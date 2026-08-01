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
- **ステータス**: REVIEW
- **ブランチ**: feature/rio-real-ai-research（マージ済み#29）→ feature/rio-pipeline-simulation（マージ済み#30）→ fix/rio-max-tokens（マージ済み）→ fix/rio-line-notification（マージ済み）→ fix/rio-workflow-verification（作成中）
- **PR**: #29（マージ済み）、#30（マージ済み）、#31-#33（マージ済み）、**#36（Slack通知統合・レビュー待ち）**
- **期限**: -
- **備考**: 需要リサーチ(101)・実験設計(102)・コンテンツ下書き+QA(103)をダミー入力からAnthropic API（claude-sonnet-4-5）呼び出しに置き換え済み（REPORT-010）。DEV_RIO_103には下書き完成時のLINE通知も追加済み（REPORT-012）。パイプライン段間のフィールド不整合3件を修正＋ローカル擬似実行シミュレーター＋GO_LIVE_RUNBOOKを追加（REPORT-014）。**Anthropicクレジット購入完了・n8n再インポート完了・実データでのライブテスト実施済み**。DEV_RIO_101・102は一発で成功、103は初回実行でmax_tokens不足による不具合を発見しREPORT-015で修正、再テストで完全な記事下書き生成とQA判定（プレースホルダー検出→FIX_REQUIRED）を確認。LINE 通知機能は複雑性の理由から任意扱いにし、ワークフロー本体の動作確認優先（REPORT-018）で LINE 機能を削除。DEV_RIO_103 全体が正常に動作することを確認。その後、Slack Incoming Webhook を使用した簡潔な Slack 通知統合を実装（REPORT-021、PR #36）。n8n UI でワークフロー実行テスト合格、Slack #all-daily-report への QA レポート投稿を確認。レビュー待ち中。

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

### TASK-004: DEV_RIO_101/102/103 の本番化準備（パイプライン全体）
- **担当**: Claude Code
- **ステータス**: IN_PROGRESS
- **ブランチ**: feature/rio-production-readiness
- **PR**: （作成後に記入）
- **期限**: 2026-08-10
- **備考**: TASK-003（Slack通知統合）の完了後、DEV_RIO_101→102→103の3ワークフロー全体を本番環境として機能させるための準備。以下を順次実施：
  1. ワークフロー JSON の最新化・リポジトリ登録（n8n UI での設定確認）
  2. 環境変数管理の確認（Anthropic API key・Slack Webhook URL・その他 Credential）
  3. n8n インスタンスの本番化計画（active フラグ ON・スケジューラー設定・ロギング）
  4. pre-deploy-qa による最終安全確認
  5. GO_LIVE_RUNBOOK に基づいた本番デプロイ手順の確認
  6. 実データでのエンドツーエンドテスト（3ワークフロー通し実行）

### TASK-005: 収益化自動化パイプライン完成（実測データ取得 → 自動スケーリング判定 → 実行）
- **担当**: Claude Code
- **ステータス**: IN_PROGRESS
- **ブランチ**: feature/revenue-automation-complete
- **PR**: （作成後に記入）
- **期限**: 2026-08-15
- **備考**: DEV_RIO_101-301 全パイプラインの本番化と、実測データ自動取得・スケーリング実行自動化を実装。以下を順次実施：
  1. **実測データ自動取得機能**
     - Gumroad API / Brain API 連携（売上・購入者数自動取得）
     - Threads / Instagram / note / Substack のメトリクス自動取得
     - YU HOLDINGS AI MCP からのデータ連携
     - metrics.csv への自動記録
  2. **スケーリング実行自動化**
     - SCALE 判定時: コンテンツ増産指示の自動生成
     - ITERATE 判定時: プロンプト調整案の自動生成
     - HOLD 判定時: 継続観察レポート自動送信
     - STOP 判定時: アーカイブ提案の自動通知
  3. **スケジューラー・トリガー設定**
     - 日次データ取得（夜間バッチ）
     - 週次集計・判定・レポート生成
     - 月次サマリー・意思決定レポート
  4. **ダッシュボード・レポート自動生成**
     - 収益グラフ（売上・粗利・ROI）
     - KPI トレンド（粗利/稼働時間の推移）
     - スケーリング提案の構造化レポート
     - Slack / Email への自動配信
  5. **本番化・ゴーライブ**
     - n8n スケジューラー ON（active: true）
     - Gumroad/Brain 実売上との連携確認
     - 実データでの 1 週間試験運用
     - GO_LIVE_RUNBOOK 実行

---

<!-- 新しいタスクは上記フォーマットに従ってここに追加する -->
