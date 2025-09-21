import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const BlogRoutes = lazy(() => import('@/features/blog/BlogRoutes'))
const AdminRoutes = lazy(() => import('@/features/admin/AdminRoutes'))

function App() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
                <div className="flex items-center space-x-2">
                    <Loader2 className="animate-spin" size={24} />
                    <span>Loading...</span>
                </div>
            </div>
        }>
            <Routes>
                <Route path="/admin/*" element={<AdminRoutes />} />
                <Route path="/*" element={<BlogRoutes />} />
            </Routes>
        </Suspense>
    )
}

export default App
