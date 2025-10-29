import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import { AdminLayout } from './components/AdminLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { PostsManagePage } from './pages/PostsManagePage'
import { PoliciesManagePage } from './pages/PoliciesManagePage'
import { PolicyDetailPage } from './pages/PolicyDetailPage'
import { LLMTestPage } from './pages/LLMTestPage'

export const AdminRoutes = () => {
    const { isAuthenticated } = useAuthStore()

    if (!isAuthenticated) {
        return <LoginPage />
    }

    return (
        <Routes>
            <Route path="/" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="posts" element={<PostsManagePage />} />
                <Route path="policies" element={<PoliciesManagePage />} />
                <Route path="policies/llm-test" element={<LLMTestPage />} />
                <Route path="policies/:plcy_no" element={<PolicyDetailPage />} />
            </Route>
        </Routes>
    )
}
