#!/bin/bash
# git pre-push 훅에서 자동 실행되거나 직접 호출 가능
# 사용: bash scripts/discord-push-notify.sh [선택적 메모]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$ROOT_DIR/.env.local"

# .env.local 에서 DISCORD_WEBHOOK_URL 로드
if [ -f "$ENV_FILE" ]; then
  DISCORD_WEBHOOK_URL=$(grep -E '^DISCORD_WEBHOOK_URL=' "$ENV_FILE" | cut -d '=' -f2-)
fi

if [ -z "$DISCORD_WEBHOOK_URL" ]; then
  echo "[discord-notify] DISCORD_WEBHOOK_URL이 .env.local에 없어서 건너뜁니다."
  exit 0
fi

BRANCH=$(git -C "$ROOT_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
AUTHOR=$(git -C "$ROOT_DIR" config user.name 2>/dev/null || echo "unknown")
REPO=$(basename "$ROOT_DIR")
MEMO="${1:-}"

# 최근 커밋 5개
COMMITS=$(git -C "$ROOT_DIR" log --oneline -5 2>/dev/null | while IFS= read -r line; do echo "• $line"; done)

# jq로 JSON 안전하게 생성
FIELDS=$(jq -n \
  --arg branch "$BRANCH" \
  --arg author "$AUTHOR" \
  --arg commits "$COMMITS" \
  '[
    {"name": "브랜치", "value": ("`" + $branch + "`"), "inline": true},
    {"name": "작성자", "value": $author, "inline": true},
    {"name": "최근 커밋", "value": $commits}
  ]')

if [ -n "$MEMO" ]; then
  FIELDS=$(echo "$FIELDS" | jq --arg memo "$MEMO" '. + [{"name": "📝 메모", "value": $memo}]')
fi

PAYLOAD=$(jq -n \
  --arg repo "$REPO" \
  --argjson fields "$FIELDS" \
  '{
    "embeds": [{
      "title": ("🚀 Push — " + $repo),
      "color": 5763719,
      "fields": $fields,
      "timestamp": now | todate
    }]
  }')

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  "$DISCORD_WEBHOOK_URL")

if [[ "$HTTP_CODE" =~ ^2 ]]; then
  echo "[discord-notify] ✅ 디스코드 알림 전송 완료"
else
  echo "[discord-notify] ❌ 전송 실패 (HTTP $HTTP_CODE)"
fi
