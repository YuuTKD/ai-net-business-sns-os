# AUTO PR FLOW — ローカルPR自動連携フロー

作成日: 2026-07-10
対象プロジェクト: ai-net-business-sns-os

---

## 概要

Claude Codeによる作業完了後、PR作成→Codexレビュー→判定→Safe Merge Gateまでを自動化するフロー。

```
作業完了
↓
git status確認
↓
対象ファイルだけ git add（git add . 禁止）
↓
git commit
↓
git push
↓
PR作成（gh pr create）
↓
./scripts/agent/pr_auto_flow.sh --pr <PR番号>
  ├── Codexレビュー実行
  │     └── data/reports/codex_review_pr_<PR番号>.txt に保存
  ├── GO / FIX / STOP 判定
  │     ├── STOP → 即停止（人間確認必須）
  │     ├── FIX  → fix_instruction生成 → Claude Code自動修正ループ（最大3回）
  │     │         ├── 試行1回目: 修正 → commit → push → 再レビュー
  │     │         ├── 試行2回目: 修正 → commit → push → 再レビュー
  │     │         ├── 試行3回目: 修正 → commit → push → 再レビュー
  │     │         └── 3回目もFIX → 停止（人間確認必須・exit 5）
  │     └── GO   → Safe Merge Gateへ
  ├── Safe Merge Gate実行
  │     └── data/reports/safe_merge_pr_<PR番号>.txt に保存
  └── リスク判定
        ├── 高リスクPR → Merge前停止（人間確認必須）
        └── 低リスクPR → ラベル付与 → AUTO_MERGE=1 → main pull
```

---

## スクリプトの場所

| スクリプト | 役割 |
|---|---|
| `scripts/agent/pr_auto_flow.sh` | メインフロー制御 |
| `scripts/review/codex_pr_review.sh` | Codexへのレビュー依頼 |
| `scripts/agent/safe_auto_merge_pr.sh` | Safe Merge Gate（監査＋Merge） |

---

## 使い方

### 基本

```bash
./scripts/agent/pr_auto_flow.sh --pr <PR番号>
```

### ドライラン（実際にはMergeしない）

```bash
./scripts/agent/pr_auto_flow.sh --pr <PR番号> --dry-run
```

### FIX試行回数リセット（3回使い切った後に人間修正した場合）

```bash
./scripts/agent/pr_auto_flow.sh --pr <PR番号> --reset-attempts
```

### 出力ファイル

| ファイル | 内容 |
|---|---|
| `data/reports/codex_review_pr_<PR番号>.txt` | Codexレビュー全文 |
| `data/reports/fix_instruction_pr_<PR番号>.md` | FIX判定時の修正指示（試行回数付き） |
| `data/reports/fix_attempt_pr_<PR番号>.txt` | FIX試行回数カウンタ（0〜3） |
| `data/reports/safe_merge_pr_<PR番号>.txt` | Safe Merge Gate結果 |

---

## FIX最大3回自動修正ループ（2026-07-10追加）

### 概要

Codexが FIX を返した場合、Claude Codeが以下のループを最大3回まで自動実行します。

```
FIX判定（1回目）
↓
fix_instruction_pr_N.md を生成（Codex指摘内容を抽出して記載）
↓
Claude Code が fix_instruction を読む
↓
許可対象の指摘のみ最小修正
↓
対象ファイルだけ git add（git add . 禁止）
↓
git commit -m "fix: address pr N codex review findings (attempt 1)"
↓
git push
↓
./scripts/agent/pr_auto_flow.sh --pr N 再実行
↓
GO → Safe Merge Gate → Merge
FIX → 2回目ループ
↓
（最大3回まで繰り返し）
↓
3回目もFIX → exit 5（停止・人間確認必須）
```

### FIX自動修正してよい対象

| 対象 | 例 |
|---|---|
| CSV列数不整合 | next_action列欠落、ヘッダー列数≠行列数 |
| Markdownリンク修正 | 相対パスエラー、Obsidian Vault外参照 |
| Obsidianリンク修正 | `[[../../docs/...]]` → 注記に変更 |
| 表記ゆれ・typo | SNS_AFILIATE → SNS_AFFILIATE |
| 日付・曜日不整合 | 「月〜火」→「07-10（金）〜07-11（土）」 |
| docs/obsidian/data の整合性 | ファイル間の矛盾修正 |
| コンプライアンス表現の言い換え | 確認日・参照元の追記 |
| model_id表記統一 | B2B_AGENT / SNS_AFFILIATE 等 |

### FIX自動修正してはいけない対象（即停止・人間確認）

| 禁止対象 | 理由 |
|---|---|
| `scripts/**` ロジック大幅変更 | 動作破壊リスク |
| `agents/**` 実行処理変更 | エージェント誤動作リスク |
| `config/**` 本番設定変更 | 本番影響リスク |
| `.env` / APIキー / Token | Secret漏洩リスク |
| deploy / Scheduler / Cloud Run | 本番障害リスク |
| 自動投稿 / DM / リプ / LINE / Gmail | 規約違反リスク |
| Google Workspace本番書き込み | 承認なし変更リスク |
| 決済 / 顧客データ | セキュリティリスク |
| 商品マッチ先AI再開 | PAUSED維持 |
| 仕様判断が必要な変更 | 人間判断必須 |
| 法務判断が必要な変更 | 専門家確認必須 |

### 3回FIX時の報告内容（exit 5）

スクリプトが出力する内容：
1. 何回FIXしたか（3/3）
2. 試行ごとの commit hash
3. まだ残るFIX理由（review txtから）
4. 人間判断が必要な箇所
5. 次に確認すべきファイル
6. カウンタリセットコマンド

### STOP判定時（即停止・自動修正禁止）

```
Codex判定 STOP
↓
自動修正禁止
↓
Merge禁止
↓
exit 3（人間確認待ち）
↓
理由を codex_review_pr_N.txt で確認
```

---

## リスク判定ルール

### 低リスクPR（自動Merge対象）

以下のパスのみを含むPR：

| パターン | 例 |
|---|---|
| `docs/**` | docs/AUTO_PR_FLOW.md |
| `obsidian/**` | obsidian/AI-NET-BUSINESS/... |
| `data/revenue_portfolio/**` | data/revenue_portfolio/portfolio_master.csv |
| `data/analytics/**` | data/analytics/weekly_summary.csv |
| `README.md` | — |
| `TASK.md` | — |
| `REPORT.md` | — |
| `.github/pull_request_template.md` | — |

### 高リスクPR（自動Merge禁止・人間確認必須）

以下のパスを1つでも含むPR：

| パターン | 理由 |
|---|---|
| `scripts/**` | 自動化ロジック変更 |
| `agents/**` | エージェント設定変更 |
| `apps/**` | アプリケーション変更 |
| `core/**` | コア機能変更 |
| `config/**` | 設定変更 |
| `.env*` | 環境変数 |
| `package.json` | 依存関係変更 |

### 高リスクキーワード

PR差分に以下のキーワードを含む場合も高リスク扱い：

- Cloud Run / Scheduler
- OAuth / API接続
- 自動投稿 / 自動DM / 自動リプ
- LINE送信 / Gmail送信
- Google Workspace本番書き込み
- 決済 / 顧客データ
- 商品マッチ先AI再開

---

## Codex判定の意味

| 判定 | 意味 | 次のアクション |
|---|---|---|
| `GO` | 問題なし | Safe Merge Gateへ進む |
| `FIX` | 修正が必要 | fix_instruction_pr_*.md を読んで修正 → 再push → 再実行 |
| `STOP` | 重大な問題 | 即停止 / 人間が判断 |

---

## FIX判定後の修正フロー

1. `data/reports/fix_instruction_pr_<PR番号>.md` を読む
2. `data/reports/codex_review_pr_<PR番号>.txt` で詳細を確認
3. 指摘箇所を修正
4. 修正対象ファイルだけを `git add`（`git add .` 禁止）
5. `git commit`
6. `git push`
7. 再実行: `./scripts/agent/pr_auto_flow.sh --pr <PR番号>`

---

## 高リスクPRのMergeフロー（人間が実行）

```bash
# 1. レビュー内容確認
cat data/reports/codex_review_pr_<PR番号>.txt
cat data/reports/safe_merge_pr_<PR番号>.txt

# 2. 問題がなければラベル付与
gh pr edit <PR番号> --add-label 'safe-auto-merge'

# 3. Merge
AUTO_MERGE=1 ./scripts/agent/safe_auto_merge_pr.sh <PR番号>

# 4. main pull
git checkout main && git pull origin main && git status
```

---

## 禁止事項

このフロー内で絶対に実行しないこと：

| 禁止 | 理由 |
|---|---|
| `git add .` | 意図しないファイル混入 |
| 高リスクPRの自動Merge | 本番障害防止 |
| STOP判定の無視 | セキュリティ・品質保護 |
| PR #9への混入 | 別作業の分離 |
| 本番デプロイ | 承認なし公開事故防止 |
| 自動投稿 / 自動DM / 自動リプ | プラットフォーム規約・スパム |
| APIキー / Token / Secret表示 | Secret漏洩防止 |
| Google Workspace本番書き込み | APPROVED_FOR_LIVE=false |
| 決済処理の自動実行 | セキュリティリスク |

---

## データフロー図

```
Claude Code
  │
  ▼
[git add/commit/push]
  │
  ▼
[gh pr create]
  │
  ▼
scripts/agent/pr_auto_flow.sh --pr N
  │
  ├── scripts/review/codex_pr_review.sh N
  │     └── data/reports/codex_review_pr_N.txt
  │
  ├── 判定: GO / FIX / STOP
  │     ├── FIX → data/reports/fix_instruction_pr_N.md → 停止
  │     └── STOP → 停止
  │
  ├── scripts/agent/safe_auto_merge_pr.sh N
  │     └── data/reports/safe_merge_pr_N.txt
  │
  └── リスク判定
        ├── 高リスク → 停止（人間がMerge）
        └── 低リスク → gh pr edit --add-label safe-auto-merge
                     → AUTO_MERGE=1 safe_auto_merge_pr.sh N
                     → git checkout main && git pull origin main
```

---

## テスト方法

```bash
# ドライランでフロー確認
./scripts/agent/pr_auto_flow.sh --pr 9 --dry-run
```

---

*このドキュメントの更新はゆうさん承認PRを通じてのみ行う。*
