#!/usr/bin/env bash
# pr_auto_flow.sh — ローカルPR自動連携フロー（Codex 120点版）
#
# 目的:
#   Claude Codeによる作業完了後、PR作成→Codexレビュー→判定→Safe Merge Gateまでを自動化する。
#   scripts/** を含む高リスクPRはMerge前で必ず停止し、人間確認を求める。
#   FIX判定は最大3回まで自動修正を許可し、3回を超えたら停止する。
#
# 使い方:
#   ./scripts/agent/pr_auto_flow.sh --pr <PR番号>
#   ./scripts/agent/pr_auto_flow.sh --pr <PR番号> --dry-run
#   ./scripts/agent/pr_auto_flow.sh --pr <PR番号> --reset-attempts
#
# 禁止事項（このスクリプト内では絶対に実行しない）:
#   - git add .
#   - 高リスクPRの自動Merge
#   - STOP判定の無視
#   - Secret/APIキー/Tokenの表示
#   - 本番デプロイ・自動投稿・自動DM・自動リプ

set -euo pipefail

# ━━━ 定数 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
REPORTS_DIR="${REPO_ROOT}/data/reports"
REVIEW_SCRIPT="${REPO_ROOT}/scripts/review/codex_pr_review.sh"
MERGE_GATE_SCRIPT="${REPO_ROOT}/scripts/agent/safe_auto_merge_pr.sh"

MAX_FIX_ATTEMPTS=3

# 低リスクパターン（これだけなら自動Merge対象）
LOW_RISK_PATTERNS=(
  "^docs/"
  "^obsidian/"
  "^data/revenue_portfolio/"
  "^data/analytics/"
  "^data/posts/"
  "^data/outreach/"
  "^\.claude/commands/"
  "^README\.md$"
  "^TASK\.md$"
  "^REPORT\.md$"
  "^\.github/pull_request_template\.md$"
)

# 高リスクパターン（1つでも含めばMerge禁止）
HIGH_RISK_PATTERNS=(
  "^scripts/"
  "^agents/"
  "^apps/"
  "^core/"
  "^config/"
  "^\.env"
  "^package\.json$"
  "^package-lock\.json$"
)

HIGH_RISK_KEYWORDS=(
  "cloudrun"
  "scheduler"
  "oauth"
  "自動投稿"
  "自動dm"
  "自動リプ"
  "line送信"
  "gmail送信"
  "workspace本番"
  "決済"
  "顧客データ"
  "商品マッチ先ai"
)

# ━━━ ヘルパー ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
YELLOW=$'\033[1;33m'
CYAN=$'\033[0;36m'
BOLD=$'\033[1m'
RESET=$'\033[0m'

info()  { echo "${CYAN}  →${RESET} $*"; }
ok()    { echo "${GREEN}  ✓${RESET} $*"; }
warn()  { echo "${YELLOW}  !${RESET} $*"; }
fail()  { echo "${RED}${BOLD}  ✗ STOP:${RESET} $*" >&2; }

header() {
  echo ""
  echo "${BOLD}━━━ $* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
}

get_fix_attempt() {
  local attempt_file="${REPORTS_DIR}/fix_attempt_pr_${PR_NUMBER}.txt"
  if [[ -f "$attempt_file" ]]; then
    cat "$attempt_file"
  else
    echo 0
  fi
}

# ━━━ 引数パース ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PR_NUMBER=""
DRY_RUN=0
RESET_ATTEMPTS=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --pr)             PR_NUMBER="$2"; shift 2 ;;
    --dry-run)        DRY_RUN=1; shift ;;
    --reset-attempts) RESET_ATTEMPTS=1; shift ;;
    *) echo "不明なオプション: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$PR_NUMBER" ]]; then
  echo "使い方: $0 --pr <PR番号> [--dry-run] [--reset-attempts]" >&2
  exit 1
fi

# ━━━ FIX試行回数管理 ━━━━━━━━━━━━━━━━━━━━━━━━━━

FIX_ATTEMPT_FILE="${REPORTS_DIR}/fix_attempt_pr_${PR_NUMBER}.txt"
mkdir -p "${REPORTS_DIR}"

if [[ $RESET_ATTEMPTS -eq 1 ]]; then
  rm -f "${FIX_ATTEMPT_FILE}"
  echo ""
  info "--reset-attemptsフラグにより、FIX試行回数をリセットしました"
fi

CURRENT_FIX_ATTEMPT="$(get_fix_attempt)"

# ━━━ 開始 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

header "PR Auto Flow — PR #${PR_NUMBER}"
echo "  DRY_RUN      : ${DRY_RUN}"
echo "  Reports      : ${REPORTS_DIR}"
echo "  FIX試行回数  : ${CURRENT_FIX_ATTEMPT}/${MAX_FIX_ATTEMPTS}"
echo ""

# ━━━ [0] gh auth確認 ━━━━━━━━━━━━━━━━━━━━━━━━━━

header "[0/6] gh auth確認"
if ! gh auth status &>/dev/null; then
  fail "gh認証が失敗しました。'gh auth login' を実行してください。"
  exit 1
fi
ok "gh認証 OK"

# ━━━ [1] mainブランチチェック ━━━━━━━━━━━━━━━━━

header "[1/6] ブランチ確認"
CURRENT_BRANCH="$(git -C "${REPO_ROOT}" branch --show-current)"
info "現在のブランチ: ${CURRENT_BRANCH}"
if [[ "$CURRENT_BRANCH" == "main" ]]; then
  fail "mainブランチ上では実行できません。作業ブランチに切り替えてください。"
  exit 1
fi
ok "ブランチ確認 OK（${CURRENT_BRANCH}）"

# ━━━ [2] PR情報取得 ━━━━━━━━━━━━━━━━━━━━━━━━━━

header "[2/6] PR情報取得"
PR_INFO="$(gh pr view "${PR_NUMBER}" --json title,state,files --jq '{title:.title,state:.state,files:[.files[].path]}')"
PR_TITLE="$(echo "$PR_INFO" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['title'])")"
PR_STATE="$(echo "$PR_INFO" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['state'])")"
PR_FILES="$(echo "$PR_INFO" | python3 -c "import json,sys; d=json.load(sys.stdin); [print(f) for f in d['files']]")"
FILE_COUNT="$(echo "$PR_FILES" | wc -l | tr -d ' ')"

info "タイトル : ${PR_TITLE}"
info "状態     : ${PR_STATE}"
info "ファイル : ${FILE_COUNT}件"

if [[ "$PR_STATE" != "OPEN" ]]; then
  fail "PRが OPEN ではありません（現在: ${PR_STATE}）。"
  exit 1
fi
ok "PR状態 OK"

# ━━━ [3] リスク判定 ━━━━━━━━━━━━━━━━━━━━━━━━━━

header "[3/6] リスク判定"

IS_HIGH_RISK=0
HIGH_RISK_REASON=""

# 高リスクパターンマッチ
while IFS= read -r file; do
  for pattern in "${HIGH_RISK_PATTERNS[@]}"; do
    if echo "$file" | grep -qE "$pattern"; then
      IS_HIGH_RISK=1
      HIGH_RISK_REASON="高リスクファイルを含む: ${file} (パターン: ${pattern})"
      break 2
    fi
  done
done <<< "$PR_FILES"

# 低リスク外ファイルチェック（低リスクパターンに1つも一致しないファイルがある場合は高リスク）
if [[ $IS_HIGH_RISK -eq 0 ]]; then
  while IFS= read -r file; do
    matched_low=0
    for pattern in "${LOW_RISK_PATTERNS[@]}"; do
      if echo "$file" | grep -qE "$pattern"; then
        matched_low=1
        break
      fi
    done
    if [[ $matched_low -eq 0 ]]; then
      IS_HIGH_RISK=1
      HIGH_RISK_REASON="低リスクパターン外のファイルを含む: ${file}"
      break
    fi
  done <<< "$PR_FILES"
fi

if [[ $IS_HIGH_RISK -eq 1 ]]; then
  warn "高リスクPR判定: ${HIGH_RISK_REASON}"
  warn "このPRは自動Mergeできません。人間によるMergeが必要です。"
else
  ok "低リスクPR判定 — 全ファイルが許可パターン内"
fi

# ━━━ [4] Codexレビュー ━━━━━━━━━━━━━━━━━━━━━━━

header "[4/6] Codexレビュー"
REVIEW_OUTPUT="${REPORTS_DIR}/codex_review_pr_${PR_NUMBER}.txt"

if [[ ! -f "$REVIEW_SCRIPT" ]]; then
  fail "レビュースクリプトが見つかりません: ${REVIEW_SCRIPT}"
  exit 1
fi

info "レビュー実行中 → ${REVIEW_OUTPUT}"

if [[ $DRY_RUN -eq 1 ]]; then
  warn "[DRY_RUN] Codexレビューはスキップします"
  REVIEW_RESULT="GO"
  echo "[DRY_RUN] Codex review skipped. Simulated result: GO" > "${REVIEW_OUTPUT}"
else
  # Codexレビュー実行・teeで保存
  if ! bash "${REVIEW_SCRIPT}" "${PR_NUMBER}" 2>&1 | tee "${REVIEW_OUTPUT}"; then
    fail "Codexレビューがエラーで終了しました。${REVIEW_OUTPUT} を確認してください。"
    exit 1
  fi

  # GO / FIX / STOP 判定（最後の行を優先、なければ全文検索）
  LAST_JUDGMENT="$(tail -20 "${REVIEW_OUTPUT}" | grep -oiE '\b(GO|FIX|STOP)\b' | tail -1 | tr '[:lower:]' '[:upper:]' || true)"
  ANY_JUDGMENT="$(grep -oiE '\b(GO|FIX|STOP)\b' "${REVIEW_OUTPUT}" | tail -1 | tr '[:lower:]' '[:upper:]' || true)"
  REVIEW_RESULT="${LAST_JUDGMENT:-${ANY_JUDGMENT:-UNKNOWN}}"
fi

info "レビュー判定: ${REVIEW_RESULT}"

case "$REVIEW_RESULT" in
  GO)
    ok "Codex判定: GO — Merge Gateに進みます"
    # FIX試行回数リセット（GO達成）
    rm -f "${FIX_ATTEMPT_FILE}"
    ;;
  FIX)
    NEXT_FIX_ATTEMPT=$((CURRENT_FIX_ATTEMPT + 1))
    echo "$NEXT_FIX_ATTEMPT" > "${FIX_ATTEMPT_FILE}"

    warn "Codex判定: FIX（試行 ${NEXT_FIX_ATTEMPT}/${MAX_FIX_ATTEMPTS}）"

    FIX_FILE="${REPORTS_DIR}/fix_instruction_pr_${PR_NUMBER}.md"

    # Codex出力から指摘事項を抽出
    FINDINGS="$(grep -E '^\*\*\[要修正\]|\*\*\[要修正\]|^\*\*\[推奨修正\]|^- \*\*\[要修正\]|^8\. 指摘事項' "${REVIEW_OUTPUT}" | head -20 || true)"
    if [[ -z "$FINDINGS" ]]; then
      FINDINGS="$(grep -E '指摘事項|要修正|修正推奨' "${REVIEW_OUTPUT}" | head -10 || true)"
    fi

    cat > "${FIX_FILE}" <<FIXEOF
# FIX指示 — PR #${PR_NUMBER}（試行 ${NEXT_FIX_ATTEMPT}/${MAX_FIX_ATTEMPTS}）

生成日時: $(date '+%Y-%m-%d %H:%M:%S')

## 判定
FIX

## FIX理由（Codex抽出）
$(echo "$FINDINGS" | head -15 || echo "詳細は ${REVIEW_OUTPUT} を参照してください")

詳細レビュー: ${REVIEW_OUTPUT}

## 優先修正順
1. データ破損・CSV不整合
2. Secret・安全性
3. コンプライアンス（Amazon開示・ステマ規制・個人情報）
4. リンク（Obsidian/Markdown）
5. 表記ゆれ・日付・曜日不整合
6. 売上導線の明確化

## 自動修正してよい内容
- CSV列数修正・model_id統一
- Markdownリンク修正
- Obsidianリンク修正（Vault外はテキスト参照に変換）
- typo / 表記ゆれ修正
- 日付・曜日修正
- docs / obsidian / data の説明補足
- コンプライアンス注記追加（参照URL追加・主体名プレースホルダー等）
- 個人情報取り扱い説明追加
- 危険表現の安全な言い換え

## 自動修正してはいけない内容
- scripts/** の実行ロジック大幅変更
- agents/** / config/** / .env
- deploy / Scheduler / Cloud Run
- 外部送信 / 自動投稿 / 自動DM / 自動リプ
- 決済 / 顧客データ / 商品マッチ先AI再開
- 法務・仕様判断が必要な変更

## Claude Codeへの修正指示
1. ${REVIEW_OUTPUT} を読んで指摘箇所を確認してください
2. 最小修正のみ実施してください
3. git add . は絶対禁止 — 対象ファイルだけ git add してください
4. git commit → git push してください
5. 再実行: ./scripts/agent/pr_auto_flow.sh --pr ${PR_NUMBER}

## 残り自動修正回数
$(echo "$((MAX_FIX_ATTEMPTS - NEXT_FIX_ATTEMPT))") 回（最大${MAX_FIX_ATTEMPTS}回中 ${NEXT_FIX_ATTEMPT}回目完了）

## 再レビューコマンド
export PATH="/Users/tokudayuya/.local/bin:/opt/homebrew/bin:\$PATH"
./scripts/agent/pr_auto_flow.sh --pr ${PR_NUMBER}
FIXEOF

    ok "FIX指示ファイル生成: ${FIX_FILE}"
    echo ""

    if [[ $NEXT_FIX_ATTEMPT -ge $MAX_FIX_ATTEMPTS ]]; then
      fail "FIX判定が ${MAX_FIX_ATTEMPTS} 回に達しました。自動修正を停止します。"
      echo ""
      echo "${YELLOW}${BOLD}人間確認が必要です:${RESET}"
      echo "  詳細レビュー : ${REVIEW_OUTPUT}"
      echo "  修正指示     : ${FIX_FILE}"
      echo ""
      echo "  FIX試行回数をリセットするには:"
      echo "  ./scripts/agent/pr_auto_flow.sh --pr ${PR_NUMBER} --reset-attempts"
      exit 5
    fi

    fail "FIX判定（試行 ${NEXT_FIX_ATTEMPT}/${MAX_FIX_ATTEMPTS}）。${FIX_FILE} を確認して修正してください。"
    exit 2
    ;;
  STOP)
    fail "Codex判定: STOP — 重大な問題が検出されました。${REVIEW_OUTPUT} を確認してください。"
    exit 3
    ;;
  *)
    warn "判定不明（${REVIEW_RESULT}）— レビュー出力を確認: ${REVIEW_OUTPUT}"
    warn "判定が取得できない場合は手動で確認してください。"
    fail "判定不明のため安全のため停止します。"
    exit 1
    ;;
esac

# ━━━ [5] Safe Merge Gate ━━━━━━━━━━━━━━━━━━━━━

header "[5/6] Safe Merge Gate"
MERGE_OUTPUT="${REPORTS_DIR}/safe_merge_pr_${PR_NUMBER}.txt"

if [[ ! -f "$MERGE_GATE_SCRIPT" ]]; then
  fail "Safe Merge Gateスクリプトが見つかりません: ${MERGE_GATE_SCRIPT}"
  exit 1
fi

info "Safe Merge Gate実行中（監査モード）→ ${MERGE_OUTPUT}"

GATE_EXIT=0
if [[ $DRY_RUN -eq 1 ]]; then
  warn "[DRY_RUN] Safe Merge Gateはスキップします"
  echo "[DRY_RUN] Safe Merge Gate skipped." > "${MERGE_OUTPUT}"
else
  bash "${MERGE_GATE_SCRIPT}" "${PR_NUMBER}" 2>&1 | tee "${MERGE_OUTPUT}" || GATE_EXIT=$?
fi

# ━━━ [6] Merge判定 ━━━━━━━━━━━━━━━━━━━━━━━━━━━

header "[6/6] Merge判定"

if [[ $IS_HIGH_RISK -eq 1 ]]; then
  echo ""
  echo "${RED}${BOLD}━━━ 自動Merge禁止 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  fail "高リスクPRのため自動Mergeは実行しません。"
  echo "${BOLD}  理由: ${HIGH_RISK_REASON}${RESET}"
  echo ""
  echo "${BOLD}人間が確認してからMergeしてください:${RESET}"
  echo ""
  echo "  # レビュー内容確認:"
  echo "  cat ${REPORTS_DIR}/codex_review_pr_${PR_NUMBER}.txt"
  echo ""
  echo "  # ラベル付与（確認後）:"
  echo "  gh pr edit ${PR_NUMBER} --add-label 'safe-auto-merge'"
  echo ""
  echo "  # Merge実行:"
  echo "  AUTO_MERGE=1 ./scripts/agent/safe_auto_merge_pr.sh ${PR_NUMBER}"
  echo ""
  echo "  # main pull:"
  echo "  git checkout main && git pull origin main"
  echo ""
  echo "${RED}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  exit 4
fi

# 低リスクPR: Gate結果チェックしてMerge
if [[ $GATE_EXIT -ne 0 ]] && [[ $DRY_RUN -eq 0 ]]; then
  warn "Safe Merge GateがNG（終了コード: ${GATE_EXIT}）"
  warn "${MERGE_OUTPUT} を確認してください。"
  fail "Gate通過できなかったため自動Mergeを停止します。"
  exit 1
fi

if [[ $DRY_RUN -eq 1 ]]; then
  warn "[DRY_RUN] 自動Mergeはスキップします（低リスクPRとして通過）"
  echo ""
  echo "  # 実際に実行するには:"
  echo "  gh pr edit ${PR_NUMBER} --add-label 'safe-auto-merge'"
  echo "  AUTO_MERGE=1 ./scripts/agent/safe_auto_merge_pr.sh ${PR_NUMBER}"
  echo "  git checkout main && git pull origin main"
else
  info "低リスクPR確認済み — ラベル付与してMergeします"
  gh pr edit "${PR_NUMBER}" --add-label "safe-auto-merge"
  ok "ラベル 'safe-auto-merge' を付与"

  AUTO_MERGE=1 bash "${MERGE_GATE_SCRIPT}" "${PR_NUMBER}"
  ok "Merge完了"

  info "main に戻ります"
  git checkout main
  git pull origin main
  git status
  ok "main pull 完了 — git status クリーン確認"
fi

echo ""
echo "${GREEN}${BOLD}━━━ PR Auto Flow 完了 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo "  PR #${PR_NUMBER} フロー終了"
echo "  Codexレビュー : ${REVIEW_OUTPUT}"
echo "  Merge Gate    : ${MERGE_OUTPUT}"
echo "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
