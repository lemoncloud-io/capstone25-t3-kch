import { config } from '../config/env'

const API_BASE_URL = config.API_BASE_URL

interface RequestConfig {
    params?: Record<string, unknown>
    headers?: Record<string, string>
}

interface ApiResponse<T> {
    data: T
}

const buildUrl = (endpoint: string, params?: Record<string, unknown>): string => {
    const url = `${API_BASE_URL}${endpoint}`

    if (!params) {
        return url
    }

    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, String(value))
        }
    })

    const queryString = searchParams.toString()
    return queryString ? `${url}?${queryString}` : url
}

const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
    if (!response.ok) {
        const error = await response.text().catch(() => response.statusText)
        throw new Error(`API Error (${response.status}): ${error}`)
    }

    const data = await response.json()
    return { data }
}

export const apiClient = {
    get: async <T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> => {
        const url = buildUrl(endpoint, config?.params)
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...config?.headers,
            },
        })

        return handleResponse<T>(response)
    },

    post: async <T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> => {
        const url = buildUrl(endpoint, config?.params)
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...config?.headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        })

        return handleResponse<T>(response)
    },

    put: async <T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> => {
        const url = buildUrl(endpoint, config?.params)
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...config?.headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        })

        return handleResponse<T>(response)
    },

    delete: async <T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> => {
        const url = buildUrl(endpoint, config?.params)
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...config?.headers,
            },
        })

        return handleResponse<T>(response)
    },
}
