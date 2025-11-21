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
        category: '주거',
        thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 1234,
        createdAt: '2025-11-06T10:00:00Z',
        content: '청년층의 주거 안정을 위해 정부에서 다양한 지원 정책을 시행하고 있습니다...',
    },
    {
        id: '2',
        title: '신입사원을 위한 취업 준비 지원금 안내',
        slug: 'job-preparation-support',
        summary: '구직 활동에 필요한 비용을 지원받을 수 있는 정부 프로그램을 소개합니다.',
        category: '일자리',
        thumbnail: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 892,
        createdAt: '2025-11-05T09:00:00Z',
        content: '취업을 준비하는 청년들을 위한 다양한 정부 지원금 프로그램을 소개합니다...',
    },
    {
        id: '3',
        title: '대학생 학자금 대출 및 장학금 프로그램',
        slug: 'student-loan-scholarship',
        summary: '등록금 부담을 줄일 수 있는 다양한 학자금 지원 제도를 알아보세요.',
        category: '교육',
        thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 2103,
        createdAt: '2025-11-04T14:00:00Z',
        content: '대학 등록금 부담을 덜어주는 다양한 학자금 지원 제도를 정리했습니다...',
    },
    {
        id: '4',
        title: '청년 창업 지원금 및 멘토링 프로그램',
        slug: 'youth-startup-support-2024',
        summary: '청년 창업을 위한 정부 지원금과 전문가 멘토링을 함께 받을 수 있습니다.',
        category: '일자리',
        thumbnail: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 1567,
        createdAt: '2025-11-03T09:00:00Z',
        content: '청년 창업을 꿈꾸는 분들을 위한 정부 지원 프로그램입니다...',
    },
    {
        id: '5',
        title: '대학생 생활비 및 교통비 지원',
        slug: 'student-living-cost-support',
        summary: '대학생들의 경제적 부담을 덜어주는 생활비와 교통비 지원 제도입니다.',
        category: '복지',
        thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 892,
        createdAt: '2025-11-02T15:00:00Z',
        content: '경제적 어려움을 겪는 대학생들을 위한 지원 프로그램입니다...',
    },
]

export const getPosts = async (params?: { category?: string }): Promise<Post[]> => {
    // Mock API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (params?.category) {
        return mockPosts.filter(post => post.category === params.category)
    }
    
    return mockPosts
}

export const getPost = async (slug: string): Promise<Post | undefined> => {
    // Mock API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockPosts.find(post => post.slug === slug)
}
