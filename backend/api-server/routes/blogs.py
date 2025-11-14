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

# 10개의 정책 카테고리를 4개의 블로그 카테고리로 표준화함.
def normalize_to_standard(raw: str) -> str:
    if not raw:
        return "복지" # 값이 비어있으면 '복지'로 통일
    text = str(raw).strip().replace(" ", "") # 공백 제거
    
    # 1. 일자리
    # ('취업 지원', '창업')
    if any(k in text for k in ["취업 지원", "창업", "일자리", "취업", "창업", "구직", "고용", "인턴"]):
        return "일자리"
    # 2. 주거
    # ('주거')
    if any(k in text for k in ["주거", "주택", "전세", "월세", "기숙사"]):
        return "주거"
    # 3. 교육
    # ('교육·자격증', '해외 기회')
    if any(k in text for k in ["교육·자격증", "해외 기회", "교육", "장학", "자격증", "학습", "학교", "공부", "어학"]):
        return "교육"
    # 4. 복지 (나머지 전부)
    # ('대출·금융', '생활비 지원', '문화·여가', '건강·상담', '청년 참여')
    return "복지"


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
def list_blogs(limit: int = 60):    #int 값 수정하면 프론트에서 불러오는 개수를 조절할 수 있습니다.
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

    raw_category = row.get("category") # 기존 DB 카테고리 값
    thumbnail_category = normalize_to_standard(raw_category) # 4대 카테고리로 정규화
    
    # row 데이터 정규화 (프론트엔드 전달용)
    row["category"] = thumbnail_category
    row["category_normalized"] = thumbnail_category

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