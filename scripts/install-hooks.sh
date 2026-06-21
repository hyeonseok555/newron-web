#!/bin/bash
# git 훅 설치 스크립트
# 사용: bash scripts/install-hooks.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
HOOKS_DIR="$ROOT_DIR/.git/hooks"

if [ ! -d "$HOOKS_DIR" ]; then
  echo "❌ .git/hooks 디렉토리를 찾을 수 없습니다. git 저장소인지 확인하세요."
  exit 1
fi

cat > "$HOOKS_DIR/pre-push" <<'HOOK'
#!/bin/bash
# 메모를 포함하려면: PUSH_MEMO="배포 메모" git push
bash "$(git rev-parse --show-toplevel)/scripts/discord-push-notify.sh" "${PUSH_MEMO:-}"
exit 0
HOOK

chmod +x "$HOOKS_DIR/pre-push"
echo "✅ pre-push 훅 설치 완료 → .git/hooks/pre-push"
echo ""
echo "이제 git push 할 때마다 Discord 알림이 전송됩니다."
echo "메모를 포함하려면:"
echo "  PUSH_MEMO=\"배포 완료\" git push"
