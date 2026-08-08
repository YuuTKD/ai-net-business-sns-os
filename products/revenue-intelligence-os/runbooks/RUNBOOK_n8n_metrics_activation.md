# RUNBOOK｜n8n メトリクス自動収集の起動（有料プラン前提）

作成: 2026-08-07 / 対象: DEV_RIO_401_Metrics_Ingestion（読み取り専用・投稿なし）
前提: n8n有料プラン継続。無断Activate禁止・完全無人"投稿"禁止（本WFは投稿を伴わない読み取りのみ）。
判定: 現状 scheduler-readiness-check = NOT_READY（未接続・未テスト・off-switch/fail-stop未確認）。本手順の完了後に再判定する。

---

## 0. まず決めること（ゆうさん・5分）
- [ ] n8n有料プランにアップグレード（試用残6日中に）。プラン確定後にActivate前提の作業へ進む。
- [ ] このWFの目的を「収益判断の材料を毎日そろえる（読み取り専用）」に限定する（投稿・DMは一切させない）。

## 1. データ源の実現度（重要・MVPの線引き）
全自動を狙わず、取れるものから自動化する。

| 媒体 | 取得方法 | 対応 |
|---|---|---|
| Gumroad | 公式API（access token） | ✅ 自動 |
| Threads | Threads Graph API（@ai_store_lab既存トークン） | ✅ 自動 |
| Brain | 公式API要確認。無ければ売上管理画面から手入力 | ⚠️ 手入力想定 |
| note | 公式の数値API無し。ダッシュボードから手入力 or YU HOLDINGS AI MCPで集約 | ❌ 手入力/MCP |
| WordPress(アフィリ) | 各ASP管理画面（A8/もしも）の成果は手入力。WP閲覧はJetpack/GA連携で自動化余地 | ⚠️ ASPは手入力 |

**MVP方針**：①Gumroad＋Threadsを自動取得 ②note/Brain/ASPは週次で手入力（or MCP）を「入力シート」に集約 ③401はそれらを統合してKPI算出。
→ "全自動ダッシュボード"ではなく "半自動・入力最小化ダッシュボード" を最初のゴールにする。

## 2. 401 をインポート（ゆうさん・2分）
※ブラウザ自動操作はネイティブのファイル選択に阻まれるため、ここは手動が確実。
- [ ] n8n → 新規ワークフロー → 右上「⋯」→「Import from file...」
- [ ] `products/revenue-intelligence-os/workflows/n8n/DEV_RIO_401_Metrics_Ingestion.json` を選択
- [ ] ノードが8個読み込まれることを確認（Manual Trigger→Collect Sources→Gumroad/Brain Query→Aggregate→Platform Metrics→Compute→Result）
- [ ] 名前を `DEV_RIO_401_Metrics_Ingestion` に確認、**Activateせず**保存（active:false）
- 備考: JSONのコード内キー文字化けは修正済み（`yu_holdings_ai`）。

## 3. Credential 登録（ゆうさん・Secretは本人のみ）
Claudeはトークンに触れない。以下はゆうさんがn8n Credential画面で登録。
- [ ] **Gumroad**: Gumroadで access token 発行 → n8n「Header Auth」credentialに `Authorization: Bearer <token>` を登録 → Gumroad Sales Query ノードに割当。`GUMROAD_API_URL` は `https://api.gumroad.com/v2/products`。
- [ ] **Threads**: @ai_store_lab の Threads Graph API トークン（threads_basic）を登録。※メトリクス取得用に Collect Platform Metrics ノードをHTTP Requestに置き換える設計追加が必要（後述4）。
- [ ] **Brain**: 公式APIの有無を確認。無ければBrain Sales Queryノードは無効化し、売上は手入力欄へ。
- [ ] Secretは `.env.local` やリポジトリに置かない（n8n Credential内のみ）。

## 4. 未実装部分の設計追加（Claude下書き可・実装は要テスト）
現状 Collect Platform Metrics は入力値をそのまま通すダミー。実データ化には：
- [ ] Threads Graph API（GET /me/threads_insights 等）でimpressions/clicks/engagementを取得するHTTP Requestノードを追加
- [ ] note/Brain/ASPの手入力値を受け取る入力口（n8n「Data table」or Google Sheets読み取り）を追加
- [ ] これらを Compute Final Metrics に統合
- ※この設計・下書きJSONはClaudeが自動作成可能。実接続テストはn8n画面で。

## 5. テスト（Manual Trigger・投稿なし）
- [x] Manual実行 → 全9ノードがエラーなく通ることを確認（2026-08-08、v2で実施）。
      - Gumroad Sales Query：**ライブデータ取得成功**（応答 success:true・製品リスト取得）
      - Parse Gumroad→Compute Final Metrics：構造化メトリクス出力・state=READY_FOR_DECISION
      - 通知ノード：disabledのままスキップ（Slack Webhook URL未設定のため想定どおり）
- [x] 出力の `metrics` / `errors` を確認（捏造なし。note/Brain/ASPは手入力欄=0のまま＝欠損明示）
- [ ] 3回連続で安定実行（残：activate前に再確認）

## 6. 無人化の安全条件（scheduler-readiness 再判定）
Activate前に以下を満たす（未達ならALMOST_READY止まり）：
- [ ] off-switch: WFを即Deactivateできることを確認
- [x] fail-stop: Error Trigger WF「DEV_RIO_402_Error_Handler」作成（Error Trigger→Format Error→Slack Alert）＋メインWF設定の「エラーワークフロー」に紐付け済み（2026-08-08）。
      - DEV_RIO_402のSlack AlertノードにWebhook URL貼付済み（2026-08-08・メインと同一URL）。残：DEV_RIO_402をactive化（Error WFは常時active必須）＝有料化後。
      - ローカル下書き：products/revenue-intelligence-os/workflows/n8n/DEV_RIO_402_Error_Handler.json
- [x] **Slack通知**（無人運用の必須条件。LINEから変更＝2026-08-08）: 実装＆テスト完了（2026-08-08）
      - Slackアプリ「RIO Metrics Notifier」作成（App ID A0BNRCP7Z4M）→ Incoming Webhooks有効化 → #日報チャンネルにWebhook発行
      - n8nの「Slack Notify」ノード：認証None・url=Webhook URL・body `{"text": <notification_text>}`・**有効化済み**
      - Manual実行でSlackが200応答（node出力 `{"データ":"わかりました"}`＝ok）を確認＝**#日報に投稿成功**
      - ※Webhook URLはSecretのためリポジトリには記録しない（n8nノード内のみ保持）。一度チャット露出した旧URLは削除・再発行済み。
- [ ] ロールバック手順: 本RUNBOOK＋ROLLBACK_PLANで代替
- [ ] `scheduler-readiness-check` を再実行 → READY を得る

## 7. Activate（ゆうさんの明示承認が必須）
- [ ] pre-deploy-qa で GO
- [ ] 最小頻度から開始：**1日1回・朝（例 8:00 JST）・14日間の観察期間**
  - cron例: `0 8 * * *`
- [ ] 停止条件: 連続2回失敗 / Slack通知未達 / 異常値検出 → 即Deactivate
- [ ] 監視: 毎朝の通知をゆうさんが確認。14日無事故なら継続。

---

## この自動化で得られること
- ゆうさんが手で追っている数字（Gumroad売上・Threads反応 等）が毎朝そろう
- 収益判断（SCALE/ITERATE/HOLD/STOP）の材料が自動で整い、次の一手が速くなる
- 投稿は一切自動化しない＝コンプラ安全（CLAUDE.md準拠）

## Claudeが自動でできる次段（指示があれば着手）
- 4章の「Threads Insights取得＋手入力口」を足した **401 v2 JSONの下書き作成**
- Slack通知ノードの下書き追加（実装済み＝2026-08-08。ゆうさんはWebhook URLを貼るだけ）
- note/Brain/ASP手入力用の入力シート様式の作成
（実接続・Credential・Activateはゆうさん）
