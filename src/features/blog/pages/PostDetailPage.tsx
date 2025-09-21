import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, User, Eye, ArrowLeft, Share2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { getPost, type Post } from '@/shared/api/posts'

export default function PostDetailPage() {
    const { slug } = useParams<{ slug: string }>()

    const { data: post, isLoading } = useQuery<Post | undefined>({
        queryKey: ['post', slug],
        queryFn: () => getPost(slug!),
        enabled: !!slug,
    })

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg p-8 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                    <div className="space-y-3">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!post) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600 mb-4">포스트를 찾을 수 없습니다.</p>
                <Link to="/" className="text-blue-600 hover:underline">
                    홈으로 돌아가기
                </Link>
            </div>
        )
    }

    return (
        <article className="max-w-4xl mx-auto">
            {/* Navigation */}
            <div className="mb-6 flex items-center justify-between">
                <Link
                    to="/"
                    className="inline-flex items-center text-gray-600 hover:text-blue-600 transition"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    목록으로
                </Link>
                <button className="inline-flex items-center text-gray-600 hover:text-blue-600 transition">
                    <Share2 size={20} className="mr-2" />
                    공유하기
                </button>
            </div>

            {/* Article */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {post.thumbnail && (
                    <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-64 sm:h-96 object-cover"
                    />
                )}

                <div className="p-6 sm:p-8 lg:p-12">
                    {/* Category */}
                    <div className="mb-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                            {post.category}
                        </span>
                    </div>
                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">
                        {post.title}
                    </h1>
                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-600 pb-8 border-b">
                        <span className="flex items-center">
                            <User size={16} className="mr-1" />
                            {post.author}
                        </span>
                        <span className="flex items-center">
                            <Calendar size={16} className="mr-1" />
                            {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                            <Eye size={16} className="mr-1" />
                            조회 {post.viewCount.toLocaleString()}
                        </span>
                    </div>
                    {/* Summary */}
                    <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                        <p className="text-lg text-gray-700">
                            {post.summary}
                        </p>
                    </div>
                    {/* Content */}
                    <div className="prose prose-lg prose-slate max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900">
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                    </div>
                </div>
            </div>
        </article>
    )
}
