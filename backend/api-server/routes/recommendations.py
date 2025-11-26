from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
import math
import re
import traceback

from jobs.ontong.storage_pg import get_session as get_db
from logging_config import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api", tags=["recommendations"])

# ---------- 온보딩 스키마 ----------
UserStatus = Literal["student", "jobseeker"]
AgeRange = Literal["19-24", "25-29", "30-34", "35+"]


class RecommendReq(BaseModel):
    userStatus: UserStatus = Field(..., example="jobseeker")
    userAge: AgeRange = Field(..., example="30-34")
    userRegion: str = Field(..., example="경기도")
    userInterests: List[str] = Field(default_factory=list, example=["housing", "job"])
    exclude_plcy_no: Optional[str] = Field(None, description="제외할 정책 번호 (상세페이지에서 현재 게시물 제외용)")
    limit: Optional[int] = Field(10, ge=1, le=50, description="반환할 추천 항목 수 (기본 10개, 최대 50개)")


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
      - "만 19세 이상" (단일 나이)
      - "19세" (단일 나이)
    """
    if not target_group_text:
        return 0.0

    text = target_group_text

    # 1) 범위 형식: "19~34", "19-34", "19 ~ 34" 등
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
            # 3) 단일 나이 형식: "만 19세 이상", "19세 이상", "19세" 등
            m3 = re.search(r"만\s*(\d{1,2})\s*세\s*이상", text)
            if m3:
                min_age = int(m3.group(1))
                max_age = 100  # 상한 없음
            else:
                # 4) "19세" 같은 단일 나이 표현 (범위로 해석: 19~19세)
                m4 = re.search(r"(\d{1,2})\s*세(?!\s*(이상|이하|~|-|∼|−))", text)
                if m4:
                    age = int(m4.group(1))
                    min_age = age
                    max_age = age
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
    조회수가 매우 낮은 경우(10회 미만)는 0에 가까운 점수 부여
    """
    if not view_count or view_count <= 0:
        return 0.0
    if max_views <= 0:
        return 0.0
    
    # 로그 스케일 정규화
    normalized = (1 + math.log10(1 + view_count)) / (1 + math.log10(1 + max_views))
    
    # 조회수가 매우 낮은 경우(10회 미만)는 점수를 낮게 부여
    if view_count < 10:
        normalized = normalized * 0.3  # 최대 0.3까지 제한
    
    return min(1.0, normalized)


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
            # user_region은 이미 정규화되었으므로 중복 정규화 제거
            norm_item = normalize_region(region)

            is_region_match = False
            if is_nationwide(region):
                is_region_match = True
            elif user_region and norm_item:
                # 정확한 지역 매칭: 완전 일치 또는 정책 지역이 사용자 지역으로 시작하는 경우만
                # 예: 사용자="경기도", 정책="경기도" -> 매칭
                # 예: 사용자="경기도", 정책="경기도 수원시" -> 매칭
                # 예: 사용자="경기도", 정책="경상북도" -> 매칭 안됨 (startswith로는 매칭되지만 방지)
                if norm_item == user_region:
                    is_region_match = True
                elif norm_item.startswith(user_region):
                    # 정책 지역이 사용자 지역으로 시작하는 경우
                    # 단, 잘못된 매칭 방지: "경상북도"와 "경기도"는 매칭 안됨
                    # 사용자 지역 다음 문자가 공백이거나 특정 구분자여야 함
                    remaining = norm_item[len(user_region):]
                    if remaining and remaining[0] in (" ", "시", "도", "구", "군", "읍", "면"):
                        is_region_match = True

            # 지역이 안 맞으면 아예 추천 후보에서 제외
            if not is_region_match:
                continue

            # 현재 보고 있는 게시물은 추천에서 제외
            if req.exclude_plcy_no and str(r["plcy_no"]) == str(req.exclude_plcy_no):
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

            # 가중치 합산 점수 계산
            # 각 점수는 0~1 범위이고, 가중치를 곱하여 합산
            # 점수는 상대적 비교를 위한 것이므로 정규화하지 않고 그대로 사용
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
        
        # 상위 N개만 반환 (기본 10개, 요청된 limit 사용)
        limit = req.limit if req.limit else 10
        items = items[:limit]
        
        return RecommendResp(items=items)

    except HTTPException:
        # HTTPException은 그대로 전달
        raise
    except Exception as e:
        # 민감한 정보가 포함될 수 있는 에러 메시지는 로깅만 하고
        # 클라이언트에는 일반적인 메시지만 반환
        logger.error(
            "추천 API 오류 발생",
            extra={
                "error_type": type(e).__name__,
                "error_message": str(e),
                "traceback": traceback.format_exc(),
            },
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail="추천 서비스 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        )
