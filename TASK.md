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

### TASK-022: Threads 投稿自動化パイプライン構築（毎日21:00自動投稿）
- **担当**: Claude Code（エンジニア・SNS運用担当）
- **ステータス**: IN_PROGRESS（n8n UI インポート待ち）
- **ブランチ**: feature/threads-auto-daily-schedule
- **PR**: （作成中）
- **期限**: 2026-08-04（投稿4初回投稿予定）
- **備考**: DEV_RIO_705 ワークフローを毎日21:00自動実行に設定。投稿4・5・6を posts_queue.csv で管理。修正版 JSON（DEV_RIO_705_Auto_Daily_Schedule.json）作成済み、n8n UI でのインポート待ち。投稿7は Brain 実サイト公開待ちで scheduled_pending 状態。手動操作：n8n UI で「Workflow Import」実施（5分程度）。

### TASK-021: Threads投稿第1弾 投稿3の公開
- **担当**: Claude Code（SNS運用担当・画面操作オペレーター）
- **ステータス**: REVIEW（実施完了・PR待ち）
- **ブランチ**: feature/threads-post3-published
- **PR**: （作成中）
- **期限**: 2026-08-03（完了）
- **備考**: 投稿3（高評価口コミへのお礼・共感型）を sns-post-quality-check で検品（初回スコア7→修正版スコア9）し、Threads @ai_store_lab に公開。投稿1・2とのテーマ重複がないことを確認済み（PR #46で公開した投稿2は本PR時点で未マージのためTASK-020として別枠）。これで7本中3本公開完了（残り4本）。

### TASK-019: 価格戦略変更の反映 + 楽天アフィリ4本目追加 + Threads投稿第1弾の開始
- **担当**: Claude Code（CEO/ライター/エンジニア/画面操作オペレーター）
- **ステータス**: REVIEW（実施完了・PR待ち。Brain実サイトの価格変更はゆうさん対応待ち）
- **ブランチ**: feature/rio-705-reliability-and-content
- **PR**: （作成中）
- **期限**: 2026-08-02（完了）
- **備考**: ゆうさんの指示で価格戦略変更（キット¥3,980→¥1,980、口コミ返信テンプレ30本を¥980で新規公開）。リポジトリ内25ファイルの価格記載を更新し、offers.csvに新商品行(off_22)を追加。Threads投稿7本目の告知文を¥980テンプレ単体向けに書き直しQA PASS。楽天アフィリ4本目リンク（RKT-004・業務用ペーパータオル・清掃用品ジャンル）を発行しリンクライブラリに追加。sns-post-quality-check通過後、Threads投稿1本を実際に手動投稿（Thread確認済み）。**残: Brain実サイトでの価格変更・テンプレ商品公開はゆうさんのログインが必要。完了後offers.csvのURLプレースホルダーを実URLに差し替え**。

### TASK-014: DEV_RIO_705（Threads×楽天自動投稿）の段階的ロールアウト・本番化準備
- **担当**: Claude Code
- **ステータス**: DONE（Threads本番投稿テスト成功・PR待ち）
- **ブランチ**: feature/rio-threads-auto-posting（作成予定）
- **PR**: （作成予定）
- **期限**: 2026-08-09（段階的承認 Threads 第1号）
- **備考**: DEV_RIO_705をdry-runから自動投稿実行モードに切り替え。policy_auto_posting_rollout.md の段階的承認方針に基づき「1事業・1アカウント・1ジャンルの1媒体ずつ」Threads から開始。n8nインポート・ワークフロー構造テスト完了（REPORT-028）。**その後、Meta Developer Portal で Threads API の Long-lived User Access Token を取得（アカウント: ai_store_lab）し n8n Credentials に Bearer Auth account として保存（Credential ID: EqL89RW6m6CtCIbm）、DEV_RIO_705_Threads_Rakuten_Prepare.json を実 Threads API 連携版（graph.threads.net の Create Threads Container → Publish Threads Post）に更新。既存ワークフロー（ID: wi1FHcHzABSV9dHv）で実行テストを実施し、@ai_store_lab アカウントへ実際に2件投稿成功（Thread ID: 18117979762927230, 17971585581120942／posted_count: 2, failed_count: 0）。これにより auto_posting_rollout_policy の第1弾（Threads）の本番稼働を確認済み（REPORT-029）。残: PR作成→ゆうさん最終承認→merge→他プラットフォームへの段階的展開検討。

### TASK-017: 楽天アフィリエイト収益導線の立ち上げ（リンクライブラリ + 実リンク入り自動投稿）
- **担当**: Claude Code（AI社員分業体制: CEO/リサーチャー/エンジニア/画面操作オペレーター/SNS運用担当）
- **ステータス**: REVIEW（実装・本番テスト完了・PR待ち）
- **ブランチ**: feature/rakuten-affiliate-launch
- **PR**: （作成中）
- **期限**: 2026-08-02（完了）
- **備考**: ゆうさんの楽天アフィリアカウントで実リンク3本を発行（リングライト2%/A型看板10%/Instagram集客本3%）し、`rakuten_link_library.csv` に登録。DEV_RIO_705 を「ライブラリの実リンクにマッチした下書きのみ【PR】付きで投稿、マッチしなければ投稿しない」設計に改修。本番テストで1件投稿成功（Thread ID: 18092211170549800・楽天商品カード自動展開を確認）。残: 失敗1件（Bad request）の原因調査、投稿ペース運用ルールの決定（REPORT-030）。

### TASK-018: AI社員10名体制の構築（サブエージェント + Obsidian情報共有ハブ）
- **担当**: Claude Code
- **ステータス**: REVIEW（構築完了・PR待ち）
- **ブランチ**: feature/rakuten-affiliate-launch
- **PR**: （作成中）
- **期限**: 2026-08-02（完了）
- **備考**: `.claude/agents/` に10名（CEO/リサーチャー/ライター/編集者/SNS運用担当/カスタマーサクセス/経理アナリスト/QAセキュリティ/画面操作オペレーター/エンジニア、全員 model: fable）のエージェント定義を作成。`obsidian/AI-NET-BUSINESS/AI_EMPLOYEES/` にCEOダッシュボード+9名分ノート（作業ログ・申し送りの型）を作成し、部門横断の情報共有ハブとして運用開始。初仕事として売上ベースライン調査（実収益¥0確認）・Threads導線分析（2系統の発見）・楽天アフィリ立ち上げを分業実施（REPORT-030）。

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
- **ステータス**: DONE（n8n実装完了・テスト成功・PR待ち）
- **ブランチ**: feature/rio-lead-generation-line
- **PR**: （作成予定）
- **期限**: 完了：2026-08-02
- **備考**: 【実装完了】700系と同一の dry-run パターンで実装。リード情報を入力に、LINE通知用のメッセージを生成して、送信前に停止。active:false・自動送信なし。qa_status=PASSゲート / Anthropic(gSjvXXaj0OLWBIza) / graceful fallback / エラーハンドリング完備。n8n での実行テスト合格（全ノード緑色）。実効化は n8n UI での再インポート後、LINE Messaging API credentials 設定が必要（ただし自動送信はしない）。

### TASK-011: DEV_RIO_602（Sales Funnel LINE フォローアップ）
- **担当**: Claude Code
- **ステータス**: DONE（n8n実装完了・テスト成功・PR待ち）
- **ブランチ**: feature/rio-sales-funnel-line
- **PR**: （作成予定）
- **期限**: 完了：2026-08-02
- **備考**: 【実装完了】セールスファネル段階に応じた LINE フォローアップメッセージの下書きを生成。スケジュール実行対応（daily trigger）。state='WAITING_APPROVAL'・published=false で停止。qa_status=PASSゲート / Anthropic(gSjvXXaj0OLWBIza)クレデンシャル / graceful fallback / JSON検証済み。n8n での実行テスト合格。LINE Messaging API credentials 設定は LINE Official Account 採用決定に基づき、実装段階で追加予定（ただし自動送信禁止）。

### TASK-012: DEV_RIO_603（Customer Retention LINE 提案）
- **担当**: Claude Code
- **ステータス**: DONE（n8n実装完了・テスト成功・PR待ち）
- **ブランチ**: feature/rio-retention-line
- **PR**: （作成予定）
- **期限**: 完了：2026-08-02
- **備考**: 【実装完了】顧客セグメント（general/VIP/at-risk）ごとのリテンション/継続提案を下書き生成。週次スケジュール実行対応。state='WAITING_APPROVAL'・published=false で停止。qa_status=PASSゲート / Anthropic(gSjvXXaj0OLWBIza)クレデンシャル / graceful fallback / JSON検証済み。n8n での実行テスト合格（全ノード緑色）。LINE Official Account 基盤に統合予定。CLAUDE.md 「自動送信禁止」を完全準拠。

### TASK-013: DEV_RIO_704（Threads×note リパーパス下書き）
- **担当**: Claude Code
- **ステータス**: REVIEW（再設計・実装完了・PR待ち）
- **ブランチ**: feat/rio-704-repurpose
- **PR**: （新規PR）
- **期限**: -
- **備考**: 【再設計して実装】「自動投稿・自動展開」案は撤回し、700系と同一の下書き準備パターンで再実装。103の記事を Instagramキャプション/ショート動画台本/Substack導入 の3フォーマットにリパーパスした**下書きのみ**生成し、公開直前で停止。active:false・投稿APIなし・人間が各媒体へ手動投稿。qa_status=PASSゲート / Anthropic(既存クレデンシャル) / graceful fallback / JSON構文・挙動テスト合格。運用手順は design/RIO_700_SERIES_RUNBOOK.md に追記。複合効果+20%等の数値は未検証。

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

### TASK-023: 収益化加速戦略 Monday キックオフ会議の実行（意思決定 + Week1着手）
- **担当**: Claude Code（CEO代理）/ ゆうさん
- **ステータス**: IN_PROGRESS
- **ブランチ**: docs/revenue-acceleration-kickoff-w1
- **PR**: （作成予定）
- **期限**: Week 1 チェックポイント 2026-08-10
- **背景**: 前セッションで作成された4戦略ドキュメント（REVENUE_ACCELERATION_STRATEGY_2026-08-09.md / N8N_PIPELINE_EXPANSION_SPEC.md / IMPLEMENTATION_SCHEDULE_AND_CHECKLIST.md / EXECUTIVE_SUMMARY_REVENUE_ACCELERATION.md）を読み込み、EXECUTIVE_SUMMARY内「意思決定が必要な5つのポイント」についてCEOとして意思決定し、Week1タスクの一部に着手した。
- **⚠️ 重要な事実訂正（本タスクで判明）**: N8N_PIPELINE_EXPANSION_SPEC.md は note.com に **OAuth 2.0 の公式投稿API（POST /api/v1/notes 等）が存在する前提**で DEV_RIO_801 を設計しているが、Web調査の結果 **note.com に公式APIは存在しない**（公式ヘルプでも「現在公開しているAPIはない・公開予定も未定」と明記）。存在するのは有志が解析した非公式APIのみで、記事取得（読み取り）系が中心。投稿（書き込み）系の非公式エンドポイントも一部報告されているが、規約上のグレー・将来の破壊的変更リスクが高く、CLAUDE.mdの安全重視方針にそぐわない。一方、本リポジトリには既に **Claude in Chrome によるブラウザ操作でnote下書きを作成する実績とSOP**（REPORT-005〜008、`reports/note先行10本_公開SOP.md`）があり、これは公開ボタンを押さない「下書き保存のみ」の安全な運用実績である。→ **DEV_RIO_801はOAuth API前提を撤回し、「Claude in Chromeによる下書き作成補助＋ゆうさん本人の手動公開」方式に再設計する**方針をCEO決定として記録する（実装は別タスクで着手）。
- **CEOの5つの意思決定**（EXECUTIVE_SUMMARY §「意思決定が必要な5つのポイント」に対する回答）:
  1. **展開順序**: 同時展開ではなく**段階展開**を採用。Threads（既存運用中）が安定稼働を継続する中で、note（ただしAPIではなくブラウザ操作の下書き補助、上記訂正済み）→ Instagram（Meta Graph API、要ビジネスアカウント審査、Week2以降）→ メルマガ（Mailchimp、実在する公式APIのため技術リスク低、Week1後半〜Week2）の順に慎重に立ち上げる。EXECUTIVE_SUMMARYの「同時展開」推奨は、存在しないnote APIへの開発投資が無駄になるリスクを踏まえ不採用。
  2. **メルマガ登録目標**: 保守的な **8月末50名** を採用（攻撃的な80名案は不採用）。9月末150名は「参考目標」として維持するが、8月末の実測を見て9月にゆうさんへ再確認する。
  3. **投稿の承認・自動化タイミング**: **人間承認を9月末まで継続**（「Yes, auto-publish by Sep 15」は不採用）。CLAUDE.md絶対禁止事項「本番SNS自動投稿の実行」「自動DM送信の実行」および既存の段階的承認ポリシー（1事業・1アカウント・1ジャンル・1媒体ずつ承認、`memory/policy_auto_posting_rollout.md`）に基づく。新規媒体（note/Instagram/メルマガ）はすべて **`sns-post-quality-check` Skill PASS + ゆうさん承認** をゲートとし、posts_queue.csvのapprover_action欄運用を踏襲する。
  4. **投稿頻度の上限**: 8月末 週4-5回、9月末 週7回（1日1回）を**上限**として段階増加。品質 > 投稿量の原則（EXECUTIVE_SUMMARY記載）を優先し、品質ゲート未達時は頻度を上げない。
  5. **予算・リソース割当**: EXECUTIVE_SUMMARY案（¥1.65M）は不採用。実収益がまだ検証段階（過去のREPORT-003監査で実収益実質¥0の時期があり、¥21K/月という現状値も未検証の推定値である点に留意）であるため、**Week1-4は原則¥0の追加現金支出**（実行はゆうさん＋Claude Codeで対応、n8n/Typeform/Mailchimpは無料枠を使用）とし、外注予算（Dev/Writer等）の検討は9月のGo/Stop判定でLTVが検証されてから行う。EXECUTIVE_SUMMARY内の「Dev/Ops/Writer/Analyst lead」という体制は本リポジトリの実運用体制（ゆうさん + Claude Code）と一致しないため、実行計画上は役割ではなくタスクとして扱う。
- **Week1着手内容**（本タスクで実施）:
  - note API調査（Web検索）: 上記の通り「公式APIなし」を確認。調査結果はREPORT側に記録。
  - posts_queue.csv 拡張スキーマ設計: N8N_PIPELINE_EXPANSION_SPEC.md §C の v2スキーマ案をベースに、note列を「API前提」から「ブラウザ下書き運用前提」に修正した提案スキーマを作成（`products/revenue-intelligence-os/data/posts_queue_v2_proposed_schema.csv` に新規作成、**既存の本番 posts_queue.csv は未変更**）。DEV_RIO_705が単純split方式でCSVをパースしており、カンマを含む値（ハッシュタグ等）でパースが壊れる既知の脆弱性があるため、v2移行時はCSVパーサ自体の堅牢化（quoted-field対応）が先行タスクとして必要である旨を明記。
  - TASK.md本エントリでキックオフと5決定を記録。
- **⚠️ ガバナンス上の追加発見**: 本タスク着手のため作業ブランチを `main` から新規作成したところ、`main` の `posts_queue.csv` はヘッダー行のみ（post_4〜7の投稿データなし）、`threads_posts.csv` は存在せず、`DEV_RIO_705_Auto_Daily_Schedule.json`（cronで毎日21:00に自動実行し `graph.threads.net` へ実際に投稿する版）も存在しないことが判明した。これらは TASK-022 / REPORT-034 / REPORT-035 として別ブランチ `feature/threads-auto-daily-schedule` にのみ存在し、**まだ `main` にマージされていない（PR未作成）**。つまり「Threadsが毎日21:00に自動投稿中」という本キックオフの前提は、git上は未レビュー・未承認の状態のコードに基づいている（n8n UI側で既にインポート・Activate済みの可能性はあるが、リポジトリの記録だけでは確認できない）。CEOとして次を推奨: (1) TASK-022のブランチを早急にPR化しゆうさんのレビュー・承認を得ること、(2) n8n UI上で当該ワークフローが実際にActivate状態か確認すること、(3) 確認が取れるまで本キックオフの新規媒体展開は「Threadsは安定稼働中」という前提を過信せず、8/4-8/6の投稿4-6が実際に投稿されたかを目視確認してから次の判断に進むこと。
- **未着手・次のステップ**（要ゆうさん確認の上、別タスクで着手）:
  - DEV_RIO_801（note）をブラウザ操作前提で再設計・実装
  - DEV_RIO_803（Mailchimp）の実API仕様確認・skeleton実装
  - DEV_RIO_802（Instagram / Meta Graph API）はビジネスアカウント審査状況の確認が先
  - posts_queue.csv本体をv2へ移行するかはDEV_RIO_801再設計完了後にゆうさんと判断
- **pre-deploy-qa 判定**: 対象外（ドキュメント作成・調査のみ。デプロイ・Scheduler変更・外部API本番呼び出しなし）
- **確認事項**: 本タスクでは note/Instagram への実投稿、Mailchimp/note API への実接続は一切行っていない。`.env.local` には触れていない。APIキーはファイルに直書きしていない。

---

<!-- 新しいタスクは上記フォーマットに従ってここに追加する -->
