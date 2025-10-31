import { apiClient } from './client'
import type { HealthResponse, OpenAIPingResponse } from './types'

/**
 * Check backend server health
 */
export const checkHealth = async (): Promise<HealthResponse> => {
    const { data } = await apiClient.get<HealthResponse>('/api/health')
    return data
}
