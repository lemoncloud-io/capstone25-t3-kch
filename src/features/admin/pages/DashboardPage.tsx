import { FileText, Users, TrendingUp, Activity } from 'lucide-react'

export default function DashboardPage() {
    const stats = [
        { label: '전체 포스트', value: '156', icon: FileText, color: 'blue', change: '+12%' },
        { label: '총 조회수', value: '45,234', icon: Users, color: 'green', change: '+23%' },
        { label: '변환율', value: '87.5%', icon: TrendingUp, color: 'purple', change: '+5%' },
        { label: '진행중', value: '3', icon: Activity, color: 'orange', change: '0%' },
    ]

    const recentPosts = [
        { id: 1, title: '2024 청년 주거지원 정책', status: 'published', views: 1234 },
        { id: 2, title: '대학생 학자금 대출 안내', status: 'draft', views: 0 },
        { id: 3, title: '신입사원 취업 지원금', status: 'published', views: 892 },
    ]

    return (
        <div>
            <h1 className="text-2xl font-bold mb-8">대시보드</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                                <stat.icon className={`text-${stat.color}-600`} size={24} />
                            </div>
                            <span className={`text-sm font-medium ${
                                stat.change.startsWith('+') ? 'text-green-600' : 'text-gray-600'
                            }`}>
                {stat.change}
              </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                        <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Posts */}
            <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold">최근 포스트</h2>
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                조회수
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {recentPosts.map((post) => (
                            <tr key={post.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {post.title}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.status === 'published' ? '게시됨' : '초안'}
                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {post.views.toLocaleString()}
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
