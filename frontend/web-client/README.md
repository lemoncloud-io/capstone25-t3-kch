# Blog Platform

청년 정책·혜택 자동 변환 블로그 플랫폼 - 한성대학교 캡스톤 프로젝트

## 🏗️ 프로젝트 개요

정부 및 공공기관에서 제공하는 정책·제도 정보를 유레카박스(CMS)를 통해 수집하고, LLM 기반 텍스트 변환으로 청년 친화적 언어로 자동 변환하여 블로그 포스트를 생성·배포하는 시스템을 구현한다.

### 🛠️ 기술 스택

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **State Management**: TanStack Query, Zustand
- **Routing**: React Router v7
- **UI Components**: Shadcn/ui + Radix UI
- **Build Tool**: Vite

## 📋 Prerequisites

- **Node.js** 18.0.0 이상
- **Yarn** 패키지 매니저 (권장)

## 🚀 설치 및 실행

### 1. 프로젝트 클론

```bash
git clone git@github.com:lemoncloud-capstone-25-fall-t3/blog-platform.git
cd blog-platform
```

### 2. 의존성 설치

```bash
yarn install
```

### 3. 환경변수 설정

```bash
cp .env.example .env.local
# .env.local 파일을 편집하여 필요한 환경변수 설정
```

### 4. 개발 서버 실행

```bash
yarn dev
```

🌐 http://localhost:5173에서 접속 가능

## 📜 Available Scripts

| 명령어          | 설명                             |
| --------------- | -------------------------------- |
| `yarn dev`      | 개발 서버 실행                   |
| `yarn build`    | 프로덕션 빌드 (`.env.prod` 사용) |
| `yarn preview`  | 빌드된 앱 미리보기               |
| `yarn lint`     | ESLint 검사                      |
| `yarn lint:fix` | ESLint 자동 수정                 |
| `yarn format`   | Prettier 코드 포맷팅             |

## 📁 프로젝트 구조

```
src/
├── features/          # 기능별 모듈
│   ├── blog/          # 블로그 기능
│   └── admin/         # 관리자 기능
├── shared/            # 공통 모듈
│   ├── api/           # API 함수
│   ├── components/    # 공통 컴포넌트
│   ├── lib/           # 유틸리티
│   └── store/         # 상태 관리
└── main.tsx           # 앱 진입점
```

## 📖 개발 가이드

자세한 개발 가이드는 [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)를 참고하세요.

## 🤝 Contributing

1. 새 브랜치 생성 (`git checkout -b feature/amazing-feature`)
2. 변경사항 커밋 (`git commit -m 'feat: add amazing feature'`)
3. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
4. Pull Request 생성

### 커밋 메시지 규칙

- `feat:` 새 기능 추가
- `fix:` 버그 수정
- `docs:` 문서 수정
- `style:` 코드 포맷팅
- `refactor:` 리팩토링
- `test:` 테스트 추가

## 📄 License

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 👨‍💻 개발팀

한성대학교 캡스톤 프로젝트 팀 - 케코한
