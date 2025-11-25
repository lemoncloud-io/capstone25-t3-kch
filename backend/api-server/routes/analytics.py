# routes/analytics.py
from datetime import datetime, timedelta
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
DDL_SHARE = """
CREATE TABLE IF NOT EXISTS blog_analytics_shares (
  id SERIAL PRIMARY KEY,
  plcy_no TEXT,
  slug TEXT,
  page TEXT,
  share_type TEXT,
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
    cur.execute(DDL_SHARE)
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

class ShareEvent(BaseModel):
  postId: Optional[str] = Field(default=None)
  slug: str
  page: Optional[str] = None
  shareType: Optional[str] = None  # 예: 'native', 'clipboard'
  ts: Optional[datetime] = None


class RecommendationClickEvent(BaseModel):
  # 추천을 노출한 원본 글 ID (없으면 None)
  sourcePostId: Optional[str] = Field(default=None)
  # 실제로 클릭된 추천 글 ID
  targetPostId: Optional[str] = Field(default=None)
  # 프론트에서 타임스탬프 보내면 사용, 없으면 DB에서 NOW()
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


@router.post("/share")
async def track_share(event: ShareEvent, request: Request):
  """포스트 공유 이벤트 기록"""
  ua, ref, ip = _common_meta(request)

  conn = get_conn()
  try:
    cur = conn.cursor()
    cur.execute(
      """
      INSERT INTO blog_analytics_shares
        (plcy_no, slug, page, share_type, ts, user_agent, referrer, client_ip)
      VALUES
        (%s, %s, %s, %s, COALESCE(%s, NOW()), %s, %s, %s)
      """,
      (
        event.postId,
        event.slug,
        event.page,
        event.shareType,
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


# 추천 콘텐츠 클릭 기록 엔드포인트
@router.post("/recommendation/click")
async def track_recommendation_click(event: RecommendationClickEvent, request: Request):
  """추천 게시글 클릭 이벤트 기록"""
  ua, ref, ip = _common_meta(request)

  conn = get_conn()
  try:
    cur = conn.cursor()
    cur.execute(
      """
      INSERT INTO blog_analytics_recommendations
        (source_post_id, target_post_id, ts, user_agent, client_ip)
      VALUES
        (%s, %s, COALESCE(%s, NOW()), %s, %s)
      """,
      (
        event.sourcePostId,
        event.targetPostId,
        event.ts,
        ua,
        ip,
      ),
    )
    conn.commit()
    cur.close()
  finally:
    conn.close()

  return {"ok": True}


# [추가] 대시보드용 일일 성과 지표 조회 엔드포인트
@router.get("/daily-metrics")
async def get_daily_metrics():
  """
  최근 7일간 일일 성과 지표 집계:
  - postClicks: 게시물 상세 진입(클릭) 수
  - postStayAvgSec: 게시물 체류 시간(초) 평균
  - postStayCount: 게시물 체류 샘플 수
  - homeStayAvgSec: 홈 체류 시간(초) 평균
  - homeStayCount: 홈 체류 샘플 수
  """
  end_date = datetime.now().date()
  start_date = end_date - timedelta(days=6)

  # 기본 결과(에러 나도 이 형식으로 리턴)
  empty_result = []
  for i in range(7):
    d = start_date + timedelta(days=i)
    empty_result.append({
      "date": d.strftime("%Y-%m-%d"),
      "postClicks": 0,
      "postStayAvgSec": 0.0,
      "postStayCount": 0,
      "homeStayAvgSec": 0.0,
      "homeStayCount": 0,
    })

  conn = None
  try:
    conn = get_conn()
    cur = conn.cursor()

    # 1) 게시물 클릭 수
    cur.execute("""
        SELECT DATE(ts) AS d, COUNT(*) AS cnt
        FROM blog_analytics_clicks
        WHERE ts >= %s
        GROUP BY DATE(ts)
    """, (start_date,))
    click_rows = cur.fetchall()
    clicks_map = {row[0]: row[1] for row in click_rows}

    # 2) 게시물 체류 시간
    cur.execute("""
        SELECT DATE(ts) AS d,
               AVG(duration_sec) AS avg_stay,
               COUNT(*) AS cnt
        FROM blog_analytics_post_stay
        WHERE ts >= %s
        GROUP BY DATE(ts)
    """, (start_date,))
    post_rows = cur.fetchall()
    post_avg_map = {row[0]: float(row[1]) for row in post_rows}
    post_cnt_map = {row[0]: row[2] for row in post_rows}

    # 3) 홈 체류 시간
    cur.execute("""
        SELECT DATE(ts) AS d,
               AVG(duration_sec) AS avg_stay,
               COUNT(*) AS cnt
        FROM blog_analytics_home_stay
        WHERE ts >= %s
        GROUP BY DATE(ts)
    """, (start_date,))
    home_rows = cur.fetchall()
    home_avg_map = {row[0]: float(row[1]) for row in home_rows}
    home_cnt_map = {row[0]: row[2] for row in home_rows}

    cur.close()
  except Exception as e:
    # 여기에서 실제 에러 원인을 백엔드 터미널에서 확인할 수 있음
    print("[/analytics/daily-metrics] ERROR:", e)
    # 에러가 나도 200 + 기본값 구조로 응답
    return {"status": "error", "data": empty_result}
  finally:
    if conn is not None:
      conn.close()

  # DB 쿼리가 성공했으면, empty_result를 실제 값으로 덮어쓰기
  result = []
  for i in range(7):
    current_date = start_date + timedelta(days=i)
    date_str = current_date.strftime("%Y-%m-%d")

    post_clicks = clicks_map.get(current_date, 0)
    post_stay_avg = round(post_avg_map.get(current_date, 0.0), 2)
    home_stay_avg = round(home_avg_map.get(current_date, 0.0), 2)
    post_stay_cnt = post_cnt_map.get(current_date, 0)
    home_stay_cnt = home_cnt_map.get(current_date, 0)

    result.append({
      "date": date_str,
      "postClicks": post_clicks,
      "postStayAvgSec": post_stay_avg,
      "postStayCount": post_stay_cnt,
      "homeStayAvgSec": home_stay_avg,
      "homeStayCount": home_stay_cnt,
    })

  return {"status": "success", "data": result}