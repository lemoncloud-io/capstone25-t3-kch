import { apiClient } from './client'
import type {
    LLMGenerationRequest,
    TitleGenerationResponse,
    SummaryGenerationResponse,
    BlogContentGenerationResponse,
    FullBlogGenerationResponse,
    RewriteResponse,
} from './types'
import { isMockMode } from '../config/env'
import {
    mockGenerateTitle,
    mockGenerateSummary,
    mockGenerateBlogContent,
    mockGenerateFullBlog,
    mockRewriteText,
} from './mock/llm'

/**
 * Generate blog title from policy data
 */
export const generateTitle = async (
    data?: LLMGenerationRequest
): Promise<TitleGenerationResponse> => {
    if (isMockMode()) {
        return mockGenerateTitle(data)
    }

    const response = await apiClient.post<TitleGenerationResponse>('/api/generate-title', data)
    return response.data
}

/**
 * Generate blog summary from policy data
 */
export const generateSummary = async (
    data?: LLMGenerationRequest
): Promise<SummaryGenerationResponse> => {
    if (isMockMode()) {
        return mockGenerateSummary(data)
    }

    const response = await apiClient.post<SummaryGenerationResponse>('/api/generate-summary', data)
    return response.data
}

/**
 * Generate blog content from policy data
 */
export const generateBlogContent = async (
    data?: LLMGenerationRequest
): Promise<BlogContentGenerationResponse> => {
    if (isMockMode()) {
        return mockGenerateBlogContent(data)
    }

    const response = await apiClient.post<BlogContentGenerationResponse>(
        '/api/generate-blog-content',
        data
    )
    return response.data
}

/**
 * Generate full blog (title + summary + content) at once
 */
export const generateFullBlog = async (
    data?: LLMGenerationRequest
): Promise<FullBlogGenerationResponse> => {
    if (isMockMode()) {
        return mockGenerateFullBlog(data)
    }

    const response = await apiClient.post<FullBlogGenerationResponse>(
        '/api/generate-full-blog',
        data
    )
    return response.data
}

/**
 * Rewrite text with specified tone
 */
export const rewriteText = async (text: string, tone?: string): Promise<RewriteResponse> => {
    if (isMockMode()) {
        return mockRewriteText(text, tone)
    }

    const response = await apiClient.post<RewriteResponse>('/api/rewrite', { text, tone })
    return response.data
}
