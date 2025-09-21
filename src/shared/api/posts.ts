import { env } from '@/shared/lib/env'

export interface Post {
    id: string
    title: string
    slug: string
    summary: string
    category: string
    thumbnail: string
    author: string
    viewCount: number
    createdAt: string
    content: string
}

export const mockPosts: Post[] = [
    {
        id: '1',
        title: '2024년 청년 주거지원 정책 총정리',
        slug: '2024-youth-housing-support',
        summary: '청년들을 위한 다양한 주거지원 프로그램을 한눈에 확인하세요. LH 청년전세임대부터 월세 지원까지.',
        category: '주거지원',
        thumbnail: 'https://via.placeholder.com/400x300',
        author: '정책관리팀',
        viewCount: 1234,
        createdAt: '2024-01-15T10:00:00Z',
        content: '상세 내용...',
    },
    {
        id: '2',
        title: '신입사원을 위한 취업 준비 지원금 안내',
        slug: 'job-preparation-support',
        summary: '구직 활동에 필요한 비용을 지원받을 수 있는 정부 프로그램을 소개합니다.',
        category: '취업지원',
        thumbnail: 'https://via.placeholder.com/400x300',
        author: '정책관리팀',
        viewCount: 892,
        createdAt: '2024-01-14T09:00:00Z',
        content: '상세 내용...',
    },
    {
        id: '3',
        title: '대학생 학자금 대출 및 장학금 프로그램',
        slug: 'student-loan-scholarship',
        summary: '등록금 부담을 줄일 수 있는 다양한 학자금 지원 제도를 알아보세요.',
        category: '교육지원',
        thumbnail: 'https://via.placeholder.com/400x300',
        author: '정책관리팀',
        viewCount: 2103,
        createdAt: '2024-01-13T14:00:00Z',
        content: '상세 내용...',
    },
]

export const getPosts = async (params?: any): Promise<Post[]> => {
    if (env.ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500))
        return mockPosts
    }

    try {
        const response = await fetch(`${env.API_BASE_URL}/posts`)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('API 호출 실패:', error)
        return mockPosts
    }
}

export const getPost = async (slug: string): Promise<Post | undefined> => {
    if (env.ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 300))
        return mockPosts.find(post => post.slug === slug)
    }

    try {
        const response = await fetch(`${env.API_BASE_URL}/posts/${slug}`)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('API 호출 실패:', error)
        return mockPosts.find(post => post.slug === slug)
    }
}
