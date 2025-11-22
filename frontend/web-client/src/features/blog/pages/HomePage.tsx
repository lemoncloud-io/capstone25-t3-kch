// src/features/blog/pages/HomePage.tsx
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPosts, type Post } from '../../../shared/api/posts'
import MainLayout from '../components/layout/MainLayout'
import { Calendar, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useRef, useState, useEffect } from 'react'
import { setDefaultOg } from '../../../shared/lib/seo'

/* =========================
   유틸: 날짜/숫자 포맷
   ========================= */
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
const fmtNum = (n?: number) => (n ?? 0).toLocaleString('ko-KR')

// 상대 시간 계산 (N일 전)
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
   카드형 포스트 (인기/최신)
   ========================= */
function PostCard({ post }: { post: Post }) {
  return (
    <Link
      to={`/posts/${post.slug}`}
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
   추천(가로형) 포스트 — 캡처 스타일
   왼쪽 큰 제목/요약, 오른쪽 정사각 썸네일, 행별 구분선
   ========================= */
function RecommendedPostItem({ post }: { post: Post }) {
  const THUMB = 150

  const cat = post.category || '정책'
  const catClass = 'text-[#FEBC02]' // 카테고리별 색상 추가 가능

  return (
    <Link
      to={`/posts/${post.slug}`}
      className="group grid grid-cols-[1fr_auto] items-start gap-6 py-6 md:gap-8 md:py-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FEBC02] max-w-md mx-auto md:max-w-none"
      aria-label={post.title}
    >
      {/* 왼쪽 텍스트: 위는 카테고리/제목/요약, 아래는 날짜
          날짜를 이미지 하단과 맞추기 위해 min-h를 썸네일과 동일하게 두고 flex로 분리 */}
      <div className="min-w-0 flex flex-col justify-between" style={{ minHeight: THUMB }}>
        <div>
          <div className={`text-sm font-bold mb-2 ${catClass}`}>[{cat}]</div>
          <h3 className="text-[22px] md:text-[26px] font-extrabold tracking-tight text-gray-900 leading-snug group-hover:text-[#FEBC02] transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="mt-3 text-[15px] text-gray-500 leading-7 line-clamp-2">
            {post.summary}
          </p>
        </div>

        {/* 날짜: "N일 전 | 날짜" 형식 */}
        <div className="text-xs text-gray-400 mt-4">
          {getRelativeTime(post.createdAt)}
          <span className="px-3">|</span>
          {fmtDate(post.createdAt)}
        </div>
      </div>

      {/* 오른쪽 썸네일: 동적 Tailwind 클래스 제거 (빌드 안정화) */}
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

/* =========================
   페이지네이션 - 원형 디자인
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
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      {/* 이전 버튼 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="이전 페이지"
      >
        <ChevronLeft size={24} />
      </button>

      {/* 페이지 번호 */}
      {pages.map((page) => (
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
      ))}

      {/* 다음 버튼 */}
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
   페이지
   ========================= */
export default function HomePage() {
  useEffect(() => {
    setDefaultOg({ title: 'KCH Blog - 홈' })
  }, [])
  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 6

  // 데이터 로드
  const { data = [], isLoading } = useQuery<Post[], Error>({
    queryKey: ['posts', 'all'],
    queryFn: () => getPosts(),
  })

  // 파생 데이터
  const sortedByViews = useMemo(
    () => [...data].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0)),
    [data],
  )
  const sortedByDate = useMemo(
    () => [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [data],
  )

  const popularPosts = sortedByViews.slice(0, 3)
  const latestPosts = sortedByDate.slice(0, 3)

  const totalPages = Math.ceil(sortedByDate.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentRecommendedPosts = sortedByDate.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // 스크롤 이동
  const recoRef = useRef<HTMLDivElement>(null)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    recoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /* ========== 로딩 ========== */
  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-12">
          {/* 인기 스켈레톤 */}
          <section aria-labelledby="section-popular">
            <h2 id="section-popular" className="text-2xl font-bold mb-6">
              인기 포스트
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="aspect-square animate-pulse bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 최신 스켈레톤 */}
          <section aria-labelledby="section-latest">
            <h2 id="section-latest" className="text-2xl font-bold mb-6">
              최신 포스트
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="aspect-square animate-pulse bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 로딩 스피너 */}
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FEBC02] mx-auto" />
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  /* ========== 본문 ========== */
  return (
    <MainLayout>
      <div className="space-y-16">
        {/* 인기 포스트 */}
        <section aria-labelledby="section-popular">
          <h2 id="section-popular" className="text-2xl font-bold mb-6">
            인기 포스트
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {popularPosts.length > 0 ? (
              popularPosts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <p className="col-span-3 text-center text-gray-500 py-10">게시물이 없습니다.</p>
            )}
          </div>
        </section>

        {/* 최신 포스트 */}
        <section aria-labelledby="section-latest">
          <h2 id="section-latest" className="text-2xl font-bold mb-6">
            최신 포스트
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {latestPosts.length > 0 ? (
              latestPosts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <p className="col-span-3 text-center text-gray-500 py-10">게시물이 없습니다.</p>
            )}
          </div>
        </section>

        {/* 당신을 위한 청년정책 */}
        <section aria-labelledby="section-reco" ref={recoRef}>
          <h2 id="section-reco" className="text-2xl font-bold mb-6">
            당신을 위한 청년정책
          </h2>

          {/* 각 아이템 사이 얇은 구분선 */}
          <div className="divide-y divide-gray-200">
            {currentRecommendedPosts.length > 0 ? (
              currentRecommendedPosts.map((post) => (
                <RecommendedPostItem key={post.id} post={post} />
              ))
            ) : (
              <p className="text-center text-gray-500 py-10">추천 게시물이 없습니다.</p>
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </section>
      </div>
    </MainLayout>
  )
}