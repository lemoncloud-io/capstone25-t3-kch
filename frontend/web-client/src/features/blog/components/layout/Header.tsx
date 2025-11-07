import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPost } from '@/shared/api/posts'
import logo from '@/assets/kch_blog.png'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // 게시물 상세 페이지 체크
  const isPostDetail = location.pathname.startsWith('/posts/')
  const slug = isPostDetail ? location.pathname.split('/').pop() : null

  // 게시물 상세 페이지일 때 게시물 정보 가져오기
  const { data: currentPost } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => getPost(slug!),
    enabled: !!slug && isPostDetail,
  })

  const categories = [
    { name: '블로그 홈', path: '/' },
    { name: '주거지원', path: '/category/housing' },
    { name: '교육지원', path: '/category/education' },
    { name: '일자리지원', path: '/category/jobs' },
    { name: '복지지원', path: '/category/welfare' },
    { name: '전체 보기', path: '/posts' },
  ]

  // 카테고리 매핑
  const categoryMap: Record<string, string[]> = {
    '/category/housing': ['주거', '주거지원'],
    '/category/education': ['교육', '교육지원'],
    '/category/jobs': ['일자리', '일자리지원'],
    '/category/welfare': ['복지', '복지지원'],
  }

  const isActive = (path: string) => {
    // 홈 페이지
    if (path === '/') {
      return location.pathname === '/'
    }
    
    // 카테고리 페이지
    if (location.pathname === path) {
      return true
    }
    
    // 게시물 상세 페이지일 때 카테고리 매칭
    if (isPostDetail && currentPost && path !== '/') {
      const matchCategories = categoryMap[path]
      return matchCategories?.includes(currentPost.category)
    }
    
    return false
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 로고 - 중앙 정렬 */}
        <div className="flex items-center justify-center py-6">
          <Link to="/">
            <img 
              src={logo}
              alt="KCH Blog" 
              className="h-16"
            />
          </Link>
        </div>

        {/* 노란색 구분선 (두껍게) */}
        <div className="border-t-2 border-[#FEBC02]"></div>

        {/* 카테고리 메뉴 + 검색창 */}
        <div className="flex items-center justify-between py-2 relative">
          {/* 모바일: 햄버거 버튼 */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 hover:text-[#FEBC02]"
            aria-label="메뉴 열기"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {categories.map((category, index) => (
              <div key={category.path} className="flex items-center">
                <Link
                  to={category.path}
                  className={`relative px-4 py-1.5 font-medium text-gray-700 hover:text-[#FEBC02] transition-colors whitespace-nowrap ${
                    isActive(category.path) ? 'text-[#FEBC02]' : ''
                  }`}
                >
                  {category.name}
                  
                  {isActive(category.path) && (
                    <span className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 w-16 h-1 bg-[#FEBC02]"></span>
                  )}
                </Link>
                
                {index === 0 && (
                  <span className="text-gray-300 mx-2">|</span>
                )}
              </div>
            ))}
          </nav>

          <form
            className="relative"
            onSubmit={(e) => {
              e.preventDefault()
              const q = searchQuery.trim()
              if (q.length > 0) {
                navigate(`/posts?q=${encodeURIComponent(q)}`)
              } else {
                navigate('/posts')
              }
            }}
          >
            <input
              type="text"
              placeholder="검색어 입력"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 sm:w-48 px-4 py-2 pr-10 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-[#FEBC02]"
            />
            <button type="submit" className="absolute right-2.5 top-2.5 text-gray-500" aria-label="검색">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* 모바일 드롭다운 메뉴 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <nav className="py-2">
              {categories.map((category) => (
                <Link
                  key={category.path}
                  to={category.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-sm font-medium ${
                    isActive(category.path)
                      ? 'text-[#FEBC02]'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-[#FEBC02]'
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}