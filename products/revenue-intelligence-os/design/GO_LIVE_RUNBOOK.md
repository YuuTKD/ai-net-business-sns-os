# GO_LIVE_RUNBOOK — Anthropic連携ワークフローの本稼働準備手順

DEV_RIO_101/102/103のAnthropic API連携（[[N8N_WORKFLOW_CATALOG]]）を、
実データで動かせる状態にするまでの手動セットアップ手順。全てゆうさんの操作が必要。
Claude Codeは自動実行しない（課金操作・Credential作成・外部公開は[[RISK_APPROVAL_POLICY]]で最高〜高リスク）。

---

## 前提

- 対象Workflow: `workflows/n8n/DEV_RIO_101_Evidence_Build.json` / `102_Experiment_Design.json` / `103_Content_QA_Approval.json`
- 全てManual Trigger・`active: false`。本Runbookの手順を終えても自動実行は始まらない。
- ローカルでの配線検証は `tests/simulate_pipeline.mjs` で実施済み（`node products/revenue-intelligence-os/tests/simulate_pipeline.mjs` で再実行可能）。

---

## 手順1: Anthropicクレジット購入

1. https://console.anthropic.com にログイン
2. Plans & Billing → クレジット購入（最小単位でよい。まず動作確認が目的）
3. 購入後、反映まで数分待つ場合がある

**判定方法**: n8nでAnthropic呼び出しノードを1つ実行し、`Bad request - please check your parameters` / `Your credit balance is too low` が出なくなれば反映済み。

---

## 手順2: n8nへのWorkflow再インポート（重複作成に注意）

**⚠️ 注意**: 新しいJSONファイルにはworkflow内部IDが含まれていない。ワークフロー一覧ページから「新規インポート」すると、既存のDEV_RIO_101/102/103とは別の重複ワークフローが作られてしまう。

**正しい手順（3ファイル分繰り返す）**:
1. n8n (`yuu1988.app.n8n.cloud`) を開く
2. ワークフロー一覧から**既存の対象ワークフローを開く**（新規作成しない）
3. 開いた状態で右上「...」メニュー → 「ファイルからインポート...」
4. 対応するJSONファイルを選択
   - `DEV_RIO_101_Evidence_Build.json` → 既存の「DEV_RIO_101_Evidence_Build」を開いた状態でインポート
   - `DEV_RIO_102_Experiment_Design.json` → 既存の「DEV_RIO_102_Experiment_Design」
   - `DEV_RIO_103_Content_QA_Approval.json` → 既存の「DEV_RIO_103_Content_QA_Approval」
5. インポート後、ワークフロー一覧の件数が増えていないか確認（増えていたら重複。古い方を削除）

---

## 手順3: Anthropic Credentialの再選択

インポート直後は各HTTP RequestノードのCredential欄が空になっている（Credential IDはインスタンス固有のためJSONに含めていない）。以下4箇所で、既存の1件（表示名は日本語UIの誤訳で「人間中心主義的説明」等と出るが中身は正しくAnthropic）を選び直す。

| Workflow | ノード名 |
|---|---|
| DEV_RIO_101 | Anthropic Research Call |
| DEV_RIO_102 | Anthropic Design Call |
| DEV_RIO_103 | Anthropic Draft Call |
| DEV_RIO_103 | Anthropic QA Call |

各ノードを開く → 認証欄の資格情報ドロップダウン → 既存の1件を選択 → 保存。

---

## 手順4: LINE通知のセットアップ（任意・後回し可）

DEV_RIO_103には下書き完成時にLINE通知を送る仕組み（「LINE Push Notification」ノード）が組み込まれているが、`continueOnFail: true` のため未設定でもパイプライン自体は止まらない。**手順1〜3だけでもワークフロー本体のテストは可能**。通知を有効化する場合のみ以下を実施:

1. https://developers.line.biz でMessaging APIチャネルを作成（未作成の場合）
2. チャネルアクセストークン（長期）を発行
3. n8nで新規Credentialを作成: 種別「Header Auth」、名前を**「LINE Messaging API」**に設定（この名前で参照している）、Name欄=`Authorization`、Value欄=`Bearer <発行したトークン>`
4. 通知先の`line_user_id`を取得（自分のOAを友だち追加してメッセージを送信 → Webhookログ or LINE公式アカウントマネージャーの分析画面等から取得。この手順はPCでの確認が楽）
5. DEV_RIO_103の実行時、Manual Triggerの入力データに`line_user_id`を含める

---

## 手順5: 実データでのエンドツーエンドテスト

1. DEV_RIO_101をManual Triggerで実行。入力に実際のテーマ・想定読者を指定（例: `{"theme": "実際に検証したいテーマ", "audience": "実際の想定読者"}`）
2. 出力のevidence_pack（facts配列、全て`source_type: estimation`であること）を確認
3. evidence_packをそのままDEV_RIO_102のManual Trigger入力にコピーして実行
4. 出力のexperiment（`variable_changed`が1つのみ、`valid: true`であること）を確認
5. experimentをそのままDEV_RIO_103のManual Trigger入力にコピーして実行
6. 出力のnote_body/threads_postを確認。**`【実際の経験に置き換える：...】`のプレースホルダーが残っていないか必ず確認**（残っていればqa_statusはFIX_REQUIREDになっているはずで、これは正常動作）
7. 出力品質をゆうさんと一緒にレビュー

**この時点では公開・投稿は一切行わない**（[[BROWSER_USE_POLICY]]の通り、DEV_RIO_201/301での配信準備・判断は別途）。

---

## トラブル時

- Anthropic呼び出しがエラーになる → `Parse Research/Design/Draft`系ノードの出力で`*_error`フィールドを確認。フォールバック値が返っていればパイプラインは正常に安全側へ倒れている。
- 出力フィールドが空/undefinedになる → `tests/simulate_pipeline.mjs`と同じ配線になっているか、該当Codeノードの返り値を確認（REPORT-014でtheme/audience/facts/note_bodyのフィールド不整合を一度修正済み）。

関連: [[N8N_WORKFLOW_CATALOG]] [[RISK_APPROVAL_POLICY]] [[COST_LIMITS]] [[TEST_PLAN]]
