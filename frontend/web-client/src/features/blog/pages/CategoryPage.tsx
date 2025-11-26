// src/pages/CategoryPage.tsx
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Home, BookOpen, Briefcase, Heart, Calendar, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { getPosts, type Post } from '../../../shared/api/posts'
import MainLayout from '@/features/blog/components/layout/MainLayout'
import { useMemo, useState, useRef, useEffect } from 'react'
import { setDefaultOg } from '../../../shared/lib/seo'
import { trackPostClick } from '../../../shared/api/analytics'

/* =========================
   카테고리 정의
   ========================= */
const categoryInfo = {
  housing: {
    name: '주거',
    icon: Home,
    description: '청년들을 위한 주거 지원 정책을 확인하세요',
  },
  education: {
    name: '교육',
    icon: BookOpen,
    description: '학자금, 장학금, 교육 프로그램 지원 정보',
  },
  jobs: {
    name: '일자리',
    icon: Briefcase,
    description: '채용, 직업훈련, 고용 연계 등 일자리 정보',
  },
  welfare: {
    name: '복지',
    icon: Heart,
    description: '건강·상담, 생활안정, 문화/여가 등 복지 지원',
  },
} as const

type CategoryKey = keyof typeof categoryInfo

/* =========================
   유틸
   ========================= */
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
const fmtNum = (n?: number) => (n ?? 0).toLocaleString('ko-KR')

const getRelativeTime = (iso: string) => {
  const now = new Date()
  const target = new Date(iso)
  const diffMs = now.getTime() - target.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffDays === 0) return '오늘'
  if (diffDays === 1) return '어제'
  if (diffDays < 7) return `${diffDays}일 전`
  if (diffDays < 14) return '1주일 전'
  if (diffDays < 21) return '2주일 전'
  if (diffDays < 28) return '3주일 전'
  if (diffDays < 60) return '1달 전'
  if (diffYears >= 1) return `${diffYears}년 전`
  return `${diffMonths}달 전`
}

/* =========================
   카드형 포스트 (홈페이지 스타일)
   ========================= */
function CategoryPostCard({ post }: { post: Post }) {
  return (
    <Link
      to={`/posts/${post.slug}`}
      onClick={() => trackPostClick(post.id, post.slug, 'category')}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FEBC02] rounded-lg h-full max-w-md mx-auto md:max-w-none"
      aria-label={post.title}
    >
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200 h-full flex flex-col">
        {/* 썸네일 */}
        <div className="aspect-square bg-gray-100 overflow-hidden relative flex-shrink-0">
          {post.thumbnail ? (
            <img
              src={post.thumbnail}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              이미지 없음
            </div>
          )}
        </div>

        {/* 텍스트 */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-lg line-clamp-2 group-hover:text-[#FEBC02] transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2 flex-1">{post.summary}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {fmtDate(post.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {fmtNum(post.viewCount)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* =========================
   가로형 포스트 (홈페이지 스타일)
   ========================= */
function CategoryPostItem({ post }: { post: Post }) {
  const THUMB = 150
  const cat = post.category || '정책'

  return (
    <Link
      to={`/posts/${post.slug}`}
      onClick={() => trackPostClick(post.id, post.slug, 'category')}
      className="group grid grid-cols-[1fr_auto] items-start gap-6 py-6 md:gap-8 md:py-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FEBC02] max-w-md mx-auto md:max-w-none"
      aria-label={post.title}
    >
      {/* 왼쪽 텍스트 */}
      <div className="min-w-0 flex flex-col justify-between" style={{ minHeight: THUMB }}>
        <div>
          <div className="text-sm font-bold mb-2 text-[#FEBC02]">[{cat}]</div>
          <h3 className="text-[22px] md:text-[26px] font-extrabold tracking-tight text-gray-900 leading-snug group-hover:text-[#FEBC02] transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="mt-3 text-[15px] text-gray-500 leading-7 line-clamp-2">
            {post.summary}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-400 mt-4">
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {getRelativeTime(post.createdAt)}
            <span className="px-2">·</span>
            {fmtDate(post.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={14} />
            {fmtNum(post.viewCount)}
          </span>
        </div>
      </div>

      {/* 오른쪽 썸네일 */}
      <div
        className="rounded-xl border border-gray-200 bg-[#EAF2FB] overflow-hidden shadow-sm flex-shrink-0"
        style={{ width: THUMB, height: THUMB }}
      >
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-gray-400 text-xs">
            이미지 없음
          </div>
        )}
      </div>
    </Link>
  )
}

/* =========================
   페이지네이션 (홈페이지 스타일)
   ========================= */
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  // 표시할 페이지 번호 배열 생성
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = []
    const delta = 2 // 현재 페이지 양쪽에 표시할 페이지 수

    // 페이지가 7개 이하면 모두 표시
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // 항상 첫 페이지 표시
    pages.push(1)

    // 현재 페이지 주변 범위 계산
    let start = Math.max(2, currentPage - delta)
    let end = Math.min(totalPages - 1, currentPage + delta)

    // 현재 페이지가 앞쪽에 있으면 더 많은 페이지 표시
    if (currentPage <= 4) {
      end = Math.min(5, totalPages - 1)
    }
    // 현재 페이지가 뒤쪽에 있으면 더 많은 페이지 표시
    else if (currentPage >= totalPages - 3) {
      start = Math.max(totalPages - 4, 2)
    }

    // 첫 페이지와 시작 사이에 간격이 있으면 생략 표시
    if (start > 2) {
      pages.push('ellipsis')
    }

    // 현재 페이지 주변 페이지들 추가
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // 끝과 마지막 페이지 사이에 간격이 있으면 생략 표시
    if (end < totalPages - 1) {
      pages.push('ellipsis')
    }

    // 항상 마지막 페이지 표시
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="이전 페이지"
      >
        <ChevronLeft size={24} />
      </button>
      {pageNumbers.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
              ...
            </span>
          )
        }
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-full font-medium transition-all ${
              currentPage === page
                ? 'bg-[#FEBC02] text-white shadow-md'
                : 'bg-white text-gray-900 hover:bg-gray-100'
            }`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        )
      })}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="다음 페이지"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  )
}

/* =========================
   카테고리 페이지
   ========================= */
export default function CategoryPage() {
  const { category } = useParams<{ category: CategoryKey }>()
  const info = category ? categoryInfo[category] : undefined
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortKey, setSortKey] = useState<'latest' | 'popular'>('latest')
  const [currentPage, setCurrentPage] = useState(1)
  
  // 🎯 뷰 모드별 다른 개수!
  const ITEMS_PER_PAGE = viewMode === 'grid' ? 9 : 6

  const listRef = useRef<HTMLDivElement>(null)

  // 뷰 모드 변경 시 1페이지로 리셋
  useEffect(() => {
    setCurrentPage(1)
  }, [viewMode])

  // 데이터 로드
  const { data = [], isLoading } = useQuery<Post[], Error>({
    queryKey: ['posts', 'category', category],
    queryFn: () => getPosts({ category: info.name }),
    enabled: !!info,
  })

  // 필터링 및 정렬
  const filteredAndSorted = useMemo(() => {
    if (!info) return []
    
    const filtered = data.filter((post) => post.category === info.name)
    
    if (sortKey === 'popular') {
      return [...filtered].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    }
    return [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [data, info, sortKey])

  // 페이지네이션
  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentPosts = filteredAndSorted.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    if (info) setDefaultOg({ title: `KCH Blog - ${info.name}` })
  }, [info])

  // 잘못된 카테고리
  if (!info) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            존재하지 않는 카테고리입니다
          </h1>
          <Link
            to="/"
            className="inline-flex items-center text-[#FEBC02] hover:text-[#FDB913] font-medium"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </MainLayout>
    )
  }

  const Icon = info.icon

  return (
    <MainLayout>
      <div className="space-y-12">
        {/* 카테고리 헤더 - 노란색 테마 */}
        <section className="bg-gradient-to-br from-[#FFF9E6] to-[#FFF3CC] rounded-2xl p-10 md:p-12 border border-[#FEBC02]/20">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Icon className="w-12 h-12 text-[#FEBC02]" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {info.name}
              </h1>
              <p className="text-gray-700 text-lg">{info.description}</p>
            </div>
            {!isLoading && filteredAndSorted.length > 0 && (
              <div className="text-center hidden md:block">
                <div className="text-5xl font-extrabold text-[#FEBC02]">
                  {filteredAndSorted.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">개의 정책</div>
              </div>
            )}
          </div>
        </section>

        {/* 로딩 */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FEBC02] mx-auto" />
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        )}

        {/* 컨트롤 바 */}
        {!isLoading && filteredAndSorted.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSortKey('latest')}
                className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
                  sortKey === 'latest'
                    ? 'bg-[#FEBC02] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                최신순
              </button>
              <button
                onClick={() => setSortKey('popular')}
                className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
                  sortKey === 'popular'
                    ? 'bg-[#FEBC02] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                인기순
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                총 <span className="font-bold text-gray-900">{filteredAndSorted.length}</span>개
              </span>
              <div className="h-4 w-px bg-gray-300" />
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#FEBC02] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#FEBC02] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <line x1="4" y1="6" x2="20" y2="6" strokeWidth="2" />
                  <line x1="4" y1="12" x2="20" y2="12" strokeWidth="2" />
                  <line x1="4" y1="18" x2="20" y2="18" strokeWidth="2" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* 포스트 목록 */}
        {!isLoading && (
          <div ref={listRef}>
            {currentPosts.length > 0 ? (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {currentPosts.map((post) => (
                      <CategoryPostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {currentPosts.map((post) => (
                      <CategoryPostItem key={post.id} post={post} />
                    ))}
                  </div>
                )}

                {/* 🎯 항상 페이지네이션 표시! (게시물이 1개라도 있으면) */}
                {filteredAndSorted.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.max(totalPages, 1)}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex p-8 rounded-full bg-gray-100 mb-6">
                  <Icon size={48} className="text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  아직 등록된 정책이 없습니다
                </h2>
                <p className="text-gray-600 mb-6">
                  {info.name} 카테고리에 새로운 정책이 등록되면 여기에 표시됩니다.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#FEBC02] text-white rounded-lg font-semibold hover:bg-[#FDB913] transition-colors"
                >
                  홈으로 돌아가기
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  )
}