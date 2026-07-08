#!/bin/bash
set -e

PR_NUMBER="$1"

if [ -z "$PR_NUMBER" ]; then
  echo "使い方: ./scripts/review/codex_pr_review.sh <PR番号>"
  exit 1
fi

DIFF_FILE="/tmp/pr-${PR_NUMBER}-diff.txt"
PROMPT_FILE="/tmp/pr-${PR_NUMBER}-codex-review-prompt.txt"

echo "PR #${PR_NUMBER} の差分を取得します..."

gh pr diff "$PR_NUMBER" > "$DIFF_FILE"

cat > "$PROMPT_FILE" <<PROMPT
以下のPR差分をレビューしてください。

確認観点：
- Secret/APIキー混入
- 破壊的変更
- 本番デプロイ影響
- 自動送信/自動投稿の危険
- テスト不足
- 過剰設計
- 既存構成破壊
- 売上化への貢献度

最後に必ず GO / FIX / STOP で判定してください。

PR差分：
$(cat "$DIFF_FILE")
PROMPT

echo "Codexに非対話モードでレビュー依頼します..."

codex exec "$(cat "$PROMPT_FILE")"
