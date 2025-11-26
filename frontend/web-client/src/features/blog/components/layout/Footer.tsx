import { Link } from 'react-router-dom'
import logo from '@/assets/kch_blog.png'

export default function Footer() {
  const quickLinks = [
    { name: '주거지원', path: '/category/housing' },
    { name: '교육지원', path: '/category/education' },
    { name: '일자리지원', path: '/category/jobs' },
    { name: '복지지원', path: '/category/welfare' },
  ]

  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 로고 & 설명 */}
          <div>
            {/* 이미지 로고로 변경 */}
            <div className="mb-4">
              <img
                src={logo}
                alt="K-Coding Hansung 로고"
                className="h-10 w-auto"
              />
            </div>

            <p className="text-gray-600 text-sm">
              AI 기반 블로그 자동 생성 서비스
            </p>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">빠른 링크</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-600 hover:text-[#FEBC02] text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 문의 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">문의</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>이메일 : lemon@lemoncloud.io</li>
              <li>전화번호 : 02-1234-5678</li>
            </ul>
          </div>
        </div>

        {/* 저작권 */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            © 2025 K-Coding Hansung, All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  )
}