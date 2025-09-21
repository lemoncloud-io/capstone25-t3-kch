import { Routes, Route } from 'react-router-dom'
import BlogLayout from './components/BlogLayout'
import HomePage from './pages/HomePage'
import PostDetailPage from './pages/PostDetailPage'

export default function BlogRoutes() {
    return (
        <Routes>
            <Route element={<BlogLayout />}>
                <Route index element={<HomePage />} />
                <Route path="post/:slug" element={<PostDetailPage />} />
            </Route>
        </Routes>
    )
}
