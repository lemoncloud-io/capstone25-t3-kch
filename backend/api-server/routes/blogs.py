"""블로그 목록/상세 API"""

import os
from functools import lru_cache
from typing import Dict, List

import psycopg2
import psycopg2.extras
from fastapi import APIRouter, HTTPException

from .thumbnails_auto import AutoReq, generate_from_policy

router = APIRouter(tags=["blogs"])

S3_BUCKET = os.getenv("S3_BUCKET", "youth-policy-thumbnails-kch")
S3_REGION = os.getenv("AWS_REGION", os.getenv("AWS_DEFAULT_REGION", "ap-northeast-2"))


def normalize_category(raw_category: str) -> str:
    """DB 카테고리를 썸네일 카테고리로 변환"""
    cat = (raw_category or "").strip()

    if any(k in cat for k in ["일자리", "취업", "취업 지원", "창업"]):
        return "일자리"
    if "주거" in cat:
        return "주거"
    if any(k in cat for k in ["복지", "건강", "건강·상담", "상담", "청년 참여"]):
        return "복지"
    if any(k in cat for k in ["교육", "해외 기회"]):
        return "교육"

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
def list_blogs(limit: int = 12):
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

    has_key_col = "thumbnail_key" in columns
    has_url_col = "thumbnail_url" in columns

    if row.get("thumbnail_url"):
        return

    if row.get("thumbnail_key"):
        row["thumbnail_url"] = s3_url_from_key(row["thumbnail_key"])
        return

    try:
        req = AutoReq(
            policy_id=row["plcy_no"],
            category=normalize_category(row.get("category")),
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