import { env } from '../lib/env'

const S3_PUBLIC_BASE =
  env.S3_PUBLIC_BASE ??
  'https://youth-policy-thumbnails-kch.s3.ap-northeast-2.amazonaws.com/'

export const CATEGORY_LABELS = ['일자리', '주거', '복지', '교육'] as const
export type CategoryLabel = (typeof CATEGORY_LABELS)[number]
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
    category: string  // CategoryLabel에서 string으로 변경
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
        category: '주거',
        thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 1234,
        createdAt: '2025-11-06T10:00:00Z',
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
        category: '일자리',
        thumbnail: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 892,
        createdAt: '2025-11-05T09:00:00Z',
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
        category: '교육',
        thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 2103,
        createdAt: '2025-11-04T14:00:00Z',
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
        content: `# 청년 창업 지원금 안내

청년 창업을 꿈꾸는 분들을 위한 정부 지원 프로그램입니다.

## 지원 내용
- 창업 자금: 최대 5,000만원
- 전문가 멘토링: 6개월간 무료
- 사무공간 제공: 1년간 무상 임대

## 신청 자격
- 만 18세~39세 예비 창업자
- 사업계획서 제출 가능자

더 자세한 정보는 K-Startup 홈페이지에서 확인하세요.`,
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
        content: `# 대학생 생활비 지원

경제적 어려움을 겪는 대학생들을 위한 지원 프로그램입니다.

## 지원 대상
- 소득 4분위 이하 대학생
- 만 18세~24세

## 지원 금액
- 생활비: 월 30만원
- 교통비: 월 10만원

학업에 집중할 수 있도록 도와드립니다.`,
    },
    {
        id: '6',
        title: '청년 문화생활 할인 및 무료 이용권',
        slug: 'youth-culture-discount',
        summary: '영화, 공연, 전시회 등 다양한 문화생활을 저렴하게 즐길 수 있는 혜택을 제공합니다.',
        category: '복지',
        thumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 756,
        createdAt: '2025-11-01T11:30:00Z',
        content: `# 청년 문화생활 지원

문화생활을 즐기고 싶은 청년들을 위한 할인 혜택입니다.

## 혜택 내용
- 영화 관람: 50% 할인
- 공연/전시: 30% 할인
- 도서 구입: 20% 할인

## 이용 방법
청년문화패스 앱을 다운로드하여 가입 후 이용하세요.`,
    },
    {
        id: '7',
        title: '지방 청년 일자리 정착 지원금',
        slug: 'regional-youth-job-settlement',
        summary: '지방에서 일자리를 찾는 청년들에게 정착 지원금과 주거 보조를 제공합니다.',
        category: '일자리',
        thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 1345,
        createdAt: '2025-10-31T14:20:00Z',
        content: `# 지방 청년 일자리 정착 지원

지역 균형 발전을 위한 청년 일자리 정책입니다.

## 지원 내용
- 정착 지원금: 월 50만원 (최대 12개월)
- 주거비 보조: 월 20만원
- 이사 비용: 일시금 100만원

지방에서 새로운 시작을 응원합니다!`,
    },
    {
        id: '8',
        title: '청년 직업훈련 무료 수강 지원',
        slug: 'youth-vocational-training',
        summary: 'IT, 디자인, 마케팅 등 실무 중심 직업훈련을 무료로 수강할 수 있습니다.',
        category: '교육',
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 2234,
        createdAt: '2025-10-30T10:00:00Z',
        content: `# 청년 직업훈련 프로그램

취업에 필요한 실무 능력을 키워드립니다.

## 훈련 과정
- 웹 개발 (6개월)
- UI/UX 디자인 (4개월)
- 디지털 마케팅 (3개월)

## 혜택
- 수강료 전액 무료
- 훈련장려금 월 30만원
- 취업 연계 지원

내일배움카드로 신청하세요.`,
    },
    {
        id: '9',
        title: '청년 건강검진 무료 지원 사업',
        slug: 'youth-health-checkup',
        summary: '만 19세~34세 청년을 대상으로 종합 건강검진을 무료로 제공합니다.',
        category: '복지',
        thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 678,
        createdAt: '2025-10-29T16:45:00Z',
        content: `# 청년 건강검진 지원

청년들의 건강한 삶을 위한 무료 검진 프로그램입니다.

## 검진 항목
- 기본 건강검진
- 암 검진 (필요시)
- 구강 검진
- 정신건강 상담

## 신청 방법
국민건강보험공단 홈페이지에서 온라인 신청하세요.`,
    },
    {
        id: '10',
        title: '청년 해외 인턴십 및 어학연수 지원',
        slug: 'youth-overseas-internship',
        summary: '해외 취업과 글로벌 역량 강화를 위한 인턴십 및 어학연수 비용을 지원합니다.',
        category: '교육',
        thumbnail: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 1890,
        createdAt: '2025-10-28T13:20:00Z',
        content: `# 청년 해외 인턴십 프로그램

글로벌 인재로 성장할 수 있는 기회를 제공합니다.

## 지원 내용
- 항공료: 왕복 100% 지원
- 체류비: 월 150만원
- 어학연수비: 최대 300만원

## 선발 인원
연간 500명 선발

## 지원 자격
- 만 18세~34세
- 영어/제2외국어 가능자

K-Move 스쿨을 통해 신청하세요.`,
    },
    {
        id: '11',
        title: '청년 월세 특별지원 확대 안내',
        slug: 'youth-rent-support-extended',
        summary: '월세 지원 한도 상향 및 대상 확대 내용을 정리했습니다.',
        category: '주거',
        thumbnail: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 1120,
        createdAt: '2025-10-27T10:00:00Z',
        content: '# 청년 월세 특별지원 확대',
    },
    {
        id: '12',
        title: '취업준비생 면접 정장 대여 지원',
        slug: 'interview-suit-support',
        summary: '면접 정장 무료/할인 대여 서비스를 지역별로 정리했습니다.',
        category: '일자리',
        thumbnail: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 980,
        createdAt: '2025-10-26T09:30:00Z',
        content: '# 면접 정장 대여 지원',
    },
    {
        id: '13',
        title: '청년 마음건강 바우처',
        slug: 'youth-mental-health-voucher',
        summary: '심리상담 지원 바우처의 신청 방법과 금액을 소개합니다.',
        category: '복지',
        thumbnail: 'https://images.unsplash.com/photo-1516302350523-c6f95f7e122b?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 1512,
        createdAt: '2025-10-25T14:00:00Z',
        content: '# 마음건강 바우처',
    },
    {
        id: '14',
        title: '지역 인재 채용 연계형 훈련',
        slug: 'regional-hire-training',
        summary: '지자체와 기업이 함께하는 채용 연계 훈련 프로그램 안내.',
        category: '일자리',
        thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 1320,
        createdAt: '2025-10-24T09:10:00Z',
        content: '# 지역 인재 채용 연계',
    },
    {
        id: '15',
        title: '저소득층 장학금 한눈에 보기',
        slug: 'low-income-scholarship-guide',
        summary: '지자체/민간 장학금 정보를 통합해 비교했습니다.',
        category: '교육',
        thumbnail: 'https://images.unsplash.com/photo-1460518451285-97b6aa326961?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 2044,
        createdAt: '2025-10-23T12:00:00Z',
        content: '# 장학금 가이드',
    },
    {
        id: '16',
        title: '청년 창업 공간 무상 제공 리스트',
        slug: 'startup-space-list',
        summary: '메이커스페이스, 공유오피스 등 창업 공간 지원을 모았습니다.',
        category: '일자리',
        thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 1677,
        createdAt: '2025-10-22T09:00:00Z',
        content: '# 창업 공간 리스트',
    },
    {
        id: '17',
        title: '청년 문화누리카드 사용처 모음',
        slug: 'culture-card-usage',
        summary: '영화관, 공연장, 전시관 등 주요 사용처를 정리했습니다.',
        category: '복지',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 845,
        createdAt: '2025-10-21T16:45:00Z',
        content: '# 문화누리카드 사용처',
    },
    {
        id: '18',
        title: '지방 청년 주거 이전 지원금',
        slug: 'youth-relocation-housing',
        summary: '지방 정착을 위한 이사비/보증금 지원 제도를 소개합니다.',
        category: '주거',
        thumbnail: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 1233,
        createdAt: '2025-10-20T09:30:00Z',
        content: '# 지방 주거 이전 지원',
    },
    {
        id: '19',
        title: '대학생 교환학생 장학 프로그램',
        slug: 'exchange-student-scholarship',
        summary: '교환학생 참가자 대상 장학금/항공권 지원 정보를 제공합니다.',
        category: '교육',
        thumbnail: 'https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 1755,
        createdAt: '2025-10-19T13:00:00Z',
        content: '# 교환학생 장학',
    },
    {
        id: '20',
        title: '사회초년생 필수 금융교육',
        slug: 'financial-education-for-youth',
        summary: '신용관리, 대출, 카드 사용 등 필수 금융 지식을 모았습니다.',
        category: '복지',
        thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop&crop=center',
        author: '정책관리팀',
        viewCount: 990,
        createdAt: '2025-10-18T09:00:00Z',
        content: '# 금융교육 가이드',
    },
]

// ============ 헬퍼 함수들 ============

/** 
 * 백엔드 row의 thumbnail_url 또는 thumbnail_key로 최종 이미지 URL 생성
 * @param b - 백엔드 응답 객체
 * @returns 완성된 URL 또는 빈 문자열
 */
function resolveThumbnail(b: any): string {
  if (b?.thumbnail_url) return b.thumbnail_url;             // 기존 저장된 절대 URL
  if (b?.thumbnail_key) return `${S3_PUBLIC_BASE}/${b.thumbnail_key}`; // 새로 쌓인 key
  return "";
}

const CATEGORY_KEYWORDS: Record<CategoryLabel, string[]> = {
  일자리: ['일자리', '취업', '채용', '고용', '근로', '직무', '직업', '창업', '인턴', '도제', '근속', '훈련', '구직', '일경험'],
  주거: ['주거', '전세', '월세', '보증금', '임대', '이사', '주택', '청약', '전월세', '공공임대'],
  복지: ['복지', '건강', '상담', '문화', '생활', '생활비', '교통비', '의료', '검진', '정신', '바우처', '참여', '권리', '여가', '돌봄', '치료', '바우쳐'],
  교육: ['교육', '장학', '자격', '대학', '연수', '교환학생', '어학', '학자금', '스쿨', '훈련', '학습', '캠프', '멘토', '강좌', '강의'],
}

const CATEGORY_KEYWORDS_EN: Record<CategoryLabel, string[]> = {
  일자리: ['job', 'employment', 'work', 'career', 'startup', 'entrepreneur', 'labor'],
  주거: ['housing', 'rent', 'lease', 'residence', 'home'],
  복지: ['welfare', 'health', 'culture', 'life', 'benefit', 'support'],
  교육: ['education', 'scholar', 'training', 'study', 'learning', 'academy', 'school'],
}

/** 
 * 카테고리를 네 가지 표준 라벨(일자리/주거/복지/교육)로 정규화
 * @param raw - 백엔드에서 온 카테고리명
 * @returns 정규화된 카테고리명
 */
function normCategory(raw?: string): CategoryLabel {
  const original = (raw ?? '').trim();
  if (CATEGORY_LABELS.includes(original as CategoryLabel)) {
    return original as CategoryLabel;
  }

  const lower = original.toLowerCase();

  for (const label of CATEGORY_LABELS) {
    const keywords = CATEGORY_KEYWORDS[label];
    if (keywords.some((kw) => kw && lower.includes(kw))) {
      return label;
    }
    const enKeywords = CATEGORY_KEYWORDS_EN[label];
    if (enKeywords.some((kw) => kw && lower.includes(kw))) {
      return label;
    }
  }

  // 기본값: 교육
  return '교육';
}

// ============ API 함수들 ============

export const getPosts = async (params?: { category?: string; limit?: number }): Promise<Post[]> => {
    console.log('🔍 getPosts 호출됨:', { 
        ENV: env.ENV, 
        USE_SERVER: env.USE_SERVER,
        condition: env.ENV === 'development' && !env.USE_SERVER 
    })
    
    if (env.ENV === 'development' && !env.USE_SERVER) {
        console.log('📦 Mock 데이터 사용')
        await new Promise(resolve => setTimeout(resolve, 500))
        // category 필터링
        if (params?.category) {
            return mockPosts.filter(post => post.category === params.category)
        }

        return mockPosts
    }

    // 백엔드 블로그 엔드포인트와 연동
    try {
        const searchParams = new URLSearchParams()
        if (params?.category) {
            searchParams.set('category', params.category)
        }
        if (params?.limit) {
            searchParams.set('limit', params.limit.toString())
        }
        
        const url = `${env.API_BASE_URL}/blogs${searchParams.toString() ? '?' + searchParams.toString() : ''}`
        console.log('🌐 실제 API 호출:', url)
        
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json() as { items: any[] }
        const items = Array.isArray(data.items) ? data.items : []
        
        console.log('API 응답:', items.length, '개 항목')
        console.log('첫 번째 아이템 샘플:', items[0]) // 실제 데이터 구조 확인
        
        // 목록 매핑 - 백엔드 응답 형식에 맞게 수정
        const mapped: Post[] = items.map((b: any) => {
            const rawCategory = b.category_normalized ?? b.category ?? b.category_original ?? ''
            return {
                id: String(b.plcy_no ?? Math.random().toString(36).slice(2)),
                title: b.blog_title ?? '제목 없음',
                slug: String(b.plcy_no ?? Math.random().toString(36).slice(2)),
                summary: b.blog_summary ?? '',
                category: normCategory(rawCategory),
                thumbnail: resolveThumbnail(b),
                author: '정책관리팀',
                viewCount: Math.floor(Math.random() * 1000), // 임시: 백엔드에 view_count 필드 없음
                createdAt: b.generated_at || b.updated_at || '2024-01-01T00:00:00Z',
                content: b.blog_content ?? '',
                meta: b.meta ?? undefined,
            }
        })
        return mapped
    } catch (error) {
        console.error('API 호출 실패:', error)
        console.log('Mock 데이터로 폴백')
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

// 새 블로그 포스트 생성
export const createBlogPost = async (plcyNo: string): Promise<any> => {
    try {
        console.log('🆕 새 블로그 포스트 생성:', plcyNo)
        
        // 1. LLM으로 블로그 콘텐츠 생성
        const content = await generatePolicyContent(plcyNo, 'full')
        
        // 2. 블로그 DB에 저장 (백엔드에서 자동 처리됨)
        console.log('✅ 블로그 생성 완료:', content)
        
        return content
    } catch (error) {
        console.error('블로그 생성 실패:', error)
        throw error
    }
}

// 블로그 포스트 삭제
export const deleteBlogPost = async (plcyNo: string): Promise<void> => {
    try {
        console.log('🗑️ 블로그 포스트 삭제 시도:', plcyNo)
        
        const response = await fetch(`${env.API_BASE_URL}/blogs/${plcyNo}`, {
            method: 'DELETE',
        })
        
        console.log('📡 삭제 응답 상태:', response.status, response.statusText)
        
        if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ 삭제 응답 에러:', errorText)
            throw new Error(`HTTP ${response.status}: ${errorText}`)
        }
        
        const result = await response.json()
        console.log('✅ 블로그 삭제 완료:', result)
    } catch (error) {
        console.error('❌ 블로그 삭제 실패:', error)
        throw error
    }
}

// 블로그 포스트 수정
export const updateBlogPost = async (plcyNo: string, updates: {
    title?: string
    summary?: string
    content?: string
    category?: string
}): Promise<any> => {
    try {
        console.log('🔄 === 블로그 포스트 수정 시작 ===')
        console.log('📝 plcyNo:', plcyNo)
        console.log('📝 updates:', JSON.stringify(updates, null, 2))
        console.log('🌐 API URL:', `${env.API_BASE_URL}/blogs/${plcyNo}`)
        
        const response = await fetch(`${env.API_BASE_URL}/blogs/${plcyNo}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        })
        
        console.log('📡 응답 상태:', response.status, response.statusText)
        console.log('📡 응답 헤더:', Object.fromEntries(response.headers.entries()))
        
        if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ 응답 에러:', errorText)
            throw new Error(`HTTP ${response.status}: ${errorText}`)
        }
        
        const result = await response.json()
        console.log('✅ 블로그 수정 완료:', JSON.stringify(result, null, 2))
        console.log('🔄 === 블로그 포스트 수정 완료 ===')
        
        return result
    } catch (error) {
        console.error('❌ 블로그 수정 실패:', error)
        throw error
    }
}

export const getPost = async (slug: string): Promise<Post | undefined> => {
    if (env.ENV === 'development' && !env.USE_SERVER) {
        await new Promise(resolve => setTimeout(resolve, 300))
        return mockPosts.find(post => post.slug === slug)
    }

    // 블로그 상세 연동 (slug는 plcy_no로 간주)
    try {
        const url = `${env.API_BASE_URL}/blogs/${slug}`
        console.log('API 호출:', url) // 디버깅용
        
        const response = await fetch(url)
        if (!response.ok) {
            if (response.status === 404) {
                console.log('블로그 포스트를 찾을 수 없음:', slug)
                return undefined
            }
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const b = await response.json()

        console.log('API 응답:', b) // 디버깅용

        // 단건 매핑 - 백엔드 응답 형식에 맞게 수정
        const rawCategory = b.category_normalized ?? b.category ?? b.category_original ?? ''
        const mapped: Post = {
            id: String(b.plcy_no ?? slug),
            title: b.blog_title ?? '제목 없음',
            slug: String(b.plcy_no ?? slug),
            summary: b.blog_summary ?? '',
            category: normCategory(rawCategory),
            thumbnail: resolveThumbnail(b),
            author: '정책관리팀',
            viewCount: Math.floor(Math.random() * 1000), // 임시: 백엔드에 view_count 필드 없음
            createdAt: b.updated_at ?? new Date().toISOString(),
            content: b.blog_content ?? '',
            meta: b.meta ?? undefined,
        }
        return mapped
    } catch (error) {
        console.error('API 호출 실패:', error)
        console.log('Mock 데이터로 폴백')
        return mockPosts.find(post => post.slug === slug)
    }
}