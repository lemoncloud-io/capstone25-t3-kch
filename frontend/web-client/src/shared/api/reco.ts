// src/shared/api/reco.ts
import { env } from '@/shared/lib/env'

export type RecommendReq = {
  userStatus: 'student' | 'jobseeker'
  userAge: '19-24' | '25-29' | '30-34' | '35+'
  userRegion: string
  userInterests: string[]
}

export type RecommendItem = {
  id: number
  title: string
  summary?: string
  category?: string
  region?: string
  score: number
  reasons: string[]
}

export async function fetchRecommendations(payload: RecommendReq) {
  // env.API_BASE_URL가 .../api 로 끝나므로 여기엔 /recommendations만 붙임
  const res = await fetch(`${env.API_BASE_URL}/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data: { algo: string; items: RecommendItem[] } = await res.json()
  return data.items
}
