import { env } from '@/shared/lib/env'

export interface PostMeta {
  title: string
  description: string
  keywords: string[]
  thumbnail_img?: string
  robots?: string
}

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
    meta?: PostMeta
}

export const mockPosts: Post[] = [
    {
        id: '1',
        title: '2024년 청년 주거지원 정책 총정리',
        slug: '2024-youth-housing-support',
        summary: '청년들을 위한 다양한 주거지원 프로그램을 한눈에 확인하세요. LH 청년전세임대부터 월세 지원까지.',
        category: '주거지원',
        thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 1234,
        createdAt: '2024-01-15T10:00:00Z',
        content: `# 2024년 청년 주거지원 정책 총정리

청년층의 주거 안정을 위해 정부에서 다양한 지원 정책을 시행하고 있습니다. 이번 포스트에서는 2024년 시행되는 주요 청년 주거지원 정책들을 정리해드리겠습니다.

## 주요 지원 프로그램

### 1. LH 청년전세임대주택
- **지원 대상**: 만 19세~39세 무주택 청년
- **지원 내용**: 전세자금 지원 및 저렴한 임대료
- **신청 방법**: LH 청약센터 온라인 신청

### 2. 청년 월세 지원
- **지원 대상**: 만 19세~34세 청년 1인 가구
- **지원 내용**: 월 최대 20만원 지원 (12개월)
- **소득 기준**: 중위소득 60% 이하

### 3. 청년 우대형 청약통장
- **가입 대상**: 만 19세~34세 무주택 청년
- **우대 혜택**: 높은 이자율 및 청약 가점 추가
- **신청 처**: 은행 영업점 또는 인터넷뱅킹

## 신청 시 필요 서류

1. **신분증** (주민등록증 또는 운전면허증)
2. **주민등록등본** (3개월 이내 발급)
3. **소득증명서류** (근로소득원천징수영수증, 소득금액증명원 등)
4. **재학증명서** (학생의 경우)

## 신청 절차

1. **온라인 사전신청** → 해당 기관 홈페이지
2. **서류 제출** → 방문 또는 우편 접수
3. **자격 심사** → 소득 및 자산 조사
4. **결과 통지** → SMS 또는 이메일 발송

더 자세한 정보는 각 지자체 홈페이지나 청년정책 통합 플랫폼에서 확인하실 수 있습니다.`,
    },
    {
        id: '2',
        title: '신입사원을 위한 취업 준비 지원금 안내',
        slug: 'job-preparation-support',
        summary: '구직 활동에 필요한 비용을 지원받을 수 있는 정부 프로그램을 소개합니다.',
        category: '주거지원',
        thumbnail: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 892,
        createdAt: '2024-01-14T09:00:00Z',
        content: `# 신입사원을 위한 취업 준비 지원금 안내

취업을 준비하는 청년들을 위한 다양한 정부 지원금 프로그램을 소개합니다. 취업 활동에 필요한 경제적 부담을 덜어드리고자 합니다.

## 국민취업지원제도

### 1유형 (구직촉진수당)
- **지원 대상**: 15~69세 저소득 구직자
- **지원 내용**: 월 50만원 × 6개월 (최대 300만원)
- **추가 혜택**: 취업활동비용, 직업훈련 참여 지원

### 2유형 (취업활동비용)
- **지원 대상**: 청년, 중장년 등 취업취약계층
- **지원 내용**: 취업활동비용 최대 954,000원
- **활동 내용**: 직업상담, 직업훈련, 일경험 프로그램 참여

## 지역별 청년 취업지원금

### 서울시 청년수당
- **대상**: 만 18~34세 미취업 청년
- **지원**: 월 50만원 × 6개월
- **조건**: 취업활동 계획서 작성 및 이행

### 경기도 청년기본소득
- **대상**: 만 24세 경기도 거주 청년
- **지원**: 분기별 25만원 × 4회 (연 100만원)
- **신청**: 온라인 신청 후 카드 발급

## 신청 방법 및 절차

1. **워크넷 회원가입** 및 구직등록
2. **국민취업지원제도 신청** (온라인 또는 방문)
3. **취업활동계획 수립** 및 상담사와 면담
4. **프로그램 참여** 및 구직활동 실시

취업준비는 혼자 하기 어려운 일입니다. 정부의 다양한 지원제도를 적극 활용하여 성공적인 취업을 이루시기 바랍니다.`,
    },
    {
        id: '3',
        title: '대학생 학자금 대출 및 장학금 프로그램',
        slug: 'student-loan-scholarship',
        summary: '등록금 부담을 줄일 수 있는 다양한 학자금 지원 제도를 알아보세요.',
        category: '교육지원',
        thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 2103,
        createdAt: '2024-01-13T14:00:00Z',
        content: `# 대학생 학자금 대출 및 장학금 프로그램

대학 등록금 부담을 덜어주는 다양한 학자금 지원 제도를 정리했습니다. 경제적 어려움 없이 학업에 집중할 수 있도록 도와드리겠습니다.

## 한국장학재단 학자금 대출

### 든든학자금 대출 (취업 후 상환)
- **대상**: 소득 8분위 이하 대학생
- **금리**: 1.7% (2024년 기준)
- **상환**: 졸업 후 소득 발생 시 상환 시작

### 일반상환 학자금대출
- **대상**: 소득 10분위 이하 대학생
- **금리**: 1.7% (2024년 기준)
- **상환**: 거치기간 후 원리금 균등상환

## 국가장학금 프로그램

### 국가장학금 I유형 (학생직접지원형)
- **소득연계**: 소득분위별 차등 지원
- **지원금액**: 연 최대 700만원 (기초~3분위)
- **성적기준**: 직전학기 12학점 이상, 80점 이상

### 국가장학금 II유형 (대학연계지원형)
- **특징**: 대학의 자체 노력과 연계
- **지원방식**: 대학별 자율적 기준 적용
- **추가혜택**: 대학별 장학금과 중복 가능

## 지방인재 장학금

### 지역인재장학금
- **대상**: 지역대학 우수학생 및 지역출신 수도권대학 입학생
- **지원**: 등록금 전액 + 생활비 일부
- **의무**: 졸업 후 지역 의무복무 (지역별 상이)

## 신청 및 관리

### 온라인 신청
- **한국장학재단 홈페이지** (kosaf.go.kr)
- **신청기간**: 학기별 지정 기간 내
- **필요서류**: 가족관계증명서, 소득증빙서류 등

### 학사관리
- **성적관리**: 직전학기 C학점(80점) 이상 유지
- **학점관리**: 학기당 12학점 이상 이수
- **경고제도**: 미충족 시 차등 지원 또는 지원 중단

학자금 지원을 통해 경제적 부담 없이 학업에 전념하시고, 밝은 미래를 준비하시기 바랍니다.`,
    },
]

export const getPosts = async (params?: { category?: string }): Promise<Post[]> => {
    if (env.ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500))
        // category 필터링
        if (params?.category) {
            return mockPosts.filter(post => post.category === params.category)
        }

        return mockPosts
    }

    // TODO: implement below
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

// LLM 콘텐츠 생성 API 함수들
export const generatePolicyContent = async (
    plcyNo: string, 
    type: 'title' | 'summary' | 'blog' | 'full'
) => {
    try {
        const response = await fetch(`${env.API_BASE_URL}/policies/${plcyNo}/content?type=${type}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        return await response.json()
    } catch (error) {
        console.error('콘텐츠 생성 API 호출 실패:', error)
        throw error
    }
}

export const getPost = async (slug: string): Promise<Post | undefined> => {
    if (env.ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 300))
        return mockPosts.find(post => post.slug === slug)
    }

    // TODO: implement below
    try {
        const response = await fetch(`${env.API_BASE_URL}/posts/${slug}`)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        return {
        ...data,
        meta: data.meta ?? undefined,
        } as Post // meta 보존해서 반환
    } catch (error) {
        console.error('API 호출 실패:', error)
        return mockPosts.find(post => post.slug === slug)
    }
}
