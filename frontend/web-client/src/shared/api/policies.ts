import { env } from '@/shared/lib/env'

export interface PolicyCleanOut {
  plcy_no: string
  title?: string
  category?: string
  category_auto?: string
  region?: string
  amount_min?: number
  amount_max?: number
  period_start?: string | null
  period_end?: string | null
  provider?: string
  summary?: string
  content_data?: unknown
}

export async function getPolicies(params?: {
  q?: string
  category?: string
  category_auto?: string
  region?: string
  limit?: number
  offset?: number
}): Promise<PolicyCleanOut[]> {
  const url = new URL(`${env.API_BASE_URL}/policies`)
  const searchParams = new URLSearchParams()
  if (params?.q) searchParams.set('q', params.q)
  if (params?.category) searchParams.set('category', params.category)
  if (params?.category_auto) searchParams.set('category_auto', params.category_auto)
  if (params?.region) searchParams.set('region', params.region)
  searchParams.set('limit', String(params?.limit ?? 50))
  searchParams.set('offset', String(params?.offset ?? 0))
  url.search = searchParams.toString()

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`Failed to fetch policies: ${res.status}`)
  }
  return await res.json()
}



