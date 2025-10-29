import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
    Home,
    Briefcase,
    ArrowLeft,
    Calendar,
    Eye,
    Heart,
    GraduationCap,
    Coins,
    MoreHorizontal,
    ChevronRight,
    AlertCircle,
} from 'lucide-react'

import { getPosts } from '@/shared/api'
import { getThumbnail } from '@/shared/constants/defaultImages'

// 카테고리별 아이콘 및 색상 매핑
const categoryConfig: Record<
    string,
    {
        icon: typeof Home
        color: string
        bgColor: string
        description: string
    }
> = {
    취업: {
        icon: Briefcase,
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        description: '청년 취업 지원 프로그램, 채용 정보, 일자리 창출 정책',
    },
    주거: {
        icon: Home,
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        description: '청년 주거 지원, 월세 보조, 임대주택 정보',
    },
    복지: {
        icon: Heart,
        color: 'text-pink-700',
        bgColor: 'bg-pink-100',
        description: '청년 복지 혜택, 의료 지원, 생활 안정 프로그램',
    },
    교육: {
        icon: GraduationCap,
        color: 'text-purple-700',
        bgColor: 'bg-purple-100',
        description: '교육비 지원, 장학금, 학습 프로그램',
    },
    금융: {
        icon: Coins,
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        description: '대출 지원, 금융 혜택, 창업 자금',
    },
    기타: {
        icon: MoreHorizontal,
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
        description: '기타 청년 지원 정책',
    },
}

export const CategoryPage = () => {
    const { category } = useParams<{ category: string }>()
    const decodedCategory = category ? decodeURIComponent(category) : ''

    // Get category configuration
    const config = categoryConfig[decodedCategory] || {
        icon: MoreHorizontal,
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
        description: '정책 정보',
    }

    // Fetch published posts for this category
    const {
        data: posts,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['posts', 'category', decodedCategory],
        queryFn: () =>
            getPosts({
                category: decodedCategory,
                isPublished: true, // Only show published posts
            }),
        enabled: !!decodedCategory,
    })

    const Icon = config.icon

    // Loading state - Mobile Optimized
    if (isLoading) {
        return (
            <div className="px-4 sm:px-0">
                {/* Header skeleton */}
                <div className="mb-6 sm:mb-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-32 sm:w-48 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full max-w-md"></div>
                    </div>
                </div>

                {/* Posts skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 animate-pulse">
                            <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="max-w-2xl mx-auto px-4 sm:px-0">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-8 sm:p-12 text-center">
                    <div className="inline-flex p-4 rounded-full bg-red-100 mb-4">
                        <AlertCircle size={32} className="text-red-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                        포스트를 불러올 수 없습니다
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 mb-6">
                        네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => refetch()}
                            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition text-sm sm:text-base"
                        >
                            다시 시도
                        </button>
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition text-sm sm:text-base"
                        >
                            <ArrowLeft size={18} className="mr-2" />
                            홈으로 돌아가기
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="pb-12">
            {/* Breadcrumb - Mobile Optimized */}
            <div className="flex items-center gap-2 mb-4 sm:mb-6 text-xs sm:text-sm px-1">
                <Link to="/" className="text-gray-500 hover:text-gray-700 transition-colors flex items-center">
                    <Home size={14} className="mr-1" />
                    <span className="hidden sm:inline">홈</span>
                </Link>
                <ChevronRight size={14} className="text-gray-400" />
                <span className="text-gray-900 font-medium">{decodedCategory}</span>
            </div>

            {/* Category Header - Mobile Optimized */}
            <div className="mb-6 sm:mb-8">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-5 sm:p-6 md:p-8">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl ${config.bgColor} flex-shrink-0`}>
                            <Icon size={28} className={config.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                {decodedCategory}
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mb-3 leading-relaxed">
                                {config.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                                <span className="text-gray-500">
                                    총{' '}
                                    <span className="font-semibold text-gray-900">
                                        {posts?.length || 0}
                                    </span>
                                    개의 정책
                                </span>
                                {posts && posts.length > 0 && (
                                    <>
                                        <span className="hidden sm:inline text-gray-300">•</span>
                                        <span className="text-gray-400">
                                            최근 업데이트: {new Date(posts[0].updatedAt).toLocaleDateString('ko-KR')}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts Grid - Mobile Optimized */}
            {posts && posts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {posts.map(post => (
                        <Link key={post.id} to={`/posts/${post.slug}`} className="block group">
                            <article className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
                                {/* Thumbnail */}
                                <div className="aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                    <img
                                        src={getThumbnail(post.category, post.thumbnail)}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>

                                <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
                                    {/* Category Badge */}
                                    <div className="mb-3">
                                        <span
                                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${config.bgColor} ${config.color}`}
                                        >
                                            <Icon size={12} />
                                            {decodedCategory}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors flex-1">
                                        {post.title}
                                    </h2>

                                    {/* Summary */}
                                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-4">
                                        {post.summary}
                                    </p>

                                    {/* Meta Info */}
                                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                                        <span className="flex items-center">
                                            <Calendar size={12} className="mr-1 flex-shrink-0" />
                                            <span className="truncate">
                                                {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                        </span>
                                        <span className="flex items-center ml-2">
                                            <Eye size={12} className="mr-1 flex-shrink-0" />
                                            {post.viewCount >= 1000
                                                ? `${(post.viewCount / 1000).toFixed(1)}k`
                                                : post.viewCount}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            ) : (
                // Empty State - Mobile Optimized
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-8 sm:p-12 text-center">
                    <div className={`inline-flex p-3 sm:p-4 rounded-full ${config.bgColor} mb-4`}>
                        <Icon size={40} className={config.color} />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                        아직 등록된 정책이 없습니다
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 mb-6 px-4">
                        {decodedCategory} 카테고리에 새로운 정책이 등록되면 여기에 표시됩니다.
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base transition-colors"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        다른 정책 둘러보기
                    </Link>
                </div>
            )}
        </div>
    )
}
