# 추천 알고리즘 & 성과지표 테스트 가이드

## 🚀 시작하기

```bash
# 1. 브랜치 전환
git checkout feature/recommendation-engine
git pull origin feature/recommendation-engine

# 2. 백엔드 실행
cd backend/api-server
uvicorn main:app --reload

# 3. 프론트엔드 실행 (새 터미널)
cd frontend/web-client
npm install  # 혹시 모르니 한번 더
npm run dev
```

## 필수 테스트 항목

### 1. 홈페이지 추천 (5분)

- [ ] `localhost:5173` 접속
- [ ] 온보딩 완료 (온보딩 안 했다면 `/onboarding/start`에서 완료)
- [ ] 추천 게시물이 보이는지 확인
- [ ] "당신을 위한 청년정책" 섹션에 추천 게시물 표시 확인
- [ ] 추천 게시물 클릭 → 상세페이지 이동 확인
- [ ] F12 → Network 탭에서 `/api/recommendations` API 호출 확인
  - **경로 확인**: `/api/recommendations` (백엔드 라우터에 `/api` prefix 있음)
  - POST 요청인지 확인
  - Request Body에 `userStatus`, `userAge`, `userRegion`, `userInterests` 포함되는지 확인
  - Response에 `items` 배열이 있고 각 항목에 `score`, `reasons` 포함되는지 확인

### 2. 상세페이지 추천 ⭐제일 중요!

- [ ] 게시물 하나 클릭
- [ ] **온보딩 완료 확인** (온보딩 안 했다면 추천이 안 보일 수 있음)
- [ ] 하단 "함께 읽으면 좋은 글" 섹션 확인
- [ ] **더미 데이터 아닌지 확인** (제목이 "React Query 효과적으로..." 같은 게 나오면 안 됨!)
- [ ] 현재 보고 있는 글은 추천에서 제외됐는지 확인
- [ ] 추천 게시물 클릭 시 상세페이지로 이동하는지 확인
- [ ] Network 탭에서 `/api/recommendations` API 호출 확인
  - **경로 확인**: `/api/recommendations` (백엔드 라우터에 `/api` prefix 있음)
  - 온보딩 프로필이 있을 때만 호출되는지 확인
  - Response의 `items`에서 현재 보고 있는 post의 `plcy_no`가 없는지 확인

### 3. 관리자 페이지 대시보드

- [ ] `localhost:5173/admin` 접속
- [ ] 로그인 (필요시)
- [ ] **추천 CTR 지표** 확인
  - "평균 추천 CTR" 카드에 값이 표시되는지
  - CTR 값이 **0~100 사이**인지 확인 (이상한 숫자 나오면 버그)
  - CTR 계산: `(총 클릭 / 총 노출) × 100` 방식인지 확인
- [ ] 일별 클릭/노출 차트 보이는지
- [ ] "추천 CTR 추이" 차트 확인
  - 데이터가 없으면 "데이터가 없습니다" 메시지 표시
  - 데이터가 있으면 그래프 표시
- [ ] 콘솔 에러 없는지 확인

### 4. 지역 매칭 테스트 (선택)

```javascript
// 브라우저 콘솔에서 실행
JSON.parse(localStorage.getItem('onboarding') || '{}')
```

- [ ] 내 지역이 "경기도"면 "경상북도" 정책 안 나오는지 확인
- [ ] 내 지역이 "경상북도"면 "경기도" 정책 안 나오는지 확인
- [ ] 전국 정책은 모든 지역에서 보이는지 확인

### 5. 성과지표 수집 테스트

- [ ] 게시물 클릭 시 `/api/analytics/click` 호출되는지 (Network 탭 확인)
- [ ] 상세페이지에서 몇 초 있다가 나가면 `/api/analytics/stay-time` 호출되는지
- [ ] 홈페이지에서 몇 초 있다가 나가면 `/api/analytics/home-stay` 호출되는지
- [ ] 추천 게시물 클릭 시 `/api/analytics/recommendation/click` 호출되는지
- [ ] 추천 영역이 보일 때 `/api/analytics/recommendation/impression` 호출되는지
  - **중복 호출 안 되는지 확인** (페이지네이션 시 여러 번 호출되면 안 됨)

### 6. 날짜 데이터 표시 테스트

- [ ] 관리자 대시보드에서 날짜별 데이터가 올바르게 표시되는지
- [ ] 빈 날짜는 0으로 표시되는지
- [ ] 한국 시간대(KST) 기준으로 날짜가 올바른지 확인

## 체크할 에러들

### 백엔드 터미널

- [ ] `[blogs] view_count 컬럼 초기화 실패` 에러 있는지
- [ ] `애널리틱스 테이블 초기화 완료` 메시지 보이는지
- [ ] API 호출 시 500 에러 없는지
- [ ] `/api/recommendations` 호출 시 정상 응답 (200) 오는지
  - **참고**: 백엔드 라우터에 `/api` prefix가 있어서 실제 경로는 `/api/recommendations`임
  - **참고**: 백엔드 라우터에 `/api` prefix가 있어서 실제 경로는 `/api/recommendations`임

### 프론트엔드 콘솔

- [ ] 빨간 에러 메시지 없는지
- [ ] API 호출 실패 없는지
- [ ] React Query 에러 없는지

## 📊 CTR 계산 검증

관리자 대시보드에서:

1. Network 탭에서 `/api/analytics/recommendation-metrics` 응답 확인
2. 각 날짜별 `clicks`, `impressions`, `ctr` 값 확인
3. `ctr = (clicks / impressions) × 100` 공식이 맞는지 확인
4. 전체 CTR 카드의 값이 `(총 클릭 / 총 노출) × 100`과 일치하는지 확인

## 🔍 추가 확인 사항

### 추천 영역 노출 추적

- [ ] 홈페이지에서 추천 영역이 처음 보일 때만 `impression` 호출되는지
- [ ] 페이지네이션으로 추천 게시물이 바뀌어도 중복 호출 안 되는지
- [ ] 상세페이지에서 추천 영역이 보일 때 `impression` 호출되는지
  - `sourcePostId`가 현재 post.id인지 확인

### 추천 알고리즘

- [ ] 추천 점수가 높은 순서로 정렬되어 있는지
- [ ] 추천 이유(`reasons`) 배열이 표시되는지 (선택사항)
- [ ] 지역 필터링이 올바르게 작동하는지

## 📝 테스트 결과 보고

### 문제 발견 시 알려주세요:

1. **어디서 문제 생겼는지** (홈페이지/상세페이지/관리자 페이지)
2. **스크린샷 or 에러 메시지**
3. **브라우저 콘솔 로그**
4. **Network 탭의 API 요청/응답** (가능하면)

### 문제 없으면:

"테스트 완료, 이상 없음" 한 줄이면 OK!

---

## 🎯 핵심 체크리스트

- [x] 홈페이지 추천 동작
- [x] 상세페이지 추천 동작 (더미 데이터 아님!)
- [x] 관리자 대시보드 CTR 계산 정확
- [x] 지역 매칭 정확 (경기도 ≠ 경상북도)
- [x] 성과지표 수집 정상
- [x] 추천 영역 노출 추적 중복 없음
- [x] 날짜 데이터 표시 정상

