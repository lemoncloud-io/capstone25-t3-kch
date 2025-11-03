# EC2 배포 및 크론잡 설정 완전 가이드

## 🎯 목표

EC2에서 24시간 동안 다음 작업을 자동으로 수행:
1. FastAPI 서버 24시간 실행 (PM2)
2. 매일 자동으로 정책 업데이트 (크론잡)
3. 신규 정책에 대해 썸네일 + 블로그 자동 생성

---

## 📋 사전 준비

### 1. EC2 인스턴스 접속
```bash
ssh -i "your-key.pem" ubuntu@your-ec2-ip
```

### 2. 프로젝트 클론 (이미 되어 있다면 스킵)
```bash
cd ~
git clone https://github.com/your-repo/capstone25-t3-kch-2.git
cd capstone25-t3-kch-2/backend/api-server
```

### 3. 필수 패키지 설치
```bash
# Python 3 설치 확인
python3 --version

# pip 업그레이드
pip3 install --upgrade pip

# 프로젝트 패키지 설치
pip3 install -r requirements.txt
```

### 4. PostgreSQL 확인
```bash
# PostgreSQL 상태 확인
sudo systemctl status postgresql

# DB 접속 테스트
psql $DB_URL -c "SELECT COUNT(*) FROM policy_raw;"
```

### 5. .env 파일 설정
```bash
cd ~/capstone25-t3-kch-2/backend/api-server

# .env 파일 생성 (없다면)
cat > .env << 'EOF'
# Database
DB_URL=postgresql://user:password@localhost:5432/youth_policy

# API Keys
YOUTHCENTER_API_KEY=your_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Server
BACKEND_URL=http://localhost:8000

# 정책 수집 설정
PAGE_SIZE=50
MAX_PAGES=5
STORE_MODE=PG
EOF

# 권한 설정
chmod 600 .env
```

---

## 🚀 1단계: FastAPI 서버 PM2로 24시간 실행

### Node.js 및 PM2 설치
```bash
# Node.js 설치 (없다면)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 설치
sudo npm install -g pm2
```

### FastAPI 서버 PM2로 실행
```bash
cd ~/capstone25-t3-kch-2/backend/api-server

# PM2로 FastAPI 서버 시작
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name api-server

# 프로세스 확인
pm2 list

# 로그 확인
pm2 logs api-server

# 재부팅 시 자동 시작 설정
pm2 startup
pm2 save
```

### 서버 동작 확인
```bash
# Health check
curl http://localhost:8000/api/health

# 정책 목록 조회
curl http://localhost:8000/api/policies?limit=5
```

---

## ⏰ 2단계: 크론잡 자동 설정

### 방법 1: 자동 설정 스크립트 (권장)
```bash
cd ~/capstone25-t3-kch-2/backend/api-server

# 실행 권한 부여
chmod +x setup_cron.sh

# 자동 설정 실행
./setup_cron.sh
```

스크립트가 다음을 자동으로 처리합니다:
- ✅ Python 패키지 설치 확인
- ✅ .env 파일 검증
- ✅ 로그 디렉토리 생성
- ✅ 크론 헬퍼 스크립트 생성
- ✅ Crontab 등록 (대화형)

### 방법 2: 수동 설정
```bash
# 1. 헬퍼 스크립트 생성
cat > ~/run_policy_update.sh << 'EOF'
#!/bin/bash

PROJECT_DIR="$HOME/capstone25-t3-kch-2/backend/api-server"
PYTHON_BIN="/usr/bin/python3"

cd $PROJECT_DIR
export $(grep -v '^#' .env | xargs)

$PYTHON_BIN $PROJECT_DIR/jobs/update_policies.py >> $PROJECT_DIR/logs/cron_output.log 2>&1

echo "[$(date)] Exit code: $?" >> $PROJECT_DIR/logs/cron_status.log
EOF

chmod +x ~/run_policy_update.sh

# 2. Crontab 등록
crontab -e

# 다음 라인 추가 (매일 오전 3시 실행)
0 3 * * * /home/ubuntu/run_policy_update.sh
```

---

## 🧪 3단계: 테스트 및 검증

### 1. Dry-run 테스트 (실제 저장 없이)
```bash
cd ~/capstone25-t3-kch-2/backend/api-server

# 빠른 테스트 (기본 dry-run)
./test_update.sh

# 또는
python3 jobs/update_policies.py --dry-run --max-pages 1
```

### 2. 실제 실행 테스트
```bash
# 첫 1페이지만 실제 저장
python3 jobs/update_policies.py --max-pages 1

# 전체 실행
python3 jobs/update_policies.py
```

### 3. 크론 헬퍼 스크립트 테스트
```bash
~/run_policy_update.sh
```

### 4. 로그 확인
```bash
# 실시간 로그
tail -f ~/capstone25-t3-kch-2/backend/api-server/logs/cron_output.log

# 오늘 날짜 로그
tail -f ~/capstone25-t3-kch-2/backend/api-server/logs/update_policies_$(date +%Y%m%d).log

# 크론 상태
tail -f ~/capstone25-t3-kch-2/backend/api-server/logs/cron_status.log
```

---

## 📊 4단계: 모니터링 및 관리

### PM2 프로세스 관리
```bash
# 프로세스 목록
pm2 list

# 로그 확인
pm2 logs api-server

# 재시작
pm2 restart api-server

# 중지
pm2 stop api-server

# 삭제
pm2 delete api-server
```

### 크론잡 관리
```bash
# 크론 목록 확인
crontab -l

# 크론 편집
crontab -e

# 크론 서비스 상태
sudo systemctl status cron

# 크론 서비스 재시작
sudo systemctl restart cron

# 시스템 크론 로그
tail -f /var/log/syslog | grep CRON
```

### DB 확인
```bash
# 정책 개수 확인
psql $DB_URL -c "SELECT COUNT(*) FROM policy_raw;"
psql $DB_URL -c "SELECT COUNT(*) FROM policy_clean;"
psql $DB_URL -c "SELECT COUNT(*) FROM blog_posts;"

# 최신 정책 확인
psql $DB_URL -c "SELECT plcy_no, title, created_at FROM policy_clean ORDER BY created_at DESC LIMIT 5;"

# 블로그 생성 상태 확인
psql $DB_URL -c "SELECT generation_status, COUNT(*) FROM blog_posts GROUP BY generation_status;"
```

---

## 🔧 트러블슈팅

### 문제 1: 크론이 실행되지 않음
```bash
# 크론 서비스 확인
sudo systemctl status cron
sudo systemctl restart cron

# 크론 로그 확인
tail -f /var/log/syslog | grep CRON

# 헬퍼 스크립트 수동 실행
~/run_policy_update.sh
```

### 문제 2: Python 모듈을 찾을 수 없음
```bash
# Python 경로 확인
which python3

# 모듈 설치 확인
pip3 list | grep -E "(fastapi|sqlalchemy|openai)"

# 재설치
cd ~/capstone25-t3-kch-2/backend/api-server
pip3 install -r requirements.txt
```

### 문제 3: DB 연결 실패
```bash
# PostgreSQL 상태 확인
sudo systemctl status postgresql

# DB URL 확인
echo $DB_URL

# DB 접속 테스트
psql $DB_URL -c "SELECT 1;"
```

### 문제 4: API 호출 실패 (썸네일 생성)
```bash
# FastAPI 서버 확인
curl http://localhost:8000/api/health

# PM2 상태 확인
pm2 list
pm2 logs api-server

# 포트 확인
netstat -tulpn | grep 8000
```

### 문제 5: OpenAI API 에러
```bash
# API 키 확인
echo $OPENAI_API_KEY

# .env 파일 확인
cat ~/capstone25-t3-kch-2/backend/api-server/.env | grep OPENAI
```

---

## 📝 로그 파일 관리

### 로그 자동 정리 (30일 이전 삭제)
```bash
# 크론에 추가 (매주 일요일 자정)
crontab -e

# 다음 라인 추가
0 0 * * 0 find ~/capstone25-t3-kch-2/backend/api-server/logs -name "update_policies_*.log" -mtime +30 -delete
```

### 디스크 용량 확인
```bash
# 전체 디스크 사용량
df -h

# 로그 디렉토리 용량
du -sh ~/capstone25-t3-kch-2/backend/api-server/logs
```

---

## ✅ 최종 체크리스트

배포 완료 후 다음을 확인하세요:

- [ ] EC2 인스턴스 접속 가능
- [ ] PostgreSQL 정상 동작
- [ ] .env 파일 설정 완료
- [ ] Python 패키지 설치 완료
- [ ] PM2로 FastAPI 서버 24시간 실행 중
- [ ] `curl http://localhost:8000/api/health` 응답 정상
- [ ] 크론잡 등록 완료 (`crontab -l`)
- [ ] Dry-run 테스트 성공
- [ ] 실제 실행 테스트 성공
- [ ] 로그 파일 생성 확인
- [ ] DB에 신규 정책 저장 확인
- [ ] 썸네일 생성 확인 (S3 또는 로컬)
- [ ] 블로그 생성 확인 (blog_posts 테이블)

---

## 🎉 완료!

이제 EC2에서 24시간 자동으로:
- ✅ FastAPI 서버가 실행됩니다
- ✅ 매일 정해진 시간에 정책을 자동 수집합니다
- ✅ 신규 정책에 대해 썸네일과 블로그를 자동 생성합니다

---

## 📚 추가 자료

- [CRON_SETUP.md](./CRON_SETUP.md) - 상세 크론잡 설정 가이드
- [README.md](./README.md) - 프로젝트 전체 문서
- [jobs/update_policies.py](./jobs/update_policies.py) - 크론잡 스크립트 코드

---

## 💡 유용한 명령어 모음

```bash
# 시스템 전체 상태 확인
echo "=== PM2 프로세스 ===" && pm2 list && \
echo "=== 크론잡 ===" && crontab -l && \
echo "=== DB 정책 개수 ===" && psql $DB_URL -c "SELECT COUNT(*) FROM policy_clean;" && \
echo "=== 최근 로그 ===" && tail -5 ~/capstone25-t3-kch-2/backend/api-server/logs/cron_status.log

# 로그 실시간 모니터링
tail -f ~/capstone25-t3-kch-2/backend/api-server/logs/cron_output.log

# 수동 정책 업데이트 (긴급)
cd ~/capstone25-t3-kch-2/backend/api-server && python3 jobs/update_policies.py
```

---

문제가 발생하면 로그를 확인하고, 이 가이드의 트러블슈팅 섹션을 참조하세요!

