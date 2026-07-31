# RUNBOOK — n8n Workflow インポート（§16）

対象: `browser-operator`（Browser Use）。前提: PR #19 承認後・Workflow JSON は `workflows/n8n/` にある。
環境: `yuu1988.app.n8n.cloud`（無料試用）。**Activate しない。**

## 事前チェック
- [ ] 対象JSONが `workflows/n8n/` にあり、`node -e "JSON.parse(...)"` で妥当
- [ ] n8n にログイン済み（未ログインは §17 で人間へ依頼）
- [ ] DEV用Project（なければ作成候補を提示 → 人間確認）

## 手順（§16の20ステップを実運用化）
1. n8n を開く（`yuu1988.app.n8n.cloud`）
2. DEV用Project を確認 / 作成候補提示
3. 新規Workflow作成（右上「+」）
4. `…`メニュー → **Import from File / URL** で対象JSONをインポート
5. ノード配置・接続順を確認（Manual Trigger → … → NoOp）
6. ノード名・Expressions・Codeノード内容を確認
7. Credential 未設定箇所を特定（本Workflowは外部Credential不要）
8. （Credentialが要る場合のみ）人間認証を §17 様式で依頼 → 選択
9. **Manual Trigger で単体テスト**（Execute Workflow）
10. 各ノードの入力/出力を確認
11. 全体 dry-run（外部アクションなしを確認）
12. 実行履歴（Executions）を確認
13. エラーがあれば修正（同一画面の再試行は最大2回）
14. Workflow を保存（**Activate トグルは OFF のまま**）
15. `…` → **Download**（JSONエクスポート）
16. エクスポートJSONを `workflows/n8n/` に上書き保存（設計JSONとの差分を確認）
17. 画面のスクリーンショットを保存（証跡）
18. **Activate せず停止**して結果報告

## DEV_RIO_001 固有の合格条件（[[TEST_PLAN]]）
- Manual Trigger → 分類（EXECUTE_NOW等）→ jobレコード（QUEUED・idempotency_key付き）→ NoOp
- 外部アクションなし・二重Jobなし・Secret表示なし・エラー記録あり

## 失敗時（2回で停止）
失敗画面 / ノード / 操作 / エラーメッセージ / 原因候補 / 人間操作要否 / 再開手順 を報告。

関連: [[N8N_WORKFLOW_CATALOG]] [[BROWSER_USE_POLICY]] [[TEST_PLAN]]
