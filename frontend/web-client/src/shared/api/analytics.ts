// src/shared/api/analytics.ts
import { env } from '@/shared/lib/env'

const BASE = env.API_BASE_URL // 예: http://127.0.0.1:8000/api

async function postAnalytics(path: string, body: unknown) {
  try {
    const res = await fetch(`${BASE}/analytics/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      console.error(`[analytics] HTTP ${res.status}:`, await res.text())
    } else {
      console.log(`[analytics] 성공: ${path}`, body)
    }
  } catch (e) {
    // 분석용이라 에러는 콘솔만 찍고 무시
    console.error('[analytics] failed:', e)
  }
}

/**
 * 세션 스토리지에서 조회한 포스트 목록 관리
 * 같은 탭에서 새로고침 시 중복 카운트 방지
 */
const SESSION_STORAGE_KEY = 'viewed_posts'

function getViewedPosts(): Set<string> {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!stored) return new Set()
    const ids = JSON.parse(stored) as string[]
    return new Set(ids)
  } catch {
    return new Set()
  }
}

function addViewedPost(postId: string | undefined, slug: string): boolean {
  // postId 또는 slug를 키로 사용
  const key = postId || slug
  if (!key) return false

  const viewed = getViewedPosts()
  if (viewed.has(key)) {
    // 이미 조회한 포스트
    return false
  }

  // 새 포스트면 추가
  viewed.add(key)
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(Array.from(viewed)))
    return true
  } catch {
    return false
  }
}

/**
 * 포스트 클릭(상세 진입) 기록
 *
 * HomePage:
 *   - 인기/최신/추천 카드 클릭 시 호출
 * PostDetailPage:
 *   - 상세 페이지 진입 시 한 번 더 호출
 *
 * 중복 방지:
 *   - 같은 탭에서 새로고침 시 카운트 안 함 (세션 스토리지 사용)
 *   - 탭 닫으면 리셋 (세션 스토리지 특성)
 *   - 새 탭으로 열면 카운트 (세션 스토리지 비어있음)
 */
export async function trackPostClick(
  postId: number | string | undefined,
  slug: string,
  page?: string,
): Promise<void> {
  const postIdStr = postId != null ? String(postId) : undefined
  
  // 세션 스토리지 확인: 이미 조회한 포스트면 카운트 안 함
  const isNewView = addViewedPost(postIdStr, slug)
  if (!isNewView) {
    console.log('[analytics] 중복 조회 방지:', { postId: postIdStr, slug })
    return
  }

  const payload = {
    postId: postIdStr,
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
