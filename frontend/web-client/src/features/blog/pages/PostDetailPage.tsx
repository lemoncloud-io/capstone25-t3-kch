import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, User, Eye, ArrowLeft, Share2, Home, ChevronRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'

import { getPost, incrementViews } from '@/shared/api'
import { getThumbnail } from '@/shared/constants/defaultImages'

import type { Post } from '@/shared/api/types'

export const PostDetailPage = () => {
    const { slug } = useParams<{ slug: string }>()

    const {
        data: post,
        isLoading,
        error,
        refetch,
    } = useQuery<Post | undefined>({
        queryKey: ['post', slug],
        queryFn: () => getPost(slug!),
        enabled: !!slug,
    })

    // Increment view count when post is loaded
    useEffect(() => {
        if (slug && post) {
            incrementViews(slug).catch(err => {
                console.error('Failed to increment views:', err)
            })
        }
    }, [slug, post?.id]) // Only increment once when post ID changes

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-0">
                <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 animate-pulse">
                    <div className="h-6 sm:h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                    <div className="space-y-3">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto px-4 sm:px-0">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-8 sm:p-12 text-center">
                    <div className="inline-flex p-4 rounded-full bg-red-100 mb-4">
                        <Eye size={32} className="text-red-600" />
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

    if (!post) {
        return (
            <div className="max-w-2xl mx-auto px-4 sm:px-0">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-8 sm:p-12 text-center">
                    <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
                        <Eye size={32} className="text-gray-400" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                        포스트를 찾을 수 없습니다
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 mb-6">
                        요청하신 포스트가 존재하지 않거나 삭제되었습니다.
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition text-sm sm:text-base"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        홈으로 돌아가기
                    </Link>
                </div>
            </div>
        )
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post.title,
                    text: post.summary,
                    url: window.location.href,
                })
                toast.success('공유되었습니다!')
            } catch (err) {
                // User cancelled share - don't show error
                if (err instanceof Error && err.name !== 'AbortError') {
                    console.error('Share failed:', err)
                }
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href)
                toast.success('링크가 복사되었습니다!')
            } catch (err) {
                toast.error('링크 복사에 실패했습니다')
                console.error('Copy failed:', err)
            }
        }
    }

    return (
        <article className="max-w-4xl mx-auto pb-12">
            {/* Breadcrumb & Navigation - Mobile Optimized */}
            <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-2 mb-3 sm:mb-4 text-xs sm:text-sm px-1">
                    <Link to="/" className="text-gray-500 hover:text-gray-700 transition-colors flex items-center">
                        <Home size={14} className="mr-1" />
                        <span className="hidden sm:inline">홈</span>
                    </Link>
                    <ChevronRight size={14} className="text-gray-400" />
                    <Link
                        to={`/category/${encodeURIComponent(post.category)}`}
                        className="text-gray-500 hover:text-gray-700 transition-colors truncate"
                    >
                        {post.category}
                    </Link>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                    <Link
                        to="/"
                        className="inline-flex items-center text-gray-600 hover:text-blue-600 transition text-sm sm:text-base"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        목록으로
                    </Link>
                    <button
                        onClick={handleShare}
                        className="inline-flex items-center text-gray-600 hover:text-blue-600 transition text-sm sm:text-base"
                    >
                        <Share2 size={18} className="mr-2" />
                        공유하기
                    </button>
                </div>
            </div>

            {/* Article - Mobile Optimized */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md overflow-hidden">
                {/* Thumbnail */}
                <div className="w-full h-56 sm:h-64 md:h-80 lg:h-96 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                        src={getThumbnail(post.category, post.thumbnail)}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="p-5 sm:p-6 md:p-8 lg:p-12">
                    {/* Category Badge */}
                    <div className="mb-4">
                        <Link to={`/category/${encodeURIComponent(post.category)}`}>
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm font-semibold rounded-full hover:bg-blue-200 transition">
                                {post.category}
                            </span>
                        </Link>
                    </div>

                    {/* Title */}
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 leading-tight">
                        {post.title}
                    </h1>

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-8 text-xs sm:text-sm text-gray-600 pb-6 sm:pb-8 border-b">
                        <span className="flex items-center">
                            <User size={14} className="mr-1 sm:mr-2 flex-shrink-0" />
                            {post.author}
                        </span>
                        <span className="flex items-center">
                            <Calendar size={14} className="mr-1 sm:mr-2 flex-shrink-0" />
                            {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </span>
                        <span className="flex items-center">
                            <Eye size={14} className="mr-1 sm:mr-2 flex-shrink-0" />
                            조회 {post.viewCount.toLocaleString()}
                        </span>
                    </div>

                    {/* Summary */}
                    <div className="mb-6 sm:mb-8 p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                        <p className="text-base sm:text-lg text-gray-800 leading-relaxed">{post.summary}</p>
                    </div>

                    {/* Content - Improved Markdown Styles */}
                    <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-strong:text-gray-900 prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-img:rounded-xl prose-img:shadow-md">
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                    </div>

                    {/* Related Category Link */}
                    <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t">
                        <p className="text-sm text-gray-600 mb-3">같은 카테고리의 다른 정책 보기</p>
                        <Link
                            to={`/category/${encodeURIComponent(post.category)}`}
                            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-blue-700 transition text-sm sm:text-base"
                        >
                            {post.category} 카테고리 보기
                            <ChevronRight size={18} className="ml-2" />
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    )
}
