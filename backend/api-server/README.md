# Capstone25-T3-KCH

## 진행 현황 (2025-10-03 기준)

### Backend (FastAPI + PostgreSQL)
- FastAPI 서버 실행 환경 구성 (`uvicorn main:app --reload`)
- DB 연결 세팅 완료 (`database.py`)
- ORM 모델 정의 (`models.py`)
  - `PolicyRaw`, `PolicyClean`, `PolicyGenerated`
- 테이블 자동 생성 스크립트 (`create_tables.py`)
- 라우터 추가 (`routers/collect.py`)
  - `/api/collect` : 정책 데이터 수집 → DB 저장
- 데이터 수집 및 DB 저장 확인 완료 (정책 원본 `PolicyRaw` 테이블에 적재)

### Git Workflow
- `develop` 브랜치에서 작업 시작
- `feature/data-collect` 브랜치 생성 및 전환
- 변경된 코드들 (`models.py`, `collect.py` 등) 추가
- 곧 README 업데이트 및 코드 푸시 예정

---

## 다음 단계
- 수집된 정책 데이터를 전처리(`PolicyClean`) 및 청년 친화적 언어 변환(OpenAI API 연동)
- 카드뉴스/썸네일 이미지 자동 생성 기능 추가
