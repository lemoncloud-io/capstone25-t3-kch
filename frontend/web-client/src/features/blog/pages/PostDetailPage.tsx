// src/pages/PostDetailPage.tsx
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Eye, ArrowLeft, Home, Share2, Link as LinkIcon, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { setOgTags } from '@/shared/lib/seo'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { getPost, getPosts, type Post } from '@/shared/api/posts'
import MainLayout from '@/features/blog/components/layout/MainLayout'
import { toast } from 'sonner'
import {
  trackPostClick,
  trackPostStay,
  trackRecommendationClick,
  trackRecommendationImpression,
  trackShare, // 공유 추적 함수 임포트
} from '@/shared/api/analytics'
import { readOnboarding } from '@/features/onboarding/readOnboarding'
import { env } from '@/shared/lib/env'

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

async function fetchRecommendations(profile: OnboardingProfile, excludePlcyNo?: string): Promise<RecommendResp> {
  const payload = {
    ...profile,
    exclude_plcy_no: excludePlcyNo,
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

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const { data: post, isLoading } = useQuery<Post | undefined>({
    queryKey: ['post', slug],
    queryFn: () => getPost(slug!),
    enabled: !!slug,
  })

  // 페이지 진입 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug]) // slug가 변경될 때마다 (다른 게시물로 이동할 때)

  // OG 태그
  useEffect(() => {
    if (post) {
      setOgTags({
        title: post.title,
        description: post.summary,
        image: post.thumbnail,
        url: window.location.href,
      })
    }
  }, [post])

  const helmetData = useMemo(() => {
    const title = post?.meta?.title ?? post?.title ?? 'KCH Blog'
    const description = post?.meta?.description ?? post?.summary ?? undefined
    const keywords = post?.meta?.keywords ?? []
    const robots = post?.meta?.robots ?? 'noindex,nofollow'
    const ogImage = post?.meta?.thumbnail_img ?? post?.thumbnail ?? undefined
    return { title, description, keywords, robots, ogImage }
  }, [post])

  // 체류 시간 측정용
  const stayEnterRef = useRef<string | null>(null)

  useEffect(() => {
    if (!post) return

    // 상세 페이지 진입 시각 기록
    stayEnterRef.current = new Date().toISOString()

    // 상세 페이지 진입 = 클릭 기록
    // 단, 같은 도메인에서 온 경우는 이미 클릭이 기록되었으므로 중복 방지
    const referrer = document.referrer
    const currentOrigin = window.location.origin
    const isFromSameDomain = referrer && referrer.startsWith(currentOrigin)
    
    // 직접 URL 접근이거나 외부에서 온 경우에만 클릭 기록
    if (!isFromSameDomain) {
      trackPostClick(post.id, post.slug, 'post-detail')
    }

    // 언마운트 시 한 번만 체류 시간 전송
    return () => {
      if (!stayEnterRef.current) return
      const leaveIso = new Date().toISOString()
      trackPostStay(post.id, post.slug, 'post-detail', stayEnterRef.current, leaveIso)
      stayEnterRef.current = null
    }
  }, [post])

  const handleShare = async () => {
    if (isLoading || !post) {
      toast.error('게시글을 불러오는 중이에요.')
      return
    }

    const shareData = {
      title: post.title,
      text: post.summary || '',
      url: window.location.href,
    }

    if (navigator.share) {
      // Web Share API 사용
      try {
        await navigator.share(shareData)
        // native 공유 성공 시 공유 이벤트 기록
        await trackShare(post.id, post.slug, 'post-detail', 'native')
      } catch (error) {
        console.error('Share API 오류:', error)
        toast.error('공유에 실패했습니다.')
      }
    } else {
      // Web Share 미지원 → 링크 복사로 대체
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('링크가 클립보드에 복사되었습니다.')
        // clipboard 공유로 기록
        await trackShare(post.id, post.slug, 'post-detail', 'clipboard')
      } catch (err) {
        console.error('클립보드 복사 오류:', err)
        toast.error('링크 복사에 실패했습니다.')
      }
    }
  }

  const handleCopyLink = async () => {
    if (!post) {
      toast.error('게시글을 불러오는 중이에요.')
      return
    }

    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('링크가 클립보드에 복사되었습니다.')
      // 별도 "링크복사" 버튼도 clipboard 공유로 기록
      await trackShare(post.id, post.slug, 'post-detail', 'clipboard')
    } catch (err) {
      console.error('클립보드 복사 오류:', err)
      toast.error('링크 복사에 실패했습니다.')
    }
  }

  // 온보딩 프로필 및 추천 데이터
  const profile = readOnboarding() as OnboardingProfile | null

  // 전체 포스트 목록 (추천 결과와 join하기 위해)
  const { data: allPosts = [] } = useQuery<Post[], Error>({
    queryKey: ['posts', 'all', 'recommendations'],
    queryFn: () => getPosts(),
  })

  // 추천 API 호출 (현재 게시물 제외)
  // post.id는 plcy_no와 동일함 (posts.ts에서 id: String(b.plcy_no)로 매핑)
  const {
    data: recoData,
    isLoading: isRecoLoading,
    isError: isRecoError,
  } = useQuery<RecommendResp, Error>({
    queryKey: ['recommendations', 'detail', profile, post?.id],
    queryFn: () => fetchRecommendations(profile as OnboardingProfile, post?.id),
    enabled: !!profile && !!post && env.USE_SERVER,
    staleTime: 1000 * 60 * 5,
  })

  // plcy_no -> Post 맵
  // post.id는 plcy_no와 동일하므로 이를 키로 사용
  const postMapByPlcyNo = useMemo(
    () => new Map(allPosts.map((p) => [String(p.id), p])),
    [allPosts],
  )

  // 추천 결과와 블로그 join (백엔드에서 이미 현재 post 제외됨, 여기서는 안전장치로 한번 더 체크)
  const recommendedPosts: Post[] = useMemo(() => {
    const items = recoData?.items ?? []
    const result: Post[] = []
    for (const it of items) {
      const p = postMapByPlcyNo.get(String(it.plcy_no))
      // 백엔드에서 이미 제외되지만, 안전장치로 한번 더 체크
      if (p && p.id !== post?.id) {
        result.push(p)
      }
    }
    // 최대 4개만 표시
    return result.slice(0, 4)
  }, [recoData?.items, postMapByPlcyNo, post?.id])

  // 추천 영역 노출 추적
  useEffect(() => {
    if (recommendedPosts.length > 0 && !isRecoLoading && !isRecoError && post?.id) {
      trackRecommendationImpression(post.id)
    }
  }, [recommendedPosts.length, isRecoLoading, isRecoError, post?.id])

  // 추천 콘텐츠 클릭 핸들러
  const onRecommendationClick = (targetPostId: string | number) => {
    if (post?.id) {
      trackRecommendationClick(targetPostId, post.id)
    }
  }

  /* ========== 로딩 ========== */
  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="aspect-[21/9] bg-gray-200 rounded-2xl animate-pulse" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
          </div>
        </div>
      </MainLayout>
    )
  }

  /* ========== 포스트 없음 ========== */
  if (!post) {
    return (
      <MainLayout>
        <Helmet>
          <title>포스트를 찾을 수 없습니다 · KCH Blog</title>
          <meta name="robots" content="noindex,nofollow" />
        </Helmet>
        <div className="text-center py-20">
          <div className="inline-flex p-8 rounded-full bg-gray-100 mb-6">
            <Home size={48} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">포스트를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-8">요청하신 포스트가 존재하지 않거나 삭제되었습니다.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FEBC02] text-white rounded-lg font-semibold hover:bg-[#FDB913] transition-colors"
          >
            <ArrowLeft size={20} />
            홈으로 돌아가기
          </Link>
        </div>
      </MainLayout>
    )
  }

  const cat = post.category || '정책'

  /* ========== 본문 ========== */
  return (
    <MainLayout>
      <Helmet>
        <title>{helmetData.title}</title>
        {helmetData.description && <meta name="description" content={helmetData.description} />}
        {helmetData.keywords.length > 0 && (
          <meta name="keywords" content={helmetData.keywords.join(', ')} />
        )}
        <meta name="robots" content={helmetData.robots} />
        {helmetData.ogImage && <meta property="og:image" content={helmetData.ogImage} />}
      </Helmet>

      <article className="max-w-5xl mx-auto">
        {/* 히어로 섹션 */}
        <div className="relative aspect-[21/9] rounded-2xl overflow-hidden mb-12 shadow-xl">
          {post.thumbnail ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${post.thumbnail})`,
                filter: 'blur(8px)',
                transform: 'scale(1.1)',
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#FEBC02] to-[#FDB913]" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

          <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <span className="flex items-center gap-2">
                  <Calendar size={18} className="drop-shadow" />
                  <span className="font-medium">{getRelativeTime(post.createdAt)}</span>
                  <span className="text-white/60">·</span>
                  <span>{fmtDate(post.createdAt)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Eye size={18} className="drop-shadow" />
                  <span className="font-medium">{fmtNum(post.viewCount)}</span>
                </span>
                <span className="hidden sm:flex items-center gap-2">
                  <span className="px-3 py-1 bg-white/15 rounded-full text-sm font-semibold">
                    {cat}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 공유 바 */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">공유</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
              <span className="text-sm font-medium">링크복사</span>
            </button>
          </div>
        </div>

        {/* 요약문 */}
        {post.summary && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gradient-to-br from-[#FFF9E6] to-[#FFF3CC] rounded-xl p-6 border border-[#FEBC02]/20">
              <p className="text-lg md:text-xl font-semibold text-gray-800 leading-relaxed">
                {post.summary}
              </p>
            </div>
          </div>
        )}

        {/* 본문 */}
        <section className="max-w-4xl mx-auto bg-white rounded-xl p-6 md:p-10 shadow-sm border border-gray-200">
          <div
            className="
            prose prose-lg prose-slate max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6
            prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-5
            prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-a:text-[#FEBC02] prose-a:no-underline hover:prose-a:underline prose-a:break-all
            prose-ul:my-4 prose-ol:my-4
            prose-li:text-gray-700 prose-li:mb-2
            prose-blockquote:border-l-4 prose-blockquote:border-[#FEBC02] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
            prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:text-gray-800
            prose-pre:bg-gray-900 prose-pre:text-gray-100
            prose-img:rounded-xl prose-img:shadow-md
            prose-table:border-collapse prose-table:w-full prose-table:my-6
            prose-th:bg-gray-100 prose-th:border prose-th:border-gray-300 prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-semibold prose-th:text-gray-900
            prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-3 prose-td:text-gray-700
            prose-tr:border-b prose-tr:border-gray-200
            [&>*:first-child]:mt-0
            [&>*:last-child]:mb-0
          "
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" />
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </section>

        {/* 추천 콘텐츠 섹션 */}
        <section className="max-w-4xl mx-auto mt-12 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-[#FEBC02]" />
            <h3 className="text-xl font-bold text-gray-900">함께 읽으면 좋은 글</h3>
          </div>
          {!profile && (
            <p className="text-gray-500 text-sm mb-4">
              온보딩을 완료하면 나에게 맞는 정책 추천이 표시됩니다.
            </p>
          )}
          {profile && isRecoLoading && (
            <p className="text-gray-500 text-sm mb-4">추천 불러오는 중…</p>
          )}
          {profile && isRecoError && (
            <p className="text-gray-500 text-sm mb-4">
              추천을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </p>
          )}
          {profile && !isRecoLoading && !isRecoError && recommendedPosts.length === 0 && (
            <p className="text-gray-500 text-sm mb-4">
              추천할 정책이 없습니다.
            </p>
          )}
          {recommendedPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedPosts.map((item) => (
                <Link
                  key={item.id}
                  to={`/posts/${item.slug}`}
                  onClick={() => onRecommendationClick(item.id)}
                  className="group block p-5 rounded-xl border border-gray-200 bg-white hover:border-[#FEBC02] hover:shadow-md transition-all"
                >
                  <h4 className="font-bold text-lg text-gray-900 group-hover:text-[#FEBC02] transition-colors mb-2 line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-gray-600 text-sm line-clamp-2">{item.summary}</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 하단 네비게이션 */}
        <div className="flex items-center justify-center pt-8 pb-16">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
            목록으로 돌아가기
          </button>
        </div>
      </article>
    </MainLayout>
  )
}
