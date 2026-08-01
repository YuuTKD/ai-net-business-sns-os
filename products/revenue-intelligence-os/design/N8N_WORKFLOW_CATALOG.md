# N8N_WORKFLOW_CATALOG — Workflowカタログ（§15）

環境: `yuu1988.app.n8n.cloud`（無料試用・残14日・Workflow 0）。
方針: 一度に本番化しない。**Manual Trigger + dry-run** で1本ずつ設計→[[BROWSER_USE_POLICY]]で画面インポート→テスト→Activateせず停止。

## DEV Workflow（6本・順次）
DEV_RIO_001/201/301はルールベースの決定論的ロジック（`manualTrigger → code(×N) → noOp`、dry-run・外部アクションなし）のまま意図的に据え置き。DEV_RIO_101/102/103はAnthropic API（claude-sonnet-4-5）による実リサーチ/実生成に置き換え済み（REPORT-010/012/014、要Anthropicクレジット。手順は[[GO_LIVE_RUNBOOK]]）。

| # | 名前 | 目的 | 実装済みノード構成 |
|---|---|---|---|
| 1 | DEV_RIO_001_Opportunity_Intake | アイデア/案件を登録し EXECUTE_NOW/MERGE/VALIDATE/HOLD/STOP に分類 | Manual Trigger → Code(Define Opportunity) → Code(Classify) → Code(Build Job Record) → NoOp(Result) |
| 2 | DEV_RIO_101_Evidence_Build | 悩み/需要/競合/商品/実体験/根拠URL/素材を Evidence Pack 化（Anthropic APIで一般的傾向をリサーチ。source_typeはestimation/unknownのみ・捏造禁止） | Manual Trigger → Code(Collect Inputs) → Code(Build Research Prompt) → HTTP Request(Anthropic Research Call) → Code(Parse Research Response) → Code(Assemble Evidence Pack) → NoOp(Result) |
| 3 | DEV_RIO_102_Experiment_Design | 誰に/何を/どの訴求/媒体/成功・停止条件/変更変数1つ をAnthropic APIに設計させ登録（失敗時は安全なデフォルト値にフォールバック） | Manual Trigger → Code(Collect Evidence Input) → Code(Build Experiment Design Prompt) → HTTP Request(Anthropic Design Call) → Code(Parse Experiment Design) → Code(Validate: single variable) → NoOp(Result) |
| 4 | DEV_RIO_103_Content_QA_Approval | note/Threads下書きをAnthropic APIに生成させ、AI自己QA＋決定論的ルールチェック（アフィリ+PR表記漏れ等）を統合判定、下書き完成時はLINE通知、人間承認待ち | Manual Trigger → Code(Collect Content Brief) → Code(Build Content Draft Prompt) → HTTP Request(Anthropic Draft Call) → Code(Parse Content Draft) → Code(Build QA Prompt) → HTTP Request(Anthropic QA Call) → Code(Combine QA Result) → Code(Build LINE Message) → HTTP Request(LINE Push Notification) → NoOp(Await Human Approval・**公開なし**) |
| 5 | DEV_RIO_201_Threads_Note_Distribution | Threads投稿候補・note下書き・UTMリンクを準備・**公開直前で停止** | Manual Trigger → Code(Prepare Distribution) → Code(Stop Before Publish) → NoOp(Result・**公開なし**) |
| 6 | DEV_RIO_301_Performance_Revenue_Decision | 表示/クリック/購入/報酬/費用/稼働 を記録し SCALE/ITERATE/HOLD/STOP 提案 | Manual Trigger → Code(Ingest Metrics) → Code(Compute KPI+Cost) → Code(Decide) → NoOp(Result・提案のみ) |

実際に n8n 画面へインポートして Browser Use 操作を伴う実行（外部Credential接続・HTTP接続等）を追加する段階は、[[BROWSER_USE_POLICY]] / `runbooks/N8N_IMPORT_RUNBOOK.md` に従う。

パイプライン各段（101→102→103→201）の出力/入力フィールドの整合性は `tests/simulate_pipeline.mjs` でローカル検証済み（REPORT-014）。

## 本番化（§21）
- 3回連続テスト合格後のみ `DEV_*` を複製し `PROD_*` 候補を作成。**無断Activate禁止**。
- 本番化前チェック: pre-deploy-qa / scheduler-readiness-check / Secret監査 / JSON監査 / Credential / 冪等性 / エラー処理 / ロールバック。

## エクスポート
- 各Workflowは検証後 n8n画面から JSON エクスポート → `workflows/n8n/` に保存（正本はGitHub）。

関連: [[JOB_STATE_MACHINE]] [[TEST_PLAN]] [[ROLLBACK_PLAN]] [[GO_LIVE_RUNBOOK]]
