# /pr-auto-flow

Claude Code作業完了後、PR作成→Codexレビュー→Safe Merge Gateまでを自動で進めるフロー。
`scripts/**` 等の高リスクPRはMerge前で必ず停止し、人間確認を求める。

## 使い方

```
/pr-auto-flow <PR番号>
/pr-auto-flow <PR番号> --dry-run
/pr-auto-flow <PR番号> --reset-attempts   # 3回使い切った後に人間修正した場合
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
  STOP → 即停止（exit 3）
  FIX  → fix_instruction生成 → Claude Code自動修正ループ（最大3回）
  GO   → Safe Merge Gate
↓
Safe Merge Gate実行
  → data/reports/safe_merge_pr_<PR番号>.txt に保存
↓
低リスクPRのみ: ラベル付与 → AUTO_MERGE=1 → main pull
高リスクPRは: 停止して人間にMergeを委ねる
```

## FIX自動修正ループ（最大3回）

スクリプトがFIX判定（exit 2）で停止したら、Claude Codeは以下を自動で実行する：

```
1. data/reports/fix_instruction_pr_<PR番号>.md を読む
2. data/reports/codex_review_pr_<PR番号>.txt を読む（詳細確認）
3. 「修正してよい対象」に該当する箇所のみ最小修正する
4. 修正ファイルだけを git add（git add . 禁止）
5. git commit -m "fix: address pr <N> codex review findings (attempt <N>)"
6. git push
7. ./scripts/agent/pr_auto_flow.sh --pr <N> を再実行
8. GO → Safe Merge Gate に進む
9. FIX → 2回目、3回目と繰り返す
10. 3回目もFIX → exit 5 で停止・人間確認待ちを報告
```

### 修正してよい対象

- CSV列数不整合（next_action等の欠落）
- Obsidianリンク修正（Vault外参照 → 注記）
- 表記ゆれ・typo（SNS_AFILIATE → SNS_AFFILIATE 等）
- 日付・曜日不整合
- docs/obsidian/data の整合性修正
- コンプライアンス表現の安全な言い換え
- 「公開前に公式確認が必要」等の注記追加
- model_id表記統一

### 修正してはいけない対象（即停止）

- scripts/** ロジック大幅変更
- agents/** 実行処理変更
- config/** 本番設定変更
- .env / APIキー / Token / Secret
- deploy / Scheduler / Cloud Run
- 自動投稿 / DM / リプ / LINE / Gmail
- Google Workspace本番書き込み
- 仕様・法務判断が必要な変更

### 3回FIX後の報告内容

Claude Codeは以下を報告する：
1. FIX試行回数（例: 3/3）
2. 各試行で修正した内容とcommit hash
3. まだ残るFIX理由
4. 人間判断が必要な箇所
5. 次に確認すべきファイル

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
