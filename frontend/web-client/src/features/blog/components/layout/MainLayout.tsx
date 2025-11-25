import { type ReactNode, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getPosts, type Post } from '../../../../shared/api/posts'
import { getPolicies, type PolicyCleanOut } from '../../../../shared/api/policies'
import { Calendar, Flame, Clock, Eye } from 'lucide-react'
import { trackPostClick } from '../../../../shared/api/analytics'

interface MainLayoutProps {
  children: ReactNode
  sidebar?: ReactNode
}

export default function MainLayout({ children, sidebar }: MainLayoutProps) {
  // 공통 사이드바 데이터 (프론트 전용)
  const { data: posts = [] } = useQuery<Post[], Error>({
    queryKey: ['posts', 'all', 'sidebar'],
    queryFn: () => getPosts(),
  })
  const { data: policies = [] } = useQuery<PolicyCleanOut[], Error>({
    queryKey: ['policies', 'sidebar'],
    queryFn: () => getPolicies({ limit: 100 }),
  })

  // 유틸
  const daysBetween = (a: Date, b: Date) => Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24))

  // 1) 마감 임박: 정책의 period_end 기준으로 D-day 계산 (백엔드 데이터 사용)
  const closingSoon = useMemo(() => {
    const now = new Date()
    return policies
      .map((p) => {
        const end = p.period_end ? new Date(p.period_end) : null
        const remaining = end ? Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
        return { policy: p, remaining }
      })
      .filter((x) => x.remaining !== null && x.remaining! > 0 && x.remaining! <= 7)
      .sort((a, b) => (a.remaining! - b.remaining!))
      .slice(0, 3)
  }, [policies])

  // 2) 인기 키워드: 제목 기반 간단 카운트 Top6 → 링크로 검색
  const trendingKeywords = useMemo(() => {
    const candidates = ['월세', '장학금', '취업', '창업', '주거', '교통비', '문화', '건강검진', '인턴십', '직업훈련']
    const counts = new Map<string, number>()
    for (const p of posts) {
      const hay = `${p.title} ${p.summary ?? ''}`
      for (const key of candidates) {
        if (hay.includes(key)) counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([k]) => k)
  }, [posts])

  // 3) 이번 주 인기: 최근 7일 내 조회수 상위 5개, 없으면 30일, 그래도 없으면 전체
  const weeklyPopular = useMemo(() => {
    const now = new Date()
    const withinDays = (d: number) => posts.filter((p) => daysBetween(now, new Date(p.createdAt)) <= d)
    let pool = withinDays(7)
    if (pool.length === 0) pool = withinDays(30)
    if (pool.length === 0) pool = posts
    return [...pool].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0)).slice(0, 5)
  }, [posts])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* 왼쪽: 메인 컨텐츠 (70%) */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

        <div className="w-px bg-gray-200 self-stretch" />


        {/* 오른쪽: 사이드바 (30%) */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          {sidebar || (
            <div className="space-y-6">
              {/* 1) 마감임박 정책 추천 */}
              <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FEBC02]" />
                  <h3 className="font-bold text-gray-900">마감임박 정책</h3>
                </div>
                <ul className="divide-y divide-gray-100">
                  {closingSoon.length > 0 ? (
                    closingSoon.map(({ policy, remaining }) => (
                      <li key={policy.plcy_no} className="px-5 py-4">
                        <Link to={`/posts?q=${encodeURIComponent(policy.title || '')}`} className="group block">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 group-hover:text-[#FEBC02] line-clamp-2">{policy.title}</p>
                              <div className="mt-1 text-xs text-gray-500 flex items-center gap-3">
                                <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{policy.period_end ? new Date(policy.period_end).toLocaleDateString('ko-KR') : '기간 미정'}</span>
                                <span className="inline-flex items-center text-red-500 font-bold">D-{remaining}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="px-5 py-6 text-sm text-gray-500">임박한 정책이 없습니다.</li>
                  )}
                </ul>
              </section>

              {/* 2) 뜨고 있는 키워드 */}
              <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#FEBC02]" />
                  <h3 className="font-bold text-gray-900">뜨고 있는 키워드 <span className="text-red-500 text-xs font-extrabold ml-1">HOT</span></h3>
                </div>
                <div className="px-5 py-4">
                  <div className="flex flex-wrap gap-3">
                    {trendingKeywords.length > 0 ? (
                      trendingKeywords.map((kw) => (
                        <Link
                          key={kw}
                          to={`/posts?q=${encodeURIComponent(kw)}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-[#FFF7DB] text-gray-800 border border-[#FEE8A1] hover:bg-[#FEF0C2] hover:shadow-sm transition"
                        >
                          {kw}
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">키워드 준비중</p>
                    )}
                  </div>
                </div>
              </section>

              {/* 3) 이번주 인기 게시물 */}
              <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#FEBC02]" />
                  <h3 className="font-bold text-gray-900">이번 주 인기</h3>
                </div>
                <ul className="divide-y divide-gray-100">
                  {weeklyPopular.map((post) => (
                    <li key={post.id} className="px-5 py-4">
                      <Link 
                        to={`/posts/${post.slug}`} 
                        onClick={() => trackPostClick(post.id, post.slug, 'sidebar-popular')}
                        className="group block"
                      >
                        <div className="flex items-start gap-3">
                          {post.thumbnail && (
                            <img src={post.thumbnail} alt="thumb" className="w-12 h-12 rounded-md object-cover border border-gray-200" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-[#FEBC02] line-clamp-2">{post.title}</p>
                            <div className="mt-1 text-xs text-gray-500 inline-flex items-center gap-1">
                              <Eye className="w-3 h-3" /> {post.viewCount.toLocaleString('ko-KR')}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}