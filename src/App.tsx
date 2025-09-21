import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'

const BlogRoutes = lazy(() => import('@/features/blog/BlogRoutes'))
const AdminRoutes = lazy(() => import('@/features/admin/AdminRoutes'))

function App() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <Routes>
                <Route path="/admin/*" element={<AdminRoutes />} />
                <Route path="/*" element={<BlogRoutes />} />
            </Routes>
        </Suspense>
    )
}

export default App
