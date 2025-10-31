import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { getPolicies, getPolicyFilterOptions, type PolicyFilters } from '@/shared/api'
import { formatPolicyAmount } from '@/shared/utils/currency'

const MAX_VISIBLE_REGIONS = 10
const PAGE_SIZE = 10

// Category color mapping for visual distinction
const getCategoryColor = (category: string): string => {
    const categoryMap: Record<string, string> = {
        '취업': 'bg-blue-100 text-blue-700 border-blue-200',
        '일자리': 'bg-blue-100 text-blue-700 border-blue-200',
        '주거': 'bg-green-100 text-green-700 border-green-200',
        '복지': 'bg-purple-100 text-purple-700 border-purple-200',
        '생활': 'bg-purple-100 text-purple-700 border-purple-200',
        '교육': 'bg-orange-100 text-orange-700 border-orange-200',
        '금융': 'bg-teal-100 text-teal-700 border-teal-200',
        '창업': 'bg-pink-100 text-pink-700 border-pink-200',
        '문화': 'bg-indigo-100 text-indigo-700 border-indigo-200',
        '참여': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    }

    // Find matching category
    for (const [key, value] of Object.entries(categoryMap)) {
        if (category.includes(key)) {
            return value
        }
    }

    return 'bg-gray-100 text-gray-700 border-gray-200' // default
}

// Region button color mapping for visual variety
const getRegionButtonColor = (region: string, isActive: boolean): string => {
    if (isActive) {
        const activeColors: Record<string, string> = {
            '전국': 'bg-blue-600 text-white',
            '서울': 'bg-purple-600 text-white',
            '부산': 'bg-cyan-600 text-white',
            '대구': 'bg-pink-600 text-white',
            '인천': 'bg-indigo-600 text-white',
            '광주': 'bg-orange-600 text-white',
            '대전': 'bg-teal-600 text-white',
            '울산': 'bg-emerald-600 text-white',
            '세종': 'bg-violet-600 text-white',
            '경기': 'bg-rose-600 text-white',
        }
        return activeColors[region] || 'bg-blue-600 text-white'
    }

    const inactiveColors: Record<string, string> = {
        '전국': 'bg-blue-50 text-blue-700 hover:bg-blue-100',
        '서울': 'bg-purple-50 text-purple-700 hover:bg-purple-100',
        '부산': 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100',
        '대구': 'bg-pink-50 text-pink-700 hover:bg-pink-100',
        '인천': 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
        '광주': 'bg-orange-50 text-orange-700 hover:bg-orange-100',
        '대전': 'bg-teal-50 text-teal-700 hover:bg-teal-100',
        '울산': 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
        '세종': 'bg-violet-50 text-violet-700 hover:bg-violet-100',
        '경기': 'bg-rose-50 text-rose-700 hover:bg-rose-100',
    }
    return inactiveColors[region] || 'bg-gray-100 text-gray-700 hover:bg-gray-200'
}

export const PoliciesManagePage = () => {
    const navigate = useNavigate()
    const [filters, setFilters] = useState<PolicyFilters>({
        limit: PAGE_SIZE,
        offset: 0,
    })
    const [searchTerm, setSearchTerm] = useState('')

    // Fetch filter options (static, cached)
    const { data: filterOptions } = useQuery({
        queryKey: ['policyFilterOptions'],
        queryFn: getPolicyFilterOptions,
        staleTime: Infinity, // Never refetch - these are static options
    })

    // Fetch policies data
    const { data, isLoading, error } = useQuery({
        queryKey: ['policies', filters],
        queryFn: () => getPolicies(filters),
        retry: 1,
    })

    const policies = data?.items
    const total = data?.total || 0
    const totalPages = Math.ceil(total / PAGE_SIZE)

    // Use static filter options from API
    const regions = ['all', ...(filterOptions?.regions || [])]
    const categories = ['all', ...(filterOptions?.categories || [])]

    const handleSearch = () => {
        setFilters(prev => ({
            ...prev,
            q: searchTerm || undefined,
            offset: 0,
        }))
    }

    const handleRegionClick = (region: string) => {
        setFilters(prev => ({
            ...prev,
            region: region === 'all' ? undefined : region,
            offset: 0,
        }))
    }

    const handleCategoryClick = (category: string) => {
        setFilters(prev => ({
            ...prev,
            category_auto: category === 'all' ? undefined : category,
            offset: 0,
        }))
    }

    const handlePageChange = (page: number) => {
        setFilters(prev => ({
            ...prev,
            offset: (page - 1) * PAGE_SIZE,
        }))
    }

    const handleRowClick = (plcy_no: string) => {
        navigate(`/admin/policies/${plcy_no}`)
    }

    const handleGenerateBlog = (e: React.MouseEvent, plcy_no: string) => {
        e.stopPropagation() // Prevent row click event
        navigate(`/admin/policies/llm-test?plcy_no=${plcy_no}`)
    }

    const currentOffset = filters.offset || 0
    const currentPage = Math.floor(currentOffset / PAGE_SIZE) + 1

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages + 2) {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Always show first page
            pages.push(1)

            if (currentPage > 3) {
                pages.push('...')
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }

            if (currentPage < totalPages - 2) {
                pages.push('...')
            }

            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages)
            }
        }

        return pages
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    정책 데이터를 불러오는데 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <h1 className="text-2xl font-bold mb-4 sm:mb-0">정책 관리</h1>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
                {/* Search Input */}
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={20}
                        />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            placeholder="정책명 또는 요약으로 검색..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        검색
                    </button>
                </div>

                {/* Region Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">지역</label>
                    <div className="flex flex-wrap gap-2">
                        {regions.slice(0, MAX_VISIBLE_REGIONS).map(region => {
                            const isActive = filters.region === region || (!filters.region && region === 'all')
                            const displayName = region === 'all' ? '전체' : region
                            return (
                                <button
                                    key={region}
                                    onClick={() => handleRegionClick(region)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${getRegionButtonColor(displayName, isActive)}`}
                                >
                                    {displayName}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Category Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(category => {
                            const isActive = filters.category_auto === category || (!filters.category_auto && category === 'all')
                            const displayName = category === 'all' ? '전체' : category

                            // Get color for active state
                            let buttonClass = ''
                            if (isActive) {
                                if (displayName === '전체') {
                                    buttonClass = 'bg-gray-700 text-white'
                                } else {
                                    // Extract base color from getCategoryColor
                                    const colorClass = getCategoryColor(displayName)
                                    if (colorClass.includes('blue')) buttonClass = 'bg-blue-600 text-white'
                                    else if (colorClass.includes('green')) buttonClass = 'bg-green-600 text-white'
                                    else if (colorClass.includes('purple')) buttonClass = 'bg-purple-600 text-white'
                                    else if (colorClass.includes('orange')) buttonClass = 'bg-orange-600 text-white'
                                    else if (colorClass.includes('teal')) buttonClass = 'bg-teal-600 text-white'
                                    else if (colorClass.includes('pink')) buttonClass = 'bg-pink-600 text-white'
                                    else if (colorClass.includes('indigo')) buttonClass = 'bg-indigo-600 text-white'
                                    else if (colorClass.includes('yellow')) buttonClass = 'bg-yellow-600 text-white'
                                    else buttonClass = 'bg-gray-600 text-white'
                                }
                            } else {
                                // Inactive colors
                                const colorClass = getCategoryColor(displayName)
                                buttonClass = colorClass.replace('border-', '').replace(/border-\w+-\d+/, '').replace('100', '50').replace('700', '700') + ' hover:' + colorClass.replace('border-', '').replace(/border-\w+-\d+/, '').replace('50', '100')
                            }

                            return (
                                <button
                                    key={category}
                                    onClick={() => handleCategoryClick(category)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${buttonClass}`}
                                >
                                    {displayName}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="text-sm text-gray-500 pt-2 border-t">
                    {total > 0 ? (
                        <>
                            총 {total}개 중 {currentOffset + 1}-{currentOffset + (policies?.length || 0)}개 표시
                        </>
                    ) : (
                        '검색 결과 없음'
                    )}
                </div>
            </div>

            {/* Policies Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-6">
                        <div className="animate-pulse space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex space-x-4">
                                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                                        정책번호
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        제목
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-28">
                                        지역
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                                        카테고리
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-36">
                                        지원금액
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                                        LLM 생성
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {policies?.map(policy => (
                                    <tr
                                        key={policy.plcy_no}
                                        onClick={() => handleRowClick(policy.plcy_no)}
                                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50/30 hover:to-transparent cursor-pointer transition-all duration-200"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-mono text-gray-600">
                                                {policy.plcy_no}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {policy.title || '제목 없음'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">
                                                {policy.region || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {(policy.category_auto || policy.category) && (
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(policy.category_auto || policy.category || '')}`}>
                                                    {policy.category_auto || policy.category}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                                                {formatPolicyAmount(policy.amount_min, policy.amount_max)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    onClick={(e) => handleGenerateBlog(e, policy.plcy_no)}
                                                    className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                                                    title="LLM 콘텐츠 생성기"
                                                >
                                                    ✨ 생성
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Controls */}
                {!isLoading && totalPages > 0 && (
                    <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-gray-200">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft size={16} />
                            이전
                        </button>

                        {getPageNumbers().map((page, index) => (
                            <button
                                key={index}
                                onClick={() => typeof page === 'number' && handlePageChange(page)}
                                disabled={page === '...'}
                                className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                                    page === currentPage
                                        ? 'bg-blue-600 text-white'
                                        : page === '...'
                                          ? 'cursor-default text-gray-400'
                                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            다음
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
