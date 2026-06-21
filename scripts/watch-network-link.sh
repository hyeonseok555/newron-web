#!/usr/bin/env bash
set -euo pipefail

LOG_DIR="${LOG_DIR:-logs}"
LOG_FILE="${LOG_FILE:-$LOG_DIR/network-link-watch.log}"
PATTERN="${PATTERN:-r8169|Link is|Downshift|100Mbps|1Gbps}"

mkdir -p "$LOG_DIR"

{
  echo "============================================================"
  echo "네트워크 링크 실시간 감시 시작: $(date '+%Y-%m-%d %H:%M:%S %Z')"
  echo "로그 파일: $LOG_FILE"
  echo "감지 패턴: $PATTERN"
  echo "중지: Ctrl+C"
  echo "============================================================"
} | tee -a "$LOG_FILE"

journalctl -k -f --no-pager |
  grep --line-buffered -E "$PATTERN" |
  while IFS= read -r line; do
    printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$line" | tee -a "$LOG_FILE"
  done
