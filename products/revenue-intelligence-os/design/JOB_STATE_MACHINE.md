# JOB_STATE_MACHINE — ジョブ状態遷移（§12）

## 正常系
```
QUEUED
 → RESERVED
  → PROCESSING
   → QA_REVIEW
    → WAITING_APPROVAL   ← 人間ゲート（公開/送信/課金 等）
     → APPROVED
      → EXTERNAL_ACTION_STARTED
       → EXTERNAL_ACTION_CONFIRMED
        → RESULT_RECORDED
         → MEASURED
```

## 失敗系
```
（任意の外部アクション）→ FAILED_RETRYABLE
   → 最大2回 再試行
     → 解消: 正常系へ復帰
     → 未解消: DEAD_LETTER_QUEUE（停止・要報告）
```

## 遷移ルール
- `WAITING_APPROVAL` → `APPROVED` は**人間のYes**のみ。AIは遷移させない。
- `EXTERNAL_ACTION_STARTED` の前に [[ID_AND_IDEMPOTENCY_POLICY]] の再実行前チェックを必須実行。
- 各遷移は `jobs.updated_at` と `errors`（失敗時）に記録。
- `DEAD_LETTER_QUEUE` 入りは [[RISK_APPROVAL_POLICY]] の様式で即報告。

## リスク区分と自動化可否（[[RISK_APPROVAL_POLICY]] 準拠）
- 低リスク（取得/下書き/分析/QA）: `WAITING_APPROVAL` をスキップ可（将来）
- 中〜最高リスク（公開/課金/Credential等）: `WAITING_APPROVAL` 必須

関連: [[RISK_APPROVAL_POLICY]] [[N8N_WORKFLOW_CATALOG]]
