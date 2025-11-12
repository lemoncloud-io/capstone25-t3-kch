#!/bin/bash

###############################################################################
# 썸네일 생성 누락 문제 해결 스크립트
#
# EC2에서 실행하여 기존 크론잡 헬퍼 스크립트에 썸네일 생성 로직을 추가합니다.
#
# 사용법:
#   chmod +x fix_cron_thumbnail.sh
#   ./fix_cron_thumbnail.sh
###############################################################################

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}썸네일 생성 크론잡 업데이트${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 프로젝트 경로 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
HELPER_SCRIPT="$HOME/run_policy_update.sh"

if [ ! -f "$HELPER_SCRIPT" ]; then
    echo -e "${RED}✗ 크론잡 헬퍼 스크립트를 찾을 수 없습니다: $HELPER_SCRIPT${NC}"
    echo -e "${YELLOW}먼저 setup_cron.sh를 실행해주세요.${NC}"
    exit 1
fi

echo -e "${YELLOW}[1/3] 기존 헬퍼 스크립트 백업 중...${NC}"
cp "$HELPER_SCRIPT" "$HELPER_SCRIPT.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${GREEN}✓ 백업 완료: $HELPER_SCRIPT.backup.*${NC}"

echo -e "${YELLOW}[2/3] 헬퍼 스크립트 업데이트 중...${NC}"

# Python 경로 찾기
PYTHON_BIN=$(which python3)

# 업데이트된 헬퍼 스크립트 생성
cat > "$HELPER_SCRIPT" << 'EOF'
#!/bin/bash

# 프로젝트 경로
PROJECT_DIR="PROJECT_DIR_PLACEHOLDER"

# Python 경로
PYTHON_BIN="PYTHON_BIN_PLACEHOLDER"

# 로그 파일
LOG_FILE="$PROJECT_DIR/logs/cron_output.log"
STATUS_FILE="$PROJECT_DIR/logs/cron_status.log"

# .env 로드
cd $PROJECT_DIR
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# 시작 로그
echo "[START] $(date '+%Y-%m-%d %H:%M:%S')" >> $STATUS_FILE

# 정책 업데이트 실행
echo "[INFO] 정책 데이터 업데이트 시작..." >> $LOG_FILE
$PYTHON_BIN $PROJECT_DIR/jobs/update_policies.py >> $LOG_FILE 2>&1
POLICY_EXIT_CODE=$?

# 정책 업데이트가 성공했으면 블로그도 생성
if [ $POLICY_EXIT_CODE -eq 0 ]; then
    echo "[INFO] 정책 업데이트 완료. 블로그 생성 시작..." >> $LOG_FILE
    $PYTHON_BIN $PROJECT_DIR/jobs/blog/generate_all_blogs.py >> $LOG_FILE 2>&1
    BLOG_EXIT_CODE=$?
    echo "[INFO] 블로그 생성 완료 (Exit code: $BLOG_EXIT_CODE)" >> $LOG_FILE
    
    # 블로그 생성이 성공했으면 썸네일도 생성
    if [ $BLOG_EXIT_CODE -eq 0 ]; then
        echo "[INFO] 썸네일 생성 시작..." >> $LOG_FILE
        $PYTHON_BIN $PROJECT_DIR/jobs/thumbnail_refresh.py >> $LOG_FILE 2>&1
        THUMBNAIL_EXIT_CODE=$?
        echo "[INFO] 썸네일 생성 완료 (Exit code: $THUMBNAIL_EXIT_CODE)" >> $LOG_FILE
        EXIT_CODE=$THUMBNAIL_EXIT_CODE
    else
        echo "[ERROR] 블로그 생성 실패 (Exit code: $BLOG_EXIT_CODE). 썸네일 생성을 건너뜁니다." >> $LOG_FILE
        EXIT_CODE=$BLOG_EXIT_CODE
    fi
else
    echo "[ERROR] 정책 업데이트 실패 (Exit code: $POLICY_EXIT_CODE). 블로그 생성을 건너뜁니다." >> $LOG_FILE
    EXIT_CODE=$POLICY_EXIT_CODE
fi

# 종료 상태 기록
echo "[END] $(date '+%Y-%m-%d %H:%M:%S') - Exit code: $EXIT_CODE" >> $STATUS_FILE

exit $EXIT_CODE
EOF

# 플레이스홀더 치환
sed -i "s|PROJECT_DIR_PLACEHOLDER|$PROJECT_DIR|g" "$HELPER_SCRIPT"
sed -i "s|PYTHON_BIN_PLACEHOLDER|$PYTHON_BIN|g" "$HELPER_SCRIPT"

chmod +x "$HELPER_SCRIPT"
echo -e "${GREEN}✓ 헬퍼 스크립트 업데이트 완료${NC}"

echo -e "${YELLOW}[3/3] 테스트 실행 중...${NC}"
echo ""
echo -e "${BLUE}기존 블로그 글 중 썸네일이 없는 항목에 대해 썸네일을 생성합니다.${NC}"
echo -e "${BLUE}DRY-RUN 모드로 테스트하려면 다음 명령을 실행하세요:${NC}"
echo -e "  ${YELLOW}python3 $PROJECT_DIR/jobs/thumbnail_refresh.py --dry-run${NC}"
echo ""

read -p "지금 썸네일 생성을 실행하시겠습니까? (y/N): " RUN_NOW

if [ "$RUN_NOW" = "y" ] || [ "$RUN_NOW" = "Y" ]; then
    echo ""
    echo -e "${BLUE}썸네일 생성 중...${NC}"
    $PYTHON_BIN "$PROJECT_DIR/jobs/thumbnail_refresh.py"
    echo ""
    echo -e "${GREEN}✓ 썸네일 생성 완료!${NC}"
else
    echo -e "${YELLOW}나중에 수동으로 실행하려면:${NC}"
    echo -e "  ${BLUE}python3 $PROJECT_DIR/jobs/thumbnail_refresh.py${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ 크론잡 업데이트 완료!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}[업데이트 내용]${NC}"
echo "  • 블로그 생성 후 자동으로 썸네일도 생성됩니다"
echo "  • 헬퍼 스크립트: $HELPER_SCRIPT"
echo "  • 백업 파일: $HELPER_SCRIPT.backup.*"
echo ""

echo -e "${YELLOW}[다음 단계]${NC}"
echo "  1. 크론잡은 이미 등록되어 있으므로 추가 작업 불필요"
echo "  2. 다음 크론잡 실행 시 자동으로 썸네일이 생성됩니다"
echo ""
echo "  3. 로그 확인:"
echo "     ${BLUE}tail -f $PROJECT_DIR/logs/cron_output.log${NC}"
echo ""

echo -e "${GREEN}수정이 완료되었습니다!${NC}"

