// src/pages/CategoryPage.tsx
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Home, BookOpen, Briefcase, Heart, ArrowLeft, Calendar, Eye } from 'lucide-react'
import { getPosts } from '@/shared/api/posts'
import { useMemo, useState } from 'react'
import React from 'react'

// ----------------------------------------------------
// 1) UI SCALE 정의
// ----------------------------------------------------
const UI_SCALE = 0.6
const CONTENT_MAX_WIDTH = 1200

const categoryInfo = {
  housing: {
    name: '주거지원',
    icon: Home,
    description: '청년들을 위한 주거 지원 정책을 확인하세요.',
    badge: 'bg-blue-100 text-blue-700',
  },
  education: {
    name: '교육지원',
    icon: BookOpen,
    description: '학자금, 장학금, 교육 프로그램 지원 정보입니다.',
    badge: 'bg-green-100 text-green-700',
  },
  jobs: {
    name: '일자리지원',
    icon: Briefcase,
    description: '채용, 직업훈련, 고용 연계 등 일자리 정보를 확인하세요.',
    badge: 'bg-red-100 text-red-700',
  },
  welfare: {
    name: '복지지원',
    icon: Heart,
    description: '건강·상담, 생활안정, 문화/여가 등 복지 관련 지원입니다.',
    badge: 'bg-purple-100 text-purple-700',
  },
} as const

type CatKey = keyof typeof categoryInfo

export default function CategoryPage() {
  const { category } = useParams<{ category: CatKey }>()
  const info = category ? categoryInfo[category] : undefined
  const [sortKey, setSortKey] = useState<'latest' | 'popular'>('latest')

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', 'category', category, sortKey],
    queryFn: () => getPosts({ category: info?.name }),
    enabled: !!info,
  })

  const sorted = useMemo(() => {
    if (!posts) return []
    if (sortKey === 'popular') {
      return [...posts].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    }
    return [...posts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }, [posts, sortKey])

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

  return (
    <div
      style={{
        overflowX: 'hidden',
      }}
    >
      <div
        style={{
          transform: `scale(${UI_SCALE})`,
          transformOrigin: 'top center',
          width: '100%',
          display: 'block',
          margin: '0 auto',
        }}
      >
        <div
          style={{ maxWidth: `${CONTENT_MAX_WIDTH}px` }}
          className="mx-auto w-full px-4 sm:px-6 lg:px-8"
        >
          {/* 상단 카테고리 네비게이션 */}
          <div className="flex items-center gap-4 py-5">
            <span className="font-semibold text-[22px]">카테고리</span>
            <span className="text-gray-300">|</span>
            <nav className="flex gap-8 text-[15px] sm:text-base">
              {([
                { k: 'housing', label: '주거지원' },
                { k: 'education', label: '교육지원' },
                { k: 'jobs', label: '일자리지원' },
                { k: 'welfare', label: '복지지원' },
              ] as { k: CatKey; label: string }[]).map((c) => (
                <Link
                  key={c.k}
                  to={`/category/${c.k}`}
                  className={`font-semibold ${
                    c.k === category ? 'text-[#6B9CC9]' : 'text-[#727272] hover:text-[#6B9CC9]'
                  }`}
                >
                  {c.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* 히어로 (파란 박스) */}
          <section className="relative w-full mt-6">
            <div className="bg-[#B0CEEA] rounded-none max-w-[1200px] mx-auto">
              <div className="px-6 py-8 sm:px-10 sm:py-10">
                <div className="flex items-center gap-8">
                  <div className="hidden sm:flex w-[150px] h-[150px] rounded-[10px] bg-white items-center justify-center">
                    <Icon className="w-12 h-12 text-[#6B9CC9]" />
                  </div>
                  <div className="flex-1">
                    <h1 className="font-semibold text-black leading-[1.15] text-[36px] sm:text-[56px] md:text-[55px]">
                      {info.name}
                    </h1>
                    <p className="mt-5 text-black/90 text-[16px] sm:text-[18px] md:text-[20px]">
                      {info.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 정렬 탭 */}
          <div className="flex **justify-end** gap-6 mt-10 **max-w-[calc(100%-281px-24px)]** **ml-auto**">
            <button
              onClick={() => setSortKey('latest')}
              className={`text-[18px] sm:text-[20px] font-semibold ${
                sortKey === 'latest' ? 'text-[#6B9CC9]' : 'text-black'
              }`}
            >
              최신순
            </button>
            <button
              onClick={() => setSortKey('popular')}
              className={`text-[18px] sm:text-[20px] font-semibold ${
                sortKey === 'popular' ? 'text-[#6B9CC9]' : 'text-black'
              }`}
            >
              인기순
            </button>
          </div>

          {/* 로딩 스켈레톤 */}
          {isLoading && (
            <div className="mt-6 space-y-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="grid grid-cols-[281px_1fr] items-center">
                  <div className="w-[281px] h-[281px] bg-gray-200 rounded" />
                  <div className="space-y-4">
                    <div className="h-10 bg-gray-200 rounded w-3/5" />
                    <div className="h-6 bg-gray-200 rounded w-2/5" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 포스트 목록 */}
          {!isLoading && (
            <>
              {sorted.length > 0 ? (
                <ul className="mt-6 space-y-6">
                  {sorted.map((post, idx) => (
                    <li key={post.id}>
                      <Link to={`/posts/${post.slug}`} className="block group">
                        <article
                          className="
                            bg-white border border-gray-200
                            rounded-2xl overflow-hidden
                            shadow-sm hover:shadow-md transition-shadow
                            flex flex-col sm:flex-row
                          "
                        >
                          {/* 썸네일 */}
                          <div
                            className="
                              w-full sm:w-[281px]
                              h-[220px] sm:h-auto
                              overflow-hidden
                              bg-[#F5F5F5]
                            "
                            style={{ minHeight: 281 }}
                          >
                            {post.thumbnail && (
                              <img
                                src={post.thumbnail}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                              />
                            )}
                          </div>

                          {/* 본문 */}
                          <div className="flex-1 bg-[#EAEAEA] p-5 sm:p-6 flex flex-col">
                            <h3 className="text-black font-extrabold leading-tight text-[26px] sm:text-[34px] md:text-[45px] line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="mt-3 text-[#727272] font-semibold text-[16px] sm:text-[18px] md:text-[20px] line-clamp-2">
                              {post.summary}
                            </p>

                            <div className="mt-auto pt-3 flex items-center justify-end gap-5 text-[14px] sm:text-[16px] text-black">
                              <span className="flex items-center">
                                <Calendar size={16} className="mr-2" />
                                {new Date(post.createdAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <Eye size={16} className="mr-2" />
                                {post.viewCount?.toLocaleString?.() ?? 0}
                              </span>
                            </div>
                          </div>
                        </article>
                      </Link>

                      {idx < sorted.length - 1 && (
                        <hr className="mt-6 border-t-[3px] border-[#EAEAEA]" />
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center mt-10">
                  <div className={`inline-flex p-4 rounded-full ${info.badge} mb-4`}>
                    <Icon size={48} />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">아직 등록된 정책이 없습니다</h2>
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}