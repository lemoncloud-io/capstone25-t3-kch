"""블로그 목록/상세 API"""

import os
from functools import lru_cache
from typing import Dict, List, Optional

import psycopg2
import psycopg2.extras
from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["blogs"])

S3_BUCKET = os.getenv("S3_BUCKET", "youth-policy-thumbnails-kch")
S3_REGION = os.getenv("AWS_REGION", os.getenv("AWS_DEFAULT_REGION", "ap-northeast-2"))

# 10개의 정책 카테고리를 4개의 블로그 카테고리로 표준화함.
def normalize_to_standard(raw: str) -> str:
    if not raw:
        return "복지" # 값이 비어있으면 '복지'로 통일
    text = str(raw).strip().replace(" ", "") # 공백 제거, 그에 따라 아래 키워드에도 공백 없어야 함
    
    # DB 카테고리 바탕으로, 쉼표로 인해 여러 카테고리가 붙어있는 경우를 우선 처리 (주요 문제 발생 지점!)
    if "일자리,교육" in text:
        return "일자리"
    if any(k in text for k in ["참여권리,참여권리", "참여권리"]):
        return "복지"
    
    # 1. 교육
    # ('교육', '교육·자격증', '해외 기회')
    if any(k in text for k in ["교육·자격증", "해외", "해외기회", "교육", "장학", "자격증", "학습", "학교", "공부", "어학"]):
        return "교육"
    # 2. 일자리
    # ('일자리', '취업 지원', '창업')
    if any(k in text for k in ["취업지원", "창업", "일자리", "취업", "구직", "고용", "인턴"]):
        return "일자리"
    # 3. 주거
    # ('주거')
    if any(k in text for k in ["주거", "주택", "전세", "월세", "기숙사"]):
        return "주거"
    # 4. 복지 (나머지 전부)
    # ('복지문화', '대출·금융', '생활비 지원', '문화·여가', '건강·상담', '청년 참여')
    if any(k in text for k in ["복지문화", "대출·금융", "생활비지원", "문화·여가", "건강·상담", "청년참여"]):
        return "복지"
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


def init_view_count_column():
    """서버 시작 시 view_count 컬럼이 없으면 추가"""
    conn = get_conn()
    try:
        cur = conn.cursor()
        # 컬럼 존재 여부 확인
        cur.execute("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'blog_posts' AND column_name = 'view_count'
            )
        """)
        exists = cur.fetchone()[0]
        
        if not exists:
            cur.execute("ALTER TABLE blog_posts ADD COLUMN view_count INTEGER DEFAULT 0 NOT NULL")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_blog_posts_view_count ON blog_posts(view_count DESC)")
            conn.commit()
            print("[blogs] view_count 컬럼 추가 완료")
            # 캐시 무효화 (컬럼이 추가되었으므로 캐시 갱신 필요)
            _get_blog_table_columns.cache_clear()
        cur.close()
    except Exception as e:
        print(f"[blogs] view_count 컬럼 초기화 실패: {e}")
        conn.rollback()
    finally:
        conn.close()


# 모듈 import 시점에 한 번 실행
init_view_count_column()


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

    # 조회수 필드 추가
    if "view_count" in columns:
        base.append("view_count")
    else:
        base.append("0 AS view_count")

    return base

# SQL 필터링을 위한 키워드 정의, normalize_to_standard와 로직 일치합니다.
CATEGORY_KEYWORDS = {
    "교육": ["교육", "교육·자격증", "해외 기회"],
    "일자리": ["일자리", "일자리,교육", "취업 지원", "창업"],
    "주거": ["주거"],
    "복지": ["참여권리", "참여권리,참여권리", "복지문화", "대출·금융", "생활비 지원", "문화·여가", "건강·상담", "청년 참여"]
}

@router.get("/blogs")
def list_blogs(limit: int = 100, category: Optional[str] = None, include_content: bool = True):  # 블로그 목록 조회
    conn = get_conn()
    columns = _get_blog_table_columns()
    rows: List[Dict] = []

    try:
        select_fields = _build_select_fields(columns, include_content=include_content)
        query_parts = [f"""
            SELECT {', '.join(select_fields)}
            FROM blog_posts
            WHERE generation_status = 'completed'
        """]
        params = []

        # SQL쿼리로 필터링
        if category and category in CATEGORY_KEYWORDS:
            category_ten = CATEGORY_KEYWORDS[category]
            
            placeholders = ', '.join(['%s'] * len(category_ten))
            
            # category 컬럼이 10대 상세 카테고리(category_ten) 중 하나에 정확히 포함되는지 검사
            query_parts.append(f"AND category IN ({placeholders})")
            params.extend(category_ten)

        # 정렬, 리밋 추가, 쿼리 합치고 실행
        query_parts.append("ORDER BY updated_at DESC")
        query_parts.append("LIMIT %s")
        params.append(limit)
        query = " ".join(query_parts)

        cur = conn.cursor()
        cur.execute(query, tuple(params))
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
    
    from .thumbnails_auto import AutoReq, generate_from_policy
    
    """썸네일 키/URL이 비어있는 경우 자동 생성 및 보완"""
    row.setdefault("thumbnail_key", None)
    row.setdefault("thumbnail_url", None)

    raw_category = row.get("category_auto") or row.get("category") # 기존 DB 카테고리 값
    thumbnail_category = normalize_to_standard(raw_category) # 4대 카테고리로 정규화
    
    # 관리자가 수동으로 설정한 카테고리가 있으면 그것을 우선 사용
    if row.get("category"):
        row["category_normalized"] = row["category"]
    else:
        # DB에 카테고리가 없는 경우에만 자동 정규화 사용
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