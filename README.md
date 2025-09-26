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
- UV (Python 패키지 매니저)

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
yarn web:dev

# 웹 클라이언트 빌드
yarn web:build

# 웹 클라이언트 프리뷰
yarn web:preview
```

#### Backend
```bash
# UV로 의존성 설치
yarn api:install

# API 서버 실행
yarn api:dev

# 또는 직접 실행
cd backend/api-server
uv run uvicorn main:app --reload
```

### 유용한 명령어

```bash
# 전체 코드 포맷팅 (JS/TS + Python)
yarn format

# 개별 포맷팅
yarn format:js   # Frontend
yarn format:py   # Backend

# 린트 검사
yarn web:lint    # Frontend
yarn api:lint    # Backend

# 모든 쳪시 정리
yarn clean
```
