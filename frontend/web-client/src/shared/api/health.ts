import { apiClient } from './client'
import type { HealthResponse, OpenAIPingResponse } from './types'
import { isMockMode } from '../config/env'

/**
 * Check backend server health
 */
export const checkHealth = async (): Promise<HealthResponse> => {
    if (isMockMode()) {
        // Mock mode: simulate healthy server
        await new Promise(resolve => setTimeout(resolve, 100))
        return {
            status: 'ok',
            message: '서버가 정상 작동 중입니다 (Mock Mode)',
        }
    }

    const { data } = await apiClient.get<HealthResponse>('/api/health')
    return data
}

/**
 * Ping OpenAI to check API connectivity
 */
export const pingOpenAI = async (): Promise<OpenAIPingResponse> => {
    if (isMockMode()) {
        // Mock mode: simulate successful OpenAI connection
        await new Promise(resolve => setTimeout(resolve, 150))
        return {
            ok: true,
            text: 'PONG',
            model: 'gpt-4o-mini (Mock)',
        }
    }

    const { data } = await apiClient.get<OpenAIPingResponse>('/openai/ping')
    return data
}
