// src/features/onboarding/readOnboarding.ts

export type OnboardingProfile = {
  userStatus: 'student' | 'jobseeker'
  userAge: '19-24' | '25-29' | '30-34' | '35+'
  userRegion: string
  userInterests: string[]
}

const LS_KEYS = {
  complete: 'onboardingComplete',
  status: 'userStatus',
  age: 'userAge',
  region: 'userRegion',
  interests: 'userInterests',
} as const

export function readOnboarding(): OnboardingProfile | null {
  try {
    // 1) 온보딩 완료 플래그 확인
    const complete = window.localStorage.getItem(LS_KEYS.complete)
    if (complete !== 'true') {
      return null
    }

    // 2) 각각 값 읽기
    const status = window.localStorage.getItem(LS_KEYS.status) as
      | OnboardingProfile['userStatus']
      | null
    const age = window.localStorage.getItem(LS_KEYS.age) as
      | OnboardingProfile['userAge']
      | null
    const region = window.localStorage.getItem(LS_KEYS.region)

    if (!status || !age || !region) {
      // 필수 값 하나라도 없으면 무효 처리
      return null
    }

    // 3) 관심사는 JSON 문자열이거나, 콤마로 이어진 문자열일 수 있음
    const rawInterests = window.localStorage.getItem(LS_KEYS.interests)
    let interests: string[] = []

    if (rawInterests) {
      try {
        const parsed = JSON.parse(rawInterests)
        if (Array.isArray(parsed)) {
          interests = parsed.map(String)
        } else {
          // 혹시 객체로 저장돼 있으면 값만 뽑기
          interests = Object.values(parsed).map(String)
        }
      } catch {
        // JSON.parse 실패하면 "a,b,c" 형태로 가정
        interests = rawInterests
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      }
    }

    return {
      userStatus: status,
      userAge: age,
      userRegion: region,
      userInterests: interests,
    }
  } catch (e) {
    console.error('readOnboarding error', e)
    return null
  }
}
