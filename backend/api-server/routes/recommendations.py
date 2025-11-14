from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
import math
import re  # ✅ 나이 범위 파싱용

from jobs.ontong.storage_pg import get_session as get_db

router = APIRouter(prefix="/api", tags=["recommendations"])

# ---------- 온보딩 스키마 ----------
UserStatus = Literal["student", "jobseeker"]
AgeRange = Literal["19-24", "25-29", "30-34", "35+"]


class RecommendReq(BaseModel):
    userStatus: UserStatus = Field(..., example="jobseeker")
    userAge: AgeRange = Field(..., example="30-34")
    userRegion: str = Field(..., example="경기도")
    userInterests: List[str] = Field(default_factory=list, example=["housing", "job"])


class RecommendItem(BaseModel):
    id: int                      # policy_clean 내부 id (디버깅용)
    plcy_no: str                 # 정책번호
    title: str
    summary: Optional[str] = None
    category: Optional[str] = None
    region: Optional[str] = None
    score: float


class RecommendResp(BaseModel):
    algo: str = "policy-clean-v1"
    items: List[RecommendItem]


# ---------- 가중치 ----------
W_STATUS = 2.5
W_AGE = 2.0
W_REGION = 3.0
W_INTEREST = 3.0
W_RECENCY = 1.5
W_VIEWS = 0.0


# ---------- 관심사 id -> 카테고리 이름 매핑 ----------
INTEREST_ID_TO_CAT = {
    "job": "취업 지원",
    "education": "교육·자격증",
    "startup": "창업",
    "housing": "주거",
    "loan": "대출·금융",
    "living": "생활비 지원",
    "culture": "문화·여가",
    "health": "건강·상담",
    "abroad": "해외 기회",
    "participation": "청년 참여",
}


# ---------- 지역 정규화 ----------
def normalize_region(s: Optional[str]) -> str:
    if not s:
        return ""
    s = s.strip()
    mapping = {
        "경기": "경기도",
        "서울": "서울특별시",
        "부산": "부산광역시",
        "대구": "대구광역시",
        "인천": "인천광역시",
        "광주": "광주광역시",
        "대전": "대전광역시",
        "울산": "울산광역시",
        "세종": "세종특별자치시",
        "강원": "강원특별자치도",
        "전북": "전북특별자치도",
        "제주": "제주특별자치도",
        "충북": "충청북도",
        "충남": "충청남도",
        "전남": "전라남도",
        "경북": "경상북도",
        "경남": "경상남도",
    }
    return mapping.get(s, s)


def is_nationwide(s: Optional[str]) -> bool:
    if not s:
        return True
    s = s.strip()
    return s in ("전국", "대한민국", "전체", "ALL", "*")


# ---------- 상태 힌트 매칭 ----------
STUDENT_HINTS = ["학생", "재학생", "대학", "고등학생", "청년(학생)", "학자금", "교내"]
JOBSEEKER_HINTS = ["구직", "미취업", "취업준비", "구직활동", "실업", "이직준비", "취업활동"]


def status_match_score(user_status: str, target_group_text: Optional[str]) -> float:
    if not target_group_text:
        return 0.0
    if user_status == "student":
        for kw in STUDENT_HINTS:
            if kw in target_group_text:
                return 1.0
    else:
        for kw in JOBSEEKER_HINTS:
            if kw in target_group_text:
                return 1.0
    return 0.0


# ---------- 나이대 매칭 ----------
# 온보딩에서 들어오는 나이 구간을 실제 나이 범위로 변환
AGE_BUCKET = {
    "19-24": (19, 24),
    "25-29": (25, 29),
    "30-34": (30, 34),
    "35+": (35, 100),
}


def age_match_score(user_age_bucket: AgeRange, target_group_text: Optional[str]) -> float:
    """
    target_group 문자열 안에서 나이 범위를 찾아서
    온보딩 나이 구간과 겹치면 1.0, 아니면 0.0
    예시 포맷:
      - "만 19~34세"
      - "19-34세"
      - "연령 19세 이상 34세 이하"
    """
    if not target_group_text:
        return 0.0

    text = target_group_text

    # 1) "19~34", "19-34", "19 ~ 34" 같은 패턴 먼저 찾기
    m = re.search(r"(\d{1,2})\s*[~\-∼−]\s*(\d{1,2})", text)
    if m:
        min_age = int(m.group(1))
        max_age = int(m.group(2))
    else:
        # 2) "19세 이상 34세 이하" 형태 대충 지원 (둘 다 있는 경우)
        m2 = re.search(r"(\d{1,2})\s*세\s*이상.*?(\d{1,2})\s*세\s*이하", text)
        if m2:
            min_age = int(m2.group(1))
            max_age = int(m2.group(2))
        else:
            # 나이 숫자 범위를 못 찾으면 0점
            return 0.0

    u_min, u_max = AGE_BUCKET.get(user_age_bucket, (0, 150))

    # 구간이 겹치면 1.0, 전혀 안 겹치면 0.0
    if max_age < u_min or min_age > u_max:
        return 0.0
    return 1.0


# ---------- 신선도 ----------
def recency_decay(ts: Optional[datetime]) -> float:
    if not ts:
        return 0.0
    diff_days = (
        (datetime.now(ts.tzinfo) - ts).days
        if ts.tzinfo
        else (datetime.now() - ts).days
    )
    return math.exp(-diff_days / 30.0)


# ---------- 메인 라우트 ----------
@router.post("/recommendations", response_model=RecommendResp)
def recommend(req: RecommendReq, db: Session = Depends(get_db)):
    try:
        rows = (
            db.execute(
                text(
                    """
                    SELECT
                        id,
                        plcy_no,
                        title,
                        summary,
                        category_auto AS category,
                        region,
                        target_group,
                        updated_at
                    FROM policy_clean
                    WHERE title IS NOT NULL
                    ORDER BY updated_at DESC NULLS LAST
                    LIMIT 200
                    """
                )
            )
            .mappings()
            .all()
        )

        user_region = normalize_region(req.userRegion)
        interest_cats = {INTEREST_ID_TO_CAT.get(i, i) for i in req.userInterests}

        items: List[RecommendItem] = []

        for r in rows:
            cat = r["category"]
            region = r["region"]
            tgroup = r["target_group"]
            updated = r["updated_at"]

            # 관심사 점수
            s_interest = 1.0 if (cat and cat in interest_cats) else 0.0

            # 지역 점수 (전국 + 광역 정도만 대충 매칭)
            norm_user = user_region
            norm_item = normalize_region(region)

            if is_nationwide(region):
                s_region = 1.0
            elif norm_user and norm_item and norm_item.startswith(norm_user[:2]):
                s_region = 1.0
            else:
                s_region = 0.0

            # 상태(학생/구직자) 점수
            s_status = status_match_score(req.userStatus, tgroup)

            # 나이대 점수 ✅
            s_age = age_match_score(req.userAge, tgroup)

            # 최신성 점수
            s_rec = recency_decay(updated)

            s_views = 0.0  # 현재 없음

            score = (
                W_INTEREST * s_interest
                + W_REGION * s_region
                + W_STATUS * s_status
                + W_AGE * s_age           # ✅ 나이대 반영
                + W_RECENCY * s_rec
                + W_VIEWS * s_views
            )

            items.append(
                RecommendItem(
                    id=int(r["id"]),
                    plcy_no=str(r["plcy_no"]),
                    title=r["title"],
                    summary=r["summary"],
                    category=cat,
                    region=region,
                    score=float(score),
                )
            )

        items.sort(key=lambda x: x.score, reverse=True)
        return RecommendResp(items=items)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
