#!/bin/bash

###############################################################################
# 정책 업데이트 스크립트 테스트
#
# 사용법:
#   chmod +x test_update.sh
#   ./test_update.sh [옵션]
#
# 옵션:
#   --dry-run      : 실제 저장 없이 테스트
#   --max-pages N  : N 페이지만 조회
###############################################################################

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 프로젝트 경로
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}정책 업데이트 스크립트 테스트${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# .env 로드
if [ -f "$SCRIPT_DIR/.env" ]; then
    source "$SCRIPT_DIR/.env"
    echo -e "${GREEN}✓ .env 파일 로드 완료${NC}"
else
    echo -e "${YELLOW}⚠ .env 파일을 찾을 수 없습니다.${NC}"
fi

# Python 경로
PYTHON_BIN=$(which python3)

# 인자 처리
ARGS="$@"

# 기본값: dry-run + max-pages 1
if [ -z "$ARGS" ]; then
    ARGS="--dry-run --max-pages 1"
    echo -e "${YELLOW}기본 옵션 사용: --dry-run --max-pages 1${NC}"
fi

echo -e "${BLUE}실행 명령어:${NC}"
echo "$PYTHON_BIN $SCRIPT_DIR/jobs/update_policies.py $ARGS"
echo ""

# 실행
cd "$SCRIPT_DIR"
$PYTHON_BIN "$SCRIPT_DIR/jobs/update_policies.py" $ARGS

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ 테스트 완료 (Exit code: $EXIT_CODE)${NC}"
else
    echo -e "${YELLOW}⚠ 테스트 실패 (Exit code: $EXIT_CODE)${NC}"
fi

echo ""
echo -e "${BLUE}로그 확인:${NC}"
echo "  tail -f $SCRIPT_DIR/logs/update_policies_$(date +%Y%m%d).log"
echo ""

exit $EXIT_CODE

