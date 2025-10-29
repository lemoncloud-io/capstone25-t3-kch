# Blog Posts ↔ Policies 관계 설계

## 데이터 모델

### 관계: Policy (1) → (N) Blog Posts

하나의 정책(`plcy_no`)에 여러 블로그 포스트가 연결될 수 있습니다.

```
policy_clean (정책)
  plcy_no: R2024010001 ─┐
                         ├─→ blog_posts (블로그 포스트 1): "청년 취업 지원금 신청 방법"
                         ├─→ blog_posts (블로그 포스트 2): "청년 취업 지원금 합격 후기"
                         └─→ blog_posts (블로그 포스트 3): "청년 취업 지원금 FAQ"
```

## 설계 근거

### ✅ 동일 정책에 여러 포스트가 필요한 이유

1. **시리즈 콘텐츠**
   - 신청 가이드, 합격 팁, 후기 등 다양한 관점
   - 초급/중급/고급 난이도별 설명

2. **업데이트 콘텐츠**
   - 정책 변경 시 새 포스트 발행
   - 과거 버전 포스트 유지 (히스토리)

3. **타겟별 콘텐츠**
   - 대학생용, 취준생용, 프리랜서용 등
   - 지역별 특화 정보

4. **형식별 콘텐츠**
   - 긴 설명 포스트
   - 요약 카드 뉴스 스타일
   - FAQ 형식

## 중복 방지 전략

### DB 레벨
```sql
-- slug로 포스트 자체의 고유성 보장
slug TEXT UNIQUE NOT NULL

-- plcy_no는 여러 포스트에서 참조 가능 (제약 없음)
plcy_no TEXT REFERENCES policy_clean(plcy_no) ON DELETE SET NULL
```

### Application 레벨 (Frontend)

```typescript
// 경고만 표시, 강제하지 않음
const checkDuplicateWarning = async (plcyNo: string, title: string) => {
  const existing = await getPosts({ plcyNo })

  const exactDuplicate = existing.find(p =>
    p.title === title && p.plcyNo === plcyNo
  )

  if (exactDuplicate) {
    toast.warning('동일한 정책과 제목의 포스트가 이미 있습니다.')
  }

  if (existing.length > 0) {
    toast.info(`이 정책에 대한 포스트가 ${existing.length}개 있습니다.`)
  }
}
```

## 실제 사용 예시

### 예시 1: 청년 취업 지원금 (R2024010001)

| ID | Slug | Title | plcy_no | Category |
|----|------|-------|---------|----------|
| 1 | youth-job-support-guide-1 | 청년 취업 지원금 완벽 가이드 | R2024010001 | 취업 |
| 2 | youth-job-support-tips-2 | 청년 취업 지원금 합격 팁 | R2024010001 | 취업 |
| 3 | youth-job-support-faq-3 | 청년 취업 지원금 자주 묻는 질문 | R2024010001 | 취업 |

### 예시 2: 청년 주거 지원 (R2024020001)

| ID | Slug | Title | plcy_no | Category |
|----|------|-------|---------|----------|
| 4 | youth-housing-seoul-4 | 서울시 청년 주거 지원 신청법 | R2024020001 | 주거 |
| 5 | youth-housing-busan-5 | 부산시 청년 주거 지원 신청법 | R2024020001 | 주거 |

### 예시 3: 정책 없는 일반 포스트

| ID | Slug | Title | plcy_no | Category |
|----|------|-------|---------|----------|
| 6 | job-interview-tips-6 | 면접 준비 완벽 가이드 | NULL | 취업 |
| 7 | resume-writing-guide-7 | 이력서 작성 팁 | NULL | 취업 |

## 제약 조건 요약

| 제약 | 적용 여부 | 이유 |
|------|----------|------|
| `slug` UNIQUE | ✅ 적용 | 각 포스트는 고유한 URL 필요 |
| `plcy_no` UNIQUE | ❌ 미적용 | 하나의 정책에 여러 포스트 허용 |
| `(plcy_no, title)` UNIQUE | ❌ 미적용 | 제목만 바꿔도 우회 가능, 유연성 저해 |

## 권장 워크플로우

### 정책 기반 포스트 생성

```
1. 정책 선택 (plcy_no 지정)
   ↓
2. LLM으로 초안 생성
   ↓
3. 기존 포스트 확인 (선택사항)
   - 같은 정책의 다른 포스트 참고
   - 중복 여부 확인
   ↓
4. 제목/내용 커스터마이징
   ↓
5. 발행
```

### 일반 포스트 생성

```
1. plcy_no 비워두기
   ↓
2. 자유롭게 작성
   ↓
3. 발행
```

## 향후 고려사항

### 포스트 그룹핑 기능 추가 (선택사항)

정책별 포스트 관리가 복잡해지면:

```sql
-- 포스트 시리즈 테이블 추가
CREATE TABLE post_series (
  id SERIAL PRIMARY KEY,
  plcy_no TEXT REFERENCES policy_clean(plcy_no),
  series_name TEXT,
  description TEXT
);

-- 포스트와 시리즈 연결
ALTER TABLE blog_posts
ADD COLUMN series_id INT REFERENCES post_series(id);
```

예:
```
Series: "청년 취업 지원금 완전정복" (plcy_no: R2024010001)
  ├─ Part 1: 신청 방법
  ├─ Part 2: 합격 팁
  └─ Part 3: 후기 모음
```

## 결론

**현재 설계는 적절합니다.**

- ✅ 유연성: 다양한 콘텐츠 전략 지원
- ✅ 확장성: 시리즈, 업데이트, 타겟별 포스트 가능
- ✅ 단순성: 복잡한 제약 없이 직관적
- ✅ 안전성: slug로 포스트 고유성 보장

중복 방지는 **UI 레벨에서 경고**로 충분합니다.
