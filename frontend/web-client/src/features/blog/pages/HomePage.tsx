// src/features/blog/pages/HomePage.tsx
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPosts, type Post } from '../../../shared/api/posts'
import MainLayout from '../components/layout/MainLayout'
import { Calendar, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useRef, useState, useEffect } from 'react'
import { setDefaultOg } from '../../../shared/lib/seo'
import { readOnboarding } from '@/features/onboarding/readOnboarding'
import { env } from '@/shared/lib/env'
import { trackHomeStay, trackPostClick, trackRecommendationImpression, trackRecommendationClick } from '@/shared/api/analytics'

/* =========================
   추천 API 타입
   ========================= */
type OnboardingProfile = {
  userStatus: 'student' | 'jobseeker'
  userAge: '19-24' | '25-29' | '30-34' | '35+'
  userRegion: string
  userInterests: string[]
}

type RecommendItem = {
  id: number
  plcy_no: string
  title: string
  summary?: string
  category?: string
  region?: string
  score: number
}

type RecommendResp = {
  algo: string
  items: RecommendItem[]
}

async function fetchRecommendations(profile: OnboardingProfile): Promise<RecommendResp> {
  // 페이지네이션을 위해 충분한 데이터 요청 (페이지당 6개, 최대 3페이지 = 18개)
  const payload = {
    ...profile,
    limit: 18, // 페이지네이션을 위해 충분한 개수 요청
  }
  const res = await fetch(`${env.API_BASE_URL}/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`추천 API 실패: ${res.status}`)
  }
  return res.json()
}

/* =========================
   유틸: 날짜/숫자 포맷
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
   카드형 포스트 (인기/최신)
   ========================= */
function PostCard({ post, pageSource }: { post: Post; pageSource: string }) {
  return (
    <Link
      to={`/posts/${post.slug}`}
      onClick={() => trackPostClick(post.id, post.slug, pageSource)}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FEBC02] rounded-lg h-full max-w-md mx-auto md:max-w-none"
      aria-label={post.title}
    >
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200 h-full flex flex-col">
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
   추천(가로형) 포스트
   ========================= */
function RecommendedPostItem({ post, pageSource }: { post: Post; pageSource: string }) {
  const THUMB = 150
  const cat = post.category || '정책'
  const catClass = 'text-[#FEBC02]'

  return (
    <Link
      to={`/posts/${post.slug}`}
      onClick={() => {
        // 일반 클릭 추적
        trackPostClick(post.id, post.slug, pageSource)
        // 추천 클릭 추적 (홈페이지에서 추천 영역 클릭이므로 sourcePostId는 undefined)
        trackRecommendationClick(post.id, undefined)
      }}
      className="group grid grid-cols-[1fr_auto] items-start gap-6 py-6 md:gap-8 md:py-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FEBC02] max-w-md mx-auto md:max-w-none"
      aria-label={post.title}
    >
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

        <div className="text-xs text-gray-400 mt-4">
          {getRelativeTime(post.createdAt)}
          <span className="px-3">|</span>
          {fmtDate(post.createdAt)}
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
          <div className="w-full h-full grid place-items-center text-gray-400 text-xs">
            이미지 없음
          </div>
        )}
      </div>
    </Link>
  )
}

/* =========================
   페이지네이션
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
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="이전 페이지"
      >
        <ChevronLeft size={24} />
      </button>

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
   페이지 컴포넌트
   ========================= */
export default function HomePage() {
  useEffect(() => {
    setDefaultOg({ title: 'KCH Blog - 홈' })
  }, [])

  // 홈 체류 시간 측정용
  const homeEnterRef = useRef<string | null>(null)

  useEffect(() => {
    // 페이지 진입 시각 기록
    homeEnterRef.current = new Date().toISOString()

    // 언마운트(다른 페이지로 이동/탭 닫힘 등) 시 한 번만 전송
    return () => {
      if (!homeEnterRef.current) return
      const leaveIso = new Date().toISOString()
      trackHomeStay(homeEnterRef.current, leaveIso)
      homeEnterRef.current = null
    }
  }, [])

  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 6

  // 데이터 로드
  const { data: posts = [], isLoading } = useQuery<Post[], Error>({
    queryKey: ['posts', 'all'],
    queryFn: () => getPosts(), // 전체 게시글 가져오기 (limit 없음)
  })

  // 인기/최신 정렬
  const sortedByViews = useMemo(
    () => [...posts].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0)),
    [posts],
  )
  const sortedByDate = useMemo(
    () => [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [posts],
  )

  const popularPosts = sortedByViews.slice(0, 3)
  const latestPosts = sortedByDate.slice(0, 3)

  // 온보딩 + 추천
  const profile = readOnboarding() as OnboardingProfile | null

  const {
    data: recoData,
    isLoading: isRecoLoading,
    isError: isRecoError,
  } = useQuery<RecommendResp, Error>({
    queryKey: ['recommendations', profile],
    queryFn: () => fetchRecommendations(profile as OnboardingProfile),
    enabled: !!profile && env.USE_SERVER, // 서버 모드일 때만
    staleTime: 1000 * 60 * 5,
  })

  // plcy_no -> Post 맵 (id 가 plcy_no 로 매핑돼 있음)
  const postMapByPlcyNo = useMemo(
    () => new Map(posts.map((p) => [String(p.id), p])),
    [posts],
  )

  // 추천 결과와 블로그 join
  const recommendedJoined: Post[] = useMemo(() => {
    const items = recoData?.items ?? []
    const result: Post[] = []
    for (const it of items) {
      const p = postMapByPlcyNo.get(String(it.plcy_no))
      if (p) result.push(p)
    }
    return result
  }, [recoData?.items, postMapByPlcyNo])

  // 페이지네이션용 소스 (추천 없으면 최신순으로 폴백)
  const sourceForReco = recommendedJoined.length > 0 ? recommendedJoined : sortedByDate
  const totalPages = Math.ceil(sourceForReco.length / ITEMS_PER_PAGE) || 1
  
  // 추천 데이터가 변경되면 페이지를 1로 리셋
  // recoData?.items의 길이와 첫 번째 항목의 plcy_no를 조합하여 변경 감지
  const recoDataKey = useMemo(
    () => recoData?.items?.map((item) => item.plcy_no).join(',') || '',
    [recoData?.items]
  )
  
  useEffect(() => {
    setCurrentPage(1)
  }, [recoDataKey]) // 추천 데이터 내용이 변경될 때마다 페이지 리셋
  
  // 현재 페이지가 총 페이지 수를 초과하면 1로 리셋
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [currentPage, totalPages])
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentRecommendedPosts = sourceForReco.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const recoRef = useRef<HTMLDivElement>(null)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    recoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // 추천 영역 노출 추적 (추천 게시글이 렌더링될 때, 한 번만 호출)
  const hasTrackedImpression = useRef(false)
  useEffect(() => {
    if (
      currentRecommendedPosts.length > 0 &&
      !isRecoLoading &&
      !isRecoError &&
      !hasTrackedImpression.current
    ) {
      // 홈페이지에서 추천 영역이 보일 때 노출 추적 (한 번만)
      // sourcePostId는 undefined (홈페이지이므로)
      trackRecommendationImpression(undefined)
      hasTrackedImpression.current = true
    }
  }, [currentRecommendedPosts.length, isRecoLoading, isRecoError])

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-12">
          {/* 스켈레톤 */}
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

          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FEBC02] mx-auto" />
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

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
              popularPosts.map((post) => (
                <PostCard key={post.id} post={post} pageSource="home-popular" />
              ))
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
              latestPosts.map((post) => (
                <PostCard key={post.id} post={post} pageSource="home-latest" />
              ))
            ) : (
              <p className="col-span-3 text-center text-gray-500 py-10">게시물이 없습니다.</p>
            )}
          </div>
        </section>

        {/* 당신을 위한 청년정책 */}
        <section aria-labelledby="section-reco" ref={recoRef}>
          <h2 id="section-reco" className="text-2xl font-bold mb-2">
            당신을 위한 청년정책
          </h2>

          {!profile && (
            <p className="text-gray-500 mb-4">
              온보딩을 완료하면 나에게 맞는 정책 추천이 표시됩니다.
            </p>
          )}
          {profile && isRecoLoading && (
            <p className="text-gray-500 mb-4">추천 불러오는 중…</p>
          )}
          {profile && isRecoError && (
            <p className="text-gray-500 mb-4">
              추천을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </p>
          )}
          {profile && !isRecoLoading && !isRecoError && recommendedJoined.length === 0 && (
            <p className="text-gray-500 mb-4">
              아직 추천 점수가 높은 정책이 많지 않아, 최근 생성된 순서로 보여드리고 있어요.
            </p>
          )}

          <div className="divide-y divide-gray-200">
            {currentRecommendedPosts.length > 0 ? (
              currentRecommendedPosts.map((post) => (
                <RecommendedPostItem
                  key={post.id}
                  post={post}
                  pageSource="home-recommend"
                />
              ))
            ) : (
              <p className="text-center text-gray-500 py-10">추천 게시물이 없습니다.</p>
            )}
          </div>

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
