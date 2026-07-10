# /pr-auto-flow

Claude Code作業完了後、PR作成→Codexレビュー→Safe Merge Gateまでを自動で進めるフロー。
`scripts/**` 等の高リスクPRはMerge前で必ず停止し、人間確認を求める。

## 使い方

```
/pr-auto-flow <PR番号>
/pr-auto-flow <PR番号> --dry-run
```

## このスキルが実行すること

以下のフローを `scripts/agent/pr_auto_flow.sh` を通じて実行する。

```
gh auth確認
↓
mainブランチ上なら停止
↓
PR情報取得（タイトル・状態・ファイル一覧）
↓
リスク判定（低リスク / 高リスク）
↓
Codexレビュー実行
  → data/reports/codex_review_pr_<PR番号>.txt に保存
↓
GO / FIX / STOP 判定
  FIX → data/reports/fix_instruction_pr_<PR番号>.md 生成・停止
  STOP → 即停止
↓
Safe Merge Gate実行
  → data/reports/safe_merge_pr_<PR番号>.txt に保存
↓
低リスクPRのみ: ラベル付与 → AUTO_MERGE=1 → main pull
高リスクPRは: 停止して人間にMergeを委ねる
```

## 実行方法

ユーザーが `/pr-auto-flow 10` と入力した場合、以下を実行する：

```bash
export PATH="/opt/homebrew/bin:$PATH"
./scripts/agent/pr_auto_flow.sh --pr $ARGUMENTS
```

`--dry-run` が指定された場合：

```bash
export PATH="/opt/homebrew/bin:$PATH"
./scripts/agent/pr_auto_flow.sh $ARGUMENTS
```

## 低リスクPR（自動Merge対象）

- `docs/**`
- `obsidian/**`
- `data/revenue_portfolio/**`
- `data/analytics/**`
- `README.md` / `TASK.md` / `REPORT.md`

## 高リスクPR（自動Merge禁止・人間確認必須）

- `scripts/**` / `agents/**` / `apps/**` / `core/**` / `config/**`
- `.env*` / `package.json`
- Cloud Run / Scheduler / OAuth / 自動投稿 / 自動DM / 自動リプ
- LINE送信 / Gmail送信 / Google Workspace本番 / 決済 / 顧客データ

## FIX判定後の対応

1. `data/reports/fix_instruction_pr_<PR番号>.md` を読む
2. 修正対象ファイルだけ `git add`（`git add .` 禁止）
3. `git commit` → `git push`
4. `/pr-auto-flow <PR番号>` を再実行

## 禁止事項

- `git add .` — 使用禁止
- 高リスクPRの自動Merge
- STOP判定の無視
- PR #9への混入
- Secret / APIキー / Token の表示

## 仕様詳細

`docs/AUTO_PR_FLOW.md` を参照。
