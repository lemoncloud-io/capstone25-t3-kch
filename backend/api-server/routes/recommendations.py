from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
import math
import re

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
    reasons: List[str] = Field(default_factory=list)  # 추천 이유


class RecommendResp(BaseModel):
    algo: str = "policy-clean-v1"
    items: List[RecommendItem]


# ---------- 가중치 ----------
W_STATUS = 2.5
W_AGE = 2.0
W_REGION = 3.0
W_INTEREST = 3.0
W_RECENCY = 1.5
W_VIEWS = 1.0  # 조회수 가중치


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

    # 1) "19~34", "19-34", "19 ~ 34" 등
    m = re.search(r"(\d{1,2})\s*[~\-∼−]\s*(\d{1,2})", text)
    if m:
        min_age = int(m.group(1))
        max_age = int(m.group(2))
    else:
        # 2) "19세 이상 34세 이하" 형태
        m2 = re.search(r"(\d{1,2})\s*세\s*이상.*?(\d{1,2})\s*세\s*이하", text)
        if m2:
            min_age = int(m2.group(1))
            max_age = int(m2.group(2))
        else:
            return 0.0

    u_min, u_max = AGE_BUCKET.get(user_age_bucket, (0, 150))

    # 구간이 겹치면 1.0
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


# ---------- 조회수 정규화 ----------
def normalize_view_count(view_count: Optional[int], max_views: int) -> float:
    """
    조회수를 0~1 사이로 정규화
    로그 스케일 사용하여 조회수 차이를 완화
    """
    if not view_count or view_count <= 0:
        return 0.0
    if max_views <= 0:
        return 0.0
    
    # 로그 스케일 정규화 (1 + log10(1 + view_count) / log10(1 + max_views))
    # 최소값 0.1 보장 (조회수가 있으면 최소한의 점수)
    normalized = (1 + math.log10(1 + view_count)) / (1 + math.log10(1 + max_views))
    return max(0.1, min(1.0, normalized))


# ---------- 메인 라우트 ----------
@router.post("/recommendations", response_model=RecommendResp)
def recommend(req: RecommendReq, db: Session = Depends(get_db)):
    try:
        rows = (
            db.execute(
                text(
                    """
                    SELECT
                        pc.id,
                        pc.plcy_no,
                        pc.title,
                        pc.summary,
                        pc.category_auto AS category,
                        pc.region,
                        pc.target_group,
                        pc.updated_at,
                        COALESCE(bp.view_count, 0) AS view_count
                    FROM policy_clean pc
                    LEFT JOIN blog_posts bp ON pc.plcy_no = bp.plcy_no
                    WHERE pc.title IS NOT NULL
                    ORDER BY pc.updated_at DESC NULLS LAST
                    LIMIT 200
                    """
                )
            )
            .mappings()
            .all()
        )
        
        # 최대 조회수 계산 (정규화용)
        max_views = max((r.get("view_count") or 0 for r in rows), default=1)

        user_region = normalize_region(req.userRegion)
        interest_cats = {INTEREST_ID_TO_CAT.get(i, i) for i in req.userInterests}

        items: List[RecommendItem] = []

        for r in rows:
            cat = r["category"]
            region = r["region"]
            tgroup = r["target_group"]
            updated = r["updated_at"]
            view_count = r.get("view_count") or 0

            # ---------------------------
            # 1) 지역 필터: 서울/전국 등만 추천 후보로 사용
            # ---------------------------
            norm_user = user_region
            norm_item = normalize_region(region)

            is_region_match = False
            if is_nationwide(region):
                is_region_match = True
            elif norm_user and norm_item and norm_item.startswith(norm_user[:2]):
                is_region_match = True

            # 지역이 안 맞으면 아예 추천 후보에서 제외
            if not is_region_match:
                continue

            # 이 아래로 내려온 애들은 전부 "지역은 맞다"
            s_region = 1.0

            # 관심사 점수
            s_interest = 1.0 if (cat and cat in interest_cats) else 0.0

            # 상태(학생/구직자) 점수
            s_status = status_match_score(req.userStatus, tgroup)

            # 나이대 점수
            s_age = age_match_score(req.userAge, tgroup)

            # 최신성 점수
            s_rec = recency_decay(updated)

            # 조회수 점수 (정규화)
            s_views = normalize_view_count(view_count, max_views)

            score = (
                W_INTEREST * s_interest
                + W_REGION * s_region
                + W_STATUS * s_status
                + W_AGE * s_age
                + W_RECENCY * s_rec
                + W_VIEWS * s_views
            )

            # 추천 이유 생성
            reasons = []
            if s_interest > 0:
                reasons.append("관심 카테고리와 일치")
            if s_region > 0:
                reasons.append("지역 조건 부합")
            if s_status > 0:
                reasons.append("상태(학생/구직자) 조건 부합")
            if s_age > 0:
                reasons.append("나이대 조건 부합")
            if s_rec > 0.5:
                reasons.append("최신 정책")
            if s_views > 0.3:  # 조회수가 어느 정도 있으면
                reasons.append("인기 정책")

            items.append(
                RecommendItem(
                    id=int(r["id"]),
                    plcy_no=str(r["plcy_no"]),
                    title=r["title"],
                    summary=r["summary"],
                    category=cat,
                    region=region,
                    score=float(score),
                    reasons=reasons,
                )
            )

        # 점수순 정렬
        items.sort(key=lambda x: x.score, reverse=True)
        return RecommendResp(items=items)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
