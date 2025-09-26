# Blog Platform Monorepo

블로그 플랫폼 모노레포 프로젝트

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

## 🚀 시작하기

### 📋 필수 요구사항

#### 1. Node.js & Yarn 설치
- **Node.js 20.x 이상**
  ```bash
  # Node.js 버전 확인
  node --version  # v20.x.x 이상

  # Node.js 설치 (미설치시)
  # macOS: brew install node
  # Windows: https://nodejs.org 에서 다운로드
  ```

- **Yarn 1.22.x**
  ```bash
  # Yarn 설치
  npm install -g yarn

  # Yarn 버전 확인
  yarn --version  # 1.22.x
  ```

#### 2. Python & UV 설치
- **Python 3.11 이상**
  ```bash
  # Python 버전 확인
  python --version  # Python 3.11.x 이상

  # Python 설치 (미설치시)
  # macOS: brew install python@3.11
  # Windows: https://python.org 에서 다운로드
  ```

- **UV (Python 패키지 매니저)**
  ```bash
  # UV 설치 (macOS/Linux)
  curl -LsSf https://astral.sh/uv/install.sh | sh

  # 또는 pip로 설치
  pip install uv

  # UV 버전 확인
  uv --version
  ```

### 🔧 프로젝트 설치

#### 1. 저장소 클론
```bash
# 프로젝트 클론
git clone <repository-url>
cd blog-platform
```

#### 2. 환경변수 설정 (필수)

프로젝트 실행 전에 환경변수 파일을 생성해야 합니다:

```bash
# Frontend 환경변수 설정
cd frontend/web-client
cp .env.example .env
```

**📝 환경변수 파일 예시:**

**Frontend (frontend/web-client/.env)**
```bash
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=http://localhost:8000
VITE_ENV=development
```

**Backend (backend/api-server/.env)**
```bash
VERSION=1.0.0
API_KEY=your-secret-api-key
NODE_ENV=development
WEB_ORIGIN=http://localhost:5173
```

⚠️ **중요**: `.env` 파일은 절대로 git에 커밋하지 마세요. 이미 `.gitignore`에 추가되어 있습니다.

#### 3. 의존성 설치
```bash
# Frontend 의존성 설치
yarn install

# Backend 의존성 설치
yarn api:install
```

### 🏃‍♂️ 개발 서버 실행

#### 🎯 빠른 시작 (권장)
```bash
# 1. Frontend 개발 서버 실행 (터미널 1)
yarn web:dev
# ➜ http://localhost:5173

# 2. Backend API 서버 실행 (터미널 2)
yarn api:dev
# ➜ http://localhost:8000
```

#### 🖥️ Frontend 개발
```bash
# 개발 서버 실행
yarn web:dev          # http://localhost:5173

# 프로덕션 빌드
yarn web:build

# 빌드 결과 미리보기
yarn web:preview

# 린트 검사
yarn web:lint
```

#### 🐍 Backend 개발
```bash
# API 서버 실행
yarn api:dev          # http://localhost:8000

# API 문서 확인
# ➜ Swagger UI: http://localhost:8000/docs
# ➜ ReDoc: http://localhost:8000/redoc

# 린트 검사
yarn api:lint

# 포맷팅
yarn api:format
```

#### 📁 개별 워크스페이스 작업
```bash
# Frontend 폴더에서 작업
cd frontend/web-client
yarn dev              # 로컬 개발 서버
yarn build            # 빌드
yarn lint             # 린트

# Backend 폴더에서 작업
cd backend/api-server
uv run uvicorn main:app --reload  # API 서버
uv run ruff check .               # 린트
uv run ruff format .              # 포맷팅
```

### 🛠️ 유용한 명령어

#### 📝 코드 포맷팅
```bash
# 전체 코드 포맷팅 (JS/TS + Python)
yarn format

# 개별 포맷팅
yarn format:js       # Frontend만
yarn format:py       # Backend만
```

#### 🔍 코드 품질 검사
```bash
# 린트 검사
yarn web:lint        # Frontend
yarn api:lint        # Backend
```

#### 🧹 정리 작업
```bash
# 모든 캐시 및 빌드 파일 정리
yarn clean

# 개별 정리
rm -rf frontend/web-client/node_modules
rm -rf backend/api-server/.venv
```

#### 🔧 문제 해결
```bash
# 의존성 재설치
yarn install --force       # Frontend
yarn api:install           # Backend

# 포트 충돌시 다른 포트 사용
yarn web:dev --port 3000   # Frontend 포트 변경
# Backend은 main.py에서 포트 수정 필요
```

## 📖 개발 워크플로우

### 🌊 Git Flow 브랜치 전략

```
main (프로덕션)
├── develop (개발 통합)
    ├── feature/user-auth     # 새 기능
    ├── feature/blog-posts    # 새 기능
    ├── hotfix/critical-bug   # 긴급 수정
    └── release/v1.0.0        # 릴리스 준비
```

#### 📋 브랜치 규칙
- **main**: 프로덕션 배포용 (항상 안정적)
- **develop**: 개발 통합 브랜치 (다음 릴리스 준비)
- **feature/***: 새 기능 개발 (develop에서 분기)
- **hotfix/***: 긴급 버그 수정 (main에서 분기)
- **release/***: 릴리스 준비 (develop에서 분기)

### 1️⃣ 새 기능 개발 (Feature Branch)

#### 🚀 기능 개발 시작
```bash
# 1. develop 브랜치로 이동하고 최신화
git checkout develop
git pull origin develop

# 2. 새 feature 브랜치 생성
git checkout -b feature/user-authentication
# 브랜치명 규칙: feature/기능명 (kebab-case)

# 3. 개발 서버 실행
yarn web:dev     # Frontend (터미널 1)
yarn api:dev     # Backend (터미널 2)
```

#### 💻 개발 및 커밋
```bash
# 4. 코드 작성 중 정기적 커밋
git add .
git commit -m "feat: add login form component"

git add .
git commit -m "feat: implement JWT authentication"

git add .
git commit -m "test: add authentication tests"

# 커밋 메시지 규칙 (Conventional Commits)
# feat: 새 기능
# fix: 버그 수정
# docs: 문서 수정
# style: 코드 스타일 변경
# refactor: 코드 리팩토링
# test: 테스트 추가/수정
# chore: 빌드 설정 등
```

#### ✅ 개발 완료 후 점검
```bash
# 5. 코드 품질 검사
yarn format      # 전체 코드 포맷팅
yarn web:lint    # Frontend 린트
yarn api:lint    # Backend 린트

# 6. 개발 브랜치 최신화 및 충돌 해결
git checkout develop
git pull origin develop
git checkout feature/user-authentication
git rebase develop  # 또는 git merge develop

# 충돌 발생시
git status                    # 충돌 파일 확인
# 충돌 해결 후
git add .
git rebase --continue
```

#### 📤 푸시 및 PR 생성
```bash
# 7. 원격 저장소에 푸시
git push origin feature/user-authentication

# 8. GitHub에서 Pull Request 생성
# feature/user-authentication → develop
```

### 2️⃣ 핫픽스 개발 (Hotfix Branch)

```bash
# 긴급 버그 수정시
git checkout main
git pull origin main
git checkout -b hotfix/critical-login-bug

# 수정 후
git add .
git commit -m "fix: resolve critical login authentication bug"

# 두 브랜치에 모두 머지 필요
git push origin hotfix/critical-login-bug
# PR: hotfix/critical-login-bug → main
# PR: hotfix/critical-login-bug → develop
```

### 3️⃣ 릴리스 준비 (Release Branch)

```bash
# 릴리스 준비시
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# 버전 업데이트 및 최종 점검
# package.json 버전 수정
git add .
git commit -m "chore: bump version to 1.0.0"

git push origin release/v1.0.0
# PR: release/v1.0.0 → main
# PR: release/v1.0.0 → develop
```

### 4️⃣ 코드 리뷰 전 체크리스트

#### 📋 필수 검사 항목
- [ ] `yarn format` 실행 완료
- [ ] `yarn web:lint` 통과
- [ ] `yarn api:lint` 통과
- [ ] Frontend: http://localhost:5173 정상 작동
- [ ] Backend: http://localhost:8000/docs API 문서 확인
- [ ] 브라우저 콘솔 에러 없음
- [ ] 새로운 기능에 대한 테스트 작성
- [ ] README 업데이트 (필요시)

#### 🔍 Git 관련 검사
- [ ] 커밋 메시지가 Conventional Commits 규칙을 따름
- [ ] 브랜치명이 규칙을 따름 (`feature/`, `fix/`, `hotfix/` 등)
- [ ] develop 브랜치와 충돌 없음
- [ ] 불필요한 파일이 커밋되지 않음 (`.env`, `node_modules` 등)

## 🌐 접속 URL

| 서비스 | URL | 설명 |
|--------|-----|------|
| Frontend | http://localhost:5173 | React 개발 서버 |
| Backend API | http://localhost:8000 | FastAPI 서버 |
| API Docs (Swagger) | http://localhost:8000/docs | API 문서 |
| API Docs (ReDoc) | http://localhost:8000/redoc | API 문서 (대안) |
| Health Check | http://localhost:8000/api/health | 서버 상태 확인 |

