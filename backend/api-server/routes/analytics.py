# routes/analytics.py
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Request
from pydantic import BaseModel, Field

from .blogs import get_conn  # 같은 DB 연결 재사용

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
)

# =========================
# DDL: 분석용 테이블 생성
# =========================

DDL_CLICK = """
CREATE TABLE IF NOT EXISTS blog_analytics_clicks (
  id SERIAL PRIMARY KEY,
  plcy_no TEXT,
  slug TEXT,
  page TEXT,
  ts TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  referrer TEXT,
  client_ip TEXT
);
"""

DDL_POST_STAY = """
CREATE TABLE IF NOT EXISTS blog_analytics_post_stay (
  id SERIAL PRIMARY KEY,
  plcy_no TEXT,
  slug TEXT,
  duration_sec INTEGER NOT NULL,
  page TEXT,
  ts TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  referrer TEXT,
  client_ip TEXT
);
"""

DDL_HOME_STAY = """
CREATE TABLE IF NOT EXISTS blog_analytics_home_stay (
  id SERIAL PRIMARY KEY,
  duration_sec INTEGER NOT NULL,
  ts TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  referrer TEXT,
  client_ip TEXT
);
"""


def init_analytics_tables() -> None:
  """서버 기동 시 한 번만 테이블 생성"""
  conn = get_conn()
  try:
    cur = conn.cursor()
    cur.execute(DDL_CLICK)
    cur.execute(DDL_POST_STAY)
    cur.execute(DDL_HOME_STAY)
    conn.commit()
    cur.close()
  finally:
    conn.close()


# 모듈 import 시점에 한 번 실행
init_analytics_tables()

# =========================
# 요청 바디 스키마
# =========================

class PostClickEvent(BaseModel):
  # 프론트에서 postId 에 plcy_no(id) 넣는다고 가정
  postId: Optional[str] = Field(default=None)
  slug: str
  page: Optional[str] = None
  ts: Optional[datetime] = None  # 없으면 서버에서 NOW 로 대체


class PostStayEvent(BaseModel):
  postId: Optional[str] = Field(default=None)
  slug: str
  durationSec: int
  page: Optional[str] = None
  ts: Optional[datetime] = None


class HomeStayEvent(BaseModel):
  durationSec: int
  ts: Optional[datetime] = None


def _common_meta(request: Request) -> tuple[Optional[str], Optional[str], Optional[str]]:
  ua = request.headers.get("user-agent")
  ref = request.headers.get("referer") or request.headers.get("referrer")
  ip = request.client.host if request.client else None
  return ua, ref, ip


# =========================
# 엔드포인트들
# =========================

@router.post("/click")
async def track_click(event: PostClickEvent, request: Request):
  """포스트 클릭(상세 진입) 기록"""
  ua, ref, ip = _common_meta(request)

  conn = get_conn()
  try:
    cur = conn.cursor()
    cur.execute(
      """
      INSERT INTO blog_analytics_clicks
        (plcy_no, slug, page, ts, user_agent, referrer, client_ip)
      VALUES
        (%s, %s, %s, COALESCE(%s, NOW()), %s, %s, %s)
      """,
      (
        event.postId,
        event.slug,
        event.page,
        event.ts,
        ua,
        ref,
        ip,
      ),
    )
    conn.commit()
    cur.close()
  finally:
    conn.close()

  return {"ok": True}


@router.post("/stay-time")
async def track_post_stay(event: PostStayEvent, request: Request):
  """포스트 상세 페이지 체류 시간 기록"""
  ua, ref, ip = _common_meta(request)

  conn = get_conn()
  try:
    cur = conn.cursor()
    cur.execute(
      """
      INSERT INTO blog_analytics_post_stay
        (plcy_no, slug, duration_sec, page, ts, user_agent, referrer, client_ip)
      VALUES
        (%s, %s, %s, %s, COALESCE(%s, NOW()), %s, %s, %s)
      """,
      (
        event.postId,
        event.slug,
        event.durationSec,
        event.page,
        event.ts,
        ua,
        ref,
        ip,
      ),
    )
    conn.commit()
    cur.close()
  finally:
    conn.close()

  return {"ok": True}


@router.post("/home-stay")
async def track_home_stay(event: HomeStayEvent, request: Request):
  """홈(메인) 페이지 체류 시간 기록"""
  ua, ref, ip = _common_meta(request)

  conn = get_conn()
  try:
    cur = conn.cursor()
    cur.execute(
      """
      INSERT INTO blog_analytics_home_stay
        (duration_sec, ts, user_agent, referrer, client_ip)
      VALUES
        (%s, COALESCE(%s, NOW()), %s, %s, %s)
      """,
      (
        event.durationSec,
        event.ts,
        ua,
        ref,
        ip,
      ),
    )
    conn.commit()
    cur.close()
  finally:
    conn.close()

  return {"ok": True}
