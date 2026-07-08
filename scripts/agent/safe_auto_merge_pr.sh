#!/usr/bin/env bash
# safe_auto_merge_pr.sh
# 指定PRが安全条件を全て満たす場合のみ squash merge する
# 使い方: ./scripts/agent/safe_auto_merge_pr.sh <PR番号>
#         DRY_RUN=1 ./scripts/agent/safe_auto_merge_pr.sh <PR番号>

set -euo pipefail

# ── 定数 ────────────────────────────────────────────────────────────────────

REQUIRED_LABEL="safe-auto-merge"

ALLOWED_PATTERNS=(
  "^docs/"
  "^templates/"
  "^reports/"
  "^README\.md$"
  "^TASK\.md$"
  "^REPORT\.md$"
  "^\.github/pull_request_template\.md$"
)

DANGER_KEYWORDS=(
  "deploy"
  "scheduler"
  " send\b"
  "payment"
  "auth"
  "customer"
)

SECRET_PATTERNS=(
  "[A-Za-z0-9_]{20,}=[A-Za-z0-9+/]{20,}"
  "sk-[A-Za-z0-9]{20,}"
  "ghp_[A-Za-z0-9]{36}"
  "xoxb-[0-9]+-[A-Za-z0-9]+"
  "Bearer [A-Za-z0-9._\-]{20,}"
  "token[[:space:]]*=[[:space:]]*['\"][A-Za-z0-9._\-]{16,}"
  "api[_-]?key[[:space:]]*=[[:space:]]*['\"][A-Za-z0-9._\-]{16,}"
)

# ── ヘルパー ─────────────────────────────────────────────────────────────────

RED='\033[0;31m'
GRN='\033[0;32m'
YLW='\033[1;33m'
BLD='\033[1m'
RST='\033[0m'

ok()   { echo -e "  ${GRN}✓${RST} $*"; }
fail() { echo -e "  ${RED}✗${RST} $*"; }
info() { echo -e "  ${YLW}→${RST} $*"; }

stop() {
  echo ""
  echo -e "${RED}${BLD}━━━ STOP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}"
  echo -e "${RED}${BLD}  自動Mergeを中止しました${RST}"
  echo -e "${RED}  理由: $*${RST}"
  echo -e "${RED}${BLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}"
  echo ""
  exit 1
}

# ── 引数チェック ──────────────────────────────────────────────────────────────

if [[ $# -lt 1 ]]; then
  echo "使い方: $0 <PR番号>"
  echo "        DRY_RUN=1 $0 <PR番号>"
  exit 1
fi

PR_NUMBER="$1"
DRY_RUN="${DRY_RUN:-0}"

echo ""
echo -e "${BLD}━━━ Safe Auto Merge Gate ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}"
echo -e "  PR番号  : #${PR_NUMBER}"
echo -e "  DRY_RUN : ${DRY_RUN}"
echo -e "${BLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}"
echo ""

# gh コマンド確認
if ! command -v gh &>/dev/null; then
  stop "gh コマンドが見つかりません。GitHub CLI をインストールしてください。"
fi

# ── PR情報取得 ───────────────────────────────────────────────────────────────

echo -e "${BLD}[1/7] PR情報を取得${RST}"

PR_JSON=$(gh pr view "$PR_NUMBER" \
  --json title,state,mergeable,labels,files \
  2>/dev/null) || stop "PR #${PR_NUMBER} の取得に失敗しました（存在しない or 権限なし）"

PR_TITLE=$(echo "$PR_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['title'])")
PR_STATE=$(echo "$PR_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['state'])")
PR_MERGEABLE=$(echo "$PR_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['mergeable'])")
PR_LABELS=$(echo "$PR_JSON" | python3 -c "import json,sys; [print(l['name']) for l in json.load(sys.stdin)['labels']]")
PR_FILES=$(echo "$PR_JSON" | python3 -c "import json,sys; [print(f['path']) for f in json.load(sys.stdin)['files']]")

info "タイトル : ${PR_TITLE}"
info "状態     : ${PR_STATE}"
info "マージ可 : ${PR_MERGEABLE}"
info "ラベル   : $(echo "$PR_LABELS" | tr '\n' ' ')"
info "変更ファイル数 : $(echo "$PR_FILES" | wc -l | tr -d ' ')件"

echo ""
echo -e "${BLD}[2/7] ラベルチェック: ${REQUIRED_LABEL}${RST}"

if echo "$PR_LABELS" | grep -qx "$REQUIRED_LABEL"; then
  ok "ラベル '${REQUIRED_LABEL}' あり"
else
  stop "ラベル '${REQUIRED_LABEL}' がありません。自動Mergeは禁止です。"
fi

# ── PRが open か確認 ──────────────────────────────────────────────────────────

echo ""
echo -e "${BLD}[3/7] PR状態チェック${RST}"

if [[ "$PR_STATE" != "OPEN" ]]; then
  stop "PRが OPEN ではありません（状態: ${PR_STATE}）"
fi
ok "PR は OPEN"

if [[ "$PR_MERGEABLE" != "MERGEABLE" ]]; then
  stop "PRがマージ不可能な状態です（mergeable: ${PR_MERGEABLE}）。コンフリクトまたはCI未通過の可能性があります。"
fi
ok "PR はマージ可能"

# ── 変更ファイルのパスチェック ────────────────────────────────────────────────

echo ""
echo -e "${BLD}[4/7] 変更ファイル パスチェック${RST}"

OUTSIDE_FILES=()
while IFS= read -r filepath; do
  [[ -z "$filepath" ]] && continue
  matched=0
  for pattern in "${ALLOWED_PATTERNS[@]}"; do
    if echo "$filepath" | grep -qE "$pattern"; then
      matched=1
      break
    fi
  done
  if [[ "$matched" -eq 0 ]]; then
    OUTSIDE_FILES+=("$filepath")
  fi
done <<< "$PR_FILES"

if [[ ${#OUTSIDE_FILES[@]} -gt 0 ]]; then
  echo ""
  for f in "${OUTSIDE_FILES[@]}"; do
    fail "許可範囲外: $f"
  done
  stop "許可範囲外のファイルが含まれています（${#OUTSIDE_FILES[@]}件）"
fi
ok "全ファイルが許可パス内"

# ── 削除ファイルチェック ──────────────────────────────────────────────────────

echo ""
echo -e "${BLD}[5/7] 削除ファイルチェック${RST}"

DELETED_FILES=$(gh pr diff "$PR_NUMBER" 2>/dev/null \
  | grep -E "^diff --git" \
  | awk '{print $3}' \
  | sed 's|^a/||' \
  | while read -r f; do
      if gh pr diff "$PR_NUMBER" 2>/dev/null \
        | grep -A5 "diff --git a/$f" \
        | grep -q "^deleted file"; then
        echo "$f"
      fi
    done) || true

if [[ -n "$DELETED_FILES" ]]; then
  echo ""
  while IFS= read -r f; do
    [[ -z "$f" ]] && continue
    fail "削除ファイル検出: $f"
  done <<< "$DELETED_FILES"
  stop "削除ファイルが含まれています。自動Mergeは禁止です。"
fi
ok "削除ファイルなし"

# ── .env ファイルチェック ──────────────────────────────────────────────────────

echo ""
echo -e "${BLD}[6/7] .env / Secret パスチェック${RST}"

ENV_FILES=()
while IFS= read -r filepath; do
  [[ -z "$filepath" ]] && continue
  if echo "$filepath" | grep -qE "(^|/)\.env(\.|$)"; then
    ENV_FILES+=("$filepath")
  fi
done <<< "$PR_FILES"

if [[ ${#ENV_FILES[@]} -gt 0 ]]; then
  for f in "${ENV_FILES[@]}"; do
    fail ".env ファイル検出: $f"
  done
  stop ".env ファイルが含まれています。"
fi
ok ".env ファイルなし"

# ── Secret / 危険キーワードチェック（diff内容） ────────────────────────────────

echo ""
echo -e "${BLD}[7/7] diff内容チェック（Secret / 危険キーワード）${RST}"

PR_DIFF=$(gh pr diff "$PR_NUMBER" 2>/dev/null) || true

SECRET_FOUND=()
for pattern in "${SECRET_PATTERNS[@]}"; do
  matches=$(echo "$PR_DIFF" | grep -E "^\+" | grep -vE "^\+\+\+" | grep -oE "$pattern" | head -3 || true)
  if [[ -n "$matches" ]]; then
    SECRET_FOUND+=("パターン: ${pattern} → ${matches:0:40}...")
  fi
done

if [[ ${#SECRET_FOUND[@]} -gt 0 ]]; then
  for s in "${SECRET_FOUND[@]}"; do
    fail "Secret疑い: $s"
  done
  stop "Secret/APIキーらしき文字列が検出されました。"
fi
ok "Secretパターンなし"

DANGER_FOUND=()
for kw in "${DANGER_KEYWORDS[@]}"; do
  matches=$(echo "$PR_DIFF" | grep -E "^\+" | grep -vE "^\+\+\+" | grep -iE "$kw" | head -3 || true)
  if [[ -n "$matches" ]]; then
    DANGER_FOUND+=("キーワード '${kw}' を検出")
  fi
done

if [[ ${#DANGER_FOUND[@]} -gt 0 ]]; then
  for d in "${DANGER_FOUND[@]}"; do
    fail "$d"
  done
  stop "危険キーワードが diff に含まれています（deploy / scheduler / send / payment / auth / customer 系）"
fi
ok "危険キーワードなし"

# ── 全チェック通過 ────────────────────────────────────────────────────────────

echo ""
echo -e "${GRN}${BLD}━━━ 全チェック通過 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}"

if [[ "$DRY_RUN" == "1" ]]; then
  echo -e "${YLW}${BLD}  [DRY_RUN] Merge はスキップされました${RST}"
  echo -e "${YLW}  実際にMergeするには DRY_RUN なしで再実行してください${RST}"
  echo -e "${GRN}${BLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}"
  echo ""
  exit 0
fi

echo -e "  PR #${PR_NUMBER} を squash merge します..."
echo ""

gh pr merge "$PR_NUMBER" --squash --delete-branch

echo ""
echo -e "${GRN}${BLD}  Merge 完了: PR #${PR_NUMBER}${RST}"
echo -e "${GRN}${BLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}"
echo ""
