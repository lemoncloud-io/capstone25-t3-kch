#!/bin/bash

###############################################################################
# 정책 자동 업데이트 크론잡 자동 설정 스크립트
#
# EC2에서 실행하여 크론잡을 자동으로 설정합니다.
#
# 사용법:
#   chmod +x setup_cron.sh
#   ./setup_cron.sh
###############################################################################

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 프로젝트 경로 설정
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}정책 자동 업데이트 크론잡 설정${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. Python 패키지 확인 및 설치
echo -e "${YELLOW}[1/6] Python 패키지 확인 중...${NC}"
cd "$PROJECT_DIR"

if [ -f "requirements.txt" ]; then
    pip3 install -q -r requirements.txt
    echo -e "${GREEN}✓ Python 패키지 설치 완료${NC}"
else
    echo -e "${RED}✗ requirements.txt 파일을 찾을 수 없습니다.${NC}"
    exit 1
fi

# 2. .env 파일 확인
echo -e "${YELLOW}[2/6] .env 파일 확인 중...${NC}"
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${RED}✗ .env 파일을 찾을 수 없습니다.${NC}"
    echo -e "${YELLOW}다음 환경 변수를 설정한 .env 파일을 생성하세요:${NC}"
    echo "  - DB_URL"
    echo "  - YOUTHCENTER_API_KEY"
    echo "  - OPENAI_API_KEY"
    exit 1
fi

# 필수 환경 변수 확인
source "$PROJECT_DIR/.env"
MISSING_VARS=()

if [ -z "$DB_URL" ]; then
    MISSING_VARS+=("DB_URL")
fi

if [ -z "$YOUTHCENTER_API_KEY" ]; then
    MISSING_VARS+=("YOUTHCENTER_API_KEY")
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${YELLOW}⚠ OPENAI_API_KEY가 설정되지 않았습니다. 블로그/썸네일 생성이 제한됩니다.${NC}"
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${RED}✗ 다음 환경 변수가 .env 파일에 없습니다:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

echo -e "${GREEN}✓ .env 파일 확인 완료${NC}"

# 3. 로그 디렉토리 생성
echo -e "${YELLOW}[3/6] 로그 디렉토리 생성 중...${NC}"
mkdir -p "$PROJECT_DIR/logs"
chmod 755 "$PROJECT_DIR/logs"
echo -e "${GREEN}✓ 로그 디렉토리 생성 완료${NC}"

# 4. 실행 권한 부여
echo -e "${YELLOW}[4/6] 실행 권한 부여 중...${NC}"
chmod +x "$PROJECT_DIR/jobs/update_policies.py"
echo -e "${GREEN}✓ 실행 권한 부여 완료${NC}"

# 5. 크론 헬퍼 스크립트 생성
echo -e "${YELLOW}[5/6] 크론 헬퍼 스크립트 생성 중...${NC}"

# Python 경로 찾기
PYTHON_BIN=$(which python3)

# 홈 디렉토리에 헬퍼 스크립트 생성
HELPER_SCRIPT="$HOME/run_policy_update.sh"

cat > "$HELPER_SCRIPT" << EOF
#!/bin/bash

# 프로젝트 경로
PROJECT_DIR="$PROJECT_DIR"

# Python 경로
PYTHON_BIN="$PYTHON_BIN"

# 로그 파일
LOG_FILE="\$PROJECT_DIR/logs/cron_output.log"
STATUS_FILE="\$PROJECT_DIR/logs/cron_status.log"

# .env 로드
cd \$PROJECT_DIR
if [ -f .env ]; then
    export \$(grep -v '^#' .env | xargs)
fi

# 시작 로그
echo "[START] \$(date '+%Y-%m-%d %H:%M:%S')" >> \$STATUS_FILE

# 정책 업데이트 실행
echo "[INFO] 정책 데이터 업데이트 시작..." >> \$LOG_FILE
\$PYTHON_BIN \$PROJECT_DIR/jobs/update_policies.py >> \$LOG_FILE 2>&1
POLICY_EXIT_CODE=\$?

# 정책 업데이트가 성공했으면 블로그도 생성
if [ \$POLICY_EXIT_CODE -eq 0 ]; then
    echo "[INFO] 정책 업데이트 완료. 블로그 생성 시작..." >> \$LOG_FILE
    \$PYTHON_BIN \$PROJECT_DIR/jobs/blog/generate_all_blogs.py >> \$LOG_FILE 2>&1
    BLOG_EXIT_CODE=\$?
    echo "[INFO] 블로그 생성 완료 (Exit code: \$BLOG_EXIT_CODE)" >> \$LOG_FILE
    EXIT_CODE=\$BLOG_EXIT_CODE
else
    echo "[ERROR] 정책 업데이트 실패 (Exit code: \$POLICY_EXIT_CODE). 블로그 생성을 건너뜁니다." >> \$LOG_FILE
    EXIT_CODE=\$POLICY_EXIT_CODE
fi

# 종료 상태 기록
echo "[END] \$(date '+%Y-%m-%d %H:%M:%S') - Exit code: \$EXIT_CODE" >> \$STATUS_FILE

exit \$EXIT_CODE
EOF

chmod +x "$HELPER_SCRIPT"
echo -e "${GREEN}✓ 크론 헬퍼 스크립트 생성 완료: $HELPER_SCRIPT${NC}"

# 6. Crontab 설정
echo -e "${YELLOW}[6/6] Crontab 설정 중...${NC}"

# 크론 시간 입력 받기
echo ""
echo -e "${BLUE}크론 실행 시간을 선택하세요:${NC}"
echo "  1) 매일 오전 3시 (권장)"
echo "  2) 매일 자정"
echo "  3) 매일 오전 9시"
echo "  4) 매 6시간마다"
echo "  5) 매 12시간마다"
echo "  6) 직접 입력"
echo ""

read -p "선택 (1-6): " CHOICE

case $CHOICE in
    1)
        CRON_TIME="0 3 * * *"
        CRON_DESC="매일 오전 3시"
        ;;
    2)
        CRON_TIME="0 0 * * *"
        CRON_DESC="매일 자정"
        ;;
    3)
        CRON_TIME="0 9 * * *"
        CRON_DESC="매일 오전 9시"
        ;;
    4)
        CRON_TIME="0 */6 * * *"
        CRON_DESC="매 6시간마다"
        ;;
    5)
        CRON_TIME="0 */12 * * *"
        CRON_DESC="매 12시간마다"
        ;;
    6)
        echo ""
        echo "크론 표현식을 입력하세요 (예: 0 3 * * *):"
        read -p "> " CRON_TIME
        CRON_DESC="사용자 정의"
        ;;
    *)
        echo -e "${RED}✗ 잘못된 선택입니다. 기본값(매일 오전 3시)을 사용합니다.${NC}"
        CRON_TIME="0 3 * * *"
        CRON_DESC="매일 오전 3시"
        ;;
esac

# 기존 크론 확인
CRON_ENTRY="$CRON_TIME $HELPER_SCRIPT"
EXISTING_CRON=$(crontab -l 2>/dev/null | grep -F "$HELPER_SCRIPT" || true)

if [ -n "$EXISTING_CRON" ]; then
    echo ""
    echo -e "${YELLOW}이미 등록된 크론잡이 있습니다:${NC}"
    echo "$EXISTING_CRON"
    echo ""
    read -p "덮어쓰시겠습니까? (y/N): " OVERWRITE
    
    if [ "$OVERWRITE" != "y" ] && [ "$OVERWRITE" != "Y" ]; then
        echo -e "${BLUE}크론잡 설정을 건너뜁니다.${NC}"
    else
        # 기존 크론 제거
        crontab -l 2>/dev/null | grep -v "$HELPER_SCRIPT" | crontab - || true
        # 새 크론 추가
        (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
        echo -e "${GREEN}✓ 크론잡 업데이트 완료 ($CRON_DESC)${NC}"
    fi
else
    # 크론 추가
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
    echo -e "${GREEN}✓ 크론잡 등록 완료 ($CRON_DESC)${NC}"
fi

# 완료
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ 크론잡 설정 완료!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 요약 정보 출력
echo -e "${YELLOW}[설정 요약]${NC}"
echo "  • 프로젝트 경로: $PROJECT_DIR"
echo "  • 헬퍼 스크립트: $HELPER_SCRIPT"
echo "  • 실행 스크립트: $PROJECT_DIR/jobs/update_policies.py"
echo "  • 실행 시간: $CRON_DESC ($CRON_TIME)"
echo "  • 로그 파일: $PROJECT_DIR/logs/"
echo ""

echo -e "${YELLOW}[다음 단계]${NC}"
echo "  1. FastAPI 서버가 24시간 실행 중인지 확인:"
echo "     ${BLUE}pm2 list${NC}"
echo ""
echo "  2. 테스트 실행:"
echo "     ${BLUE}$HELPER_SCRIPT${NC}"
echo "     또는"
echo "     ${BLUE}python3 $PROJECT_DIR/jobs/update_policies.py --dry-run${NC}"
echo ""
echo "  3. 크론 확인:"
echo "     ${BLUE}crontab -l${NC}"
echo ""
echo "  4. 로그 확인:"
echo "     ${BLUE}tail -f $PROJECT_DIR/logs/cron_output.log${NC}"
echo "     ${BLUE}tail -f $PROJECT_DIR/logs/cron_status.log${NC}"
echo ""

echo -e "${GREEN}설정이 완료되었습니다!${NC}"

