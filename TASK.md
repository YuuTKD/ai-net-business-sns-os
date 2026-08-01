# TASK.md — ai-net-business-sns-os

現在進行中・完了済みのタスクを記録するファイル。
作業開始時・PR作成時・完了時にステータスを更新すること。

---

## ステータス凡例

| ステータス | 意味 |
|-----------|------|
| `TODO` | 未着手 |
| `IN_PROGRESS` | 作業中 |
| `REVIEW` | PRレビュー待ち |
| `DONE` | 完了・merge済み |
| `BLOCKED` | 依存関係・判断待ちで停止中 |

---

## フォーマット

```
### TASK-XXX: タイトル
- **担当**: Claude Code / Codex / ゆうさん / 外注
- **ステータス**: TODO / IN_PROGRESS / REVIEW / DONE / BLOCKED
- **ブランチ**: feature/xxx
- **PR**: #番号（作成後に記入）
- **期限**: YYYY-MM-DD
- **備考**: 補足事項
```

---

## タスク一覧

### TASK-003: DEV_RIO_101/102/103 に Anthropic API 連携を実装
- **担当**: Claude Code
- **ステータス**: BLOCKED
- **ブランチ**: feature/rio-real-ai-research（マージ済み#29）→ feature/rio-pipeline-simulation（レビュー待ち）
- **PR**: #29（マージ済み）、続き（作成後に記入）
- **期限**: -
- **備考**: 需要リサーチ(101)・実験設計(102)・コンテンツ下書き+QA(103)をダミー入力からAnthropic API（claude-sonnet-4-5）呼び出しに置き換え済み（詳細はREPORT-010、PR #29でマージ済み）。DEV_RIO_103には下書き完成時のLINE通知も追加済み（REPORT-012）。夜間の自律作業でパイプライン段間のフィールド不整合3件を修正＋ローカル擬似実行シミュレーター＋GO_LIVE_RUNBOOKを追加（REPORT-014、レビュー待ち）。**BLOCKED理由**: (1) Anthropicアカウントのクレジット残高不足（ゆうさんによるconsole.anthropic.comでの購入待ち・後回し方針で合意済み）、(2) 更新済みJSON4本（101/102/103/201）のn8nへの再インポートが未実施（手順は`design/GO_LIVE_RUNBOOK.md`参照。スマホでも実施可能）、(3) LINE Messaging APIのCredential（Header Auth）未作成・通知先line_user_id未設定。全て解消後、実データでのエンドツーエンドテストに進む。

### TASK-002: Revenue Intelligence OS を正式リポジトリへ統合（A案）
- **担当**: Claude Code
- **ステータス**: REVIEW
- **ブランチ**: feature/revenue-intelligence-os-integration
- **PR**: #18
- **期限**: 2026-07-30
- **備考**: `~/revenue-browser-ops`（独立git・未push）を `products/revenue-intelligence-os/` へコピー統合（MIGRATION_TO_OFFICIAL_REPO.md A案）。110ファイル（agents10体 / policies / content note10本・Substack7本 / data CSV10種 / experiments EXP001-007 / queues / reports Phase1一式）。既存 products（brain_parts / client_acquisition_kit / 30_day_...md）は不変、logs/ は移行対象外。コピー元は当面バックアップとして残す。

### TASK-001: Codex × Claude Code × GitHub PR連携 初期セットアップ
- **担当**: Claude Code
- **ステータス**: REVIEW
- **ブランチ**: setup/codex-claude-pr-workflow
- **PR**: （作成後に記入）
- **期限**: 2026-07-08
- **備考**: CLAUDE.md / AGENTS.md / TEAM_RULES.md / TASK.md / REPORT.md / .github/pull_request_template.md の6ファイルを新規作成

---

<!-- 新しいタスクは上記フォーマットに従ってここに追加する -->
