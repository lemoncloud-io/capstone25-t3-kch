import { apiClient } from './client'
import type { PaginatedResponse, Policy, PolicyFilters, PolicyFilterOptions } from './types'

/**
 * Get list of policies with optional filtering
 */
export const getPolicies = async (filters?: PolicyFilters): Promise<PaginatedResponse<Policy>> => {
    const { data } = await apiClient.get<PaginatedResponse<Policy>>('/api/policies', {
        params: filters as Record<string, unknown>,
    })
    return data
}

/**
 * Get policy details by policy number
 */
export const getPolicyDetail = async (plcy_no: string): Promise<Policy> => {
    if (!plcy_no) {
        throw new Error('plcy_no is required')
    }

    const { data } = await apiClient.get<Policy>(`/api/policies/${plcy_no}`)
    return data
}

/**
 * Get available filter options (regions and categories)
 */
export const getPolicyFilterOptions = async (): Promise<PolicyFilterOptions> => {
    const { data } = await apiClient.get<PolicyFilterOptions>('/api/policies/filters')
    return data
}
