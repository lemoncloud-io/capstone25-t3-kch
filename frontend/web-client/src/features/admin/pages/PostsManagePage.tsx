import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit, Trash2, Eye, Plus, RefreshCw, X, Search } from 'lucide-react'
import { getPosts, getPost, createBlogPost, deleteBlogPost, updateBlogPost, type Post } from '../../../shared/api/posts'
import { getPolicies, type PolicyCleanOut } from '../../../shared/api/policies'
import { toast } from 'sonner'

export default function PostsManagePage() {
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [showNewPostModal, setShowNewPostModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingPost, setEditingPost] = useState<Post | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const queryClient = useQueryClient()
    
    // 개발 환경에서만 디버깅 헬퍼 함수 제공
    React.useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
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
        }
    }, [queryClient])

    const handleNewPost = () => {
        setShowNewPostModal(true)
    }

    const handleViewPost = (post: Post) => {
        const baseUrl = window.location.origin
        window.open(`${baseUrl}/posts/${post.slug}`, '_blank')
    }

    // 새 포스트 생성
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

    const updatePostMutation = useMutation({
        mutationFn: ({ plcyNo, updates }: { plcyNo: string, updates: any }) => 
            updateBlogPost(plcyNo, updates),
        onSuccess: () => {
            // 모든 관련 쿼리 캐시 무효화
            queryClient.invalidateQueries({ queryKey: ['posts'] })
            queryClient.invalidateQueries({ queryKey: ['post'] })
            queryClient.invalidateQueries({ queryKey: ['blogs'] })
            
            toast.success('포스트가 수정되었습니다!')
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
            setEditingPost(fullPost)
            setShowEditModal(true)
        } catch (error) {
            console.error('포스트 상세 정보 가져오기 실패:', error)
            toast.error('포스트 정보를 가져올 수 없습니다.')
        }
    }

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

    const handleDeletePost = (post: Post) => {
        if (confirm(`"${post.title}" 포스트를 삭제하시겠습니까?`)) {
            deletePostMutation.mutate(post.slug)
        }
    }

    // 포스트 목록 가져오기
    const { data: allPosts = [], isLoading, refetch } = useQuery({
        queryKey: ['posts'],
        queryFn: () => getPosts(), // 전체 게시글 가져오기 (limit 없음)
    })

    // 정책 목록 가져오기 (새 포스트 생성용)
    const { data: policies = [] } = useQuery({
        queryKey: ['policies'],
        queryFn: () => getPolicies({ limit: 100 }),
        enabled: showNewPostModal, // 모달이 열릴 때만 로드
    })

    // 카테고리 목록 생성
    const categories = ['all', ...new Set(allPosts?.map(post => post.category) || [])]

    // 검색 및 필터링된 포스트 (문자열 기반, 본문 검색 포함, 띄어쓰기 무시)
    const filteredPosts = useMemo(() => {
        // 카테고리 필터링
        let filtered = allPosts.filter(post => 
            selectedCategory === 'all' || post.category === selectedCategory
        )

        // 검색어가 있으면 문자열 기반 검색 (본문 포함, 띄어쓰기 무시)
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase()
            const normalizedQuery = lowerQuery.replace(/\s+/g, '') // 공백 제거
            
            // 검색 헬퍼 함수: 띄어쓰기 무시하고 검색
            const matches = (text: string, searchQuery: string, normalizedQuery: string): boolean => {
                const lowerText = text.toLowerCase()
                if (lowerText.includes(searchQuery)) return true
                const normalizedText = lowerText.replace(/\s+/g, '')
                if (normalizedText.includes(normalizedQuery)) return true
                return false
            }
            
            filtered = filtered.filter(post => {
                const titleMatch = matches(post.title, lowerQuery, normalizedQuery)
                const summaryMatch = matches(post.summary || '', lowerQuery, normalizedQuery)
                const contentMatch = matches(post.content || '', lowerQuery, normalizedQuery)
                const categoryMatch = matches(post.category || '', lowerQuery, normalizedQuery)
                
                return titleMatch || summaryMatch || contentMatch || categoryMatch
            })
        }

        return filtered
    }, [allPosts, selectedCategory, searchQuery])

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">포스트 관리</h1>
                    <p className="text-gray-600 mt-1">블로그 포스트를 관리하고 편집할 수 있습니다.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => refetch()}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <RefreshCw size={16} />
                        새로고침
                    </button>
                    <button
                        onClick={handleNewPost}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={16} />
                        새 포스트
                    </button>
                </div>
            </div>

            {/* 검색 및 필터 */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    {/* 검색창 */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="제목, 요약, 카테고리로 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* 카테고리 필터 */}
                    <div className="flex gap-2 flex-wrap">
                        {(categories as string[]).map((category: string) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
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
                
                {/* 검색 결과 정보 */}
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <div>
                        {searchQuery && (
                            <span>
                                "<strong>{searchQuery}</strong>" 검색 결과: <strong>{filteredPosts.length}</strong>개
                            </span>
                        )}
                        {!searchQuery && (
                            <span>총 <strong>{filteredPosts.length}</strong>개의 포스트</span>
                        )}
                    </div>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            검색 초기화
                        </button>
                    )}
                </div>
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
                ) : filteredPosts.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            {searchQuery ? (
                                <>
                                    <Search size={48} className="mx-auto mb-4" />
                                    <p className="text-lg font-medium">검색 결과가 없습니다</p>
                                    <p className="text-sm">다른 키워드로 검색해보세요</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-lg font-medium">포스트가 없습니다</p>
                                    <p className="text-sm">새 포스트를 생성해보세요</p>
                                </>
                            )}
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
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPosts.map((post) => (
                                    <tr key={post.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 w-12">
                                                    {post.thumbnail ? (
                                                        <img
                                                            className="h-12 w-12 rounded-lg object-cover"
                                                            src={post.thumbnail}
                                                            alt={post.title}
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                                            <span className="text-gray-400 text-xs">No Image</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                                        {post.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500 line-clamp-1 mt-1">
                                                        {post.summary}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {post.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {post.viewCount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleViewPost(post)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="미리보기"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEditPost(post)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="편집"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePost(post)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="삭제"
                                                >
                                                    <Trash2 size={16} />
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
                    <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
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
        
        // 변경된 필드만 전송 (빈 객체 방지)
        const updates: any = {}
        
        if (title !== post.title) {
            updates.title = title
        }
        if (summary !== post.summary) {
            updates.summary = summary
        }
        if (content !== post.content) {
            updates.content = content
        }
        if (category !== post.category) {
            updates.category = category
        }
        
        // 변경사항이 없으면 알림
        if (Object.keys(updates).length === 0) {
            toast.error('변경된 내용이 없습니다.')
            return
        }
        
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
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
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