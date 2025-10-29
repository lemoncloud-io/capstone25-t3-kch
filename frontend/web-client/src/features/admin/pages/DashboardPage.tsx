import { FileText, Users, TrendingUp, Activity, Server } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getPosts, checkHealth } from '@/shared/api'

export const DashboardPage = () => {
    // Health check with 30s polling
    const { data: healthData, isLoading: healthLoading } = useQuery({
        queryKey: ['health'],
        queryFn: checkHealth,
        refetchInterval: 30000,
        retry: 1,
    })

    // Fetch all posts
    const { data: posts = [], isLoading: postsLoading } = useQuery({
        queryKey: ['posts'],
        queryFn: () => getPosts(),
    })

    // Calculate statistics from real data
    const totalPosts = posts.length
    const totalViews = posts.reduce((sum, post) => sum + post.viewCount, 0)
    const publishedPosts = posts.filter(post => post.isPublished).length

    const stats = [
        {
            label: '전체 포스트',
            value: postsLoading ? '-' : totalPosts.toString(),
            icon: FileText,
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
        {
            label: '총 조회수',
            value: postsLoading ? '-' : totalViews.toLocaleString(),
            icon: Users,
            bgColor: 'bg-green-100',
            iconColor: 'text-green-600',
        },
        {
            label: '게시된 포스트',
            value: postsLoading ? '-' : publishedPosts.toString(),
            icon: TrendingUp,
            bgColor: 'bg-purple-100',
            iconColor: 'text-purple-600',
        },
        {
            label: '카테고리',
            value: postsLoading ? '-' : [...new Set(posts.map(post => post.category))].length.toString(),
            icon: Activity,
            bgColor: 'bg-orange-100',
            iconColor: 'text-orange-600',
        },
    ]

    const recentPosts = [...posts]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">대시보드</h1>

            {/* System Health Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${healthData?.status === 'ok' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                            <Server className={healthData?.status === 'ok' ? 'text-green-600' : 'text-yellow-600'} size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">백엔드 서버</p>
                            <p className="text-lg font-bold text-gray-900">
                                {healthLoading ? '확인 중...' : healthData?.status === 'ok' ? '정상' : '오류'}
                            </p>
                        </div>
                    </div>
                    <div className={`h-3 w-3 rounded-full ${healthData?.status === 'ok' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                </div>
                {healthData?.message && (
                    <p className="text-xs text-gray-500 mt-3">{healthData.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map(stat => {
                    const Icon = stat.icon
                    return (
                        <div
                            key={stat.label}
                            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                    <Icon className={stat.iconColor} size={24} />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                        </div>
                    )
                })}
            </div>

            {/* Recent Posts */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">최근 포스트</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    제목
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    상태
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    조회수
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {postsLoading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                        로딩 중...
                                    </td>
                                </tr>
                            ) : recentPosts.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                        포스트가 없습니다
                                    </td>
                                </tr>
                            ) : (
                                recentPosts.map(post => (
                                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{post.title}</div>
                                            <div className="text-xs text-gray-500">{post.category}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                post.isPublished
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {post.isPublished ? '게시됨' : '미발행'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                            {post.viewCount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
