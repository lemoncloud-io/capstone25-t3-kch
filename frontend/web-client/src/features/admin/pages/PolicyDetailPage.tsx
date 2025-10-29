import { useParams, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Sparkles, Calendar, MapPin, Tag, DollarSign, Building } from 'lucide-react'
import { getPolicyDetail } from '@/shared/api/policies'
import { formatPolicyAmount } from '@/shared/utils/currency'

export const PolicyDetailPage = () => {
    const { plcy_no } = useParams<{ plcy_no: string }>()
    const navigate = useNavigate()

    const { data: policy, isLoading, error } = useQuery({
        queryKey: ['policy', plcy_no],
        queryFn: () => getPolicyDetail(plcy_no!),
        enabled: !!plcy_no,
        retry: 1,
    })

    const handleGenerateBlog = () => {
        navigate(`/admin/llm-test?plcy_no=${plcy_no}`)
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    정책 상세 정보를 불러오는데 실패했습니다.
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        )
    }

    if (!policy) {
        return (
            <div className="p-6">
                <div className="text-center text-gray-500">정책을 찾을 수 없습니다.</div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate('/admin/policies')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                >
                    <ArrowLeft size={20} />
                    <span>목록으로</span>
                </button>
                <button
                    onClick={handleGenerateBlog}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                    <Sparkles size={20} />
                    블로그 생성
                </button>
            </div>

            {/* Main Info Card */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {policy.title || '제목 없음'}
                        </h1>
                        <p className="text-sm font-mono text-gray-500">정책번호: {policy.plcy_no}</p>
                    </div>
                    {(policy.category_auto || policy.category) && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                            {policy.category_auto || policy.category}
                        </span>
                    )}
                </div>

                {policy.summary && (
                    <p className="text-gray-700 leading-relaxed mb-6 p-4 bg-gray-50 rounded-lg">
                        {policy.summary}
                    </p>
                )}

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {policy.region && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                            <MapPin className="text-blue-600" size={20} />
                            <div>
                                <div className="text-xs text-gray-500">지역</div>
                                <div className="font-medium text-gray-900">{policy.region}</div>
                            </div>
                        </div>
                    )}

                    {policy.provider && (
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                            <Building className="text-purple-600" size={20} />
                            <div>
                                <div className="text-xs text-gray-500">제공기관</div>
                                <div className="font-medium text-gray-900">{policy.provider}</div>
                            </div>
                        </div>
                    )}

                    {(policy.amount_min || policy.amount_max) && (
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <DollarSign className="text-green-600" size={20} />
                            <div>
                                <div className="text-xs text-gray-500">지원금액</div>
                                <div className="font-medium text-gray-900">
                                    {formatPolicyAmount(policy.amount_min, policy.amount_max)}
                                </div>
                            </div>
                        </div>
                    )}

                    {(policy.period_start || policy.period_end) && (
                        <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                            <Calendar className="text-yellow-600" size={20} />
                            <div>
                                <div className="text-xs text-gray-500">신청기간</div>
                                <div className="font-medium text-gray-900">
                                    {policy.period_start} ~ {policy.period_end}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Blog JSON Section */}
            {policy.blog_json && (
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Tag size={20} className="text-gray-600" />
                        블로그 정보
                    </h2>

                    <div className="space-y-4">
                        {policy.blog_json.conditions?.target && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="text-sm font-medium text-gray-700 mb-2">
                                    지원 대상
                                </div>
                                <div className="text-gray-900">
                                    {policy.blog_json.conditions.target}
                                </div>
                            </div>
                        )}

                        {policy.blog_json.summary && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="text-sm font-medium text-gray-700 mb-2">
                                    핵심 혜택
                                </div>
                                <div className="text-gray-900">{policy.blog_json.summary}</div>
                            </div>
                        )}

                        {policy.blog_json.apply?.method && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="text-sm font-medium text-gray-700 mb-2">
                                    신청 방법
                                </div>
                                <div className="text-gray-900">{policy.blog_json.apply.method}</div>
                            </div>
                        )}
                    </div>

                    {/* Raw JSON View */}
                    <details className="mt-6">
                        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                            JSON 원본 보기
                        </summary>
                        <pre className="mt-2 p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-xs">
                            {JSON.stringify(policy.blog_json, null, 2)}
                        </pre>
                    </details>
                </div>
            )}
        </div>
    )
}
