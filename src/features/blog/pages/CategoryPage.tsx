import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Home, BookOpen, ArrowLeft, Calendar, Eye } from 'lucide-react'
import { getPosts } from '@/shared/api/posts'

const categoryInfo = {
    housing: {
        name: '주거지원',
        icon: Home,
        description: '청년, 신혼부부를 위한 주거 지원 정책을 확인하세요.',
        color: 'bg-blue-100 text-blue-700',
    },
    education: {
        name: '교육지원',
        icon: BookOpen,
        description: '학자금, 장학금, 교육 프로그램 지원 정보입니다.',
        color: 'bg-green-100 text-green-700',
    },
}

export default function CategoryPage() {
    const { category } = useParams<{ category: string }>()
    const info = categoryInfo[category as keyof typeof categoryInfo]

    // NOTE: 카테고리별 포스트 조회
    const { data: posts, isLoading } = useQuery({
        queryKey: ['posts', 'category', category],
        queryFn: () => getPosts({ category }),
        enabled: !!category,
    })

    // 잘못된 카테고리 처리
    if (!info) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    존재하지 않는 카테고리입니다
                </h1>
                <Link
                    to="/"
                    className="flex items-center text-blue-600 hover:text-blue-700"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    홈으로 돌아가기
                </Link>
            </div>
        )
    }

    const Icon = info.icon

    // 로딩 상태
    if (isLoading) {
        return (
            <div>
                {/* 카테고리 헤더 */}
                <div className="mb-8">
                    <div className="animate-pulse">
                        <div className="h-10 bg-gray-200 rounded w-48 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-96"></div>
                    </div>
                </div>

                {/* 포스트 스켈레톤 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                            <div className="h-48 bg-gray-200 rounded mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* 카테고리 헤더 */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Link
                        to="/"
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        홈
                    </Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-900">{info.name}</span>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${info.color}`}>
                            <Icon size={32} />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                {info.name}
                            </h1>
                            <p className="text-gray-600">
                                {info.description}
                            </p>
                            <div className="mt-4 text-sm text-gray-500">
                                총 {posts?.length || 0}개의 정책
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 포스트 목록 */}
            {posts && posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <Link key={post.id} to={`/post/${post.slug}`}>
                            <article className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                                {/* 썸네일 */}
                                {post.thumbnail && (
                                    <div className="aspect-video overflow-hidden bg-gray-100">
                                        <img
                                            src={post.thumbnail}
                                            alt={post.title}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}

                                <div className="p-6">
                                    {/* 카테고리 뱃지 */}
                                    <div className="mb-3">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${info.color}`}>
                      {info.name}
                    </span>
                                    </div>

                                    {/* 제목 */}
                                    <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                                        {post.title}
                                    </h2>

                                    {/* 요약 */}
                                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                        {post.summary}
                                    </p>

                                    {/* 메타 정보 */}
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
            ) : (
                // 빈 상태
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <div className={`inline-flex p-4 rounded-full ${info.color} mb-4`}>
                        <Icon size={48} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        아직 등록된 정책이 없습니다
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {info.name} 카테고리에 새로운 정책이 등록되면 여기에 표시됩니다.
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        다른 정책 둘러보기
                    </Link>
                </div>
            )}
        </div>
    )
}
