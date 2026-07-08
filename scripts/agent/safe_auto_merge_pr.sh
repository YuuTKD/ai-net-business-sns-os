#!/usr/bin/env bash
# safe_auto_merge_pr.sh
# Safe Merge Audit Gate / audit-only mode
#
# 目的:
#   指定PRが「低リスクMerge候補」かを判定する。
#   この版では自動Mergeは実行しない。Merge可否の監査と人間実行用コマンド表示のみ行う。
#
# 使い方:
#   ./scripts/agent/safe_auto_merge_pr.sh <PR番号>

set -euo pipefail

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

BLOCKED_PATH_PATTERNS=(
  "(^|/)\.env($|\.)"
  "(^|/)apps/"
  "(^|/)workflows/"
  "(^|/)cloudrun/"
  "(^|/)scheduler/"
  "(^|/)scripts/send/"
  "(^|/)scripts/deploy/"
  "(^|/)gmail/"
  "(^|/)line/"
  "(^|/)payment/"
  "(^|/)auth/"
  "(^|/)customer/"
)

DANGER_REGEXES=(
  "(^|[^[:alnum:]_])secret([^[:alnum:]_]|$)"
  "(^|[^[:alnum:]_])token([^[:alnum:]_]|$)"
  "(^|[^[:alnum:]_])credential([^[:alnum:]_]|$)"
  "(^|[^[:alnum:]_])password([^[:alnum:]_]|$)"
  "(^|[^[:alnum:]_])private_key([^[:alnum:]_]|$)"
  "(^|[^[:alnum:]_])deploy([^[:alnum:]_]|$)"
  "(^|[^[:alnum:]_])scheduler([^[:alnum:]_]|$)"
  "(^|[^[:alnum:]_])payment([^[:alnum:]_]|$)"
  "(^|[^[:alnum:]_])auth([^[:alnum:]_]|$)"
  "(^|[^[:alnum:]_])customer([^[:alnum:]_]|$)"
  "(^|[^[:alnum:]_])send([^[:alnum:]_]|$)"
  "(^|[^[:alnum:]_])post([^[:alnum:]_]|$)"
  "(^|[^[:alnum:]_])dm([^[:alnum:]_]|$)"
  "(^|[^[:alnum:]_])mail([^[:alnum:]_]|$)"
  "(^|[^[:alnum:]_])webhook([^[:alnum:]_]|$)"
  "(^|[^[:alnum:]_])stripe([^[:alnum:]_]|$)"
  "(^|[^[:alnum:]_])aws([^[:alnum:]_]|$)"
  "(^|[^[:alnum:]_])firebase([^[:alnum:]_]|$)"
  "(^|[^[:alnum:]_])line([^[:alnum:]_]|$)"
  "(^|[^[:alnum:]_])slack([^[:alnum:]_]|$)"
)

SECRET_PATTERNS=(
  "sk-[A-Za-z0-9]{20,}"
  "ghp_[A-Za-z0-9]{20,}"
  "gho_[A-Za-z0-9]{20,}"
  "github_pat_[A-Za-z0-9_]{20,}"
  "xox[baprs]-[A-Za-z0-9-]{20,}"
  "Bearer[[:space:]]+[A-Za-z0-9._-]{20,}"
  "-----BEGIN[[:space:]]+([A-Z0-9 ]+)?PRIVATE[[:space:]]+KEY-----"
  "api[_-]?key[[:space:]]*[:=][[:space:]]*['\"]?[A-Za-z0-9._-]{16,}['\"]?"
  "token[[:space:]]*[:=][[:space:]]*['\"]?[A-Za-z0-9._-]{16,}['\"]?"
  "secret[[:space:]]*[:=][[:space:]]*['\"]?[A-Za-z0-9._-]{16,}['\"]?"
)

RED='\033[0;31m'
GRN='\033[0;32m'
YLW='\033[1;33m'
BLD='\033[1m'
RST='\033[0m'

ok()   { echo -e "  ${GRN}✓${RST} $*"; }
info() { echo -e "  ${YLW}→${RST} $*"; }

stop() {
  echo ""
  echo -e "${RED}${BLD}━━━ STOP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}"
  echo -e "${RED}${BLD}  Merge監査で停止しました${RST}"
  echo -e "${RED}  理由: $*${RST}"
  echo -e "${RED}${BLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}"
  echo ""
  exit 1
}

if [[ $# -lt 1 ]]; then
  echo "使い方: $0 <PR番号>"
  exit 1
fi

PR_NUMBER="$1"
AUTO_MERGE="${AUTO_MERGE:-0}"

echo ""
echo -e "${BLD}━━━ Safe Merge Audit Gate ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}"
echo -e "  PR番号: #${PR_NUMBER}"
echo -e "  AUTO_MERGE: ${AUTO_MERGE}"
echo -e "  注意  : 通常は監査のみ。AUTO_MERGE=1 の時だけMergeします"
echo -e "${BLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}"
echo ""

command -v gh >/dev/null 2>&1 || stop "gh コマンドが見つかりません。"
command -v python3 >/dev/null 2>&1 || stop "python3 が見つかりません。"

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null) \
  || stop "GitHubリポジトリ情報を取得できません。"

echo -e "${BLD}[1/7] PR情報取得${RST}"

PR_JSON=$(gh pr view "$PR_NUMBER" --json title,state,mergeable,labels 2>/dev/null) \
  || stop "PR #${PR_NUMBER} を取得できません。"

PR_TITLE=$(echo "$PR_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['title'])")
PR_STATE=$(echo "$PR_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['state'])")
PR_MERGEABLE=$(echo "$PR_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['mergeable'])")
PR_LABELS=$(echo "$PR_JSON" | python3 -c "import json,sys; [print(l['name']) for l in json.load(sys.stdin)['labels']]")

PR_FILE_STATUS=$(gh api --paginate "repos/${REPO}/pulls/${PR_NUMBER}/files" \
  --jq '.[] | "\(.status)\t\(.filename)"' 2>/dev/null) \
  || stop "PRファイル一覧をGitHub APIから取得できません。"

PR_FILES=$(echo "$PR_FILE_STATUS" | cut -f2-)

info "タイトル : ${PR_TITLE}"
info "状態     : ${PR_STATE}"
info "mergeable: ${PR_MERGEABLE}"
info "ラベル   : $(echo "$PR_LABELS" | tr '\n' ' ')"
info "ファイル : $(echo "$PR_FILES" | wc -l | tr -d ' ')件"

echo ""
echo -e "${BLD}[2/7] ラベル確認${RST}"

echo "$PR_LABELS" | grep -qx "$REQUIRED_LABEL" \
  || stop "必須ラベル '${REQUIRED_LABEL}' がありません。"
ok "必須ラベルあり"

echo ""
echo -e "${BLD}[3/7] PR状態確認${RST}"

[[ "$PR_STATE" == "OPEN" ]] || stop "PRがOPENではありません: ${PR_STATE}"
ok "PRはOPEN"

[[ "$PR_MERGEABLE" == "MERGEABLE" ]] || stop "PRがmergeableではありません: ${PR_MERGEABLE}"
ok "PRはmergeable"

echo ""
echo -e "${BLD}[4/7] 変更ファイル許可範囲確認${RST}"

while IFS= read -r filepath; do
  [[ -z "$filepath" ]] && continue

  for blocked in "${BLOCKED_PATH_PATTERNS[@]}"; do
    if echo "$filepath" | grep -qiE "$blocked"; then
      stop "禁止パスを検出: ${filepath}"
    fi
  done

  matched=0
  for allowed in "${ALLOWED_PATTERNS[@]}"; do
    if echo "$filepath" | grep -qE "$allowed"; then
      matched=1
      break
    fi
  done

  [[ "$matched" -eq 1 ]] || stop "許可範囲外ファイル: ${filepath}"
  ok "許可: ${filepath}"
done <<< "$PR_FILES"

echo ""
echo -e "${BLD}[5/7] 削除・rename確認${RST}"

while IFS=$'\t' read -r status filepath; do
  [[ -z "${status:-}" ]] && continue
  if [[ "$status" == "removed" || "$status" == "renamed" ]]; then
    stop "削除またはrenameを検出: ${status} ${filepath}"
  fi
done <<< "$PR_FILE_STATUS"

ok "削除・renameなし"

echo ""
echo -e "${BLD}[6/7] Secret/APIキーらしき内容確認${RST}"

PR_DIFF=$(gh pr diff "$PR_NUMBER" 2>/dev/null || true)
ADDED_LINES=$(echo "$PR_DIFF" | grep -E "^\+" | grep -vE "^\+\+\+" || true)

for pattern in "${SECRET_PATTERNS[@]}"; do
  if echo "$ADDED_LINES" | grep -qiE "$pattern"; then
    stop "Secret/APIキーらしき文字列を検出しました。値は表示しません。"
  fi
done

ok "Secret/APIキーらしき文字列なし"

echo ""
echo -e "${BLD}[7/7] 危険語確認${RST}"

for regex in "${DANGER_REGEXES[@]}"; do
  if echo "$ADDED_LINES" | grep -qiE "$regex"; then
    stop "危険語カテゴリを追加差分内に検出しました。"
  fi
done

ok "危険語なし"

echo ""
echo -e "${GRN}${BLD}━━━ GO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}"
echo -e "${GRN}${BLD}  低リスクMerge候補として通過しました${RST}"
echo ""

if [[ "$AUTO_MERGE" == "1" ]]; then
  echo -e "${YLW}${BLD}  AUTO_MERGE=1 のため squash merge を実行します${RST}"
  echo -e "${YLW}  ※ --delete-branch は使いません${RST}"
  echo ""
  gh pr merge "$PR_NUMBER" --squash
  echo ""
  echo -e "${GRN}${BLD}  Merge完了: PR #${PR_NUMBER}${RST}"
else
  echo -e "${GRN}  監査のみ完了。Mergeは実行していません。${RST}"
  echo ""
  echo -e "${BLD}自動Mergeする場合:${RST}"
  echo "  AUTO_MERGE=1 ./scripts/agent/safe_auto_merge_pr.sh ${PR_NUMBER}"
  echo ""
  echo -e "${BLD}手動Mergeする場合:${RST}"
  echo "  gh pr merge ${PR_NUMBER} --squash"
fi

echo ""
echo -e "${GRN}${BLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}"
