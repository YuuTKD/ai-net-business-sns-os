# DATA_MODEL — データ層（Phase1のCSVを継承）

正本は `data/*.csv`（Phase2でDB/Sheets Projectionへ拡張検討）。推定値と実績値は `source(actual/estimate)` で必ず分離。欠損は `unknown`。

## テーブル一覧（既存10 + Phase2追加）

| テーブル | 主なカラム | 状態 |
|---|---|---|
| audiences | id, name, jtbd, pain, urgency, wtp, barrier, best_channel, demand_score, confidence, status | 既存 |
| offers | id, name, type, payout, payout_type, est_gross_margin, est_cvr, approval_rate, compliance_flag, offer_score, url, status | 既存 |
| hypotheses | id, audience_id, offer_id, hypothesis, channel, angle, expected_metric, status | 既存 |
| experiments | id, hypothesis_id, variable_changed, success_condition, stop_condition, min_data, judge_by, status, result, decision | 既存 |
| content | id, experiment_id, master_path, media, variant_path, cta, ad_disclosure, qa_status, draft_url, published | 既存 |
| posts_queue | id, content_id, media, scheduled, status, approver_action, url | 既存 |
| metrics | date, content_id, media, impressions, clicks, link_clicks, signups, page_visits, est_revenue, confirmed_revenue, source | 既存（現状ヘッダのみ） |
| attribution | utm_campaign, content_id, offer_id, click_ts, event, amount, confirmed, source | 既存 |
| errors | ts, component, message, retry, resolved | 既存 |
| decisions | ts, experiment_id, decision, rationale, owner_yes_no, next_action | 既存 |
| **jobs**（追加） | job_id, workflow, portfolio_id, campaign_id, experiment_id, state, retry_count, idempotency_key, created_at, updated_at | Phase2 |
| **evidence_packs**（追加） | evidence_pack_id, experiment_id, sources(url[]), facts, notes, assets, created_at | Phase2 |

## 実測ベースライン投入（Phase1確定値）
- offers: P-BRAIN-01（¥3,980, payout 50%=¥1,990, compliance_flag=OK, status=販売中, 実績レビュー0）
- metrics: note公開2（ビュー計9）, Brain販売0, Substack登録1 → **confirmed_revenue=¥0**
- ※「note10本公開」等の過大記載は投入しない（[[SECURITY_POLICY]] §実績の正確性）

関連: [[ID_AND_IDEMPOTENCY_POLICY]] [[JOB_STATE_MACHINE]]
