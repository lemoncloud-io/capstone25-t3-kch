import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Edit, Trash2, Eye, Plus } from 'lucide-react'
import {getPosts, type Post} from '@/shared/api/posts'
import { toast} from "sonner";

export default function PostsManagePage() {
    const [selectedCategory, setSelectedCategory] = useState('all')

    const handleNewPost = () => {
        toast('TODO: 새 포스트 작성 기능')
    }

    const handleViewPost = (post: Post) => {
        window.open(`http://localhost:5173/posts/${post.slug}`, '_blank')
    }

    const handleEditPost = (post: Post) => {
        console.log('clicked: ', post);
        toast(`TODO: 수정 기능`)
    }

    const handleDeletePost = (post: Post) => {
        console.log('clicked: ', post);
        toast(`TODO: 삭제 기능`)
    }

    // 모든 포스트 가져오기
    const { data: allPosts, isLoading } = useQuery({
        queryKey: ['posts'],
        queryFn: () => getPosts(),
    })

    // 카테고리 목록 생성
    const categories = ['all', ...new Set(allPosts?.map(post => post.category) || [])]

    // 카테고리 필터링
    const posts = selectedCategory === 'all'
        ? allPosts
        : allPosts?.filter(post => post.category === selectedCategory)

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <h1 className="text-2xl font-bold mb-4 sm:mb-0">포스트 관리</h1>
                <button
                    onClick={handleNewPost}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={20} />
                    새 포스트
                </button>
            </div>

            {/* Category Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-lg transition ${
                                selectedCategory === category
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {category === 'all' ? '전체' : category}
                        </button>
                    ))}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                    총 {posts?.length || 0}개의 포스트
                </div>
            </div>

            {/* Posts Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-6">
                        <div className="animate-pulse space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex space-x-4">
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    제목
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    카테고리
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    조회수
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    작성일
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    작업
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {posts?.map((post) => (
                                <tr key={post.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {post.title}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                            {post.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-600">
                                            {post.viewCount.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-600">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleViewPost(post)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="보기"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleEditPost(post)}
                                                className="text-green-600 hover:text-green-800"
                                                title="수정"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePost(post)}
                                                className="text-red-600 hover:text-red-800"
                                                title="삭제"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
