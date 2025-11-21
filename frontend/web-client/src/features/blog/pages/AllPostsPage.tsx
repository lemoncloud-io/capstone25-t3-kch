// src/pages/AllPostsPage.tsx
import { useMemo, useRef, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { Calendar, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import MainLayout from '@/features/blog/components/layout/MainLayout'
import { getPosts, type Post } from '../../../shared/api/posts'
import { setDefaultOg } from '../../../shared/lib/seo'

/* ===== 유틸 ===== */
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
const fmtNum = (n?: number) => (n ?? 0).toLocaleString('ko-KR')

/* ===== 유틸: 하이라이트 ===== */
function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function renderHighlighted(text: string, query?: string) {
  if (!query) return text
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'ig'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-[#FEF3C7] text-gray-900 rounded px-0.5">{part}</mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

/* ===== 카드 ===== */
function PostCard({ post, query }: { post: Post; query?: string }) {
  return (
    <Link
      to={`/posts/${post.slug}`}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FEBC02] rounded-lg h-full max-w-md mx-auto md:max-w-none"
      aria-label={post.title}
    >
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200 h-full flex flex-col">
        <div className="aspect-square bg-gray-100 overflow-hidden relative flex-shrink-0">
          {post.thumbnail ? (
            <img
              src={post.thumbnail}
              alt={post.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-gray-400 text-sm">이미지 없음</div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="text-xs font-semibold text-[#FEBC02] mb-1">
            {post.category?.replace('지원', '') || '정책'}
          </div>
          <h3 className="font-bold text-lg line-clamp-2 group-hover:text-[#FEBC02] transition-colors">
            {renderHighlighted(post.title, query)}
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

/* ===== 리스트 아이템 (가로형) ===== */
function PostItem({ post, query }: { post: Post; query?: string }) {
  const THUMB = 150
  const cat = post.category?.replace('지원', '') || '정책'

  return (
    <Link
      to={`/posts/${post.slug}`}
      className="group grid grid-cols-[1fr_auto] items-start gap-6 py-6 md:gap-8 md:py-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FEBC02] max-w-md mx-auto md:max-w-none"
      aria-label={post.title}
    >
      <div className="min-w-0 flex flex-col justify-between" style={{ minHeight: THUMB }}>
        <div>
          <div className="text-sm font-bold mb-2 text-[#FEBC02]">[{cat}]</div>
          <h3 className="text-[22px] md:text-[26px] font-extrabold tracking-tight text-gray-900 leading-snug group-hover:text-[#FEBC02] transition-colors line-clamp-2">
            {renderHighlighted(post.title, query)}
          </h3>
          <p className="mt-3 text-[15px] text-gray-500 leading-7 line-clamp-2">{post.summary}</p>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-400 mt-4">
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
          <div className="w-full h-full grid place-items-center text-gray-400 text-xs">이미지 없음</div>
        )}
      </div>
    </Link>
  )
}

/* ===== 페이지네이션 ===== */
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="이전 페이지"
      >
        <ChevronLeft size={24} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-10 h-10 rounded-full font-medium transition-all ${
            currentPage === p ? 'bg-[#FEBC02] text-white shadow-md' : 'bg-white text-gray-900 hover:bg-gray-100'
          }`}
          aria-current={currentPage === p ? 'page' : undefined}
        >
          {p}
        </button>
      ))}
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

/* ===== 전체 게시물 페이지 ===== */
export default function AllPostsPage() {
  const [params] = useSearchParams()
  const query = (params.get('q') || '').trim().toLowerCase()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortKey, setSortKey] = useState<'latest' | 'popular'>('latest')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = viewMode === 'grid' ? 9 : 6
  const listRef = useRef<HTMLDivElement>(null)

  // 뷰/정렬 바뀌면 1페이지로
  useEffect(() => {
    setCurrentPage(1)
  }, [sortKey, viewMode])

  const { data = [], isLoading } = useQuery<Post[], Error>({
    queryKey: ['posts', 'all'],
    queryFn: () => getPosts(), // 전체 가져오기 (dev: mock, prod: API)
  })

  useEffect(() => {
    setDefaultOg({ title: query ? `KCH Blog - 검색: ${params.get('q')}` : 'KCH Blog - 전체보기' })
  }, [query, params])

  const sorted = useMemo(() => {
    const base = [...data].filter((p) => {
      if (!query) return true
      const hay = `${p.title} ${p.summary ?? ''} ${p.category ?? ''}`.toLowerCase()
      return hay.includes(query)
    })
    if (sortKey === 'popular') return base.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    return base.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  }, [data, sortKey, query])

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE) || 1
  const start = (currentPage - 1) * ITEMS_PER_PAGE
  const current = sorted.slice(start, start + ITEMS_PER_PAGE)

  const handlePageChange = (p: number) => {
    setCurrentPage(p)
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <MainLayout>
      <div className="space-y-10">
        {/* 헤더 */}
        <section className="bg-gradient-to-br from-[#FFF9E6] to-[#FFF3CC] rounded-2xl p-8 md:p-10 border border-[#FEBC02]/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">전체 게시물</h1>
              <p className="text-gray-700 mt-2">
                {query ? (
                  <>
                    검색어 '<span className="font-semibold text-gray-900">{params.get('q')}</span>'에 대한 결과
                  </>
                ) : (
                  '모든 카테고리의 최신 글을 한 곳에서 확인하세요.'
                )}
              </p>
            </div>
            {!isLoading && (
              <div className="text-center">
                <div className="text-5xl font-extrabold text-[#FEBC02]">{sorted.length}</div>
                <div className="text-sm text-gray-600 mt-1">개의 포스트</div>
              </div>
            )}
          </div>
        </section>

        {/* 컨트롤 바 */}
        {!isLoading && sorted.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              총 <span className="font-bold text-gray-900">{sorted.length}</span>개
              <span className="mx-3 h-4 w-px bg-gray-300" />
              <button
                onClick={() => setSortKey('latest')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  sortKey === 'latest' ? 'bg-[#FEBC02] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                최신순
              </button>
              <button
                onClick={() => setSortKey('popular')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  sortKey === 'popular' ? 'bg-[#FEBC02] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                인기순
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-[#FEBC02] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                aria-label="그리드 보기"
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
                  viewMode === 'list' ? 'bg-[#FEBC02] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                aria-label="리스트 보기"
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

        {/* 목록 */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-xl font-bold text-gray-900 mb-2">검색 결과가 없습니다</h2>
            <p className="text-gray-600">다른 검색어로 다시 시도해 보세요.</p>
          </div>
        ) : (
          <>
            <div ref={listRef}>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  {current.map((post) => (
                    <PostCard key={post.id} post={post} query={query} />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {current.map((post) => (
                    <PostItem key={post.id} post={post} query={query} />
                  ))}
                </div>
              )}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </div>
    </MainLayout>
  )
}