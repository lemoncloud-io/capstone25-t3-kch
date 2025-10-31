import { Routes, Route } from 'react-router-dom'
import BlogLayout from './components/BlogLayout'
import HomePage from './pages/HomePage'
import PostDetailPage from './pages/PostDetailPage'
import CategoryPage from '@/features/blog/pages/CategoryPage.tsx'

export default function BlogRoutes() {
return (
<Routes>
    <Route element={<BlogLayout />}>
    <Route index element={<HomePage />} />
    <Route path="posts/:slug" element={<PostDetailPage />} />
    <Route path="category/:category" element={<CategoryPage />} />
    </Route>
</Routes>
)
}
