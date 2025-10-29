import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit, Trash2, Eye, Plus, CheckCircle, XCircle, X } from 'lucide-react'
import { getPosts, deletePost, publishPost, createPost, updatePost } from '@/shared/api'
import type { Post, PostFilters, PostCreate } from '@/shared/api/types'
import { toast } from 'sonner'

/**
 * Posts Management Page - Admin UI for blog CRUD
 *
 * This file contains:
 * 1. State Management (lines 9-19): Filters, modal, form state
 * 2. API Queries (lines 21-78): Fetch and mutate posts data
 * 3. Event Handlers (lines 80-168): User interactions
 * 4. JSX Render (lines 170-530): UI components (filters, table, modal)
 */
export const PostsManagePage = () => {
    // ==================== 1. STATE MANAGEMENT ====================

    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [publishFilter, setPublishFilter] = useState<'all' | 'published' | 'draft'>('all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPost, setEditingPost] = useState<Post | null>(null)
    const [formData, setFormData] = useState<PostCreate>({
        title: '',
        summary: '',
        content: '',
        category: '취업',
    })
    const queryClient = useQueryClient()

    // ==================== 2. API QUERIES & MUTATIONS ====================

    // Build filters
    const filters: PostFilters = {}
    if (selectedCategory !== 'all') filters.category = selectedCategory
    if (publishFilter === 'published') filters.isPublished = true
    if (publishFilter === 'draft') filters.isPublished = false

    // Fetch posts
    const { data: posts, isLoading } = useQuery({
        queryKey: ['posts', filters],
        queryFn: () => getPosts(filters),
    })

    // Create/Update mutation
    const saveMutation = useMutation({
        mutationFn: async (data: PostCreate) => {
            if (editingPost) {
                return updatePost(editingPost.slug, data)
            } else {
                return createPost(data)
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] })
            toast.success(editingPost ? '포스트가 수정되었습니다' : '포스트가 생성되었습니다')
            closeModal()
        },
        onError: (error: Error) => {
            toast.error(`저장 실패: ${error.message}`)
        },
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] })
            toast.success('포스트가 삭제되었습니다')
        },
        onError: (error: Error) => {
            toast.error(`삭제 실패: ${error.message}`)
        },
    })

    // Publish/unpublish mutation
    const publishMutation = useMutation({
        mutationFn: publishPost,
        onSuccess: (updatedPost: Post) => {
            queryClient.invalidateQueries({ queryKey: ['posts'] })
            toast.success(
                updatedPost.isPublished
                    ? '포스트가 발행되었습니다'
                    : '포스트 발행이 취소되었습니다'
            )
        },
        onError: (error: Error) => {
            toast.error(`발행 상태 변경 실패: ${error.message}`)
        },
    })

    // Extract unique categories
    const categories = ['all', ...new Set(posts?.map(post => post.category) || [])]

    // ==================== 3. EVENT HANDLERS ====================

    const openModal = () => {
        setFormData({
            title: '',
            summary: '',
            content: '',
            category: '취업',
        })
        setEditingPost(null)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingPost(null)
        setFormData({
            title: '',
            summary: '',
            content: '',
            category: '취업',
        })
    }

    const handleNewPost = () => {
        openModal()
    }

    const handleViewPost = (post: Post) => {
        window.open(`/posts/${post.slug}`, '_blank')
    }

    const handleEditPost = (post: Post) => {
        setFormData({
            title: post.title,
            summary: post.summary,
            content: post.content,
            category: post.category,
            thumbnail: post.thumbnail || undefined,
            plcyNo: post.plcyNo || undefined,
        })
        setEditingPost(post)
        setIsModalOpen(true)
    }

    const handleDeletePost = (post: Post) => {
        if (confirm(`"${post.title}" 포스트를 삭제하시겠습니까?`)) {
            deleteMutation.mutate(post.slug)
        }
    }

    const handleTogglePublish = (post: Post) => {
        const action = post.isPublished ? '발행 취소' : '발행'
        if (confirm(`"${post.title}" 포스트를 ${action}하시겠습니까?`)) {
            publishMutation.mutate(post.slug)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title || !formData.summary || !formData.content) {
            toast.error('제목, 요약, 내용을 모두 입력해주세요')
            return
        }

        // Check for duplicate posts (same plcy_no and title)
        if (!editingPost && posts && formData.plcyNo) {
            const exactDuplicate = posts.find(
                (p) => p.plcyNo === formData.plcyNo && p.title === formData.title
            )

            if (exactDuplicate) {
                toast.warning(
                    '동일한 정책과 제목의 포스트가 이미 있습니다. 제목을 변경하거나 기존 포스트를 수정하세요.',
                    { duration: 5000 }
                )
                return
            }

            // Inform about other posts with same policy
            const samePolicyPosts = posts.filter((p) => p.plcyNo === formData.plcyNo)
            if (samePolicyPosts.length > 0) {
                toast.info(
                    `이 정책에 대한 포스트가 ${samePolicyPosts.length}개 있습니다. 다른 관점의 콘텐츠를 작성하세요.`,
                    { duration: 4000 }
                )
            }
        }

        saveMutation.mutate(formData)
    }

    // ==================== 4. JSX RENDER ====================
    // Components: Filters (lines 192-248) → Table (lines 250-380) → Modal (lines 382-537)

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <h1 className="text-2xl font-bold mb-4 sm:mb-0">포스트 관리</h1>
                <button
                    onClick={handleNewPost}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={20} />새 포스트
                </button>
            </div>

            {/* ========== FILTERS SECTION ========== */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 space-y-4">
                {/* Publish Status Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        발행 상태
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: 'all' as const, label: '전체' },
                            { value: 'published' as const, label: '발행됨' },
                            { value: 'draft' as const, label: '미발행' },
                        ].map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => setPublishFilter(value)}
                                className={`px-4 py-2 rounded-lg transition ${
                                    publishFilter === value
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        카테고리
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(category => (
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
                </div>

                <div className="text-sm text-gray-500 pt-2 border-t">
                    총 {posts?.length || 0}개의 포스트
                </div>
            </div>

            {/* ========== POSTS TABLE SECTION ========== */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-6">
                        <div className="animate-pulse space-y-4">
                            {[1, 2, 3].map(i => (
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
                                        상태
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
                                {posts?.map(post => (
                                    <tr key={post.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {post.title}
                                            </div>
                                            {post.plcyNo && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    정책번호: {post.plcyNo}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                                {post.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {post.isPublished ? (
                                                <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                                    <CheckCircle size={16} />
                                                    발행됨
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-gray-500 text-sm font-medium">
                                                    <XCircle size={16} />
                                                    미발행
                                                </span>
                                            )}
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
                                                    onClick={() => handleTogglePublish(post)}
                                                    className={`${
                                                        post.isPublished
                                                            ? 'text-orange-600 hover:text-orange-800'
                                                            : 'text-green-600 hover:text-green-800'
                                                    }`}
                                                    title={
                                                        post.isPublished ? '발행 취소' : '발행'
                                                    }
                                                    disabled={publishMutation.isPending}
                                                >
                                                    {post.isPublished ? (
                                                        <XCircle size={18} />
                                                    ) : (
                                                        <CheckCircle size={18} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleEditPost(post)}
                                                    className="text-purple-600 hover:text-purple-800"
                                                    title="수정"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePost(post)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="삭제"
                                                    disabled={deleteMutation.isPending}
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

            {/* ========== CREATE/EDIT MODAL SECTION ========== */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b sticky top-0 bg-white">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold">
                                    {editingPost ? '포스트 수정' : '새 포스트 작성'}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    제목 *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="포스트 제목을 입력하세요"
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    카테고리 *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={e =>
                                        setFormData({ ...formData, category: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="취업">취업</option>
                                    <option value="주거">주거</option>
                                    <option value="복지">복지</option>
                                    <option value="교육">교육</option>
                                    <option value="금융">금융</option>
                                    <option value="기타">기타</option>
                                </select>
                            </div>

                            {/* Summary */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    요약 *
                                </label>
                                <textarea
                                    value={formData.summary}
                                    onChange={e =>
                                        setFormData({ ...formData, summary: e.target.value })
                                    }
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="포스트 요약을 입력하세요"
                                    required
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    본문 * <span className="text-gray-500 text-xs">(Markdown 지원)</span>
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={e =>
                                        setFormData({ ...formData, content: e.target.value })
                                    }
                                    rows={15}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                    placeholder="포스트 본문을 Markdown 형식으로 입력하세요"
                                    required
                                />
                            </div>

                            {/* Thumbnail URL (optional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    썸네일 URL (선택)
                                </label>
                                <input
                                    type="url"
                                    value={formData.thumbnail || ''}
                                    onChange={e =>
                                        setFormData({ ...formData, thumbnail: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            {/* Policy Number (optional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    정책 번호 (선택)
                                    <span className="text-xs text-gray-500 ml-2">
                                        정책과 연결하려면 입력하세요
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.plcyNo || ''}
                                    onChange={e =>
                                        setFormData({ ...formData, plcyNo: e.target.value || undefined })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="예: R2024010001"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    💡 하나의 정책으로 여러 포스트를 작성할 수 있습니다 (시리즈, 관점별 등)
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={saveMutation.isPending}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {saveMutation.isPending
                                        ? '저장 중...'
                                        : editingPost
                                        ? '수정 완료'
                                        : '포스트 생성'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                                >
                                    취소
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
