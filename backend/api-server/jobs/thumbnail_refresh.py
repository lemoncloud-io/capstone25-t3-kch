#!/usr/bin/env python3
"""Rebuild thumbnails for blog posts missing `thumbnail_url`.

This script can be executed standalone (without running FastAPI) and will:

1. Load environment variables to connect to the database and S3.
2. Look for blog posts whose `thumbnail_url` is NULL/empty.
3. For each post, generate a fresh thumbnail by calling the core
   `routes.thumbnails.generate` function directly.
4. Upload to S3 (or local fallback) and persist the resulting URL/key.

Usage:
    python jobs/thumbnail_refresh.py [--dry-run]

Requirements:
    - .env file with DB_URL / DATABASE_URL, AWS credentials, etc.
    - Optional: OPENAI_API_KEY for richer captions (falls back gracefully).
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

# ======== 프로젝트 경로 및 모듈 세팅 ========
BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

# FastAPI 라우트 모듈 재사용
from routes.thumbnails import Req as ThumbnailReq, generate as generate_thumbnail  # type: ignore
from routes.thumbnails_auto import (  # type: ignore
    _fallback_candidates,
    _hard_limit,
    _prompt_for_thumbnail,
    _score,
    _split_two_lines,
)
from settings import get_settings


settings = get_settings()


CATEGORY_KEYWORDS = {
    "일자리": [
        "일자리",
        "취업",
        "구직",
        "채용",
        "고용",
        "근로",
        "직무",
        "직업",
        "창업",
        "인턴",
        "도제",
        "근속",
        "훈련",
        "일경험",
    ],
    "주거": [
        "주거",
        "전세",
        "월세",
        "보증금",
        "임대",
        "이사",
        "주택",
        "청약",
        "전월세",
        "공공임대",
    ],
    "복지": [
        "복지",
        "건강",
        "상담",
        "문화",
        "생활",
        "생활비",
        "교통비",
        "의료",
        "검진",
        "정신",
        "바우처",
        "참여",
        "권리",
        "여가",
        "돌봄",
        "치료",
    ],
    "교육": [
        "교육",
        "장학",
        "자격",
        "대학",
        "연수",
        "교환학생",
        "어학",
        "학자금",
        "스쿨",
        "훈련",
        "학습",
        "캠프",
        "멘토",
        "강좌",
        "강의",
    ],
}

CATEGORY_KEYWORDS_EN = {
    "일자리": ["job", "employment", "work", "career", "startup", "entrepreneur", "labor"],
    "주거": ["housing", "rent", "lease", "residence", "home"],
    "복지": ["welfare", "health", "culture", "life", "benefit", "support"],
    "교육": ["education", "scholar", "training", "study", "learning", "academy", "school"],
}


def normalize_category_label(*sources: Optional[str]) -> str:
    texts: List[str] = []
    for src in sources:
        if not src:
            continue
        cleaned = str(src).strip()
        if cleaned:
            texts.append(cleaned.lower())

    joined = " ".join(texts)

    for label, keywords in CATEGORY_KEYWORDS.items():
        if any(kw.lower() in joined for kw in keywords):
            return label
        if any(kw in joined for kw in CATEGORY_KEYWORDS_EN[label]):
            return label

    return "교육"


# ======== 설정 & 로깅 ========
LOG_FORMAT = "[%(asctime)s] [%(levelname)s] %(message)s"
logging.basicConfig(level=logging.INFO, format=LOG_FORMAT)
logger = logging.getLogger("thumbnail_refresh")


# ======== 데이터 구조 ========
@dataclass
class BlogPostRow:
    plcy_no: str
    category: str
    blog_title: Optional[str]
    blog_summary: Optional[str]
    blog_content: Optional[str]


@dataclass
class PolicyInfo:
    policy_id: str
    title: Optional[str]
    region: Optional[str]
    benefit: Optional[str]
    benefit_amount: Optional[str]
    target: Optional[str]
    deadline: Optional[str]
    summary: Optional[str]
    category: str


# ======== DB 유틸 ========
def get_engine() -> Engine:
    db_url = settings.ensure_database_url()
    return create_engine(db_url, pool_pre_ping=True)


def fetch_pending_posts(engine: Engine) -> List[BlogPostRow]:
    query = text(
        """
        SELECT plcy_no, category, blog_title, blog_summary, blog_content
        FROM blog_posts
        WHERE (thumbnail_url IS NULL OR thumbnail_url = '')
          AND (generation_status IS NULL OR generation_status = 'completed')
        ORDER BY updated_at DESC
        """
    )
    with engine.connect() as conn:
        rows = conn.execute(query).mappings().all()

    results: List[BlogPostRow] = []
    for row in rows:
        normalized = normalize_category_label(
            row.get("category"),
            row.get("blog_title"),
            row.get("blog_summary"),
            row.get("blog_content"),
        )
        results.append(
            BlogPostRow(
                plcy_no=row["plcy_no"],
                category=normalized,
                blog_title=row.get("blog_title"),
                blog_summary=row.get("blog_summary"),
                blog_content=row.get("blog_content"),
            )
        )
    return results


def fetch_policy_info(engine: Engine, plcy_no: str, fallback_category: str) -> PolicyInfo:
    query = text(
        """
        SELECT title, region, summary, category, category_auto, content_data,
               period_end, provider
        FROM policy_clean
        WHERE plcy_no = :plcy_no
        """
    )

    with engine.connect() as conn:
        row = conn.execute(query, {"plcy_no": plcy_no}).mappings().first()

    if not row:
        normalized = normalize_category_label(fallback_category)
        return PolicyInfo(
            policy_id=plcy_no,
            title=None,
            region=None,
            benefit=None,
            benefit_amount=None,
            target=None,
            deadline=None,
            summary=None,
            category=normalized,
        )

    content_data: Dict[str, Any] = {}
    if row.get("content_data"):
        try:
            if isinstance(row["content_data"], str):
                content_data = json.loads(row["content_data"])
            else:
                content_data = row["content_data"]
        except Exception as exc:  # pragma: no cover - 방어적 처리
            logger.warning("content_data JSON 파싱 실패: %s", exc)

    # content_data 키 후보들 추출
    benefit = content_data.get("benefit") or content_data.get("benefit_text")
    benefit_amount = content_data.get("benefit_amount") or content_data.get("benefitRange")
    target = content_data.get("target") or content_data.get("target_group")

    normalized_category = normalize_category_label(
        row.get("category_auto"),
        row.get("category"),
        fallback_category,
    )

    return PolicyInfo(
        policy_id=plcy_no,
        title=row.get("title"),
        region=row.get("region"),
        benefit=benefit,
        benefit_amount=str(benefit_amount) if benefit_amount is not None else None,
        target=target,
        deadline=row.get("period_end"),
        summary=row.get("summary"),
        category=normalized_category,
    )


# ======== 캡션 생성 ========
def build_policy_payload(post: BlogPostRow, policy: PolicyInfo) -> Dict[str, Any]:
    """thumbnails_auto 모듈에서 사용하는 정책 딕셔너리 구성"""
    return {
        "policy_id": policy.policy_id,
        "title": policy.title or post.blog_title,
        "region": policy.region,
        "benefit": policy.benefit,
        "benefit_amount": policy.benefit_amount,
        "target": policy.target,
        "deadline": policy.deadline,
        "summary": policy.summary or post.blog_summary or post.blog_content,
        "category": policy.category or post.category,
    }


def select_caption(policy_payload: Dict[str, Any]) -> str:
    """LLM 기반 후보 → 후처리 → 최종 캡션 선택 (폴백 포함)."""
    allow_emoji = False
    max_variants = 4

    try:
        candidates = _prompt_for_thumbnail(policy_payload, allow_emoji, max_variants=max_variants)
    except Exception as exc:
        logger.warning("LLM 캡션 생성 실패(%s), 폴백 사용", exc)
        candidates = []

    cooked: List[str] = []
    for cand in candidates:
        s = re.sub(r"\s+", " ", str(cand or "").strip())
        if not s:
            continue
        s = _hard_limit(s, 22)
        s = _split_two_lines(s)
        cooked.append(s)

    if not cooked:
        cooked = [
            _split_two_lines(_hard_limit(txt, 22))
            for txt in _fallback_candidates(policy_payload)
        ]

    if not cooked:
        return "한눈에 보는\n핵심 꿀팁"

    return max(cooked, key=_score)


# ======== DB 업데이트 ========
def update_thumbnail_fields(
    engine: Engine,
    plcy_no: str,
    url: Optional[str],
    key: Optional[str],
    storage: str,
    dry_run: bool = False,
):
    query = text(
        """
        UPDATE blog_posts
        SET thumbnail_url = :thumbnail_url,
            thumbnail_key = COALESCE(:thumbnail_key, thumbnail_key),
            updated_at = NOW()
        WHERE plcy_no = :plcy_no
        """
    )

    if dry_run:
        logger.info("[DRY-RUN] DB 업데이트 건너뜀 (plcy_no=%s) url=%s", plcy_no, url)
        return

    with engine.begin() as conn:
        conn.execute(
            query,
            {
                "thumbnail_url": url,
                "thumbnail_key": key if storage == "s3" else None,
                "plcy_no": plcy_no,
            },
        )


# ======== 메인 로직 ========
def process_post(engine: Engine, post: BlogPostRow, dry_run: bool = False) -> bool:
    policy_info = fetch_policy_info(engine, post.plcy_no, post.category)
    policy_payload = build_policy_payload(post, policy_info)
    caption = select_caption(policy_payload)

    req = ThumbnailReq(policy_id=post.plcy_no, category=policy_info.category, caption=caption)
    result = generate_thumbnail(req)

    storage = result.get("storage", "local")
    url = result.get("url") or result.get("path")
    key = result.get("key")

    if not url:
        logger.error("썸네일 생성 성공했으나 URL/경로가 없습니다 (plcy_no=%s)", post.plcy_no)
        return False

    update_thumbnail_fields(engine, post.plcy_no, url, key, storage, dry_run=dry_run)

    logger.info(
        "썸네일 생성 완료 (plcy_no=%s, category=%s, storage=%s, url=%s)",
        post.plcy_no,
        policy_info.category,
        storage,
        url,
    )
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description="Rebuild thumbnails for blog posts")
    parser.add_argument("--dry-run", action="store_true", help="DB 업데이트 없이 테스트 실행")
    args = parser.parse_args()

    engine = get_engine()
    posts = fetch_pending_posts(engine)

    if not posts:
        logger.info("썸네일이 비어 있는 게시글이 없습니다.")
        return

    logger.info("총 %d건의 게시글에 대해 썸네일을 재생성합니다.", len(posts))

    success = 0
    for post in posts:
        try:
            if process_post(engine, post, dry_run=args.dry_run):
                success += 1
        except Exception as exc:  # pragma: no cover - 실행 시 방어
            logger.exception("썸네일 생성 중 오류 (plcy_no=%s): %s", post.plcy_no, exc)

    logger.info("썸네일 재생성 완료: 성공 %d / 시도 %d", success, len(posts))


if __name__ == "__main__":
    main()


