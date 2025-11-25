# backend/api-server/routes/analytics.py

from datetime import datetime, timedelta, timezone
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

# 포스트 공유 이벤트
DDL_SHARE = """
CREATE TABLE IF NOT EXISTS blog_analytics_shares (
  id SERIAL PRIMARY KEY,
  plcy_no TEXT,
  slug TEXT,
  share_type TEXT,
  ts TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  referrer TEXT,
  client_ip TEXT
);
"""

# 추천 클릭 이벤트
DDL_RECO_CLICK = """
CREATE TABLE IF NOT EXISTS blog_analytics_recommendations (
  id SERIAL PRIMARY KEY,
  source_post_id TEXT,
  target_post_id TEXT,
  ts TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  client_ip TEXT
);
"""

# 추천 영역 노출(임프레션) 이벤트
DDL_RECO_IMPRESSION = """
CREATE TABLE IF NOT EXISTS blog_analytics_reco_impressions (
  id SERIAL PRIMARY KEY,
  source_post_id TEXT,
  ts TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
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
    cur.execute(DDL_RECO_CLICK)
    cur.execute(DDL_RECO_IMPRESSION)
    conn.commit()
    cur.close()
  finally:
    conn.close()


# 모듈 import 시점에는 실행하지 않음
# main.py에서 서버 시작 시점에 명시적으로 호출해야 함

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
  shareType: Optional[str] = None  # 'native' | 'clipboard' 등
  ts: Optional[datetime] = None


class RecommendationClickEvent(BaseModel):
  sourcePostId: Optional[str] = Field(default=None)
  targetPostId: str
  ts: Optional[datetime] = None


class RecommendationImpressionEvent(BaseModel):
  sourcePostId: Optional[str] = Field(default=None)
  ts: Optional[datetime] = None


def _common_meta(request: Request) -> tuple[Optional[str], Optional[str], Optional[str]]:
  ua = request.headers.get("user-agent")
  ref = request.headers.get("referer") or request.headers.get("referrer")
  ip = request.client.host if request.client else None
  return ua, ref, ip


# =========================
# 엔드포인트들 (수집)
# =========================

@router.post("/click")
async def track_click(event: PostClickEvent, request: Request):
  """포스트 클릭(상세 진입) 기록"""
  ua, ref, ip = _common_meta(request)

  conn = get_conn()
  try:
    cur = conn.cursor()
    # 1. analytics 테이블에 클릭 이벤트 기록
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
    
    # 2. blog_posts 테이블의 view_count도 증가
    # slug 또는 plcy_no로 매칭 (slug가 plcy_no와 동일할 수 있음)
    if event.postId or event.slug:
      # plcy_no가 있으면 그것으로, 없으면 slug로 업데이트
      identifier = event.postId if event.postId else event.slug
      cur.execute(
        """
        UPDATE blog_posts
        SET view_count = COALESCE(view_count, 0) + 1
        WHERE plcy_no = %s OR slug = %s
        """,
        (identifier, identifier),
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
        (plcy_no, slug, share_type, ts, user_agent, referrer, client_ip)
      VALUES
        (%s, %s, %s, COALESCE(%s, NOW()), %s, %s, %s)
      """,
      (
        event.postId,
        event.slug,
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


@router.post("/recommendation/impression")
async def track_recommendation_impression(
  event: RecommendationImpressionEvent,
  request: Request,
):
  """추천 영역 노출(임프레션) 기록"""
  ua, ref, ip = _common_meta(request)

  conn = get_conn()
  try:
    cur = conn.cursor()
    cur.execute(
      """
      INSERT INTO blog_analytics_reco_impressions
        (source_post_id, ts, user_agent, client_ip)
      VALUES
        (%s, COALESCE(%s, NOW()), %s, %s)
      """,
      (
        event.sourcePostId,
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


# =========================
# 대시보드용 집계 API들
# =========================

@router.get("/recommendation-metrics")
async def get_recommendation_metrics():
    """
    최근 7일간 추천 콘텐츠 지표 집계
    - date: 날짜 (YYYY-MM-DD)
    - clicks: 추천 클릭 수
    - impressions: 추천 영역 노출 수
    - ctr: 클릭률(%) = clicks / impressions * 100
    """
    conn = get_conn()
    try:
        cur = conn.cursor()

        # 한국 시간대(KST, UTC+9) 기준으로 오늘 날짜 계산
        kst = timezone(timedelta(hours=9))
        today = datetime.now(kst).date()
        start_date = today - timedelta(days=6)

        # 추천 클릭 수 (한국 시간대 기준으로 날짜 계산)
        cur.execute(
            """
            SELECT DATE(ts AT TIME ZONE 'Asia/Seoul') AS d, COUNT(*) AS cnt
            FROM blog_analytics_recommendations
            WHERE ts >= %s
            GROUP BY DATE(ts AT TIME ZONE 'Asia/Seoul')
            """,
            (start_date,),
        )
        click_rows = cur.fetchall()
        # date 객체를 문자열로 변환하여 키로 사용
        click_map = {str(row["d"]): row["cnt"] for row in click_rows}

        # 추천 노출 수 (한국 시간대 기준으로 날짜 계산)
        cur.execute(
            """
            SELECT DATE(ts AT TIME ZONE 'Asia/Seoul') AS d, COUNT(*) AS cnt
            FROM blog_analytics_reco_impressions
            WHERE ts >= %s
            GROUP BY DATE(ts AT TIME ZONE 'Asia/Seoul')
            """,
            (start_date,),
        )
        imp_rows = cur.fetchall()
        # date 객체를 문자열로 변환하여 키로 사용
        imp_map = {str(row["d"]): row["cnt"] for row in imp_rows}

        cur.close()
    finally:
        conn.close()

    result = []
    for i in range(7):
        d = start_date + timedelta(days=i)
        d_str = str(d)
        clicks = click_map.get(d_str, 0)
        imps = imp_map.get(d_str, 0)
        ctr = round((clicks / imps * 100), 2) if imps > 0 else 0.0

        result.append(
            {
                "date": d.strftime("%Y-%m-%d"),
                "clicks": clicks,
                "impressions": imps,
                "ctr": ctr,
            }
        )

    return {"status": "success", "data": result}

@router.get("/daily-metrics")
async def get_daily_metrics(days: int = 7):
    """
    최근 N일(기본 7일) 동안의 일일 성과 지표를 반환
    응답 형식: { status: "success", data: [ { date, postClicks, postStayAvgSec,
                                        postStayCount, homeStayAvgSec,
                                        homeStayCount, shareCount }, ... ] }
    """
    # 한국 시간대(KST, UTC+9) 기준으로 날짜 계산
    kst = timezone(timedelta(hours=9))
    end_date = datetime.now(kst).date()
    start_date = end_date - timedelta(days=days - 1)

    with get_conn() as conn:
        cur = conn.cursor()

        # 1) 게시물 클릭 수 (한국 시간대 기준으로 날짜 계산)
        cur.execute(
            """
            SELECT DATE(ts AT TIME ZONE 'Asia/Seoul') AS date, COUNT(*)::int AS cnt
            FROM blog_analytics_clicks
            WHERE ts >= %s AND ts < %s + interval '1 day'
            GROUP BY DATE(ts AT TIME ZONE 'Asia/Seoul')
            """,
            (start_date, end_date),
        )
        click_rows = cur.fetchall()
        # RealDictCursor일 수도 있으므로 key / index 둘 다 처리
        click_map = {}
        for row in click_rows:
            if isinstance(row, dict):
                d = row["date"]
                c = row["cnt"]
            else:
                d, c = row[0], row[1]
            click_map[str(d)] = int(c)

        # 2) 게시물 체류 시간 (한국 시간대 기준으로 날짜 계산)
        cur.execute(
            """
            SELECT DATE(ts AT TIME ZONE 'Asia/Seoul') AS date,
                   AVG(duration_sec)::float AS avg_duration,
                   COUNT(*)::int AS cnt
            FROM blog_analytics_post_stay
            WHERE ts >= %s AND ts < %s + interval '1 day'
            GROUP BY DATE(ts AT TIME ZONE 'Asia/Seoul')
            """,
            (start_date, end_date),
        )
        stay_rows = cur.fetchall()
        post_stay_map = {}
        for row in stay_rows:
            if isinstance(row, dict):
                d = row["date"]
                avg_d = row["avg_duration"] or 0
                c = row["cnt"]
            else:
                d, avg_d, c = row[0], row[1] or 0, row[2]
            post_stay_map[str(d)] = (float(avg_d), int(c))

        # 3) 홈 체류 시간 (한국 시간대 기준으로 날짜 계산)
        cur.execute(
            """
            SELECT DATE(ts AT TIME ZONE 'Asia/Seoul') AS date,
                   AVG(duration_sec)::float AS avg_duration,
                   COUNT(*)::int AS cnt
            FROM blog_analytics_home_stay
            WHERE ts >= %s AND ts < %s + interval '1 day'
            GROUP BY DATE(ts AT TIME ZONE 'Asia/Seoul')
            """,
            (start_date, end_date),
        )
        home_rows = cur.fetchall()
        home_stay_map = {}
        for row in home_rows:
            if isinstance(row, dict):
                d = row["date"]
                avg_d = row["avg_duration"] or 0
                c = row["cnt"]
            else:
                d, avg_d, c = row[0], row[1] or 0, row[2]
            home_stay_map[str(d)] = (float(avg_d), int(c))

        # 4) 공유 수 (한국 시간대 기준으로 날짜 계산)
        cur.execute(
            """
            SELECT DATE(ts AT TIME ZONE 'Asia/Seoul') AS date, COUNT(*)::int AS cnt
            FROM blog_analytics_shares
            WHERE ts >= %s AND ts < %s + interval '1 day'
            GROUP BY DATE(ts AT TIME ZONE 'Asia/Seoul')
            """,
            (start_date, end_date),
        )
        share_rows = cur.fetchall()
        share_map = {}
        for row in share_rows:
            if isinstance(row, dict):
                d = row["date"]
                c = row["cnt"]
            else:
                d, c = row[0], row[1]
            share_map[str(d)] = int(c)

    # 날짜 배열 만들기 (누락된 날짜는 0으로 채움)
    dates = [start_date + timedelta(days=i) for i in range(days)]
    data = []
    for d in dates:
        key = str(d)
        post_clicks = click_map.get(key, 0)
        post_avg, post_cnt = post_stay_map.get(key, (0.0, 0))
        home_avg, home_cnt = home_stay_map.get(key, (0.0, 0))
        share_cnt = share_map.get(key, 0)

        data.append(
            {
                "date": key,
                "postClicks": post_clicks,
                "postStayAvgSec": post_avg,
                "postStayCount": post_cnt,
                "homeStayAvgSec": home_avg,
                "homeStayCount": home_cnt,
                "shareCount": share_cnt,
            }
        )

    return {"status": "success", "data": data}