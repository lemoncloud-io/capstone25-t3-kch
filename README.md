# 2025년 2학기 기업연계 AI 캡스톤 디자인 프로젝트 - 한성대

## 프로젝트 개요

### 목표
청년이 정책·혜택을 쉽게 이해하고 바로 활용할 수 있는 AI 기반 블로그 자동 생성 플랫폼 구축

### 주요 기능
- **정책 정보 수집**: 정부 및 공공기관의 정책·제도 정보를 유레카박스(CMS)를 통해 자동 수집
- **AI 기반 변환**: LLM을 활용하여 복잡한 행정 용어를 청년 친화적 언어로 자동 변환
- **콘텐츠 자동 생성**: 변환된 내용을 바탕으로 블로그 포스트 자동 생성 및 배포

## 프로젝트 구조

```
blog-platform/
├── frontend/
│   └── web-client/     # React 웹 클라이언트 (TypeScript)
└── backend/          
    └── api-server/     # FastAPI 서버 (Python)
```

## 기술 스택

### Frontend
- React 19 + TypeScript
- Vite
- TailwindCSS
- Zustand (상태 관리)
- Tanstack Query

### Backend
- Python 3.11+
- FastAPI
- UV (Python 패키지 매니저)

## 시작하기

### 필수 요구사항

#### Node.js & Yarn
- Node.js 20.x 이상
- Yarn 1.22.x

```bash
# 버전 확인
node --version  # v20.x.x 이상
yarn --version  # 1.22.x

# Yarn 설치 (미설치시)
npm install -g yarn
```

#### Python & UV
- Python 3.11 이상
- UV (Python 패키지 매니저)

```bash
# 버전 확인
python --version  # Python 3.11.x 이상
uv --version

# UV 설치
curl -LsSf https://astral.sh/uv/install.sh | sh
# 또는
pip install uv
```

### 프로젝트 설치

#### 1. 저장소 클론
```bash
git clone <repository-url>
cd blog-platform
```

#### 2. 환경변수 설정

**Frontend** (`frontend/web-client/.env`)
```bash
cp frontend/web-client/.env.example frontend/web-client/.env
```
```
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=http://localhost:8000
VITE_ENV=development
```

**Backend** (`backend/api-server/.env`)
```bash
cp backend/api-server/.env.example backend/api-server/.env
```
```
VERSION=1.0.0
API_KEY=your-secret-api-key
NODE_ENV=development
WEB_ORIGIN=http://localhost:5173
```

#### 3. 의존성 설치
```bash
# Frontend 의존성
yarn install

# Backend 의존성
yarn api:install
```

### 개발 서버 실행

#### 빠른 시작
```bash
# Terminal 1: Frontend
yarn web:dev    # http://localhost:5173

# Terminal 2: Backend
yarn api:dev    # http://localhost:8000
```

## 주요 명령어

### Frontend 명령어
| 명령어 | 설명 |
|--------|------|
| `yarn web:dev` | 개발 서버 실행 |
| `yarn web:build` | 프로덕션 빌드 |
| `yarn web:preview` | 빌드 결과 미리보기 |
| `yarn web:lint` | 린트 검사 |
| `yarn web:lint:fix` | 린트 오류 자동 수정 |

### Backend 명령어
| 명령어 | 설명 |
|--------|------|
| `yarn api:dev` | API 서버 실행 |
| `yarn api:lint` | 린트 검사 |
| `yarn api:lint:fix` | 린트 오류 자동 수정 |
| `yarn api:format` | 코드 포맷팅 |
| `yarn api:install` | 의존성 설치 |

### 공통 명령어
| 명령어 | 설명 |
|--------|------|
| `yarn format` | 전체 코드 포맷팅 |
| `yarn format:js` | Frontend 포맷팅 |
| `yarn format:py` | Backend 포맷팅 |
| `yarn lint:fix` | 전체 린트 오류 자동 수정 |
| `yarn clean` | 캐시 및 빌드 파일 정리 |

## 개발 워크플로우

### Git Flow 브랜치 전략

```
main                    # 프로덕션
└── develop            # 개발 통합
    ├── feature/*      # 새 기능
    ├── hotfix/*       # 긴급 수정
    └── release/*      # 릴리스 준비
```

### 브랜치 규칙
- `main`: 프로덕션 배포용 (항상 안정적)
- `develop`: 개발 통합 브랜치
- `feature/*`: 새 기능 개발
- `hotfix/*`: 긴급 버그 수정
- `release/*`: 릴리스 준비

### 새 기능 개발 프로세스

#### 1. 브랜치 생성
```bash
git checkout develop
git pull origin develop
git checkout -b feature/기능명
```

#### 2. 개발 및 커밋
```bash
git add .
git commit -m "type: description"
```

**커밋 타입**
- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 스타일 변경
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드 설정 등

#### 3. 코드 품질 검사
```bash
yarn format
yarn lint:fix
```

#### 4. 브랜치 최신화
```bash
git checkout develop
git pull origin develop
git checkout feature/기능명
git rebase develop
```

#### 5. Push 및 PR 생성
```bash
git push origin feature/기능명
# GitHub에서 PR 생성: feature/기능명 → develop
```

### 코드 리뷰 체크리스트

**필수 검사 항목**
- [ ] 코드 포맷팅 완료 (`yarn format`)
- [ ] 린트 오류 수정 완료 (`yarn lint:fix`)
- [ ] 로컬 환경 정상 작동 확인
- [ ] 브라우저 콘솔 에러 없음
- [ ] 테스트 작성 완료
- [ ] develop 브랜치와 충돌 없음

## 접속 URL

| 서비스 | URL | 설명 |
|--------|-----|------|
| Frontend | http://localhost:5173 | React 개발 서버 |
| Backend API | http://localhost:8000 | FastAPI 서버 |
| API Docs (Swagger) | http://localhost:8000/docs | Swagger UI |
| API Docs (ReDoc) | http://localhost:8000/redoc | ReDoc UI |
| Health Check | http://localhost:8000/api/health | 서버 상태 확인 |

## 문제 해결

### 포트 충돌
```bash
# Frontend 포트 변경
yarn web:dev --port 3000

# Backend 포트는 main.py에서 수정
```

### 의존성 재설치
```bash
# Frontend
rm -rf frontend/web-client/node_modules
yarn install --force

# Backend
rm -rf backend/api-server/.venv
yarn api:install
```

### 환경변수 문제
- `.env` 파일이 올바르게 설정되었는지 확인
- `.env.example` 파일과 비교하여 누락된 변수 확인
- 환경변수 변경 후 서버 재시작 필요
