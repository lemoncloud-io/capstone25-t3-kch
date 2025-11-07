import { Outlet } from 'react-router-dom'
import Header from './layout/Header'
import Footer from './layout/Footer'

export default function BlogLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 맨 위: 헤더 */}
      <Header />

      {/* 중간: 메인 컨텐츠 (페이지별로 바뀜) */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* 맨 아래: 푸터 */}
      <Footer />
    </div>
  )
}