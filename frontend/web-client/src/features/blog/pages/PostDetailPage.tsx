// src/pages/PostDetailPage.tsx
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Eye } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { getPost, type Post } from '@/shared/api/posts'
import React, { useLayoutEffect, useRef, useState } from 'react'

// ----------------------------------------------------
// 1) UI SCALE
// ----------------------------------------------------
const UI_SCALE = 0.6
const CONTENT_MAX_WIDTH = 1200

const nameToKey: Record<string, string> = {
  주거지원: 'housing',
  교육지원: 'education',
  일자리지원: 'jobs',
  복지지원: 'welfare',
}

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: post, isLoading } = useQuery<Post | undefined>({
    queryKey: ['post', slug],
    queryFn: () => getPost(slug!),
    enabled: !!slug,
  })

  // 시각(스케일 적용 후) 높이 측정 → 부모 height에 반영
  const scalerRef = useRef<HTMLDivElement>(null)
  const [visualH, setVisualH] = useState<number>(0)

  useLayoutEffect(() => {
    const measure = () => {
      if (scalerRef.current) {
        setVisualH(scalerRef.current.getBoundingClientRect().height)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [post])

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded w-3/4 mt-8 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-40 mb-8" />
          <div className="mx-auto w-full max-w-[553px] aspect-square bg-gray-200 rounded mb-10" />
          <div className="h-5 bg-gray-200 rounded w-28 mb-3" />
          <div className="h-6 bg-gray-200 rounded w-2/3 mb-8" />
          <div className="h-[400px] bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-gray-600 mb-4">포스트를 찾을 수 없습니다.</p>
        <Link to="/" className="text-blue-600 hover:underline">홈으로 돌아가기</Link>
      </div>
    )
  }

  const categoryName = post.category || '카테고리'
  const categoryKey = nameToKey[categoryName]

  return (
    // 가로 스크롤 방지
    <div style={{ overflowX: 'hidden' }}>
      <div style={{ position: 'relative', height: visualH || 'auto' }}>
        <div
          ref={scalerRef}
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: `translateX(-50%) scale(${UI_SCALE})`,
            transformOrigin: 'top center',
            width: '100%',
            margin: 0,
            paddingBottom: 0,
          }}
        >
          {/* 내부 컨텐츠 */}
          <article
            style={{ maxWidth: `${CONTENT_MAX_WIDTH}px` }}
            className="mx-auto w-full px-4 sm:px-6 lg:px-8"
          >
            {/* 브레드크럼 */}
            <nav className="mt-6 text-[15px] text-gray-700">
              <Link to="/" className="hover:text-blue-600">홈</Link>
              <span className="mx-2 text-gray-300">/</span>
              {categoryKey ? (
                <Link
                  to={`/category/${categoryKey}`}
                  className="font-semibold text-[#6B9CC9] hover:underline"
                >
                  {categoryName}
                </Link>
              ) : (
                <span>{categoryName}</span>
              )}
            </nav>

            {/* 제목/메타 */}
            <header className="mt-6">
              <h1 className="font-semibold text-black leading-tight text-[50px] sm:text-[50px] lg:text-[60px]">
                {post.title}
              </h1>
              <div className="mt-6 flex items-center gap-6 text-gray-800 font-semibold">
                <span className="inline-flex items-center">
                  <Calendar size={18} className="mr-2" />
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center">
                  <Eye size={18} className="mr-2" />
                  {post.viewCount?.toLocaleString?.() ?? 0}
                </span>
              </div>
            </header>

            {/* 썸네일*/}
            {post.thumbnail && (
              <div className="mt-10 mx-auto w-full max-w-[553px]">
                <div className="aspect-square bg-[#F5F5F5] rounded overflow-hidden">
                  <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* 요약문 */}
            <section className="mt-20">
              <p className="text-[#6B9CC9] font-semibold text-[30px] sm:text-[35px] leading-snug">
                {post.summary}
              </p>
            </section>

            {/* 본문 */}
            <section className="mt-8 mb-0">
              <div className="bg-white rounded-xl px-6 sm:px-10 lg:px-14 pt-10 pb-0">
                {/* 마지막 요소 하단 마진 제거 */}
                <div className="prose prose-slate max-w-none prose-headings:text-black prose-p:text-black prose-strong:text-black prose-li:text-black [&>*:last-child]:mb-0">
                  <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>
              </div>
            </section>
          </article>
        </div>
      </div>
    </div>
  )
}
