## 2025년 2학기 기업연계 AI 캡스톤 디자인 프로젝트 - 한성대

---

## 변경 이력 (Changelog)

### 2025.11.02 - 블로그 자동 생성 시스템 구축

#### 주요 변경사항

**feat(blog): LLM 블로그 자동 생성 파이프라인 구축**
- `blog_posts` 테이블 설계 및 생성
  - LLM 생성 컨텐츠: blog_title, blog_summary, blog_content
  - 메타 정보: category, region, keywords (배열)
  - 생성 추적: generated_at, updated_at, generation_status
  - 에러 로깅: error_message
  - 인덱스: plcy_no, category, region, generated_at
  - 자동 updated_at 트리거 구현

**feat(batch): 블로그 일괄 생성 스크립트**
- `generate_all_blogs.py` 구현
  - 100개 정책 데이터 자동 조회 및 LLM 호출
  - Rate limit 방어 (0.5초 간격)
  - 중복 생성 방지 옵션 (`--no-skip`)
  - 에러 핸들링 및 상세 로깅
  - 테스트 모드 지원 (`--limit N`)
- 명령어 옵션
  ```bash
  # 신규 정책만 생성 (기본)
  python -m jobs.blog.generate_all_blogs
  
  # 전체 재생성
  python -m jobs.blog.generate_all_blogs --no-skip
  
  # 테스트 (10개만)
  python -m jobs.blog.generate_all_blogs --limit 10
  ```

**refactor(prompts): 프롬프트 품질 개선**
- `blog_content_system_prompt.json` 수정
  - **마크다운 형식 금지** 명시 (#, ##, *, **, - 등 모든 문법)
  - **필수 안내 문구 자동 추가**
    - "이 정책의 연령, 소득 기준 등 세부 조건은 실제와 다를 수 있으니, 신청 전 반드시 공식 웹사이트에서 최신 정보를 확인하시기 바랍니다."
  - SEO 최적화 가이드라인 유지 (하위 키워드, 롱테일 키워드)
  - 친근한 어조와 논리적 흐름 강조

**feat(data-quality): 연령 데이터 품질 개선**
- `preprocess.py`의 `summarize_target()` 함수 개선
  - "0" 값을 빈 값으로 처리 (무의미한 연령 정보 제거)
  - "99세 이상" 연령은 "연령 제한은 공식 사이트에서 확인 필요"로 표시
  - 숫자 변환 실패 시 안전한 폴백 처리
- 기존 DB 데이터 일괄 업데이트
  - `update_age_data.py` 스크립트로 100개 정책 target_group 자동 수정
  - 특정 정책 수동 보정 (일상돌봄서비스사업: 19~99 → 19~64)

**test(blog): 생성 결과 검증**
- 100개 정책 블로그 생성 완료
  - 성공: 100개
  - 건너뛰기: 0개
  - 실패: 0개
- 품질 확인 항목
  - ✅ 마크다운 없이 순수 텍스트로 생성
  - ✅ 친근한 어조와 구조적 정리 (1., 2., 3. 형식)
  - ✅ 정책 정보 명확하게 전달 (대상, 혜택, 신청 방법)
  - ✅ 안내 문구 자동 추가
  - ✅ 키워드 자동 수집 및 저장

---

### 2025.10.26 - LLM 프롬프트 통합

#### 주요 변경사항

**feat(llm): OpenAI API 연동 및 블로그 콘텐츠 자동 생성**
- LLM 기반 블로그 제목/요약/본문 자동 생성 기능 추가
- DB 정제 데이터를 활용한 프롬프트 생성
- 청년 친화적 구어체 톤앤매너 적용 ("~해요", "~있어요", "~해보세요")
- 마크다운 형식 배제, 자연스러운 텍스트 생성

**feat(prompts): 분야별/타겟별 프롬프트 구성**
- 10개 카테고리별 맞춤 프롬프트 (톤앤매너, 이모지, 강조표시)
  - 💼 취업 지원: 실용적·동기부여 톤
  - 📚 교육·자격증: 친근·격려 톤
  - 🚀 창업: 활기차고 도전적 톤
  - 🏠 주거: 안정감·따뜻한 톤
  - 💰 대출·금융: 신뢰감·명확한 톤
  - 💸 생활비 지원: 부드럽고 친근한 톤
  - 🎨 문화·여가: 밝고 경쾌한 톤
  - 💚 건강·상담: 따뜻하고 위로하는 톤
  - ✈️ 해외 기회: 설레고 희망찬 톤
  - 🗣️ 청년 참여: 활동적·격려하는 톤

**feat(seo): SEO 최적화 프롬프트**
- 롱테일 키워드 및 하위 키워드 발굴
- 연관 키워드 활용 (키워드 반복 방지)
- 다양한 문장 구조 및 논리적 흐름
- 검색 엔진 노출 최적화

**feat(api): 통합 콘텐츠 생성 엔드포인트**
- POST /api/policies/{plcy_no}/content: 통합 콘텐츠 생성 API
  - `?type=title`: 블로그 제목 생성
  - `?type=summary`: 블로그 요약 생성  
  - `?type=blog`: 블로그 본문 생성
  - `?type=full`: 제목+요약+본문 일괄 생성

**refactor(structure): 프로젝트 구조 개선**
- prompts_config/ 폴더 추가 (프롬프트 템플릿 JSON 관리)
  - title_system_prompt.json
  - summary_system_prompt.json
  - blog_content_system_prompt.json
  - category_config.json (카테고리별 이모지, 톤, 강조점)
  - category_prompts.json (카테고리별 프롬프트)
- utils/llm_utils.py: PromptGenerator 클래스 구현
- routes/prompts.py: 프롬프트 API 라우터

**feat(thumbnail): 썸네일 자동 생성 및 S3 업로드 연동**
- S3 업로드 기능 추가 (boto3 연동)
- DB 기반 정책 자동 캡션 생성 (LLM 프롬프트 개선)
- 썸네일 문구 줄바꿈/길이 자동 최적화
- 로깅 및 캐싱 구조 개선

---

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
│     ├─ .env.example                 # 샘플 환경변수 (업데이트: OPENAI_API_KEY 추가)
│     ├─ .python-version              
│     ├─ README.md
│     ├─ main.py                      # FastAPI 앱 기동/라우터 등록 (업데이트: prompts 라우터 추가)
│     ├─ pyproject.toml               
│     ├─ requirements.txt             # 백엔드 의존성 (업데이트: openai 추가)
│     ├─ routes/                      
│     │  ├─ policies.py               # /api/policies 목록/상세 (업데이트: content_data 추가)
│     │  └─ prompts.py                # /api/generate-* LLM 프롬프트 생성 엔드포인트 (신규)
│     ├─ utils/                       # 유틸리티 모듈 (신규)
│     │  ├─ __init__.py
│     │  └─ llm_utils.py              # PromptGenerator 클래스, OpenAI API 연동
│     ├─ prompts_config/              # LLM 프롬프트 템플릿 (신규)
│     │  ├─ title_system_prompt.json          # 제목 생성 프롬프트
│     │  ├─ summary_system_prompt.json        # 요약 생성 프롬프트
│     │  ├─ blog_content_system_prompt.json   # 본문 생성 프롬프트
│     │  ├─ category_config.json              # 카테고리별 이모지, 톤, 강조점
│     │  └─ category_prompts.json             # 카테고리별 프롬프트 (10개)
│     ├─ data/
│     │  └─ zip_prefix_regions.csv    # 3자리 우편번호 → 행정구역 시/군/구 매핑
│     └─ jobs/
│        ├─ __init__.py
│        └─ ontong/
│           ├─ __init__.py
│           ├─ fetch_and_clean.py     # 온통청년 수집 → 전처리 → DB 저장 파이프라인
│           ├─ preprocess.py          # 기간/금액/대상/신청방법/region 등 정규화 (업데이트: 하이브리드 카테고리, content_data 구조)
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

### 2025.11.02 - 썸네일 자동 생성 및 S3 연동

- S3 버킷 업로드 연동 (CORS/권한 설정 포함)
- LLM 프롬프트 개선 (문구 자연화)
- 로깅 및 캐싱 구조 안정화


## 로컬 테스트 방법

### 1. 환경변수 설정
.env.example 복사해서 .env 생성 후 API 키 입력
```bash
DB_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/youth_policy
YOUTHCENTER_API_KEY=your_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
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

#### 정책 데이터 조회
```bash
# 카테고리별 정책 목록
curl "http://127.0.0.1:8000/api/policies?category_auto=취업%20지원&limit=5"

# 정책 상세 조회
curl "http://127.0.0.1:8000/api/policies/20250924005400211793"
```

#### LLM 블로그 콘텐츠 생성
```bash
# 블로그 제목 생성
curl -X POST "http://127.0.0.1:8000/api/policies/20250924005400211793/content?type=title"

# 블로그 요약 생성
curl -X POST "http://127.0.0.1:8000/api/policies/20250924005400211793/content?type=summary"

# 블로그 본문 생성
curl -X POST "http://127.0.0.1:8000/api/policies/20250924005400211793/content?type=blog"

# 제목+요약+본문 일괄 생성
curl -X POST "http://127.0.0.1:8000/api/policies/20250924005400211793/content?type=full"
```

## Thumbnail Auto (LLM + S3 Upload)

### 사용 예시
```bash
curl -X POST http://127.0.0.1:8000/api/thumbnails/auto \
  -H "Content-Type: application/json" \
  -d '{
    "policy_id": "20250922005400211790",
    "category": "복지",
    "max_variants": 3
  }'
```
---

💡 **설명**
- 위 명령은 정책 ID(`policy_id`)를 기반으로 썸네일 자동 생성 API를 호출합니다.  
- 백엔드가 DB에서 정책 정보를 조회하고,  
  LLM(OpenAI API)을 이용해 문구를 생성한 후 이미지를 생성해 S3에 업로드합니다.  
- 응답 예시는 다음과 같습니다 

```json
{
  "ok": true,
  "caption": "청년 복지,\n당신의 삶을 바꿀 기회!",
  "result": {
    "ok": true,
    "storage": "s3",
    "url": "https://youth-policy-thumbnails-kch.s3.ap-northeast-2.amazonaws.com/thumbnails/2025/11/20250922005400211790.png"
  }
}
```