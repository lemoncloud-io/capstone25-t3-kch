## 프로젝트 개요

### 핵심 설계 원칙

- **Single Page Application**: React Router 기반 CSR
- **Feature-based Architecture**: 기능별 모듈 분리
- **Code Splitting**: 번들 최적화를 위한 Lazy Loading

### 기술 스택

1. **TypeScript**: 정적 타입 시스템으로 개발 생산성과 코드 안정성 향상
2. **React 19** 
3. **TanStack Query**: 서버 상태 관리와 데이터 페칭
4. **Zustand**: 간단하고 강력한 클라이언트 상태 관리
5. **React Router v7**: 라우팅 시스템
6. **Tailwind CSS**: 유틸리티 퍼스트 CSS 프레임워크
7. **Shadcn/ui**: 재사용 가능한 컴포넌트 시스템

| 카테고리            | 기술               | 버전  | 용도                           |
| ------------------- | ------------------ | ----- | ------------------------------ |
| **빌드 도구**       | Vite               | 7.1.6 | 빠른 개발 서버 및 번들링       |
| **라우팅**          | React Router       | v7    | SPA 라우팅 및 페이지 네비게이션 |
| **서버 상태**       | TanStack Query     | v5    | API 데이터 페칭 및 캐싱        |
| **클라이언트 상태** | Zustand            | v5    | 로컬 상태 관리                 |
| **스타일링**        | Tailwind CSS       | v4    | 유틸리티 기반 스타일링         |
| **UI 컴포넌트**     | Shadcn/ui + Radix | -     | 접근성 좋은 재사용 컴포넌트    |
| **HTTP 통신**       | Axios              | v1.12 | API 통신                       |
| **아이콘**          | Lucide React       | -     | 일관된 아이콘 시스템           |
| **마크다운**        | React Markdown     | v10   | 블로그 콘텐츠 렌더링           |


### 각 기술 스택 소개

#### 🚀 Vite (빌드 도구)
```bash
# 개발 서버 실행
yarn dev

# 프로덕션 빌드
yarn build
```

#### 🎯 TypeScript (정적 타입)
```typescript
// 인터페이스 정의 예시
interface Post {
    id: string
    title: string
    content: string
    createdAt: string
}

// 함수 타입 정의
const getPosts = async (): Promise<Post[]> => {
    // 구현...
}
```
- **장점**: 런타임 에러를 컴파일 타임에 미리 발견
- **IDE 지원**: 자동완성, 리팩토링, 타입 체크
- **파일 확장자**: `.ts`, `.tsx` (React 컴포넌트)

______________________________________________________________________

## 프로젝트 구조

```
src/
├── features/                    # 기능별 모듈
│   ├── blog/
│   │   ├── BlogRoutes.tsx       # 블로그 라우팅 정의
│   │   ├── components/
│   │   │   └── BlogLayout.tsx   # 헤더, 푸터 포함 레이아웃
│   │   └── pages/
│   │       ├── HomePage.tsx     # 메인 페이지
│   │       ├── PostDetailPage.tsx
│   │       └── CategoryPage.tsx
│   │
│   └── admin/
│       ├── AdminRoutes.tsx      # 어드민 라우팅 + 인증 가드
│       ├── components/
│       │   └── AdminLayout.tsx  # 어드민 레이아웃
│       └── pages/
│           ├── LoginPage.tsx
│           ├── DashboardPage.tsx
│           └── PostsManagePage.tsx
│
├── shared/
│   ├── api/
│   │   └── posts.ts             # API 함수, Mock 데이터
│   ├── store/
│   │   └── authStore.ts         # Zustand 스토어
│   ├── components/
│   │   └── ui/                  # Shadcn 컴포넌트
│   └── lib/
│       └── utils.ts             # 유틸리티 함수
│
├── App.tsx                      # 최상위 라우팅 분기
├── main.tsx                     # 앱 진입점, Provider 설정
└── index.css                    # Tailwind 임포트
```

______________________________________________________________________

## 개발 시작하기

### 필수 준비사항

1. **Node.js 18+** 설치
2. **Yarn** 패키지 매니저 (권장)
3. **VS Code** + TypeScript, Tailwind CSS 확장프로그램

### 프로젝트 실행

```bash
# 의존성 설치
yarn install

# 개발 서버 실행 (http://localhost:5173)
yarn dev

# TypeScript 타입 체크 및 프로덕션 빌드
yarn build

# 코드 포맷팅
yarn format

# ESLint 검사 및 자동 수정
yarn lint:fix
```

### 개발 도구 설정

#### VS Code 확장프로그램 (권장)
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint"
  ]
}
```

#### 브라우저 개발자 도구
- **React Developer Tools**: React 컴포넌트 트리 확인
- **TanStack Query DevTools**: 쿼리 상태와 캐시 확인 (자동 활성화됨)

______________________________________________________________________

## 주요 기술 스택 상세 가이드

### 🔄 TanStack Query (서버 상태 관리)

데이터 페칭, 캐싱, 동기화를 자동으로 처리하는 라이브러리입니다.

```typescript
// src/shared/api/posts.ts - API 함수 정의
export const getPosts = async (): Promise<Post[]> => {
    const response = await fetch('/api/posts')
    return response.json()
}

// 컴포넌트에서 사용
import { useQuery } from '@tanstack/react-query'

function PostList() {
    const { data: posts, isLoading, error } = useQuery({
        queryKey: ['posts'],
        queryFn: getPosts,
        staleTime: 5 * 60 * 1000, // 5분
    })

    if (isLoading) return <div>로딩중...</div>
    if (error) return <div>에러 발생</div>

    return (
        <div>
            {posts?.map(post => (
                <div key={post.id}>{post.title}</div>
            ))}
        </div>
    )
}
```

### 🗃️ Zustand (클라이언트 상태 관리)

Redux보다 간단한 상태 관리 라이브러리입니다.

```typescript
// src/shared/store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
    isAuthenticated: boolean
    login: () => void
    logout: () => void
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            login: () => set({ isAuthenticated: true }),
            logout: () => set({ isAuthenticated: false }),
        }),
        { name: 'auth-storage' } // localStorage에 자동 저장
    )
)

// 컴포넌트에서 사용
function LoginButton() {
    const { isAuthenticated, login, logout } = useAuthStore()

    return (
        <button onClick={isAuthenticated ? logout : login}>
            {isAuthenticated ? '로그아웃' : '로그인'}
        </button>
    )
}
```

### 🎨 Tailwind CSS (스타일링)

유틸리티 클래스 기반의 CSS 프레임워크입니다.

```tsx
// 반응형 그리드 레이아웃
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* 모바일: 1열, 태블릿: 2열, 데스크톱: 3열 */}
</div>

// 호버 효과와 애니메이션
<button className="bg-blue-500 hover:bg-blue-600 transition-colors duration-200 px-4 py-2 rounded-lg text-white">
    클릭하세요
</button>

// 조건부 스타일링
<div className={cn(
    "base-class",
    isActive && "bg-blue-500",
    className // props로 받은 추가 클래스
)}>
    내용
</div>
```

### 🧩 Shadcn/ui (컴포넌트 시스템)

재사용 가능한 UI 컴포넌트 라이브러리입니다.

```tsx
// src/shared/components/ui/button.tsx - 버튼 컴포넌트
import { Button } from '@/shared/components/ui/button'

function MyComponent() {
    return (
        <div className="space-y-4">
            <Button variant="default">기본 버튼</Button>
            <Button variant="outline">외곽선 버튼</Button>
            <Button variant="destructive">삭제 버튼</Button>
            <Button size="lg">큰 버튼</Button>
        </div>
    )
}
```

______________________________________________________________________

## 라우팅 아키텍처

### 라우팅 계층 구조

```
App.tsx (최상위 분기)
├── /admin/* → AdminRoutes
│   ├── 인증 체크
│   └── AdminLayout
│       ├── /admin/dashboard
│       └── /admin/posts
│
└── /* → BlogRoutes
    └── BlogLayout
        ├── / (HomePage)
        ├── /posts/:slug
        └── /category/:category
```

### 라우팅 구현 상세

**App.tsx - 최상위 분기**

```typescript
function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/*" element={<BlogRoutes />} />
      </Routes>
    </Suspense>
  )
}
```

**BlogRoutes.tsx - 블로그 라우팅**

```typescript
export default function BlogRoutes() {
  return (
    <Routes>
      <Route element={<BlogLayout />}>
        <Route index element={<HomePage />} />
        <Route path="posts/:slug" element={<PostDetailPage />} />
        <Route path="category/:category" element={<CategoryPage />} />
      </Route>
    </Routes>
  )
}
```

**AdminRoutes.tsx - 보호된 라우팅**

```typescript
export default function AdminRoutes() {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="posts" element={<PostsManagePage />} />
      </Route>
    </Routes>
  )
}
```

______________________________________________________________________


## 상태 관리

### TanStack Query 설정

```typescript
// main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,     // 5분
      cacheTime: 1000 * 60 * 10,    // 10분
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

### Zustand Store

```typescript
// authStore.ts
export const useAuthStore = create()(
    persist(
        (set) => ({
            isAuthenticated: false,
            login: () => set({ isAuthenticated: true }),
            logout: () => set({ isAuthenticated: false }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
```

______________________________________________________________________

## API 통신

### API 구조

```typescript
// api/posts.ts
const API_URL = import.meta.env.VITE_API_URL || '/api'

// Mock 데이터 (개발용)
const mockPosts = [
    { id: '1', title: '청년 주거지원', ... }
]

// API 함수
export async function getPosts(params?: any) {
    if (import.meta.env.DEV) {
        await delay(500)  // 네트워크 시뮬레이션
        return mockPosts
    }

    const { data } = await axios.get(`${API_URL}/posts`, { params })
    return data
}

// Query Hook 사용
const { data, isLoading } = useQuery({
    queryKey: ['posts', category],
    queryFn: () => getPosts({ category }),
})
```

______________________________________________________________________

### 자주 사용되는 패턴

```typescript
// 반응형 그리드
"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// 조건부 표시
"hidden lg:block"  // 데스크톱만
"lg:hidden"        // 모바일/태블릿만

// 반응형 패딩
"px-4 sm:px-6 lg:px-8"

// 반응형 텍스트
"text-sm md:text-base lg:text-lg"
```

### cn 유틸리티 함수

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 사용 예
className={cn(
  "base-class",
  isActive && "active-class",
  className  // props 오버라이드
)}
```

______________________________________________________________________

## 개발 가이드

### 새로운 페이지 추가하기

1. **페이지 컴포넌트 생성**
```tsx
// src/features/blog/pages/NewPage.tsx
export default function NewPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">새로운 페이지</h1>
            <p>페이지 내용...</p>
        </div>
    )
}
```

2. **라우트 등록**
```tsx
// src/features/blog/BlogRoutes.tsx
import NewPage from './pages/NewPage'

export default function BlogRoutes() {
    return (
        <Routes>
            <Route element={<BlogLayout />}>
                <Route index element={<HomePage />} />
                <Route path="new" element={<NewPage />} />  {/* 새 라우트 */}
                {/* 기존 라우트들... */}
            </Route>
        </Routes>
    )
}
```

### 새로운 API 추가하기

1. **타입 정의**
```typescript
// src/shared/api/categories.ts
export interface Category {
    id: string
    name: string
    slug: string
    description: string
}
```

2. **API 함수 작성**
```typescript
// src/shared/api/categories.ts
import { Category } from './types'

export const getCategories = async (): Promise<Category[]> => {
    if (env.ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500))
        return mockCategories
    }

    const response = await fetch(`${env.API_BASE_URL}/categories`)
    return response.json()
}
```

3. **컴포넌트에서 사용**
```tsx
// 컴포넌트 내부
const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
})
```

### 새로운 UI 컴포넌트 만들기

```
npx shadcn@latest add card # shadcn 컴포넌트 추가
```

```tsx
// src/shared/components/ui/card.tsx
import { cn } from '@/shared/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

export function Card({ className, children, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-lg border bg-card text-card-foreground shadow-sm",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

export function CardHeader({ className, children, ...props }: CardProps) {
    return (
        <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
            {children}
        </div>
    )
}

export function CardContent({ className, children, ...props }: CardProps) {
    return (
        <div className={cn("p-6 pt-0", className)} {...props}>
            {children}
        </div>
    )
}
```

### 상태 관리 패턴

```typescript
// src/shared/store/uiStore.ts - UI 상태 관리
interface UiStore {
    sidebarOpen: boolean
    theme: 'light' | 'dark'
    setSidebarOpen: (open: boolean) => void
    toggleTheme: () => void
}

export const useUiStore = create<UiStore>((set) => ({
    sidebarOpen: false,
    theme: 'light',
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
    })),
}))
```

### 폼 처리 패턴

```tsx
// React Hook Form 없이 간단한 폼
function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            // API 호출
            await submitContactForm(formData)
            // 성공 처리
            toast.success('문의가 전송되었습니다')
        } catch (error) {
            toast.error('전송에 실패했습니다')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="text"
                placeholder="이름"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                    ...prev,
                    name: e.target.value
                }))}
                className="w-full px-3 py-2 border rounded-lg"
            />
            {/* 다른 input들... */}
            <Button type="submit">전송</Button>
        </form>
    )
}
```

______________________________________________________________________

## 자주 사용하는 패턴과 컨벤션

### 파일 및 폴더 명명 규칙
- **컴포넌트 파일**: PascalCase (예: `BlogLayout.tsx`)
- **일반 파일**: camelCase (예: `authStore.ts`)
- **폴더**: kebab-case (예: `blog-platform`)
- **페이지 컴포넌트**: `*Page.tsx` 접미사 사용


### 환경변수 사용법

```typescript
// src/shared/lib/env.ts
export const env = {
    ENV: import.meta.env.MODE, // 'development' | 'production'
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    APP_NAME: import.meta.env.VITE_APP_NAME || 'Blog Platform',
}

// .env.local 파일
VITE_API_BASE_URL=https://api.example.com
VITE_APP_NAME=My Blog
```

______________________________________________________________________

## 트러블슈팅

### 자주 발생하는 문제들

#### 1. TypeScript 에러
```bash
# 타입 체크 실행
yarn build

# 일반적인 해결법
- 타입 정의 확인
- import 경로 확인
- 인터페이스 정의 누락 확인
```

#### 2. Tailwind CSS 클래스가 적용되지 않을 때
```bash
# Tailwind 재빌드
yarn dev

# 해결법
- 클래스명 오타 확인
- 브라우저 개발자 도구에서 CSS 확인
```

#### 3. 라우팅 문제
```tsx
// 올바른 라우트 구조
<Routes>
    <Route path="/admin/*" element={<AdminRoutes />} />
    <Route path="/*" element={<BlogRoutes />} />  {/* 와일드카드는 마지막에 */}
</Routes>
```

#### 4. TanStack Query 캐시 문제
```tsx
// 캐시 무효화
const queryClient = useQueryClient()
queryClient.invalidateQueries({ queryKey: ['posts'] })

// 강제 리페치
refetch()
```

### 추가 학습 자료

- **React 공식 문서**: https://react.dev
- **TanStack Query 가이드**: https://tanstack.com/query
- **Tailwind CSS 문서**: https://tailwindcss.com
- **Zustand 문서**: https://github.com/pmndrs/zustand
- **TypeScript 핸드북**: https://www.typescriptlang.org/docs

______________________________________________________________________

## 팀 개발 가이드

### Git 워크플로우
```bash
# 새 기능 개발
git checkout -b feature/blog-search
git add .
git commit -m "feat: 블로그 검색 기능 추가"
git push origin feature/blog-search

# 커밋 메시지 규칙
feat: 새 기능
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 리팩토링
test: 테스트 추가
```
