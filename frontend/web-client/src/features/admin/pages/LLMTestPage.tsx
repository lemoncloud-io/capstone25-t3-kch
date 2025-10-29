import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Sparkles, Copy, Check, Loader2, RefreshCw, Save, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

import {
    generateTitle,
    generateSummary,
    generateBlogContent,
    generateFullBlog,
    rewriteText,
} from '@/shared/api/llm'
import { getPolicyDetail } from '@/shared/api/policies'
import { createPost } from '@/shared/api'
import { getErrorMessage } from '@/shared/utils'

import type { LLMGenerationRequest } from '@/shared/api/types'

type TabType = 'blog' | 'rewrite'

export const LLMTestPage = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const plcy_no = searchParams.get('plcy_no')
    const [activeTab, setActiveTab] = useState<TabType>('blog')

    const [formData, setFormData] = useState<LLMGenerationRequest>({})
    const [generatedTitle, setGeneratedTitle] = useState('')
    const [generatedSummary, setGeneratedSummary] = useState('')
    const [generatedContent, setGeneratedContent] = useState('')
    const [rewriteInput, setRewriteInput] = useState('')
    const [rewriteTone, setRewriteTone] = useState('youthful')
    const [rewriteOutput, setRewriteOutput] = useState('')
    const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

    // Load policy data if plcy_no is provided
    const { data: policyData } = useQuery({
        queryKey: ['policy', plcy_no],
        queryFn: () => getPolicyDetail(plcy_no!),
        enabled: !!plcy_no,
    })

    useEffect(() => {
        if (policyData) {
            setFormData({
                plcy_no: policyData.plcy_no,
                title: policyData.title || undefined,
                category: policyData.category_auto || policyData.category || undefined,
                region: policyData.region || undefined,
                summary: policyData.summary || undefined,
                blog_json: policyData.blog_json || undefined,
            })
        }
    }, [policyData])

    const titleMutation = useMutation({
        mutationFn: generateTitle,
        onSuccess: data => {
            setGeneratedTitle(data.title)
            toast.success('제목 생성 완료!')
        },
        onError: (error: unknown) => {
            toast.error(`제목 생성 실패: ${getErrorMessage(error)}`)
        },
    })

    const summaryMutation = useMutation({
        mutationFn: generateSummary,
        onSuccess: data => {
            setGeneratedSummary(data.summary)
            toast.success('요약 생성 완료!')
        },
        onError: (error: unknown) => {
            toast.error(`요약 생성 실패: ${getErrorMessage(error)}`)
        },
    })

    const contentMutation = useMutation({
        mutationFn: generateBlogContent,
        onSuccess: data => {
            setGeneratedContent(data.blog_content)
            toast.success('본문 생성 완료!')
        },
        onError: (error: unknown) => {
            toast.error(`본문 생성 실패: ${getErrorMessage(error)}`)
        },
    })

    const fullBlogMutation = useMutation({
        mutationFn: generateFullBlog,
        onSuccess: data => {
            setGeneratedTitle(data.title)
            setGeneratedSummary(data.summary)
            setGeneratedContent(data.blog_content)
            toast.success('전체 블로그 생성 완료!')
        },
        onError: (error: unknown) => {
            toast.error(`전체 블로그 생성 실패: ${getErrorMessage(error)}`)
        },
    })

    const rewriteMutation = useMutation({
        mutationFn: ({ text, tone }: { text: string; tone?: string }) => rewriteText(text, tone),
        onSuccess: data => {
            setRewriteOutput(data.result)
            toast.success('재작성 완료!')
        },
        onError: (error: unknown) => {
            toast.error(`재작성 실패: ${getErrorMessage(error)}`)
        },
    })

    // Save blog post mutation
    const savePostMutation = useMutation({
        mutationFn: createPost,
        onSuccess: () => {
            toast.success('블로그 포스트가 저장되었습니다!')
            navigate('/admin/posts')
        },
        onError: (error: unknown) => {
            toast.error(`저장 실패: ${getErrorMessage(error)}`)
        },
    })

    const handleBack = () => {
        navigate('/admin/policies')
    }

    const copyToClipboard = async (text: string, key: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedStates(prev => ({ ...prev, [key]: true }))
            toast.success('클립보드에 복사되었습니다')
            setTimeout(() => {
                setCopiedStates(prev => ({ ...prev, [key]: false }))
            }, 2000)
        } catch (error) {
            toast.error('복사 실패')
        }
    }

    const isAnyLoading =
        titleMutation.isPending ||
        summaryMutation.isPending ||
        contentMutation.isPending ||
        fullBlogMutation.isPending ||
        rewriteMutation.isPending ||
        savePostMutation.isPending

    // Check if blog content is complete
    const isBlogComplete = generatedTitle && generatedSummary && generatedContent

    const handleSaveBlog = () => {
        if (!isBlogComplete) {
            toast.error('제목, 요약, 본문을 모두 생성해주세요')
            return
        }

        savePostMutation.mutate({
            title: generatedTitle,
            summary: generatedSummary,
            content: generatedContent,
            category: formData.category || '기타',
            plcyNo: formData.plcy_no,
        })
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                >
                    <ArrowLeft size={20} />
                    정책 관리로 돌아가기
                </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">LLM 콘텐츠 생성기</h1>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('blog')}
                            className={`flex items-center gap-2 px-6 py-4 font-semibold transition border-b-2 ${
                                activeTab === 'blog'
                                    ? 'border-purple-600 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Sparkles size={20} />
                            블로그 생성
                        </button>
                        <button
                            onClick={() => setActiveTab('rewrite')}
                            className={`flex items-center gap-2 px-6 py-4 font-semibold transition border-b-2 ${
                                activeTab === 'rewrite'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <RefreshCw size={20} />
                            텍스트 재작성
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'blog' && (
                        <div className="space-y-6">
                            {/* Policy Info Banner */}
                            {policyData && (
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1">
                                            <p className="font-semibold text-blue-900">{policyData.title}</p>
                                            <p className="text-sm text-blue-700 mt-1">
                                                정책번호: {policyData.plcy_no} | 지역: {policyData.region || '-'} |
                                                카테고리: {policyData.category_auto || policyData.category || '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                {/* Left Column - Input Form */}
                                <div className="xl:col-span-1 space-y-6">
                                    {/* Input Data Card */}
                                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                                        <h3 className="font-bold text-gray-900 mb-4">입력 데이터</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    정책번호
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.plcy_no || ''}
                                                    onChange={e =>
                                                        setFormData({ ...formData, plcy_no: e.target.value })
                                                    }
                                                    placeholder="선택사항"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    정책명
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.title || ''}
                                                    onChange={e =>
                                                        setFormData({ ...formData, title: e.target.value })
                                                    }
                                                    placeholder="선택사항"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        지역
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.region || ''}
                                                        onChange={e =>
                                                            setFormData({ ...formData, region: e.target.value })
                                                        }
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        카테고리
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.category || ''}
                                                        onChange={e =>
                                                            setFormData({ ...formData, category: e.target.value })
                                                        }
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    정책 요약
                                                </label>
                                                <textarea
                                                    value={formData.summary || ''}
                                                    onChange={e =>
                                                        setFormData({ ...formData, summary: e.target.value })
                                                    }
                                                    rows={4}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Generation Buttons */}
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => fullBlogMutation.mutate(formData)}
                                            disabled={isAnyLoading}
                                            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold flex items-center justify-center gap-2"
                                        >
                                            {fullBlogMutation.isPending && <Loader2 className="animate-spin" size={18} />}
                                            <Sparkles size={18} />
                                            전체 블로그 생성
                                        </button>

                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                onClick={() => titleMutation.mutate(formData)}
                                                disabled={isAnyLoading}
                                                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium flex items-center justify-center gap-1"
                                            >
                                                {titleMutation.isPending && <Loader2 className="animate-spin" size={14} />}
                                                제목
                                            </button>
                                            <button
                                                onClick={() => summaryMutation.mutate(formData)}
                                                disabled={isAnyLoading}
                                                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium flex items-center justify-center gap-1"
                                            >
                                                {summaryMutation.isPending && <Loader2 className="animate-spin" size={14} />}
                                                요약
                                            </button>
                                            <button
                                                onClick={() => contentMutation.mutate(formData)}
                                                disabled={isAnyLoading}
                                                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium flex items-center justify-center gap-1"
                                            >
                                                {contentMutation.isPending && <Loader2 className="animate-spin" size={14} />}
                                                본문
                                            </button>
                                        </div>

                                        {/* Save Button */}
                                        <button
                                            onClick={handleSaveBlog}
                                            disabled={!isBlogComplete || isAnyLoading}
                                            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold flex items-center justify-center gap-2"
                                        >
                                            {savePostMutation.isPending && <Loader2 className="animate-spin" size={18} />}
                                            <Save size={18} />
                                            블로그 저장 (미발행)
                                        </button>
                                    </div>
                                </div>

                                {/* Right Column - Output Results */}
                                <div className="xl:col-span-2 space-y-6">
                                    {generatedTitle || generatedSummary || generatedContent ? (
                                        <>
                                            {generatedTitle && (
                                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                    <div className="bg-blue-50 px-6 py-3 border-b border-blue-200 flex items-center justify-between">
                                                        <h4 className="font-semibold text-blue-900 text-sm">생성된 제목</h4>
                                                        <button
                                                            onClick={() => copyToClipboard(generatedTitle, 'title')}
                                                            className="text-blue-600 hover:text-blue-800 transition"
                                                        >
                                                            {copiedStates['title'] ? <Check size={16} /> : <Copy size={16} />}
                                                        </button>
                                                    </div>
                                                    <div className="p-6">
                                                        <p className="text-lg font-semibold text-gray-900">{generatedTitle}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {generatedSummary && (
                                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                    <div className="bg-green-50 px-6 py-3 border-b border-green-200 flex items-center justify-between">
                                                        <h4 className="font-semibold text-green-900 text-sm">생성된 요약</h4>
                                                        <button
                                                            onClick={() => copyToClipboard(generatedSummary, 'summary')}
                                                            className="text-green-600 hover:text-green-800 transition"
                                                        >
                                                            {copiedStates['summary'] ? <Check size={16} /> : <Copy size={16} />}
                                                        </button>
                                                    </div>
                                                    <div className="p-6">
                                                        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{generatedSummary}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {generatedContent && (
                                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                    <div className="bg-purple-50 px-6 py-3 border-b border-purple-200 flex items-center justify-between">
                                                        <h4 className="font-semibold text-purple-900 text-sm">생성된 본문</h4>
                                                        <button
                                                            onClick={() => copyToClipboard(generatedContent, 'content')}
                                                            className="text-purple-600 hover:text-purple-800 transition"
                                                        >
                                                            {copiedStates['content'] ? <Check size={16} /> : <Copy size={16} />}
                                                        </button>
                                                    </div>
                                                    <div className="p-6">
                                                        <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans leading-relaxed">
{generatedContent}
                                                        </pre>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-16 text-center">
                                            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                                                <Sparkles className="text-purple-600" size={32} />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">결과 대기 중</h3>
                                            <p className="text-gray-500 text-sm">
                                                왼쪽의 생성 버튼을 클릭하면 AI가 콘텐츠를 생성합니다
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'rewrite' && (
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <RefreshCw size={20} />
                                    텍스트 재작성
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            원본 텍스트
                                        </label>
                                        <textarea
                                            value={rewriteInput}
                                            onChange={e => setRewriteInput(e.target.value)}
                                            placeholder="재작성할 텍스트를 입력하세요..."
                                            rows={6}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                톤 선택
                                            </label>
                                            <select
                                                value={rewriteTone}
                                                onChange={e => setRewriteTone(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            >
                                                <option value="youthful">청년 친화적</option>
                                                <option value="formal">공식적</option>
                                                <option value="casual">캐주얼</option>
                                            </select>
                                        </div>
                                        <div className="pt-7">
                                            <button
                                                onClick={() => rewriteMutation.mutate({ text: rewriteInput, tone: rewriteTone })}
                                                disabled={!rewriteInput || isAnyLoading}
                                                className="px-8 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold flex items-center gap-2"
                                            >
                                                {rewriteMutation.isPending && <Loader2 className="animate-spin" size={18} />}
                                                재작성
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {rewriteOutput && (
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-200 flex items-center justify-between">
                                        <h4 className="font-semibold text-indigo-900 text-sm">재작성 결과</h4>
                                        <button
                                            onClick={() => copyToClipboard(rewriteOutput, 'rewrite')}
                                            className="text-indigo-600 hover:text-indigo-800 transition"
                                        >
                                            {copiedStates['rewrite'] ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{rewriteOutput}</p>
                                    </div>
                                </div>
                            )}

                            {!rewriteOutput && (
                                <div className="bg-gray-50 rounded-lg border border-gray-200 p-16 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                                        <RefreshCw className="text-indigo-600" size={32} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">결과 대기 중</h3>
                                    <p className="text-gray-500 text-sm">
                                        텍스트를 입력하고 재작성 버튼을 클릭하세요
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
