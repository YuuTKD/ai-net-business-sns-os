# N8N_WORKFLOW_CATALOG — Workflowカタログ（§15）

環境: `yuu1988.app.n8n.cloud`（無料試用・残14日・Workflow 0）。
方針: 一度に本番化しない。**Manual Trigger + dry-run** で1本ずつ設計→[[BROWSER_USE_POLICY]]で画面インポート→テスト→Activateせず停止。

## DEV Workflow（6本・順次）
| # | 名前 | 目的 | 主要ノード（想定） |
|---|---|---|---|
| 1 | DEV_RIO_001_Opportunity_Intake | アイデア/案件を登録し EXECUTE_NOW/MERGE/VALIDATE/HOLD/STOP に分類 | Manual Trigger → Set(入力) → Code(分類ロジック) → Code(jobs追記) → NoOp(結果) |
| 2 | DEV_RIO_101_Evidence_Build | 悩み/需要/競合/商品/実体験/根拠URL/素材を Evidence Pack 化 | Manual Trigger → HTTP/AI(調査) → Code(整形) → 保存 |
| 3 | DEV_RIO_102_Experiment_Design | 誰に/何を/どの訴求/媒体/成功・停止条件/変更変数1つ を登録 | Manual Trigger → Set → Code(検証) → 保存 |
| 4 | DEV_RIO_103_Content_QA_Approval | note/Threads/CTA/PR表記/アフィリ候補を作成しQA後 人間承認待ち | Manual Trigger → AI(生成) → Code(QA) → Wait(承認) |
| 5 | DEV_RIO_201_Threads_Note_Distribution | Threads投稿候補保存・note下書き作成・リンク挿入・**公開直前で停止** | Manual Trigger → Code → (Browser Use連携) → Stop |
| 6 | DEV_RIO_301_Performance_Revenue_Decision | 表示/クリック/購入/報酬/費用/稼働 を記録し SCALE/ITERATE/HOLD/STOP 提案 | Manual Trigger → 取得 → Code(集計) → Code(判定) |

## 本番化（§21）
- 3回連続テスト合格後のみ `DEV_*` を複製し `PROD_*` 候補を作成。**無断Activate禁止**。
- 本番化前チェック: pre-deploy-qa / scheduler-readiness-check / Secret監査 / JSON監査 / Credential / 冪等性 / エラー処理 / ロールバック。

## エクスポート
- 各Workflowは検証後 n8n画面から JSON エクスポート → `workflows/n8n/` に保存（正本はGitHub）。

関連: [[JOB_STATE_MACHINE]] [[TEST_PLAN]] [[ROLLBACK_PLAN]]
