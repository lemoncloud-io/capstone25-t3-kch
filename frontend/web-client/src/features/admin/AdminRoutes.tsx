import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../../shared/store/authStore'
import AdminLayout from './components/AdminLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PostsManagePage from './pages/PostsManagePage'
import AdminDashboardPage from './pages/AdminDashboardPage'
export default function AdminRoutes() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        {/* /admin 접속 시 기본으로 성과 지표 대시보드로 이동 */}
        <Route index element={<Navigate to="/admin/metrics" replace />} />

        {/* 기존 대시보드 */}
        <Route path="dashboard" element={<DashboardPage />} />

        {/* 성과 지표 대시보드 */}
        <Route path="metrics" element={<AdminDashboardPage />} />

        {/* 게시물 관리 페이지 */}
        <Route path="posts" element={<PostsManagePage />} />
      </Route>
    </Routes>
  )
}
