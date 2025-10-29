import type {
    LLMGenerationRequest,
    TitleGenerationResponse,
    SummaryGenerationResponse,
    BlogContentGenerationResponse,
    FullBlogGenerationResponse,
    RewriteResponse,
} from '../types'

/**
 * Simulates API delay to provide realistic UX testing
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Generate contextual blog title based on policy data
 */
export const mockGenerateTitle = async (
    data?: LLMGenerationRequest
): Promise<TitleGenerationResponse> => {
    // Simulate API delay (500-1000ms)
    await delay(500 + Math.random() * 500)

    const region = data?.region || '전국'
    const category = data?.category || '지원'

    const titleTemplates = [
        `${region} 청년이라면 꼭 알아야 할 ${category} 정책!`,
        `놓치면 후회하는 ${region} 청년 ${category} 혜택`,
        `${region} 거주 청년 필수! ${category} 지원 정책 총정리`,
        `2024년 ${region} 청년을 위한 ${category} 완벽 가이드`,
        `${region} 청년 ${category}, 이것만 알면 OK!`,
    ]

    const title = titleTemplates[Math.floor(Math.random() * titleTemplates.length)]

    return { title }
}

/**
 * Generate contextual summary based on policy data
 */
export const mockGenerateSummary = async (
    data?: LLMGenerationRequest
): Promise<SummaryGenerationResponse> => {
    // Simulate API delay (800-1500ms)
    await delay(800 + Math.random() * 700)

    const region = data?.region || '전국'
    const category = data?.category || '지원'
    const title = data?.title || '청년 지원 정책'

    const summary = `${title}은 ${region} 지역 청년들을 위한 ${category} 프로그램입니다. 이 정책은 만 19세부터 34세까지의 청년들이 경제적 부담 없이 안정적으로 미래를 준비할 수 있도록 돕기 위해 마련되었습니다. 특히 ${category} 분야에서 실질적인 도움이 필요한 청년들에게 큰 힘이 될 것으로 기대됩니다.`

    return { summary }
}

/**
 * Generate full blog content based on policy data
 */
export const mockGenerateBlogContent = async (
    data?: LLMGenerationRequest
): Promise<BlogContentGenerationResponse> => {
    // Simulate longer API delay (1500-2500ms)
    await delay(1500 + Math.random() * 1000)

    const region = data?.region || '전국'
    const category = data?.category || '지원'
    const title = data?.title || '청년 지원 정책'
    const target = data?.blog_json?.conditions?.target || '만 19~34세 청년'
    const applyMethod = data?.blog_json?.apply?.method || '온라인 신청'

    const blog_content = `## ${title}

안녕하세요! 오늘은 ${region} 청년 여러분께 꼭 필요한 ${category} 정책에 대해 소개해드리려고 합니다. 😊

### 📌 이런 분들께 추천합니다

${target}에 해당하시는 분들이라면 꼭 확인해보세요!

이 정책은 청년들의 경제적 부담을 줄이고, 안정적인 미래를 준비할 수 있도록 실질적인 도움을 제공합니다.

### 💰 지원 내용

${category} 분야에서 청년들이 필요로 하는 다양한 혜택을 제공합니다:

- ✅ 경제적 지원을 통한 부담 경감
- ✅ 전문가 상담 및 멘토링
- ✅ 관련 교육 프로그램 제공
- ✅ 네트워킹 기회 확대

### 📝 신청 방법

신청은 간단합니다! ${applyMethod}을 통해 신청하실 수 있어요.

**신청 시 필요한 서류:**
1. 신분증 (주민등록증 또는 운전면허증)
2. 주민등록등본 (최근 3개월 이내 발급)
3. 소득 증빙 서류 (해당자에 한함)
4. 기타 정책별 요구 서류

### ⏰ 신청 기간

신청 기간을 놓치지 마세요! 조기 마감될 수 있으니 서둘러 신청하시는 것을 추천드립니다.

### 💡 꿀팁!

- 신청 전 자격 요건을 꼼꼼히 확인하세요
- 필요 서류를 미리 준비해두면 신청이 훨씬 수월합니다
- 궁금한 점은 담당 부서에 문의하면 친절하게 안내해드립니다

### 🔔 마무리

${region} 청년 여러분의 꿈을 응원합니다! 이 정책을 통해 한 걸음 더 나아가실 수 있기를 바랍니다.

더 많은 청년 정책 정보가 궁금하시다면 저희 블로그를 구독해주세요! 📱

**#${region}청년 #${category}정책 #청년지원 #정부지원금 #청년정책**`

    return { blog_content }
}

/**
 * Generate full blog (title + summary + content) at once
 */
export const mockGenerateFullBlog = async (
    data?: LLMGenerationRequest
): Promise<FullBlogGenerationResponse> => {
    // Generate all three parts
    const [titleResult, summaryResult, contentResult] = await Promise.all([
        mockGenerateTitle(data),
        mockGenerateSummary(data),
        mockGenerateBlogContent(data),
    ])

    return {
        title: titleResult.title,
        summary: summaryResult.summary,
        blog_content: contentResult.blog_content,
    }
}

/**
 * Rewrite text with specified tone
 */
export const mockRewriteText = async (text: string, tone?: string): Promise<RewriteResponse> => {
    // Simulate API delay (1000-2000ms)
    await delay(1000 + Math.random() * 1000)

    if (!text) {
        throw new Error('텍스트를 입력해주세요')
    }

    // Different rewrite styles based on tone
    let result = text

    if (tone === 'youthful' || !tone) {
        // 청년 친화적 톤: 친근하고 쉬운 표현
        result = `안녕하세요! 😊\n\n${text}\n\n위 내용을 청년 친화적으로 풀어보면, 복잡해 보이는 정책도 실제로는 우리 청년들을 위한 든든한 지원이에요.

핵심만 쉽게 정리하자면:
- 신청 자격이 되는지 먼저 확인하기
- 필요한 서류 미리미리 준비하기
- 신청 기간 놓치지 않기

어렵게 생각하지 마시고, 하나씩 차근차근 준비하면 충분히 받으실 수 있는 혜택이니까 꼭 도전해보세요! 💪`
    } else if (tone === 'formal') {
        // 공식적 톤: 정중하고 격식 있는 표현
        result = `${text}

상기 내용은 청년 지원 정책의 주요 사항을 안내드린 것입니다.

해당 정책은 청년들의 사회·경제적 안정을 도모하고자 마련된 것으로, 자격 요건에 부합하시는 분들께서는 신청 기간 내에 필요 서류를 구비하여 신청하시기 바랍니다.

기타 문의 사항이 있으실 경우, 담당 부서로 연락 주시면 성실히 안내해 드리겠습니다.

감사합니다.`
    } else if (tone === 'casual') {
        // 캐주얼 톤: 편안하고 대화체
        result = `${text}

자, 이제 좀 더 쉽게 이야기해볼게요!

이 정책 진짜 괜찮은데요? 청년이라면 한번쯤 알아보면 좋을 것 같아요.

신청하는 것도 생각보다 어렵지 않거든요. 서류 몇 개만 챙기면 되고, 요즘은 대부분 온라인으로도 신청 가능해서 편해요.

혹시 주변에 해당되는 친구들 있으면 같이 알아보는 것도 좋을 것 같네요! 👍`
    }

    return { result }
}
