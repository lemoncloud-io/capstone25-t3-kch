import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit, Trash2, Eye, Plus, RefreshCw, X } from 'lucide-react'
import { getPosts, getPost, createBlogPost, deleteBlogPost, updateBlogPost, type Post } from '../../../shared/api/posts'
import { getPolicies, type PolicyCleanOut } from '../../../shared/api/policies'
import { toast } from 'sonner'

export default function PostsManagePage() {
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [showNewPostModal, setShowNewPostModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingPost, setEditingPost] = useState<Post | null>(null)

    const queryClient = useQueryClient()
    
    // 디버깅용 - 브라우저 콘솔에서 사용 가능
    React.useEffect(() => {
        (window as any).debugCache = () => {
            console.log('🔍 현재 React Query 캐시 상태:')
            console.log(queryClient.getQueryCache().getAll())
        }
        
        (window as any).clearCache = () => {
            console.log('🗑️ 모든 캐시 삭제')
            queryClient.clear()
        }
        
        (window as any).refetchPosts = () => {
            console.log('🔄 포스트 데이터 강제 새로고침')
            queryClient.refetchQueries({ queryKey: ['posts'] })
        }
    }, [queryClient])

    const handleNewPost = () => {
        setShowNewPostModal(true)
    }

    const handleViewPost = (post: Post) => {
        window.open(`http://localhost:5173/posts/${post.slug}`, '_blank')
    }

    // Mutations
    const createPostMutation = useMutation({
        mutationFn: createBlogPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] })
            toast.success('새 포스트가 생성되었습니다!')
            setShowNewPostModal(false)
        },
        onError: (error: any) => {
            toast.error(`포스트 생성 실패: ${error.message}`)
        }
    })

    const deletePostMutation = useMutation({
        mutationFn: deleteBlogPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] })
            toast.success('포스트가 삭제되었습니다!')
        },
        onError: (error: any) => {
            toast.error(`포스트 삭제 실패: ${error.message}`)
        }
    })

    const updatePostMutation = useMutation({
        mutationFn: ({ plcyNo, updates }: { plcyNo: string, updates: any }) => 
            updateBlogPost(plcyNo, updates),
        onSuccess: () => {
            // 모든 관련 쿼리 캐시 무효화 (프론트엔드 카테고리 업데이트를 위해)
            queryClient.invalidateQueries({ queryKey: ['posts'] })
            queryClient.invalidateQueries({ queryKey: ['post'] }) // 개별 포스트 캐시
            queryClient.invalidateQueries({ queryKey: ['blogs'] }) // 블로그 목록 캐시
            
            // 강제로 모든 쿼리 다시 가져오기
            queryClient.refetchQueries({ queryKey: ['posts'] })
            
            // 5초 후 페이지 새로고침 (캐시 문제 해결)
            setTimeout(() => {
                console.log('🔄 페이지 새로고침으로 캐시 문제 해결')
                window.location.reload()
            }, 2000)
            
            toast.success('포스트가 수정되었습니다! 잠시 후 페이지가 새로고침됩니다.')
            setShowEditModal(false)
            setEditingPost(null)
        },
        onError: (error: any) => {
            toast.error(`포스트 수정 실패: ${error.message}`)
        }
    })

    const handleEditPost = async (post: Post) => {
        try {
            // 상세 데이터 가져오기 (content 포함)
            const fullPost = await getPost(post.slug)
            if (fullPost) {
                setEditingPost(fullPost)
                setShowEditModal(true)
            } else {
                toast.error('포스트 데이터를 불러올 수 없습니다')
            }
        } catch (error) {
            toast.error('포스트 데이터 로딩 실패')
            console.error('포스트 로딩 실패:', error)
        }
    }

    const handleDeletePost = (post: Post) => {
        if (window.confirm(`정말로 "${post.title}" 포스트를 삭제하시겠습니까?`)) {
            deletePostMutation.mutate(post.slug)
        }
    }

    const handleRefreshPosts = () => {
        queryClient.invalidateQueries({ queryKey: ['posts'] })
        toast.success('포스트 목록을 새로고침했습니다')
    }

    // 모든 포스트 가져오기
    const { data: allPosts, isLoading } = useQuery({
        queryKey: ['posts'],
        queryFn: () => getPosts(),
    })

    // 정책 목록 가져오기 (새 포스트 생성용)
    const { data: policies = [] } = useQuery({
        queryKey: ['policies'],
        queryFn: () => getPolicies({ limit: 100 }),
        enabled: showNewPostModal, // 모달이 열릴 때만 로드
    })

    // 카테고리 목록 생성
    const categories = ['all', ...new Set(allPosts?.map(post => post.category) || [])]

    // 카테고리 필터링
    const posts = selectedCategory === 'all' ? allPosts : allPosts?.filter(post => post.category === selectedCategory)

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <h1 className="text-2xl font-bold mb-4 sm:mb-0">포스트 관리</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleRefreshPosts}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                        <RefreshCw size={20} />새로고침
                    </button>
                    <button
                        onClick={handleNewPost}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={20} />새 포스트
                    </button>
                </div>
            </div>

            {/* Category Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
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
                <div className="mt-2 text-sm text-gray-500">총 {posts?.length || 0}개의 포스트</div>
            </div>

            {/* Posts Table */}
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
                                            <div className="text-sm font-medium text-gray-900">{post.title}</div>
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

            {/* 새 포스트 생성 모달 */}
            {showNewPostModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">새 포스트 생성</h2>
                            <button
                                onClick={() => setShowNewPostModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            <p className="text-gray-600 mb-4">
                                정책을 선택하면 AI가 자동으로 블로그 포스트를 생성합니다.
                            </p>
                            
                            <div className="max-h-60 overflow-y-auto border rounded-lg">
                                {policies.map((policy) => (
                                    <div
                                        key={policy.plcy_no}
                                        className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                                        onClick={() => {
                                            if (createPostMutation.isPending) return
                                            createPostMutation.mutate(policy.plcy_no)
                                        }}
                                    >
                                        <div className="font-medium text-sm">{policy.title}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {policy.category} • {policy.plcy_no}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {createPostMutation.isPending && (
                            <div className="text-center py-4">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="mt-2 text-gray-600">AI가 블로그를 생성하고 있습니다...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 포스트 편집 모달 */}
            {showEditModal && editingPost && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">포스트 편집</h2>
                            <button
                                onClick={() => {
                                    setShowEditModal(false)
                                    setEditingPost(null)
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <EditPostForm 
                            post={editingPost}
                            onSave={(updates) => {
                                updatePostMutation.mutate({ 
                                    plcyNo: editingPost.slug, 
                                    updates 
                                })
                            }}
                            onCancel={() => {
                                setShowEditModal(false)
                                setEditingPost(null)
                            }}
                            isLoading={updatePostMutation.isPending}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

// 포스트 편집 폼 컴포넌트
function EditPostForm({ 
    post, 
    onSave, 
    onCancel,
    isLoading 
}: { 
    post: Post & { category: string }  // 명시적으로 category를 string으로 오버라이드
    onSave: (updates: any) => void
    onCancel: () => void
    isLoading: boolean 
}) {
    const [title, setTitle] = useState(post.title)
    const [summary, setSummary] = useState(post.summary)
    const [content, setContent] = useState(post.content)
    const [category, setCategory] = useState<string>(post.category)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        console.log('🔄 === 수정 폼 제출 시작 ===')
        console.log('📝 현재 값들:')
        console.log('  - title:', title)
        console.log('  - summary:', summary)
        console.log('  - content:', content?.substring(0, 50) + '...')
        console.log('  - category:', category)
        console.log('📝 원본 값들:')
        console.log('  - post.title:', post.title)
        console.log('  - post.summary:', post.summary)
        console.log('  - post.content:', post.content?.substring(0, 50) + '...')
        console.log('  - post.category:', post.category)
        
        // 변경된 필드만 전송 (빈 객체 방지)
        const updates: any = {}
        
        if (title !== post.title) {
            updates.title = title
            console.log('✏️ 제목 변경됨:', post.title, '→', title)
        }
        if (summary !== post.summary) {
            updates.summary = summary
            console.log('✏️ 요약 변경됨:', post.summary, '→', summary)
        }
        if (content !== post.content) {
            updates.content = content
            console.log('✏️ 내용 변경됨')
        }
        if (category !== post.category) {
            updates.category = category
            console.log('✏️ 카테고리 변경됨:', post.category, '→', category)
            console.log('🔍 카테고리 상세 정보:')
            console.log('  - 원본 카테고리 타입:', typeof post.category, '값:', JSON.stringify(post.category))
            console.log('  - 새 카테고리 타입:', typeof category, '값:', JSON.stringify(category))
            console.log('  - 비교 결과:', category === post.category, category !== post.category)
            
            // "교육" 특별 체크
            if (category === '교육' || post.category === '교육') {
                console.log('🎓 교육 카테고리 특별 체크:')
                console.log('  - 새 값이 교육인가?', category === '교육')
                console.log('  - 원본이 교육인가?', post.category === '교육')
                console.log('  - 교육 문자열 길이:', category.length, post.category?.length)
                console.log('  - 교육 문자 코드:', [...category].map(c => c.charCodeAt(0)))
            }
        }
        
        console.log('📝 최종 수정 데이터:', updates)
        
        // 변경사항이 없으면 알림
        if (Object.keys(updates).length === 0) {
            console.log('⚠️ 변경된 내용이 없음')
            alert('변경된 내용이 없습니다.')
            return
        }
        
        console.log('🚀 onSave 호출')
        onSave(updates)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">요약</label>
                <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as string)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="일자리">일자리</option>
                    <option value="주거">주거</option>
                    <option value="복지">복지</option>
                    <option value="교육">교육</option>
                </select>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={isLoading}
                >
                    취소
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    disabled={isLoading}
                >
                    {isLoading ? '저장 중...' : '저장'}
                </button>
            </div>
        </form>
    )
}
