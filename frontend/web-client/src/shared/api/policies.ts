import { env } from '../lib/env'

export interface PolicyCleanOut {
    plcy_no: string
    title: string
    category: string
    region?: string
    summary?: string
}

export const getPolicies = async (params?: { 
    category?: string
    region?: string 
    limit?: number 
}): Promise<PolicyCleanOut[]> => {
    if (env.ENV === 'development' && !env.USE_SERVER) {
        // Mock 데이터 반환
        await new Promise(resolve => setTimeout(resolve, 300))
        return []
    }

    try {
        const searchParams = new URLSearchParams()
        if (params?.category) searchParams.set('category', params.category)
        if (params?.region) searchParams.set('region', params.region)
        if (params?.limit) searchParams.set('limit', params.limit.toString())

        console.log('🔍 정책 목록 조회:', `${env.API_BASE_URL}/policies?${searchParams}`)
        
        const response = await fetch(`${env.API_BASE_URL}/policies?${searchParams}`)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        const policies = Array.isArray(data) ? data : (data.items || [])
        
        console.log('📋 정책 목록 응답:', policies.length, '개')
        
        return policies
    } catch (error) {
        console.error('정책 API 호출 실패:', error)
        return []
    }
}