import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Calendar, Eye, ChevronRight, TrendingUp, Sparkles, AlertCircle } from 'lucide-react'

import { getPosts } from '@/shared/api'
import { getThumbnail } from '@/shared/constants/defaultImages'

import { CategoryNav } from '../components'

import type { Post } from '@/shared/api/types'

export const HomePage = () => {
    // Only show published posts on homepage
    const {
        data: posts,
        isLoading,
        error,
        refetch,
    } = useQuery<Post[]>({
        queryKey: ['posts', 'published'],
        queryFn: () => getPosts({ isPublished: true }),
    })

    // Get unique categories from posts
    const categories = Array.from(new Set(posts?.map(p => p.category) || []))

    if (isLoading) {
        return (
            <div className="space-y-6 px-4 sm:px-0">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-xl p-6 animate-pulse shadow-sm">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        )
    }

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
                    <button
                        onClick={() => refetch()}
                        className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition text-sm sm:text-base"
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        )
    }

    const featuredPost: Post | undefined = posts?.[0]

    return (
        <div className="pb-12">
            {/* Hero Section - Mobile Optimized */}
            <section className="mb-8 sm:mb-12">
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-white shadow-2xl">
                    <div className="flex items-start gap-3 mb-4">
                        <Sparkles className="flex-shrink-0 mt-1" size={24} />
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
                                청년 정책 정보
                            </h1>
                            <p className="text-base sm:text-lg md:text-xl mb-6 opacity-95 leading-relaxed">
                                취업, 주거, 복지, 교육, 금융 등<br className="sm:hidden" /> 청년을 위한 다양한 정책을
                                확인하세요
                            </p>
                        </div>
                    </div>

                    {categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {categories.slice(0, 4).map(category => (
                                <Link
                                    key={category}
                                    to={`/category/${encodeURIComponent(category)}`}
                                    className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg sm:rounded-xl font-semibold backdrop-blur-sm transition-all duration-200 hover:scale-105 text-sm sm:text-base"
                                >
                                    {category}
                                    <ChevronRight className="ml-1 sm:ml-2" size={18} />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Category Navigation */}
            <CategoryNav />

            {featuredPost && (
                <section className="mb-8 sm:mb-12">
                    <div className="flex items-center mb-4 sm:mb-6 px-1">
                        <TrendingUp className="text-red-500 mr-2 flex-shrink-0" size={20} />
                        <h2 className="text-xl sm:text-2xl font-bold">인기 포스트</h2>
                    </div>
                    <Link to={`/posts/${featuredPost.slug}`} className="block">
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                            <div className="flex flex-col md:flex-row">
                                {/* Thumbnail */}
                                <div className="w-full md:w-2/5 h-48 sm:h-56 md:h-auto overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                    <img
                                        src={getThumbnail(featuredPost.category, featuredPost.thumbnail)}
                                        alt={featuredPost.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-5 sm:p-6 md:p-8 md:w-3/5 flex flex-col justify-center">
                                    {/* Category & Views */}
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm font-semibold rounded-full">
                                            {featuredPost.category}
                                        </span>
                                        <span className="flex items-center text-gray-500 text-xs sm:text-sm">
                                            <Eye size={14} className="mr-1" />
                                            {featuredPost.viewCount.toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {featuredPost.title}
                                    </h3>

                                    {/* Summary */}
                                    <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                                        {featuredPost.summary}
                                    </p>

                                    {/* Meta */}
                                    <div className="flex items-center text-xs sm:text-sm text-gray-500">
                                        <Calendar size={14} className="mr-1 flex-shrink-0" />
                                        <span>{new Date(featuredPost.createdAt).toLocaleDateString('ko-KR')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </section>
            )}

            {/* Recent Posts Grid - Mobile Optimized */}
            <section>
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-1">최신 포스트</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {posts?.slice(1, 10).map(post => (
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

                                {/* Content */}
                                <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
                                    {/* Category Badge */}
                                    <div className="mb-3">
                                        <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg">
                                            {post.category}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="font-bold text-base sm:text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors flex-1">
                                        {post.title}
                                    </h3>

                                    {/* Summary */}
                                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-4">{post.summary}</p>

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

                {/* Empty State */}
                {posts && posts.length === 0 && (
                    <div className="text-center py-12 sm:py-16 px-4">
                        <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                            <TrendingUp size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                            아직 등록된 포스트가 없습니다
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600">새로운 정책이 등록되면 여기에 표시됩니다.</p>
                    </div>
                )}
            </section>
        </div>
    )
}
