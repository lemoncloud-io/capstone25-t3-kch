import { apiClient } from './client'
import type {
    LLMGenerationRequest,
    TitleGenerationResponse,
    SummaryGenerationResponse,
    BlogContentGenerationResponse,
    FullBlogGenerationResponse,
    RewriteResponse,
} from './types'

/**
 * Generate blog title from policy data
 */
export const generateTitle = async (
    data: LLMGenerationRequest
): Promise<TitleGenerationResponse> => {
    if (!data.plcy_no) {
        throw new Error('plcy_no is required')
    }
    const response = await apiClient.post<TitleGenerationResponse>(
        `/api/policies/${data.plcy_no}/content?type=title`
    )
    return response.data
}

/**
 * Generate blog summary from policy data
 */
export const generateSummary = async (
    data: LLMGenerationRequest
): Promise<SummaryGenerationResponse> => {
    if (!data.plcy_no) {
        throw new Error('plcy_no is required')
    }
    const response = await apiClient.post<SummaryGenerationResponse>(
        `/api/policies/${data.plcy_no}/content?type=summary`
    )
    return response.data
}

/**
 * Generate blog content from policy data
 */
export const generateBlogContent = async (
    data: LLMGenerationRequest
): Promise<BlogContentGenerationResponse> => {
    if (!data.plcy_no) {
        throw new Error('plcy_no is required')
    }
    const response = await apiClient.post<BlogContentGenerationResponse>(
        `/api/policies/${data.plcy_no}/content?type=blog`
    )
    return response.data
}

/**
 * Generate full blog (title + summary + content) at once
 */
export const generateFullBlog = async (
    data: LLMGenerationRequest
): Promise<FullBlogGenerationResponse> => {
    if (!data.plcy_no) {
        throw new Error('plcy_no is required')
    }
    const response = await apiClient.post<FullBlogGenerationResponse>(
        `/api/policies/${data.plcy_no}/content?type=full`
    )
    return response.data
}

/**
 * Rewrite text with specified tone
 */
export const rewriteText = async (text: string, tone?: string): Promise<RewriteResponse> => {
    const response = await apiClient.post<RewriteResponse>('/api/rewrite', { text, tone })
    return response.data
}
