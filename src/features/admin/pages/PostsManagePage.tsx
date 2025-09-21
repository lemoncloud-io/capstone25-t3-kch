import { useState } from 'react'
import { Edit, Trash2, Eye, Plus } from 'lucide-react'
import { mockPosts } from '@/shared/api/posts'

export default function PostsManagePage() {
    const [selectedStatus, setSelectedStatus] = useState('all')

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <h1 className="text-2xl font-bold mb-4 sm:mb-0">포스트 관리</h1>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <Plus size={20} />
                    새 포스트
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedStatus('all')}
                        className={`px-4 py-2 rounded-lg transition ${
                            selectedStatus === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        전체
                    </button>
                    <button
                        onClick={() => setSelectedStatus('published')}
                        className={`px-4 py-2 rounded-lg transition ${
                            selectedStatus === 'published'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        게시됨
                    </button>
                    <button
                        onClick={() => setSelectedStatus('draft')}
                        className={`px-4 py-2 rounded-lg transition ${
                            selectedStatus === 'draft'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        초안
                    </button>
                </div>
            </div>

            {/* Posts Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                        {mockPosts.map((post) => (
                            <tr key={post.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">
                                        {post.title}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
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
                                        <button className="text-blue-600 hover:text-blue-800">
                                            <Eye size={18} />
                                        </button>
                                        <button className="text-green-600 hover:text-green-800">
                                            <Edit size={18} />
                                        </button>
                                        <button className="text-red-600 hover:text-red-800">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
