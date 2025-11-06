# 온보딩 페이지 설정 완료 ✅

## 📁 프로젝트 구조

```
src/
├── features/
│   └── onboarding/
│       ├── OnboardingRoutes.tsx       # 온보딩 라우트 설정
│       └── pages/
│           ├── StartPage.tsx          # /start
│           ├── Start2Page.tsx         # /start2
│           ├── StatusPage.tsx         # /status
│           ├── Status2Page.tsx        # /status2
│           ├── RegionPage.tsx         # /region
│           ├── InterestPage.tsx       # /interest
│           ├── Interest2Page.tsx      # /interest2
│           └── Interest3Page.tsx      # /interest3
├── styles/
│   └── fonts.css                      # 폰트 정의
└── App.tsx                            # 메인 앱 (온보딩 라우트 연결)

public/
├── fonts/                             # Inter 폰트 파일들 + Lacquer
└── images/
    ├── gps.png, gps-2.png, heart.png, left-arrow.png
    ├── interest/                      # 관심사 아이콘들
    │   ├── airline-ticket.png
    │   ├── books.png
    │   ├── children.png
    │   ├── coins.png
    │   ├── extracurricular-activities.png
    │   ├── fitness.png
    │   ├── house.png
    │   ├── job-seeker.png
    │   ├── money.png
    │   └── shuttle.png
    └── lemon/                         # 레몬 캐릭터 이미지들
        ├── job_lemon.png
        ├── Lemon_hi.png
        ├── lemon_sleep.png
        ├── lemon.png
        └── student_lemon.png
```

## 🎨 디자인 설정

### 메인 컬러
- **Primary Yellow**: `#FFCD42` 
  - Tailwind 클래스: `bg-primary`, `text-primary`, `bg-primary-500` 등

### 폰트
- **Inter**: 기본 폰트 (Regular, Medium, SemiBold, Bold)
  - Tailwind 클래스: `font-sans` (기본 적용됨)
- **Lacquer**: 특수 폰트
  - Tailwind 클래스: `font-lacquer`

## 📝 이미지 사용 예시

```tsx
// 레몬 캐릭터
<img src="/images/lemon/Lemon_hi.png" alt="레몬" />

// 관심사 아이콘
<img src="/images/interest/house.png" alt="주거" />

// 기타
<img src="/images/left-arrow.png" alt="뒤로가기" />
```

## 🚀 라우트 구조

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/start` | StartPage | 온보딩 시작 |
| `/start2` | Start2Page | 온보딩 2 |
| `/status` | StatusPage | 상태 선택 |
| `/status2` | Status2Page | 상태 선택 2 |
| `/region` | RegionPage | 지역 선택 |
| `/interest` | InterestPage | 관심사 선택 1 |
| `/interest2` | Interest2Page | 관심사 선택 2 |
| `/interest3` | Interest3Page | 관심사 선택 3 |

## 📤 피그마 디자인 전달 방법

1. **스크린샷**: 각 페이지를 캡처해서 이미지로 전달
2. **피그마 링크**: 파일 공유 링크 (View 권한)
3. **설명**: 각 페이지의 구성 요소를 텍스트로 설명

### 전달 시 포함할 정보
- 각 페이지의 레이아웃 구조
- 버튼/입력 필드 위치
- 텍스트 내용
- 이미지 위치
- 애니메이션/인터랙션

## 💡 다음 단계

1. 피그마 디자인 공유
2. 각 페이지별 컴포넌트 구현
3. 상태 관리 (선택한 값들 저장)
4. API 연동 (필요시)

