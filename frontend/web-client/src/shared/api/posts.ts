import { apiClient } from './client'
import type { Post, PostCreate, PostUpdate, PostFilters, Category } from './types'

export const getPosts = async (filters?: PostFilters): Promise<Post[]> => {
    const params: Record<string, unknown> = {}
    if (filters?.category) params.category = filters.category
    if (filters?.isPublished !== undefined) params.isPublished = filters.isPublished
    if (filters?.limit) params.limit = filters.limit
    if (filters?.offset) params.offset = filters.offset

    const { data } = await apiClient.get<Post[]>('/api/posts', { params })
    return data
}

export const getPost = async (slug: string): Promise<Post> => {
    if (!slug?.trim()) {
        throw new Error('Slug is required and cannot be empty')
    }

    const { data } = await apiClient.get<Post>(`/api/posts/${slug}`)
    return data
}

export const createPost = async (post: PostCreate): Promise<Post> => {
    const { data } = await apiClient.post<Post>('/api/posts', post)
    return data
}

export const updatePost = async (slug: string, post: PostUpdate): Promise<Post> => {
    if (!slug?.trim()) {
        throw new Error('Slug is required and cannot be empty')
    }

    const { data } = await apiClient.put<Post>(`/api/posts/${slug}`, post)
    return data
}

export const deletePost = async (slug: string): Promise<void> => {
    if (!slug?.trim()) {
        throw new Error('Slug is required and cannot be empty')
    }

    await apiClient.delete(`/api/posts/${slug}`)
}

export const publishPost = async (slug: string): Promise<Post> => {
    if (!slug?.trim()) {
        throw new Error('Slug is required and cannot be empty')
    }

    const { data } = await apiClient.post<Post>(`/api/posts/${slug}/publish`)
    return data
}

export const incrementViews = async (slug: string): Promise<Post> => {
    if (!slug?.trim()) {
        throw new Error('Slug is required and cannot be empty')
    }

    const { data } = await apiClient.post<Post>(`/api/posts/${slug}/increment-views`)
    return data
}

export const getCategories = async (filters?: { isPublished?: boolean }): Promise<Category[]> => {
    const params: Record<string, unknown> = {}
    if (filters?.isPublished !== undefined) {
        params.isPublished = filters.isPublished
    }

    const { data } = await apiClient.get<Category[]>('/api/categories', { params })
    return data
}
