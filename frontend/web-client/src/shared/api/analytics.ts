// src/shared/api/analytics.ts
import { env } from '@/shared/lib/env'

const BASE = env.API_BASE_URL // 예: http://127.0.0.1:8000/api

// =========================================================
// 공통 POST 헬퍼
// =========================================================
async function postAnalytics(path: string, body: unknown) {
  try {
    await fetch(`${BASE}/analytics/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  } catch (e) {
    // 분석용이므로 에러는 콘솔만 찍고 무시
    console.error('[analytics] failed:', e)
  }
}

// =========================================================
// 기본 행동 추적 (클릭 / 체류시간 / 홈 체류시간 / 공유)
// =========================================================

/**
 * 포스트 클릭(상세 진입) 기록
 *
 * HomePage:
 *   - 인기/최신/추천 카드 클릭 시 호출
 * PostDetailPage:
 *   - 상세 페이지 진입 시 한 번 더 호출
 */
export async function trackPostClick(
  postId: number | string | undefined,
  slug: string,
  page?: string,
): Promise<void> {
  const payload = {
    postId: postId != null ? String(postId) : undefined,
    slug,
    page,
    ts: new Date().toISOString(),
  }

  await postAnalytics('click', payload)
}

/**
 * 포스트 상세 페이지 체류 시간 기록
 *
 * 호출 예:
 *   trackPostStay(post.id, post.slug, 'post-detail', enterIso, leaveIso)
 */
export async function trackPostStay(
  postId: number | string | undefined,
  slug: string,
  page: string,
  enterIso: string,
  leaveIso: string,
): Promise<void> {
  const start = new Date(enterIso).getTime()
  const end = new Date(leaveIso).getTime()
  const diffMs = Math.max(0, end - start)
  const durationSec = Math.max(1, Math.round(diffMs / 1000))

  const payload = {
    postId: postId != null ? String(postId) : undefined,
    slug,
    durationSec,
    page,
    ts: new Date(leaveIso).toISOString(), // 끝난 시점을 기준 시간으로 저장
  }

  await postAnalytics('stay-time', payload)
}

/**
 * 홈(메인) 페이지 체류 시간 기록
 *
 * 호출 예:
 *   trackHomeStay(enterIso, leaveIso)
 */
export async function trackHomeStay(
  enterIso: string,
  leaveIso: string,
): Promise<void> {
  const start = new Date(enterIso).getTime()
  const end = new Date(leaveIso).getTime()
  const diffMs = Math.max(0, end - start)
  const durationSec = Math.max(1, Math.round(diffMs / 1000))

  const payload = {
    durationSec,
    ts: new Date(leaveIso).toISOString(),
  }

  await postAnalytics('home-stay', payload)
}

/**
 * 포스트 공유 이벤트 기록
 *
 * 예: trackShare(post.id, post.slug, 'post-detail', 'native')
 */
export async function trackShare(
  postId: number | string | undefined,
  slug: string,
  page: string,
  shareType: 'native' | 'clipboard' | string,
): Promise<void> {
  const payload = {
    postId: postId != null ? String(postId) : undefined,
    slug,
    page,
    shareType,
    ts: new Date().toISOString(),
  }

  await postAnalytics('share', payload)
}

// =========================================================
// 추천 콘텐츠 클릭 및 대시보드 데이터 조회
// =========================================================

/**
 * 추천 콘텐츠 클릭 기록
 * (PostDetailPage 등의 하단 추천 리스트에서 클릭 시 호출)
 */
export async function trackRecommendationClick(
  targetPostId: number | string, // 클릭한 추천 게시글 ID
  sourcePostId?: number | string, // 현재 보고 있던 게시글 ID (옵션)
): Promise<void> {
  const payload = {
    sourcePostId: sourcePostId != null ? String(sourcePostId) : undefined,
    targetPostId: String(targetPostId),
    ts: new Date().toISOString(),
  }

  // backend url: /analytics/recommendation/click
  await postAnalytics('recommendation/click', payload)
}

// =========================================================
// 관리자 대시보드용: 일일 기본 성과 지표
// =========================================================

/**
 * 대시보드용 일일 성과 지표 타입
 *  - /analytics/daily-metrics 응답 구조와 일치
 */
export interface DailyMetric {
  date: string
  postClicks: number
  postStayAvgSec: number
  postStayCount: number
  homeStayAvgSec: number
  homeStayCount: number
  shareCount: number
}

/**
 * 관리자 대시보드용 일일 성과 지표 조회
 * GET /analytics/daily-metrics
 *
 * 백엔드 응답: { status: "success", data: DailyMetric[] }
 */
export async function fetchDailyMetrics(): Promise<DailyMetric[]> {
  try {
    const res = await fetch(`${BASE}/analytics/daily-metrics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      throw new Error(`Status: ${res.status}`)
    }

    const json = await res.json()
    return (json.data ?? []) as DailyMetric[]
  } catch (e) {
    console.error('[analytics] fetch daily metrics failed:', e)
    return []
  }
}

// =========================================================
// 관리자 대시보드용: 추천 CTR 지표
// =========================================================

/**
 * 추천 CTR 일별 지표 타입
 *  - /analytics/recommendation-metrics 응답 구조와 일치
 */
export interface RecommendationMetric {
  date: string
  clicks: number
  impressions: number
  ctr: number // 백엔드에서 % 단위로 내려주면 그대로 사용
}

/**
 * 추천 CTR 일별 지표 조회
 * GET /analytics/recommendation-metrics
 *
 * 백엔드 응답: { status: "success", data: RecommendationMetric[] }
 */
export async function fetchRecommendationMetrics(): Promise<RecommendationMetric[]> {
  try {
    const res = await fetch(`${BASE}/analytics/recommendation-metrics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      throw new Error(`Status: ${res.status}`)
    }

    const json = await res.json()
    return (json.data ?? []) as RecommendationMetric[]
  } catch (e) {
    console.error('[analytics] fetch recommendation metrics failed:', e)
    return []
  }
}
