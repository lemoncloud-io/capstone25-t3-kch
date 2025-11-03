# 정책 자동 업데이트 크론잡 설정 가이드

## 개요

매일 자동으로 youthcenter.go.kr API에서 최신 정책을 가져와서:
1. 신규 정책을 DB에 저장
2. 썸네일 자동 생성
3. 블로그 자동 생성

## 전제 조건

### 1. Python 환경 설정
```bash
cd /home/ubuntu/capstone25-t3-kch-2/backend/api-server

# 필요한 패키지 설치 확인
pip install -r requirements.txt
pip install openai cachetools pillow  # 추가 패키지
```

### 2. .env 파일 설정
`.env` 파일에 다음 환경 변수가 설정되어 있어야 합니다:

```bash
# 필수
DB_URL=postgresql://user:password@localhost:5432/dbname
YOUTHCENTER_API_KEY=your_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# 선택 (기본값 있음)
PAGE_SIZE=50
MAX_PAGES=5
BACKEND_URL=http://localhost:8000
```

### 3. FastAPI 서버 실행 확인
크론잡이 썸네일 API를 호출하므로, FastAPI 서버가 24시간 실행 중이어야 합니다.

```bash
# PM2로 FastAPI 서버 실행 (권장)
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name api-server
pm2 save
pm2 startup
```

## 크론잡 설정

### 1. 스크립트 실행 권한 부여
```bash
chmod +x /home/ubuntu/capstone25-t3-kch-2/backend/api-server/jobs/update_policies.py
```

### 2. 크론잡 설정 파일 생성
```bash
# 크론 헬퍼 스크립트 생성
cat > /home/ubuntu/run_policy_update.sh << 'EOF'
#!/bin/bash

# 프로젝트 경로
PROJECT_DIR="/home/ubuntu/capstone25-t3-kch-2/backend/api-server"

# Python 경로 (가상환경 사용 시 수정)
PYTHON_BIN="/usr/bin/python3"

# .env 로드
cd $PROJECT_DIR
export $(grep -v '^#' .env | xargs)

# 스크립트 실행
$PYTHON_BIN $PROJECT_DIR/jobs/update_policies.py >> $PROJECT_DIR/logs/cron_output.log 2>&1

# 실행 결과 기록
echo "[$(date)] Cron job completed with exit code: $?" >> $PROJECT_DIR/logs/cron_status.log
EOF

chmod +x /home/ubuntu/run_policy_update.sh
```

### 3. Crontab 등록

```bash
# crontab 편집
crontab -e

# 다음 라인 추가 (매일 오전 3시 실행)
0 3 * * * /home/ubuntu/run_policy_update.sh

# 또는 매일 자정 실행
0 0 * * * /home/ubuntu/run_policy_update.sh

# 또는 매 6시간마다 실행
0 */6 * * * /home/ubuntu/run_policy_update.sh
```

### 4. 크론 시간 설정 예시

| 스케줄 | Cron 표현식 | 설명 |
|--------|-------------|------|
| 매일 오전 3시 | `0 3 * * *` | 새벽에 실행 (서버 부하 적음) |
| 매일 자정 | `0 0 * * *` | 자정에 실행 |
| 매일 오전 9시 | `0 9 * * *` | 아침에 실행 |
| 매 6시간마다 | `0 */6 * * *` | 하루 4회 실행 |
| 매 12시간마다 | `0 */12 * * *` | 하루 2회 실행 |

### 5. 크론 동작 확인

```bash
# 크론 등록 확인
crontab -l

# 크론 로그 확인
tail -f /var/log/syslog | grep CRON

# 스크립트 로그 확인
tail -f /home/ubuntu/capstone25-t3-kch-2/backend/api-server/logs/cron_output.log
tail -f /home/ubuntu/capstone25-t3-kch-2/backend/api-server/logs/cron_status.log
```

## 수동 실행 및 테스트

### 1. Dry-run 모드 (실제 저장 없이 테스트)
```bash
cd /home/ubuntu/capstone25-t3-kch-2/backend/api-server
python3 jobs/update_policies.py --dry-run
```

### 2. 페이지 제한 실행 (첫 1페이지만)
```bash
python3 jobs/update_policies.py --max-pages 1
```

### 3. 정상 실행
```bash
python3 jobs/update_policies.py
```

## 로그 확인

### 1. 크론 실행 로그
```bash
# 실시간 로그 보기
tail -f /home/ubuntu/capstone25-t3-kch-2/backend/api-server/logs/cron_output.log

# 오늘 날짜 정책 업데이트 로그
tail -f /home/ubuntu/capstone25-t3-kch-2/backend/api-server/logs/update_policies_$(date +%Y%m%d).log
```

### 2. 로그 파일 위치
- `/home/ubuntu/capstone25-t3-kch-2/backend/api-server/logs/update_policies_YYYYMMDD.log` - 일별 실행 로그
- `/home/ubuntu/capstone25-t3-kch-2/backend/api-server/logs/cron_output.log` - 크론 실행 출력
- `/home/ubuntu/capstone25-t3-kch-2/backend/api-server/logs/cron_status.log` - 크론 실행 상태

## 트러블슈팅

### 1. 크론이 실행되지 않는 경우
```bash
# 크론 서비스 상태 확인
sudo systemctl status cron

# 크론 서비스 재시작
sudo systemctl restart cron

# 환경 변수 확인
env | grep -E "(DB_URL|YOUTHCENTER|OPENAI)"
```

### 2. Python 모듈을 찾을 수 없는 경우
```bash
# run_policy_update.sh에서 PYTHONPATH 추가
export PYTHONPATH="/home/ubuntu/capstone25-t3-kch-2/backend/api-server:$PYTHONPATH"
```

### 3. DB 연결 실패
```bash
# PostgreSQL 상태 확인
sudo systemctl status postgresql

# DB 연결 테스트
psql $DB_URL -c "SELECT COUNT(*) FROM policy_raw;"
```

### 4. API 호출 실패
```bash
# FastAPI 서버 실행 확인
curl http://localhost:8000/api/health

# PM2 프로세스 확인
pm2 list
pm2 logs api-server
```

## PM2로 FastAPI 서버 24시간 실행

### 1. PM2 설치 (필요시)
```bash
npm install -g pm2
```

### 2. FastAPI 서버 실행
```bash
cd /home/ubuntu/capstone25-t3-kch-2/backend/api-server

# PM2로 실행
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name api-server

# 재부팅 시 자동 시작 설정
pm2 startup
pm2 save
```

### 3. PM2 관리 명령어
```bash
# 프로세스 목록
pm2 list

# 로그 보기
pm2 logs api-server

# 재시작
pm2 restart api-server

# 중지
pm2 stop api-server

# 삭제
pm2 delete api-server
```

## 시스템 리소스 모니터링

### 1. 로그 파일 용량 관리
```bash
# 30일 이전 로그 파일 삭제
find /home/ubuntu/capstone25-t3-kch-2/backend/api-server/logs -name "update_policies_*.log" -mtime +30 -delete

# 크론에 추가 (매주 일요일 자정)
0 0 * * 0 find /home/ubuntu/capstone25-t3-kch-2/backend/api-server/logs -name "update_policies_*.log" -mtime +30 -delete
```

### 2. 디스크 용량 확인
```bash
df -h
du -sh /home/ubuntu/capstone25-t3-kch-2/backend/api-server/logs
```

## 보안 권장 사항

### 1. .env 파일 권한 설정
```bash
chmod 600 /home/ubuntu/capstone25-t3-kch-2/backend/api-server/.env
```

### 2. 로그 파일 권한 설정
```bash
chmod 755 /home/ubuntu/capstone25-t3-kch-2/backend/api-server/logs
chmod 644 /home/ubuntu/capstone25-t3-kch-2/backend/api-server/logs/*.log
```

## 완료 체크리스트

- [ ] Python 패키지 설치 완료
- [ ] .env 파일 설정 완료
- [ ] FastAPI 서버 PM2로 실행 중
- [ ] update_policies.py 실행 권한 부여
- [ ] run_policy_update.sh 생성 및 권한 부여
- [ ] crontab 등록 완료
- [ ] dry-run 모드로 테스트 완료
- [ ] 실제 실행 테스트 완료
- [ ] 로그 확인 가능
- [ ] 크론 동작 확인 완료

## 예상 실행 시간

- API 조회: 5-10초/페이지 (페이지당 50개 정책)
- 신규 정책 1개당:
  - DB 저장: 0.1초
  - 썸네일 생성: 3-5초 (LLM 호출 포함)
  - 블로그 생성: 10-15초 (LLM 3회 호출)
- 신규 정책 10개 기준: 약 3-5분 소요

## 문의

문제가 발생하면 로그 파일을 확인하거나 다음 명령어로 디버깅하세요:

```bash
# 상세 로그 출력
python3 jobs/update_policies.py --dry-run 2>&1 | tee debug.log

# DB 확인
psql $DB_URL -c "SELECT plcy_no, title, created_at FROM policy_clean ORDER BY created_at DESC LIMIT 10;"

# 블로그 확인
psql $DB_URL -c "SELECT plcy_no, blog_title, generation_status, updated_at FROM blog_posts ORDER BY updated_at DESC LIMIT 10;"
```

