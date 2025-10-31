import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Home, BookOpen, Briefcase, ArrowLeft, Calendar, Eye, DollarSign, TrendingUp, ShoppingBag, Film, Heart, Globe, Users } from 'lucide-react' 
import { getPosts } from '@/shared/api/posts'

// 전체 카테고리 정보 정의
const categoryInfo = {
    housing: {
        name: '주거지원',
        icon: Home,
        description: '청년들을 위한 주거 지원 정책을 확인하세요.',
        color: 'bg-blue-100 text-blue-700',
    },
    education: {
        name: '교육지원',
        icon: BookOpen,
        description: '학자금, 장학금, 교육 프로그램 지원 정보입니다.',
        color: 'bg-green-100 text-green-700',
    },
    employment: {
        name: '취업 지원',
        icon: Briefcase,
        description: '일자리 알선, 직업 훈련 등 취업에 필요한 정보를 확인하세요.',
        color: 'bg-red-100 text-red-700',
    },
    license: {
        name: '교육/자격증 지원',
        icon: BookOpen,
        description: '자격증 취득 지원금, 교육 과정 정보를 찾아보세요.',
        color: 'bg-yellow-100 text-yellow-700',
    },
    startup: {
        name: '창업지원',
        icon: TrendingUp,
        description: '창업 공간, 멘토링, 사업화 자금 지원 정책을 확인하세요.',
        color: 'bg-indigo-100 text-indigo-700',
    },
    finance: {
        name: '대출/금융 지원',
        icon: DollarSign,
        description: '저금리 대출, 신용 회복 등 금융 관련 정보를 얻으세요.',
        color: 'bg-teal-100 text-teal-700',
    },
    living: {
        name: '생활비 지원',
        icon: ShoppingBag,
        description: '긴급 생계비, 저소득층 지원 등 생활 안정 자금 정보입니다.',
        color: 'bg-purple-100 text-purple-700',
    },
    culture: {
        name: '문화/여가 지원',
        icon: Film,
        description: '여행, 문화 예술 활동, 여가 생활 지원 정보를 확인하세요.',
        color: 'bg-pink-100 text-pink-700',
    },
    health: {
        name: '건강/상담 지원',
        icon: Heart,
        description: '심리 상담, 건강 검진 등 청년 건강 관리 정보입니다.',
        color: 'bg-orange-100 text-orange-700',
    },
    overseas: {
        name: '해외 기회 지원',
        icon: Globe,
        description: '워킹홀리데이, 해외 취업 등 글로벌 기회를 모색하세요.',
        color: 'bg-sky-100 text-sky-700',
    },
    participation: {
        name: '청년 참여 기회 지원',
        icon: Users,
        description: '정책 제안, 청년 위원회 등 사회 참여 기회 정보입니다.',
        color: 'bg-fuchsia-100 text-fuchsia-700',
    },
}

export default function CategoryPage() {
    const { category } = useParams<{ category: string }>()
    const info = categoryInfo[category as keyof typeof categoryInfo]

    // NOTE: 카테고리별 포스트 조회
    const { data: posts, isLoading } = useQuery({
        queryKey: ['posts', 'category', category],
        queryFn: () => getPosts({ category: info?.name }), 
        enabled: !!category && !!info,
    })

    // 잘못된 카테고리 처리 (이제 'employment' 등은 info가 정의되므로 이 부분이 실행되지 않습니다.)
    if (!info) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">존재하지 않는 카테고리입니다</h1>
                <Link to="/" className="flex items-center text-blue-600 hover:text-blue-700">
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
                    {[1, 2, 3, 4, 5, 6].map(i => (
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
                    <Link to="/" className="text-gray-500 hover:text-gray-700 transition-colors">
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
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{info.name}</h1>
                            <p className="text-gray-600">{info.description}</p>
                            <div className="mt-4 text-sm text-gray-500">총 {posts?.length || 0}개의 정책</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 포스트 목록 */}
            {posts && posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map(post => (
                        <Link key={post.id} to={`/posts/${post.slug}`}>
                            <article className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                                {/* ⭐️ 썸네일 렌더링 로직 복구 */}
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
                                        <span
                                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${info.color}`}
                                        >
                                            {info.name}
                                        </span>
                                    </div>

                                    {/* 제목 */}
                                    <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                                        {post.title}
                                    </h2>

                                    {/* 요약 */}
                                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{post.summary}</p>

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
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">아직 등록된 정책이 없습니다</h2>
                    <p className="text-gray-600 mb-6">
                        {info.name} 카테고리에 새로운 정책이 등록되면 여기에 표시됩니다.
                    </p>
                    <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                        <ArrowLeft size={20} className="mr-2" />
                        다른 정책 둘러보기
                    </Link>
                </div>
            )}
        </div>
    )
}