# Blog Platform Monorepo

블로그 플랫폼 모노레포 프로젝트

## 프로젝트 구조

```
blog-platform/
├── frontend/
│   └── web-client/     # React 웹 클라이언트 (TypeScript)
├── backend/
│   └── api-server/     # FastAPI 서버 (Python)
└── packages/           # 공유 패키지 (추후 추가)
    └── shared/         # 공유 유틸리티 및 타입
```

## 기술 스택

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- Zustand (상태 관리)

### Backend
- Python 3.11+
- FastAPI

## 시작하기

### 필수 요구사항
- Node.js 20.x
- Yarn 1.22.x

### 설치

```bash
# 의존성 설치
yarn install
```

### 개발

#### Frontend
```bash
# 웹 클라이언트 개발 서버 실행
yarn dev:web

# 웹 클라이언트 빌드
yarn build:web

# 웹 클라이언트 프리뷰
yarn preview:web
```

#### Backend
```bash
# API 서버 실행
yarn dev:api

# 또는 직접 실행
cd backend/api-server
uvicorn main:app --reload
```

### 유용한 명령어

```bash
# 코드 포맷팅 (JS/TS)
yarn format

# 린트 검사
yarn lint:web

# 모든 node_modules, dist, __pycache__ 폴더 삭제
yarn clean
```

## 프로젝트 추가 계획

- [x] Backend API 서버 구조 추가 (Python/FastAPI)
- [ ] Admin 대시보드 추가
- [ ] 모바일 앱 추가 (React Native)
- [ ] 공유 컴포넌트 라이브러리 추가
- [ ] E2E 테스트 환경 구축
- [ ] Docker Compose 설정 추가
- [ ] CI/CD 파이프라인 구축