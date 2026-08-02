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
- **ステータス**: REVIEW（本番化準備完了・実行待ち）
- **ブランチ**: feature/revenue-automation-complete
- **PR**: #37（統合・レビュー待ち）
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

### TASK-006: 2 並行トラック・4 週間本番化戦闘（¥1M 月間売上達成）
- **担当**: Claude Code / ゆうさん
- **ステータス**: IN_PROGRESS
- **ブランチ**: feature/parallel-monetization-execution
- **PR**: （本番化実行中）
- **期限**: 2026-08-29（4 週間後）
- **⚠️ 重要な訂正（2026-08-02）**: 本タスクと配下の計画ドキュメント（PARALLEL_EXECUTION_ROADMAP.md 等）に記載の**収益数値（¥1.3M/月・各チャネル¥XXk 等）は根拠のない推定**であり、実測後に全面的に再評価する。また「自動投稿/自動リプライ/自動アップロード」を前提とした記述は **CLAUDE.md 禁止事項に抵触するため撤回**し、実装は「下書き準備＋人間が手動投稿」（700系）に統一した。以下の週次売上目標は未検証の構想値として扱うこと。
- **備考**: PARALLEL_EXECUTION_ROADMAP.md に基づき、トラック A（グレードアップ）+ トラック B（新規チャネル 5 つ）を並行実行。Week 4 終了時点で月間売上 ¥1.3M 達成を目標。
  - **トラック A（グレードアップ）**: DEV_RIO_101-403 本番化 + 売上ルート確認 + Lead/Funnel/Retention 自動化（DEV_RIO_601-603）
    - Week 1: 本番化実施 + 売上検証（¥300k → ¥350k）
    - Week 2: Lead/Funnel 自動化（¥350k → ¥500k）
    - Week 3: Retention 自動化 + DEV_RIO_301/402 拡張（¥500k → ¥650k）
    - Week 4: KPI 検証・ダッシュボード確立（¥650k → ¥750k）
  - **トラック B（新規チャネル）**: 5 つのワークフロー段階的実装
    - Phase 1（Week 1-2）: DEV_RIO_702/701/705 同時実装（+¥400k）
    - Phase 2（Week 3）: DEV_RIO_704 実装（複合効果 +¥120k）
    - Phase 3（Month 2）: DEV_RIO_703 YouTube 自動化実装

### TASK-007: DEV_RIO_702 実装（X 投稿【下書き準備のみ】）
- **担当**: Claude Code
- **ステータス**: DONE（PR #37 マージ済み）※実効化には n8n 再インポートが必要
- **ブランチ**: fix/rio-workflow-verification
- **PR**: #37（マージ済み）
- **期限**: 2026-08-07
- **備考**: 【方針修正】当初の「自動投稿」案は CLAUDE.md 絶対禁止事項『本番SNS自動投稿の実行』および既存 DEV_RIO_201 の dry-run アーキテクチャに反するため撤回。Claude(Haiku)で X投稿の下書き候補3案を生成し、'Stop Before Publish' で公開直前停止。active:false・投稿APIは呼ばない。人間が確認後に手動投稿。**本番運用可能化として実施済み**: (1) 既存DEV_RIO_101の実働パターンに準拠（anthropicApi クレデンシャル参照 / body はCode nodeでオブジェクト構築しjsonBody=`{{$json.anthropic_body}}` で安全にエスケープ）、(2) qa_status=PASS ゲート追加（品質未達はSKIP）、(3) パースの graceful fallback（API error/不正出力でも捏造せず手動フォールバック）、(4) エッジケース単体テスト合格。運用手順は design/RIO_700_SERIES_RUNBOOK.md。収益数値（¥150-300k/月）は根拠のない推定のため撤回、実測後に再評価。

### TASK-008: DEV_RIO_701 実装（アフィリエイト【下書き準備のみ】）
- **担当**: Claude Code
- **ステータス**: DONE（PR #37 マージ済み）※実効化には n8n 再インポートが必要
- **ブランチ**: fix/rio-workflow-verification
- **PR**: #37（マージ済み）
- **期限**: 2026-08-07
- **備考**: 【方針修正】自動埋め込みはせず、記事へのアフィリ挿入案（ジャンル/位置/アンカー文）とリンク差し込み欄（プレースホルダ）のみ生成。偽のアフィリURLは作らない。人間が自分のアフィリID付きリンクを差し込み、手動反映。**本番運用可能化**: DEV_RIO_101準拠のAnthropic呼び出し / qa_status=PASSゲート / graceful fallback / JSON検証済み。運用手順は design/RIO_700_SERIES_RUNBOOK.md。期待売上は実測後に再評価。

### TASK-009: DEV_RIO_705 実装（Threads × 楽天【下書き準備のみ】）
- **担当**: Claude Code
- **ステータス**: DONE（PR #37 マージ済み）※実効化には n8n 再インポートが必要
- **ブランチ**: fix/rio-workflow-verification
- **PR**: #37（マージ済み）
- **期限**: 2026-08-06
- **備考**: 【方針修正】自動リプライはせず、Threads投稿に添える楽天アフィリのリプライ下書き案のみ生成。実リンクは作らずプレースホルダのみ。人間が手動投稿。CLAUDE.md 準拠。**本番運用可能化**: DEV_RIO_101準拠のAnthropic呼び出し / qa_status=PASSゲート / graceful fallback / JSON検証済み。運用手順は design/RIO_700_SERIES_RUNBOOK.md。期待売上は実測後に再評価。

### TASK-010: DEV_RIO_601（Lead Generation 支援）
- **担当**: Claude Code
- **ステータス**: BLOCKED（前提未確立・要ゆうさん判断）
- **ブランチ**: 未作成
- **PR**: -
- **期限**: 未定
- **備考**: 【要再スコープ】当初「CTA自動埋め込み・自動登録」案。実装するなら 700系と同じく「CTA下書き案の生成まで（実登録・実送信はしない）」に限定。メールフォーム(Convertkit等)の実アカウント・API有無が未確認のため BLOCKED。前提: 700系が n8n で動作確認できてから着手。

### TASK-011: DEV_RIO_602（Sales Funnel メール下書き）
- **担当**: Claude Code
- **ステータス**: BLOCKED（前提未確立・要ゆうさん判断）
- **ブランチ**: 未作成
- **PR**: -
- **期限**: 未定
- **備考**: 【要再スコープ】メール「自動送信」は承認なし外部送信になるため実装しない。実装するなら「3段階メールの下書き生成まで・送信は人間」。転換率2-3x等の数値は未検証。前提: メール配信基盤の実在確認。

### TASK-012: DEV_RIO_603（Retention メール下書き）
- **担当**: Claude Code
- **ステータス**: BLOCKED（前提未確立・要ゆうさん判断）
- **ブランチ**: 未作成
- **PR**: -
- **期限**: 未定
- **備考**: 【要再スコープ】購買後フォロー「下書き」生成まで。自動送信はしない。リピート率・LTV の数値目標は未検証のため撤回。前提: 購買データ源(Gumroad/Brain)の実データ接続確認。

### TASK-013: DEV_RIO_704（Threads×note リパーパス下書き）
- **担当**: Claude Code
- **ステータス**: BLOCKED（CLAUDE.md 抵触・要再設計）
- **ブランチ**: 未作成
- **PR**: -
- **期限**: 未定
- **備考**: 【撤回・要再設計】「自動投稿・自動展開」は CLAUDE.md 禁止。実装するなら「他媒体向けリパーパス下書きの生成まで・投稿は人間」に限定。複合効果+20%は未検証。

### TASK-014: DEV_RIO_703（YouTube 台本・素材下書き）
- **担当**: Claude Code
- **ステータス**: BLOCKED（CLAUDE.md 抵触・要再設計）
- **ブランチ**: 未作成
- **PR**: -
- **期限**: 未定
- **備考**: 【撤回・要再設計】「YouTube自動アップロード」は承認なし公開のため実装しない。Remotion/Cap Cut 自動化は大規模投資かつ未検証。当面の現実的範囲は「動画台本・構成の下書き生成」まで。収益数値は未検証。

### TASK-015: DEV_RIO_800（チャネル横断レポート）
- **担当**: Claude Code
- **ステータス**: BLOCKED（実データ源が前提）
- **ブランチ**: 未作成
- **PR**: -
- **期限**: 未定
- **備考**: 【要再スコープ】各チャネルの「実測データ源」が接続できてから着手（現状は実売上/クリックの取得基盤が未確立）。DEV_RIO_403（月次ダッシュボード）と重複するため統合も検討。

### TASK-016: DEV_RIO_103 の再インポート健全性修正（Slackフィールド + Anthropicクレデンシャル）
- **担当**: Claude Code
- **ステータス**: REVIEW（PR待ち・一部#38マージ済み）
- **ブランチ**: fix/rio-103-slack-fields（#38 マージ済み）→ fix/rio-103-credentials
- **PR**: #38（Slackフィールド・マージ済み）、（クレデンシャル修正・新規PR）
- **期限**: -
- **備考**: 構造検証ツールで発見した2件の再インポート不具合を修正。(1) Slack通知が空欄で送信される問題（qa_judgment/qa_reasoning → qa_status/note）= #38でマージ済み。(2) Anthropic 2ノード（Draft/QA Call）に credentials 参照が欠落しており、リポジトリJSONを再インポートすると認証未選択で401になる問題 → 101/700系と同じ anthropicApi クレデンシャル(gSjvXXaj0OLWBIza)を明示バインド。実効化には n8n 再インポートが必要。孤立ノード「Slack Notification」の削除可否は要ゆうさん判断（未変更）。

---

<!-- 新しいタスクは上記フォーマットに従ってここに追加する -->
