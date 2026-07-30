# IMPLEMENTATION_PLAN — 実装計画

## Phase 2 スコープ（本PR）
1. 追加レイヤー scaffold（domain/schemas/prompts/adapters/workflows/n8n/tests/runbooks/design）✅
2. 設計資料16点（design/）✅
3. Agent 5体（§13）— 新規2（portfolio-manager / workflow-architect）＋流用3（browser-operator / quality-reviewer / revenue-analyst）の定義
4. 最初のWorkflow `DEV_RIO_001_Opportunity_Intake` の n8n JSON（Manual Trigger + dry-run, Activateなし）

**本PRに含めない**（別途・要承認）:
- 実績過大記載の REPORT.md 訂正（[[SECURITY_POLICY]]）→ 独立コミットで提案
- Browser Use での n8n 画面インポート（§16）→ Phase 2承認・PR後に実施
- Claude Code Hooks（§14）→ 既存Hooksとの競合確認後に別PR

## 順序（依存）
```
scaffold → 設計16点 → Agent5体 → DEV_RIO_001 JSON
  → 【PR作成・ゆう承認】
    → Browser Useで n8n へインポート・dry-run（§16）
      → 3回連続テスト（[[TEST_PLAN]]）
        → 残り DEV Workflow 5本（§15）
          → PROD候補（§21・要 pre-deploy-qa/承認）
```

## 停止ゲート（§23）
ログイン/認証・課金・Credential・外部公開/送信・削除・本番Activate・本番デプロイ・GitHub push・main変更・大きな設計変更 → 必ず停止して Yes/No。

## 次アクション（Phase2承認後）
1. n8n `yuu1988.app.n8n.cloud` に DEV_RIO_001 をインポート（Browser Use）
2. Manual Trigger で dry-run → 合格条件確認（[[TEST_PLAN]]）
3. JSONをエクスポートして `workflows/n8n/` に保存

関連: [[N8N_WORKFLOW_CATALOG]] [[TEST_PLAN]] [[ROLLBACK_PLAN]]
