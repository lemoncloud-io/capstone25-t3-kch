import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { Eye, Search, Sparkles } from 'lucide-react'
import { getPolicies, type PolicyFilters } from '@/shared/api'
import { formatPolicyAmount } from '@/shared/utils/currency'
import { toast } from 'sonner'

const MAX_VISIBLE_REGIONS = 10

export const PoliciesManagePage = () => {
    const navigate = useNavigate()
    const [filters, setFilters] = useState<PolicyFilters>({
        limit: 20,
        offset: 0,
    })
    const [searchTerm, setSearchTerm] = useState('')

    const { data: policies, isLoading, error } = useQuery({
        queryKey: ['policies', filters],
        queryFn: () => getPolicies(filters),
        retry: 1,
    })

    // Extract unique regions and categories with proper type guards
    const regions = [
        'all',
        ...new Set(
            policies
                ?.map(p => p.region)
                .filter((region): region is string => region !== null && region !== undefined) ?? []
        ),
    ]

    const categories = [
        'all',
        ...new Set(
            policies
                ?.map(p => p.category_auto || p.category)
                .filter((cat): cat is string => cat !== null && cat !== undefined) ?? []
        ),
    ]

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

    const handleViewDetail = (plcy_no: string) => {
        navigate(`/admin/policies/${plcy_no}`)
    }

    const handleGenerateBlog = (plcy_no: string) => {
        navigate(`/admin/policies/llm-test?plcy_no=${plcy_no}`)
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
                        {regions.slice(0, MAX_VISIBLE_REGIONS).map(region => (
                            <button
                                key={region}
                                onClick={() => handleRegionClick(region)}
                                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                                    filters.region === region || (!filters.region && region === 'all')
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {region === 'all' ? '전체' : region}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => handleCategoryClick(category)}
                                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                                    filters.category_auto === category || (!filters.category_auto && category === 'all')
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {category === 'all' ? '전체' : category}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="text-sm text-gray-500 pt-2 border-t">
                    총 {policies?.length || 0}개의 정책
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
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        정책번호
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        제목
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        지역
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        카테고리
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        지원금액
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        작업
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {policies?.map(policy => (
                                    <tr key={policy.plcy_no} className="hover:bg-gray-50">
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
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                    {policy.category_auto || policy.category}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">
                                                {formatPolicyAmount(policy.amount_min, policy.amount_max)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleViewDetail(policy.plcy_no)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="상세보기"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleGenerateBlog(policy.plcy_no)}
                                                    className="text-purple-600 hover:text-purple-800"
                                                    title="블로그 생성"
                                                >
                                                    <Sparkles size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
