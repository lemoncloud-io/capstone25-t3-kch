import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import AdminLayout from './components/AdminLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PostsManagePage from './pages/PostsManagePage'

export default function AdminRoutes() {
    const { isAuthenticated } = useAuthStore()

    if (!isAuthenticated) {
        return <LoginPage />
    }

    return (
        <Routes>
            <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="posts" element={<PostsManagePage />} />
            </Route>
        </Routes>
    )
}
