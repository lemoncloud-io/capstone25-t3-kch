import React from 'react'
import { FileText, Users, TrendingUp, Activity, Eye, ExternalLink } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getPosts, type Post } from '../../../shared/api/posts'
import { Link } from 'react-router-dom'

function RecentPostCard({ post }: { post: Post }) {
    const categoryColors: Record<string, string> = {
        일자리: 'bg-blue-100 text-blue-700',
        주거: 'bg-purple-100 text-purple-700',
        복지: 'bg-orange-100 text-orange-700',
        교육: 'bg-emerald-100 text-emerald-700',
    }

    const categoryColor = categoryColors[post.category] || 'bg-gray-100 text-gray-700'

    const formatDate = (isoDate: string) => {
        const date = new Date(isoDate)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return '오늘'
        if (diffDays === 1) return '어제'
        if (diffDays < 7) return `${diffDays}일 전`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`
        if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`
        return `${Math.floor(diffDays / 365)}년 전`
    }

    return (
        <Link
            to={`/posts/${post.slug}`}
            className="group flex flex-col gap-3 rounded-xl bg-white p-4 ring-1 ring-gray-100 transition-all duration-200 hover:shadow-md hover:ring-gray-200"
        >
            {/* 썸네일 */}
            <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-gray-100">
                {post.thumbnail ? (
                    <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                        }}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        이미지 없음
                    </div>
                )}
            </div>

            {/* 내용 */}
            <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${categoryColor}`}>
                        {post.category}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
                </div>
                <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {post.title}
                </h3>
                <p className="line-clamp-2 text-xs text-gray-500">{post.summary}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {post.viewCount.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                        <ExternalLink size={12} />
                        보기
                    </span>
                </div>
            </div>
        </Link>
    )
}

export default function DashboardPage() {
    // 실제 API 데이터 가져오기
    const { data: posts = [], isLoading } = useQuery({
        queryKey: ['posts'],
        queryFn: () => getPosts(), // 전체 게시글 가져오기 (limit 없음)
    })

    // 실제 데이터 기반 통계 계산
    const totalPosts = posts.length
    const totalViews = posts.reduce((sum, post) => sum + post.viewCount, 0)
    const publishedPosts = posts.length

    const stats = [
        {
            label: '전체 포스트',
            value: totalPosts.toString(),
            icon: FileText,
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
        {
            label: '누적 조회수',
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
            value: [...new Set(posts.map(post => post.category))].length.toString(),
            icon: Activity,
            bgColor: 'bg-orange-100',
            iconColor: 'text-orange-600',
        },
    ]

    const recentPosts = posts
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6) // 최근 6개만 표시

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">데이터를 불러오는 중...</span>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">대시보드</h1>
                <p className="text-sm text-gray-600">포스트 통계 및 최근 게시물을 확인하세요</p>
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

            {/* Recent Posts with Thumbnails */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">최근 포스트</h2>
                </div>
                <div className="p-6">
                    {recentPosts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <FileText className="h-12 w-12 text-gray-300 mb-4" />
                            <p className="text-sm font-medium text-gray-500 mb-1">포스트가 없습니다</p>
                            <p className="text-xs text-gray-400">새로운 포스트를 작성하면 여기에 표시됩니다</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recentPosts.map(post => (
                                <RecentPostCard key={post.id} post={post} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
