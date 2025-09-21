import { FileText, Users, TrendingUp, Activity } from 'lucide-react'
import { mockPosts } from '@/shared/api/posts'

export default function DashboardPage() {
    // mockPosts 기반 통계 계산
    const totalPosts = mockPosts.length
    const totalViews = mockPosts.reduce((sum, post) => sum + post.viewCount, 0)
    const publishedPosts = mockPosts.length // 모든 mockPosts는 게시됨 상태로 가정

    const stats = [
        {
            label: '전체 포스트',
            value: totalPosts.toString(),
            icon: FileText,
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
        {
            label: '총 조회수',
            value: totalViews.toLocaleString(),
            icon: Users,
            bgColor: 'bg-green-100',
            iconColor: 'text-green-600',
        },
        {
            label: '게시된 포스트',
            value: publishedPosts.toString(),
            icon: TrendingUp,
            bgColor: 'bg-purple-100',
            iconColor: 'text-purple-600',
            change: '+5%',
        },
        {
            label: '카테고리',
            value: [...new Set(mockPosts.map(post => post.category))].length.toString(),
            icon: Activity,
            bgColor: 'bg-orange-100',
            iconColor: 'text-orange-600',
        },
    ]

    const recentPosts = mockPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">대시보드</h1>

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
                            {recentPosts.map(post => (
                                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{post.title}</div>
                                        <div className="text-xs text-gray-500">{post.category}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            게시됨
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                        {post.viewCount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
