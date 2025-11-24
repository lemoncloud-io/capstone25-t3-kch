// src/pages/PostDetailPage.tsx
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Eye, ArrowLeft, Home, Share2, Link as LinkIcon } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { setOgTags } from '../../../shared/lib/seo'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { getPost, type Post } from '../../../shared/api/posts'
import MainLayout from '@/features/blog/components/layout/MainLayout'
import { toast } from 'sonner'
import { trackPostClick, trackPostStay } from '@/shared/api/analytics'

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

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const { data: post, isLoading } = useQuery<Post | undefined>({
    queryKey: ['post', slug],
    queryFn: () => getPost(slug!),
    enabled: !!slug,
  })

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

    const enterIso = new Date().toISOString()
    stayEnterRef.current = enterIso

    // 상세 페이지 진입 = 클릭 기록
    console.log('[PostDetail] 조회수 추적 시작:', { id: post.id, slug: post.slug })
    trackPostClick(post.id, post.slug, 'post-detail')

    const handleLeave = () => {
      if (!stayEnterRef.current) return
      const leaveIso = new Date().toISOString()
      trackPostStay(post.id, post.slug, 'post-detail', stayEnterRef.current, leaveIso)
      stayEnterRef.current = null
    }

    window.addEventListener('beforeunload', handleLeave)
    window.addEventListener('pagehide', handleLeave)

    return () => {
      handleLeave()
      window.removeEventListener('beforeunload', handleLeave)
      window.removeEventListener('pagehide', handleLeave)
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
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.error('Share API 오류:', error)
        toast.error('공유에 실패했습니다.')
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('링크가 클립보드에 복사되었습니다.')
      } catch (err) {
        console.error('클립보드 복사 오류:', err)
        toast.error('링크 복사에 실패했습니다.')
      }
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('링크가 클립보드에 복사되었습니다.')
    } catch (err) {
      console.error('클립보드 복사 오류:', err)
      toast.error('링크 복사에 실패했습니다.')
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
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            포스트를 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 mb-8">
            요청하신 포스트가 존재하지 않거나 삭제되었습니다.
          </p>
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
