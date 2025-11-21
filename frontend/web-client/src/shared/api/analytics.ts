// src/shared/api/analytics.ts
import { env } from '@/shared/lib/env'

const BASE = env.API_BASE_URL // 예: http://127.0.0.1:8000/api

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
    // 분석용이라 에러는 콘솔만 찍고 무시
    console.error('[analytics] failed:', e)
  }
}

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
 * 호출 형식:
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
 * 호출 형식:
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
