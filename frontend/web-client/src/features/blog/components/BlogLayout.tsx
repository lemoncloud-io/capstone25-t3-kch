import { Outlet, Link } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, Home, BookOpen, Users, Briefcase } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export default function BlogLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // 카테고리 4개
  const categories = [
    { name: '주거지원', icon: Home, path: '/category/housing' },
    { name: '교육지원', icon: BookOpen, path: '/category/education' },
    { name: '일자리지원', icon: Briefcase, path: '/category/jobs' },
    { name: '복지지원', icon: Users, path: '/category/welfare' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="relative z-50 w-full bg-white">
        {/* 파란 라인: 화면 전체 폭으로 고정 (컨테이너 밖) */}
        <div className="pointer-events-none absolute bottom-0 left-1/2 translate-y-[30px] -translate-x-1/2 w-screen h-[5px] bg-[#B0CEEA]" />

        {/* 가운데 컨테이너: absolute 대신 자연 배치 + 중앙정렬 */}
        <div className="w-full max-w-[1449px] mx-auto px-4 pt-[34px]">
          <div className="flex flex-col items-center gap-[37px]">
            <div className="w-full flex items-center justify-between h-[54px]">
              {/* 로고 그룹 (312x54, gap 21) */}
              <Link to="/" className="flex items-center gap-[21px] w-[312px] h-[54px]">
                {/* 56x54 background 로고 */}
                <div
                  className="w-[56px] h-[54px] bg-no-repeat bg-center bg-contain flex-none order-0"
                  style={{ backgroundImage: "url('/KCodingHansung_logo.png')" }}
                  aria-label="K-Coding Hansung 로고"
                />
                {/* 텍스트 235x30, 25/30, 600 */}
                <span className="w-[235px] h-[30px] font-[600] text-[25px] leading-[30px] text-black">
                  K-Coding Hansung
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-8 pr-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.path}
                    to={cat.path}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
            {/* 여기선 더 이상 보더 라인 X (라인은 상단에 w-screen으로 이미 그림) */}
          </div>
        </div>

        {/* Mobile Menu: 헤더 아래 자연 배치 (이제 mt 보정 불필요) */}
        <div
          className={cn(
            'md:hidden bg-white border-t transition-all duration-300 overflow-hidden',
            isMobileMenuOpen ? 'max-h-96' : 'max-h-0'
          )}
        >
          <div className="w-full max-w-[1449px] mx-auto px-4 py-4 space-y-4">
            <nav className="space-y-2">
              {categories.map((cat) => (
                <Link
                  key={cat.path}
                  to={cat.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  <cat.icon size={20} className="text-gray-500" />
                  <span>{cat.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* MAIN */}
      {/* 헤더가 자연 높이를 가지므로 큰 고정 패딩 불필요 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-3">K-Coding Hansung</h3>
              <p className="text-sm text-gray-600">
                유레카박스(CMS)를 활용한 AI 기반 블로그 자동 생성 서비스
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">빠른 링크</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/" className="hover:text-blue-600">홈</Link></li>
                <li><Link to="/category/housing" className="hover:text-blue-600">주거지원</Link></li>
                <li><Link to="/category/education" className="hover:text-blue-600">교육지원</Link></li>
                <li><Link to="/category/jobs" className="hover:text-blue-600">일자리지원</Link></li>
                <li><Link to="/category/welfare" className="hover:text-blue-600">복지지원</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">문의</h3>
              <p className="text-sm text-gray-600">
                이메일: lemon@lemoncloud.io
                <br />
                전화: 02-1234-5678
              </p>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
            © 2025 K-Coding Hansung. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}