// Policy API Types
export interface Policy {
    plcy_no: string
    title: string | null
    category: string | null
    category_auto: string | null
    region: string | null
    amount_min: number | null
    amount_max: number | null
    period_start: string | null
    period_end: string | null
    provider: string | null
    summary: string | null
    blog_json: {
        conditions?: {
            target?: string
        }
        summary?: string
        apply?: {
            method?: string
        }
    } | null
}

export interface PolicyFilters {
    q?: string // Search term for title/summary
    region?: string // Region filter
    category?: string // Original category
    category_auto?: string // Auto-classified category
    limit?: number // Results per page (1-100)
    offset?: number // Pagination offset
}

// LLM Generation API Types
export interface LLMGenerationRequest {
    plcy_no?: string
    title?: string
    category?: string
    region?: string
    summary?: string
    blog_json?: {
        conditions?: {
            target?: string
        }
        summary?: string
        apply?: {
            method?: string
        }
    }
}

export interface TitleGenerationResponse {
    title: string
}

export interface SummaryGenerationResponse {
    summary: string
}

export interface BlogContentGenerationResponse {
    blog_content: string
}

export interface FullBlogGenerationResponse {
    title: string
    summary: string
    blog_content: string
}

export interface RewriteRequest {
    text: string
    tone?: string
}

export interface RewriteResponse {
    result: string
}

// Health Check Types
export interface HealthResponse {
    status: string
    message: string
}

export interface OpenAIPingResponse {
    ok: boolean
    text: string
    model: string
}

// Post Types (camelCase from Python API via alias_generator)
export interface Post {
    id: number
    slug: string
    title: string
    summary: string
    content: string
    category: string
    thumbnail: string | null
    author: string
    viewCount: number
    isPublished: boolean
    createdAt: string
    updatedAt: string
    publishedAt: string | null
    plcyNo: string | null
}

export interface PostCreate {
    title: string
    summary: string
    content: string
    category: string
    thumbnail?: string
    plcyNo?: string
}

export interface PostUpdate {
    title?: string
    summary?: string
    content?: string
    category?: string
    thumbnail?: string
    plcyNo?: string
}

export interface PostFilters {
    category?: string
    isPublished?: boolean
    limit?: number
    offset?: number
}

export interface Category {
    category: string
    count: number
}
