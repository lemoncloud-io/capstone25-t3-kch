# 🚀 Quick Start Guide

## 전체 실행 순서 (Backend → Frontend)

### 📋 사전 준비

필요한 도구:
- **PostgreSQL** (5432 포트)
- **Python 3.10+** (uv 패키지 매니저)
- **Node.js 18+** (yarn)
- **OpenAI API Key**

---

## 1️⃣ 데이터베이스 설정

```bash
# PostgreSQL 접속
psql -U postgres -h localhost -p 5432

# 데이터베이스 생성
CREATE DATABASE youth_policy;

# 확인 후 종료
\l
\q
```

---

## 2️⃣ Backend 설정 및 실행

### Step 1: 환경변수 설정

```bash
cd backend/api-server

# .env 파일 생성 (아래 내용 참고)
cp .env.example .env
```

**`.env` 파일 내용:**
```bash
# Database
DB_URL=postgresql+psycopg2://postgres:YOUR_PASSWORD@localhost:5432/youth_policy

# API Keys
YOUTHCENTER_API_KEY=your_youthcenter_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Server
VERSION=1.0.0
NODE_ENV=local
WEB_ORIGIN=http://localhost:5173
API_KEY=your-super-secret-key

# Data Collection
PAGE_SIZE=10
MAX_PAGES=10
STORE_MODE=PG
```

### Step 2: 패키지 설치

```bash
# uv를 사용한 의존성 설치
uv sync

# 또는 직접 설치
uv pip install -r requirements.txt
```

### Step 3: 데이터 수집 (선택사항)

```bash
# 온통청년 API에서 정책 데이터 수집 및 전처리
python -m jobs.ontong.fetch_and_clean

# 또는 루트 디렉토리에서
yarn api:collect
```

**예상 출력:**
```
Fetching page 1/10...
Fetching page 2/10...
...
✓ Collected 245 policies
✓ Preprocessed 245 policies
✓ Inserted/Updated 245 records in policy_clean
```

### Step 4: Backend 서버 실행

```bash
# backend/api-server 디렉토리에서
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 또는 루트 디렉토리에서
cd ../..
yarn api:dev
```

**서버 시작 확인:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.

=== Backend Environment Variables ===
NODE_ENV: local
VERSION: 1.0.0
OPENAI_API_KEY: set
=====================================
```

**API 확인:**
- Swagger UI: http://localhost:8000/docs
- Health Check: http://localhost:8000/api/health

---

## 3️⃣ Frontend 설정 및 실행

### Step 1: 패키지 설치

```bash
# 루트 디렉토리에서
yarn install
```

### Step 2: 환경변수 설정 (선택사항)

Frontend는 기본적으로 `http://localhost:8000`을 백엔드로 사용합니다.

변경이 필요하면:
```bash
cd frontend/web-client

# .env.local 파일 생성
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local
```

### Step 3: Frontend 서버 실행

```bash
# 루트 디렉토리에서
yarn web:dev

# 또는 frontend/web-client에서
cd frontend/web-client
yarn dev
```

**서버 시작 확인:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

**Frontend 접속:**
- 블로그: http://localhost:5173/
- 관리자: http://localhost:5173/admin

---

## 4️⃣ 전체 동작 확인

### Backend API 테스트

```bash
# Health check
curl http://localhost:8000/api/health

# 정책 목록 조회
curl http://localhost:8000/api/policies?limit=5

# 블로그 포스트 목록
curl http://localhost:8000/api/posts

# 카테고리 목록
curl http://localhost:8000/api/categories
```

### Frontend 접속

1. **블로그 메인 페이지**: http://localhost:5173/
2. **관리자 대시보드**: http://localhost:5173/admin
3. **블로그 포스트 관리**: http://localhost:5173/admin/posts
4. **정책 관리**: http://localhost:5173/admin/policies

---

## 5️⃣ 테스트 데이터 생성 (선택사항)

```bash
cd backend/api-server

# 통합 테스트 실행
python create_test_posts.py --test-only

# 샘플 블로그 포스트 생성
python create_test_posts.py
```

**예상 출력:**
```
=== PHASE 1: Integration Tests ===
1. Fetching valid policies...
✓ Found policy: R2024...
2. Creating post with valid plcy_no...
✓ Created post with plcy_no: ...
...
✓ All policy linking tests passed!

=== PHASE 2: Creating Sample Posts ===
Creating post: 청년 취업 지원 프로그램 A
✓ Created: 청년-취업-지원-프로그램-a-1
✓ Published: 청년-취업-지원-프로그램-a-1
...
✓ Created 10 test posts!
```

---

## 📦 One-Command 실행 (개발용)

### 터미널 1: Backend
```bash
yarn api:dev
```

### 터미널 2: Frontend
```bash
yarn web:dev
```

---

## 🔍 트러블슈팅

### 1. Database connection error
```bash
# PostgreSQL 실행 확인
psql -U postgres -c "SELECT 1;"

# 데이터베이스 존재 확인
psql -U postgres -l | grep youth_policy

# .env의 DB_URL 확인
cat backend/api-server/.env | grep DB_URL
```

### 2. OPENAI_API_KEY not set
```bash
# .env 파일에 API 키 추가
cd backend/api-server
echo "OPENAI_API_KEY=sk-..." >> .env
```

### 3. Port already in use
```bash
# Backend (8000 포트)
lsof -ti:8000 | xargs kill -9

# Frontend (5173 포트)
lsof -ti:5173 | xargs kill -9
```

### 4. Foreign key constraint error
서버 첫 실행 시 다음 경고는 정상입니다:
```
Warning: Could not add foreign key constraint: relation "policy_clean" does not exist
```

해결: 데이터 수집 후 서버 재시작
```bash
python -m jobs.ontong.fetch_and_clean
# 서버 재시작
```

### 5. Frontend API connection error
```bash
# Backend가 실행 중인지 확인
curl http://localhost:8000/api/health

# CORS 설정 확인 (.env의 WEB_ORIGIN)
cat backend/api-server/.env | grep WEB_ORIGIN
```

---

## 📂 주요 파일 위치

```
capstone25-t3-kch/
├── backend/api-server/
│   ├── .env                    # 환경변수 (gitignore)
│   ├── main.py                 # FastAPI 앱 진입점
│   ├── database.py             # 공유 DB 연결
│   ├── routes/
│   │   ├── policies.py         # 정책 API
│   │   ├── prompts.py          # LLM 생성 API
│   │   └── posts.py            # 블로그 CRUD API
│   └── jobs/ontong/
│       └── fetch_and_clean.py  # 데이터 수집 스크립트
├── frontend/web-client/
│   ├── src/
│   │   ├── features/blog/      # 블로그 UI
│   │   ├── features/admin/     # 관리자 UI
│   │   └── shared/api/         # API 클라이언트
│   └── package.json
└── package.json                # 루트 스크립트
```

---

## 🎯 기본 워크플로우

### 블로그 포스트 생성 워크플로우

1. **데이터 수집**: `python -m jobs.ontong.fetch_and_clean`
2. **정책 확인**: http://localhost:5173/admin/policies
3. **콘텐츠 생성**:
   - 방법 1: 관리자 UI에서 LLM 생성 사용
   - 방법 2: API로 직접 생성
     ```bash
     curl -X POST "http://localhost:8000/api/generate-full-blog?plcy_no=R2024..."
     ```
4. **포스트 작성**: http://localhost:5173/admin/posts
5. **발행**: 포스트 목록에서 "발행" 버튼 클릭
6. **확인**: http://localhost:5173/

---

## 📊 주요 엔드포인트

### Backend API (http://localhost:8000)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/health` | Health check |
| GET | `/api/policies` | 정책 목록 |
| GET | `/api/policies/{plcy_no}` | 정책 상세 |
| POST | `/api/generate-full-blog` | LLM 콘텐츠 생성 |
| GET | `/api/posts` | 블로그 포스트 목록 |
| POST | `/api/posts` | 포스트 생성 |
| GET | `/api/posts/{slug}` | 포스트 상세 |
| PUT | `/api/posts/{slug}` | 포스트 수정 |
| POST | `/api/posts/{slug}/publish` | 발행 토글 |
| GET | `/api/categories` | 카테고리 목록 |

### Frontend Routes (http://localhost:5173)

| Route | 설명 |
|-------|------|
| `/` | 블로그 홈 |
| `/category/:category` | 카테고리별 포스트 |
| `/post/:slug` | 포스트 상세 |
| `/admin` | 관리자 대시보드 |
| `/admin/posts` | 포스트 관리 |
| `/admin/policies` | 정책 관리 |
| `/admin/llm-test` | LLM 테스트 |

---

## ✅ 성공 확인

모든 것이 정상 작동하면:

1. ✅ Backend: http://localhost:8000/docs 접속 가능
2. ✅ Frontend: http://localhost:5173 접속 가능
3. ✅ API 연동: 블로그 메인 페이지에 포스트 목록 표시
4. ✅ 관리자: http://localhost:5173/admin 접속 가능

---

## 📝 다음 단계

- 마이그레이션 적용: `MIGRATION_GUIDE.md` 참고
- 상세 수정 내역: `FIXES_SUMMARY.md` 참고
- API 문서: http://localhost:8000/docs
- Backend 상세: `backend/api-server/README.md`

---

**문제가 있으면**: 위 트러블슈팅 섹션 참고 또는 로그 확인
- Backend: 터미널 출력
- Frontend: 브라우저 개발자 도구 Console
