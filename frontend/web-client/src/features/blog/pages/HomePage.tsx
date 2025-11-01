import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Calendar, Eye, ChevronRight, TrendingUp } from 'lucide-react'
import { getPosts, type Post } from '@/shared/api/posts'

export default function HomePage() {
    const { data: posts, isLoading } = useQuery<Post[]>({
        queryKey: ['posts'],
        queryFn: () => getPosts(),
    })

    if (isLoading) {
        return (
            <div className="space-y-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        )
    }

    const featuredPost: Post | undefined = posts?.[0]

    return (
        <div>
            {/* Hero Section */}
            <section className="mb-12">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-white">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Title</h1>
                    <p className="text-lg sm:text-xl mb-6 opacity-90">Description</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/category/housing"
                            className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
                        >
                            주거지원 보기
                            <ChevronRight className="ml-2" size={20} />
                        </Link>
                        <Link
                            to="/category/education"
                            className="inline-flex items-center justify-center px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition"
                        >
                            교육지원 보기
                            <ChevronRight className="ml-2" size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {featuredPost && (
                <section className="mb-12">
                    <div className="flex items-center mb-6">
                        <TrendingUp className="text-red-500 mr-2" size={24} />
                        <h2 className="text-2xl font-bold">인기 포스트</h2>
                    </div>
                    <Link to={`/posts/${featuredPost.slug}`}>
                        <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                            <div className="md:flex">
                                <div className="md:w-2/5">
                                    <img
                                        src={featuredPost.thumbnail}
                                        alt={featuredPost.title}
                                        className="w-full h-48 md:h-full object-cover"
                                    />
                                </div>
                                <div className="p-6 md:w-3/5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                            {featuredPost.category}
                                        </span>
                                        <span className="text-gray-500 text-sm">
                                            조회 {featuredPost.viewCount.toLocaleString()}회
                                        </span>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold mb-3 hover:text-blue-600 transition">
                                        {featuredPost.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4 line-clamp-2">{featuredPost.summary}</p>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar size={16} className="mr-1" />
                                        {new Date(featuredPost.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </section>
            )}

            {/* Recent Posts Grid */}
            <section>
                <h2 className="text-2xl font-bold mb-6">최신 포스트</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts?.slice(1).map(post => (
                        <Link key={post.id} to={`/posts/${post.slug}`}>
                            <article className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                                <img src={post.thumbnail} alt={post.title} className="w-full h-48 object-cover" />
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                            {post.category}
                                        </span>
                                    </div>
                                    <h3 className="font-bold mb-2 line-clamp-2 hover:text-blue-600 transition">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">{post.summary}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span className="flex items-center">
                                            <Calendar size={14} className="mr-1" />
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center">
                                            <Eye size={14} className="mr-1" />
                                            {post.viewCount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    )
}
