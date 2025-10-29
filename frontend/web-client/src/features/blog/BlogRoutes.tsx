import { Routes, Route } from 'react-router-dom'

import { BlogLayout } from './components'
import { HomePage, PostDetailPage, CategoryPage } from './pages'

export const BlogRoutes = () => {
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
