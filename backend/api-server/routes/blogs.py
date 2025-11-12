"""블로그 목록/상세 API"""

import os
from functools import lru_cache
from typing import Dict, List, Optional

import psycopg2
import psycopg2.extras
from fastapi import APIRouter, HTTPException

from .thumbnails_auto import AutoReq, generate_from_policy

router = APIRouter(tags=["blogs"])

S3_BUCKET = os.getenv("S3_BUCKET", "youth-policy-thumbnails-kch")
S3_REGION = os.getenv("AWS_REGION", os.getenv("AWS_DEFAULT_REGION", "ap-northeast-2"))


KEYWORDS_BY_CATEGORY = {
    "일자리": {
        "ko": ["일자리", "취업", "구직", "채용", "고용", "근로", "직무", "직업", "창업", "인턴", "도제", "근속", "훈련"],
        "en": ["job", "employment", "work", "career", "startup", "entrepreneur"],
        "codes": ["employment", "job"],
    },
    "주거": {
        "ko": ["주거", "전세", "월세", "보증금", "임대", "이사", "주택", "청약", "전월세", "부동산"],
        "en": ["housing", "rent", "lease"],
        "codes": ["housing"],
    },
    "복지": {
        "ko": ["복지", "건강", "상담", "문화", "생활", "생활비", "교통비", "의료", "검진", "정신", "바우처", "참여", "권리", "여가", "돌봄"],
        "en": ["welfare", "health", "culture", "life"],
        "codes": ["welfare", "culture"],
    },
    "교육": {
        "ko": ["교육", "장학", "자격", "대학", "연수", "교환학생", "어학", "학자금", "스쿨", "교육·훈련", "학습", "캠프", "멘토"],
        "en": ["education", "scholar", "training", "study", "learning", "academy"],
        "codes": ["education", "training"],
    },
}


def _match_category(text: str, candidates: List[str]) -> Optional[str]:
    for key in candidates:
        if key and key in text:
            return key
    return None


def normalize_category(
    raw_category: Optional[str],
    auto_category: Optional[str] = None,
    *texts: Optional[str]
) -> str:
    """제목/요약/본문 등 다양한 단서를 바탕으로 카테고리를 정규화"""

    candidates: List[str] = []

    for src in (raw_category, auto_category):
        if not src:
            continue
        cleaned = str(src).strip()
        if cleaned:
            candidates.append(cleaned.lower())

    for extra in texts:
        if not extra:
            continue
        cleaned = str(extra).strip().lower()
        if cleaned:
            candidates.append(cleaned)

    joined = " ".join(candidates)

    for label, groups in KEYWORDS_BY_CATEGORY.items():
        ko = [kw.lower() for kw in groups["ko"]]
        if _match_category(joined, ko):
            return label
        if _match_category(joined, groups["en"]):
            return label
        if _match_category(joined, groups["codes"]):
            return label

    # 키워드 매칭 실패 시 기본값
    return "교육"


def s3_url_from_key(key: str) -> str:
    """S3 key를 절대 URL로 변환"""
    if not key or not S3_BUCKET:
        return ""
    if S3_REGION:
        return f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{key}"
    return f"https://{S3_BUCKET}.s3.amazonaws.com/{key}"


def get_conn():
    url = os.getenv("DB_URL") or os.getenv("DATABASE_URL")
    if not url:
        raise HTTPException(status_code=500, detail="DB_URL/DATABASE_URL not set")

    # psycopg2는 'postgresql://...' 형식만 이해
    url = url.replace("postgresql+psycopg2://", "postgresql://")
    return psycopg2.connect(url, cursor_factory=psycopg2.extras.RealDictCursor)


@lru_cache(maxsize=1)
def _get_blog_table_columns() -> set[str]:
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'blog_posts'
              AND table_schema = ANY(current_schemas(FALSE))
            """
        )
        rows = cur.fetchall()
        cur.close()
        return {row["column_name"] for row in rows}
    finally:
        conn.close()


def _build_select_fields(columns: set[str], include_content: bool = False) -> List[str]:
    base = [
        "plcy_no",
        "blog_title",
        "blog_summary",
    ]

    if include_content:
        base.append("blog_content")

    base.extend(["category", "region", "updated_at"])

    if "category_auto" in columns:
        base.append("category_auto")
    else:
        base.append("NULL::text AS category_auto")

    if "thumbnail_key" in columns:
        base.append("thumbnail_key")
    else:
        base.append("NULL::text AS thumbnail_key")

    if "thumbnail_url" in columns:
        base.append("thumbnail_url")
    else:
        base.append("NULL::text AS thumbnail_url")

    return base


@router.get("/blogs")
def list_blogs(limit: int = 40):
    conn = get_conn()
    columns = _get_blog_table_columns()
    rows: List[Dict] = []

    try:
        select_fields = _build_select_fields(columns)
        query = f"""
            SELECT {', '.join(select_fields)}
            FROM blog_posts
            WHERE generation_status = 'completed'
            ORDER BY updated_at DESC
            LIMIT %s
        """

        cur = conn.cursor()
        cur.execute(query, (limit,))
        fetched = cur.fetchall()
        cur.close()

        for row in fetched:
            ensure_thumbnail_fields(conn, row, columns)
            rows.append(row)
    finally:
        conn.close()

    return {"items": rows, "count": len(rows)}


@router.get("/blogs/{plcy_no}")
def get_blog(plcy_no: str):
    conn = get_conn()
    columns = _get_blog_table_columns()

    try:
        select_fields = _build_select_fields(columns, include_content=True)
        query = f"""
            SELECT {', '.join(select_fields)}
            FROM blog_posts
            WHERE plcy_no = %s
        """

        cur = conn.cursor()
        cur.execute(query, (plcy_no,))
        row = cur.fetchone()
        cur.close()

        if not row:
            raise HTTPException(status_code=404, detail="Blog post not found")

        ensure_thumbnail_fields(conn, row, columns)
        return row
    finally:
        conn.close()


def ensure_thumbnail_fields(conn, row: Dict, columns: set[str]):
    """썸네일 키/URL이 비어있는 경우 자동 생성 및 보완"""
    row.setdefault("thumbnail_key", None)
    row.setdefault("thumbnail_url", None)

    # 카테고리 보정 없이 blog_posts.category 값을 바로 가져와서 
    # thumbnail_categoty에 저장하도록 수정했기에 
    # 해당 테이블에 category 값이 무조건 들어있어야 합니다.
    # DB에 category 값이 없으면 경고를 남기고 썸네일 생성을 중단합니다.
    thumbnail_category = row.get("category")

    has_key_col = "thumbnail_key" in columns
    has_url_col = "thumbnail_url" in columns

    if row.get("thumbnail_url"):
        return

    if row.get("thumbnail_key"):
        row["thumbnail_url"] = s3_url_from_key(row["thumbnail_key"])
        return
    
    if not thumbnail_category:
        print(f"[WARN] 썸네일 생성 중단 (DB에 category 값이 없음): {row.get('plcy_no')}")
        return
    
    try:
        req = AutoReq(
            policy_id=row["plcy_no"],
            category=thumbnail_category,
            max_variants=2,
            allow_emoji=False,
        )
        result = generate_from_policy(req)
        if not result.get("ok"):
            return

        payload = result.get("result", {})
        thumb_key = payload.get("key")
        thumb_url = payload.get("url") or s3_url_from_key(thumb_key)

        updates = []
        params: List[str] = []

        if thumb_key and has_key_col:
            row["thumbnail_key"] = thumb_key
            updates.append("thumbnail_key = %s")
            params.append(thumb_key)

        if thumb_url and has_url_col:
            row["thumbnail_url"] = thumb_url
            updates.append("thumbnail_url = %s")
            params.append(thumb_url)
        else:
            row["thumbnail_url"] = thumb_url

        if updates:
            params.append(row["plcy_no"])
            cur = conn.cursor()
            cur.execute(
                f"UPDATE blog_posts SET {', '.join(updates)} WHERE plcy_no = %s",
                params,
            )
            conn.commit()
            cur.close()
    except Exception as exc:  # pragma: no cover - 로깅용
        print(f"[WARN] 썸네일 자동 생성 실패 ({row.get('plcy_no')}): {exc}")