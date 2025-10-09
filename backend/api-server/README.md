## 2025년 2학기 기업연계 AI 캡스톤 디자인 프로젝트 - 한성대

---

## 변경 이력 (Changelog)

### 2025.10.09 - 데이터 정제

#### 주요 변경사항

**feat(preproc): 하이브리드 카테고리 분류 시스템 도입**
- 정부 원본 분류(mclsfNm, lclsfNm)와 키워드 기반 분류 결합
- 10개 청년 친화적 카테고리로 확장 (취업 지원, 교육·자격증, 창업, 주거, 대출·금융, 생활비 지원, 문화·여가, 건강·상담, 해외 기회, 청년 참여)
- "기타" 카테고리 최소화
- 포괄적 정부 분류("복지문화", "참여권리") 제외 처리

**feat(storage): blog_json 구조 개선 - Flat & 프론트 친화적**
- Nested 구조 → Flat 구조로 변경 (프론트에서 접근 용이)
- 금액 표시: 텍스트("최대 10만원") + 숫자(정렬용) 병행 제공
- 혜택 표현: 금액/서비스 모두 지원 ("100만원" 또는 "혜택 제공")
- 기간 상태 추가: "진행 중", "🔥 마감 임박", "마감", "상시 모집"
- 검색용 키워드 자동 추출 (최대 5개)

**refactor(preproc): 키워드 규칙 개선**
- 주거: "자립" 키워드 추가
- 생활비 지원: "정착금" 추가
- 건강·상담: "고독사", "고립", "은둔" 추가
- 해외 기회: "IFWY" 추가

---

### 2025.10.04 - 초기 개발 내용

```text
capstone25-t3-kch/
├─ .gitignore
├─ README.md
├─ package.json
├─ yarn.lock
├─ backend/
│  └─ api-server/
│     ├─ .env.example                 # 샘플 환경변수 (업데이트)
│     ├─ .python-version              
│     ├─ README.md
│     ├─ main.py                      # FastAPI 앱 기동/라우터 등록(업데이트)
│     ├─ pyproject.toml               
│     ├─ requirements.txt             # 백엔드 의존성(업데이트)
│     ├─ routes/                      
│     │  └─ policies.py               # /api/policies 목록/상세
│     ├─ data/
│     │  └─ zip_prefix_regions.csv    # 3자리 우편번호 → 행정구역 시/군/구 매핑
│     └─ jobs/
│        ├─ __init__.py
│        └─ ontong/
│           ├─ __init__.py
│           ├─ fetch_and_clean.py     # 온통청년 수집 → 전처리 → DB 저장 파이프라인
│           ├─ preprocess.py          # 기간/금액/대상/신청방법/region 등 정규화
│           ├─ quality.py             # FR-14~16 점검(누락/타입/중복 등)
│           ├─ storage_pg.py          # PostgreSQL 연결/테이블 생성/업서트
│           ├─ utils.py               # HTTP 요청, 정제 유틸, 금액 파싱 등
│           └─ zipmap_prefix.py       # zip code 앞 3자리 → region 변환 헬퍼
└─ frontend/
   └─ ...                             
```

###1. 프로젝트/레포 세팅
    - backend/api-server 백엔드 작업 폴더 정리
    -.env 구성 및 requirements.txt 업데이트

###2. PostgreSQL 준비 & 연동
    - 로컬 Postgres 설치·접속(5432) → youth_policy DB 생성
    -테이블 스키마 준비: policy_raw, policy_clean (+ 컬럼 보강: category_auto, region 등)
    -SQL 쿼리로 접속/건수 확인 (\c youth_policy, SELECT COUNT(*) ...)

###3. 전처리 파이프라인 구축
    - 온통청년 API 수집 + 전처리 : python -m jobs.ontong.fetch_and_clean
    -핵심 필드 정규화: 기간(period_start/end 문자열 YYYY-MM-DD), 금액, 대상, 신청방법
    -품질체크 로직(quality.py)로 누락/형식 검사 (FR-14~19 대응)

    ####3-1. 지역 매핑(주소/우편번호→시/군/구)
    -data/zip_prefix_regions.csv 추가(우편번호 앞 3자리 매핑)
    -jobs/ontong/zipmap_prefix.py 구현 → 전처리에서 zipCd 파싱해 region 자동 주입
    -DB 반영 확인(경상남도 등 접두어 매칭 결과 조회)

###4. API 서버(FastAPI) 동작 확인
    - 서버 실행: py -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
    -Swagger UI(/docs)로 확인

    ####4-1. 엔드포인트
    -목록: GET /api/policies (검색/필터: q, region, category, category_auto, limit/offset)
    -상세: GET /api/policies/{plcy_no}

###5. 데이터 적재/검증
    - 수집 원문 policy_raw 적재 확인
    -전처리 결과 policy_clean 적재 및 필드 점검
    -샘플 레코드 상세 조회 성공: /api/policies/20250924005400211793
    
---

## 로컬 테스트 방법

### 1. 환경변수 설정
.env.example 복사해서 .env 생성 후 API 키 입력
```bash
DB_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/youth_policy
YOUTHCENTER_API_KEY=your_api_key_here
```

### 2. 패키지 설치
```bash
uv pip install -r requirements.txt
```

### 3. DB 생성
```bash
psql -U postgres -h localhost -p 5432
CREATE DATABASE youth_policy;
```

### 4. 데이터 수집
```bash
cd backend/api-server
python -m jobs.ontong.fetch_and_clean
```

### 5. 서버 실행
```bash
yarn api:dev
```

### 6. API 테스트
- Swagger UI: http://127.0.0.1:8000/docs
- 목록: GET /api/policies
- 상세: GET /api/policies/{plcy_no}

```bash
# 예시
curl "http://127.0.0.1:8000/api/policies?category_auto=취업%20지원&limit=5"
curl "http://127.0.0.1:8000/api/policies/20250924005400211793"
```