import { apiClient } from './client'
import type { Policy, PolicyFilters } from './types'
import { isMockMode } from '../config/env'
import { mockPolicies } from './mock/policies'

/**
 * Filter policies based on search criteria (mimics backend SQL logic)
 */
const filterPolicies = (policies: Policy[], filters?: PolicyFilters): Policy[] => {
    let filtered = [...policies]

    if (filters?.q) {
        const searchTerm = filters.q.toLowerCase()
        filtered = filtered.filter(
            p =>
                p.title?.toLowerCase().includes(searchTerm) ||
                p.summary?.toLowerCase().includes(searchTerm)
        )
    }

    if (filters?.region) {
        filtered = filtered.filter(p => p.region?.startsWith(filters.region!))
    }

    if (filters?.category) {
        filtered = filtered.filter(p => p.category === filters.category)
    }

    if (filters?.category_auto) {
        filtered = filtered.filter(p => p.category_auto === filters.category_auto)
    }

    // Apply pagination
    const offset = filters?.offset || 0
    const limit = filters?.limit || 20

    return filtered.slice(offset, offset + limit)
}

/**
 * Get list of policies with optional filtering
 */
export const getPolicies = async (filters?: PolicyFilters): Promise<Policy[]> => {
    if (isMockMode()) {
        // Mock mode: use local data with filtering
        await new Promise(resolve => setTimeout(resolve, 300)) // Simulate network delay
        return filterPolicies(mockPolicies, filters)
    }

    // Real API mode
    const { data } = await apiClient.get<Policy[]>('/api/policies', {
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

    if (isMockMode()) {
        // Mock mode: find policy in local data
        await new Promise(resolve => setTimeout(resolve, 200)) // Simulate network delay
        const policy = mockPolicies.find(p => p.plcy_no === plcy_no)
        if (!policy) {
            throw new Error(`Policy not found: ${plcy_no}`)
        }
        return policy
    }

    // Real API mode
    const { data } = await apiClient.get<Policy>(`/api/policies/${plcy_no}`)
    return data
}
