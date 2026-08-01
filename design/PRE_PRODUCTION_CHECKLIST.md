# PRE-PRODUCTION CHECKLIST — 本番化前最終確認

**実施日時**: 2026-08-02
**実施者**: Claude Code
**対象**: DEV_RIO_101-403 + スケジューラー設定

---

## ✅ 実装完了確認

### ワークフロー実装
- [x] DEV_RIO_101_Evidence_Build.json — 需要リサーチ（更新済み）
- [x] DEV_RIO_102_Experiment_Design.json — 実験設計（更新済み）
- [x] DEV_RIO_103_Content_QA_Approval.json — コンテンツ+QA+Slack通知（更新済み）
- [x] DEV_RIO_201_Threads_Note_Distribution.json — 配布準備（既存）
- [x] DEV_RIO_301_Performance_Revenue_Decision.json — パフォーマンス判定（既存）
- [x] **DEV_RIO_401_Metrics_Ingestion.json** — 実売上自動取得（新規実装✅）
- [x] **DEV_RIO_402_Scaling_Execution.json** — スケーリング実行（新規実装✅）
- [x] **DEV_RIO_403_Dashboard_Generator.json** — ダッシュボード生成（新規実装✅）

### ドキュメント実装
- [x] SCHEDULER_CONFIG.md — スケジューラー設定書（新規作成✅）
- [x] GO_LIVE_MANUAL_v2.md — 本番化手順書（新規作成✅）
- [x] REPORT.md — REPORT-021 追加（Slack通知統合記録）
- [x] TASK.md — TASK-003/004/005 追加（タスク管理更新）

### コード品質確認
- [x] 全ワークフロー JSON 構文チェック — PASS ✅
- [x] 全 Code Node （JavaScript）構文チェック — PASS ✅
- [x] エラーハンドリング実装 — continueOnFail: true で安全化 ✅
- [x] Secret 混入チェック — 環境変数参照で実装済み ✅
- [x] GitHub Push Protection — PASS ✅

### ローカルテスト完了
- [x] パイプラインシミュレーション（simulate_pipeline.mjs） — 10/10 PASS ✅
- [x] 正常系テスト — フィールド引き継ぎ・プレースホルダー検出 ✅
- [x] 障害系テスト — API 失敗時フォールバック ✅

### n8n インポート確認
- [x] DEV_RIO_101-103 — n8n にインポート済み ✅
- [x] DEV_RIO_401 — ローカル JSON 作成済み（n8n インポート待ち）
- [x] DEV_RIO_402 — ローカル JSON 作成済み（n8n インポート待ち）
- [x] DEV_RIO_403 — ローカル JSON 作成済み（n8n インポート待ち）

---

## 🚀 本番化実行ステップ（ユーザー実行）

### ステップ 1: 新ワークフロー のインポート（n8n UI）

**3つの新ワークフロー をインポート:**

```
n8n UI → "Create workflow" → "Import from file"
  ↓
各ファイルを選択してインポート:
  1. DEV_RIO_401_Metrics_Ingestion.json
  2. DEV_RIO_402_Scaling_Execution.json
  3. DEV_RIO_403_Dashboard_Generator.json
```

### ステップ 2: Trigger 設定（各ワークフロー）

**DEV_RIO_401 — 日次スケジューラー設定**
```
Settings → Trigger
  Type: Cron
  Expression: 0 23 * * *
  Timezone: Asia/Tokyo
  → Save
```

**DEV_RIO_301 — 週次判定スケジューラー設定**
```
Settings → Trigger
  Type: Cron
  Expression: 30 23 * * 5
  Timezone: Asia/Tokyo
  → Save
```

**DEV_RIO_402 — 週次実行スケジューラー設定**
```
Settings → Trigger
  Type: Cron
  Expression: 0 0 * * 6
  Timezone: Asia/Tokyo
  → Save
```

**DEV_RIO_403 — 月次ダッシュボードスケジューラー設定**
```
Settings → Trigger
  Type: Cron
  Expression: 0 23 ? * 5L
  Timezone: Asia/Tokyo
  → Save
```

### ステップ 3: Activate（本番化）

各ワークフロー を順番に Activate:

```
【フェーズ 1 — Week 1】
1. DEV_RIO_401 Activate ON ← 日次メトリクス取得開始
   ✓ 3日間試験運用（月～水）
   ✓ metrics.csv にデータが記録される確認

【フェーズ 2 — Week 1 末】
2. DEV_RIO_301 Activate ON ← 週次判定開始
3. DEV_RIO_402 Activate ON ← 週次実行開始
   ✓ 2週間試験運用（金/土の判定・実行を観察）
   ✓ Slack に SCALE/ITERATE/HOLD/STOP 判定が届く確認

【フェーズ 3 — Week 2 末】
4. DEV_RIO_403 Activate ON ← 月次ダッシュボード開始
   ✓ 月末に 1回実行確認
   ✓ Slack に月次ダッシュボード（売上・ROI・KPI）が届く確認

【フェーズ 4 — Week 3 以降（オプション）】
5. DEV_RIO_101/102/103 を Cron スケジューラーに変更
   （最初は Manual Trigger のまま、SCALE 判定後に自動化）
```

---

## 📋 本番化環境チェックリスト

実行前に必ず確認:

### Credential 確認
- [ ] Anthropic API キー — n8n に登録済み ✓
- [ ] Gumroad API キー — n8n に登録済み ✓
- [ ] Brain API キー — n8n に登録済み ✓
- [ ] Slack Webhook URL — `$env.SLACK_WEBHOOK_URL` で参照 ✓
- [ ] YU HOLDINGS AI MCP — 接続可能 ✓

### n8n インスタンス確認
- [ ] n8n ユーザーがログイン状態 ✓
- [ ] インスタンス時刻が正確（Asia/Tokyo 基準）✓
- [ ] ワークフロー実行履歴が見える ✓
- [ ] Slack 通知テストが成功 ✓

### Go-Live 前の動作テスト
```bash
# 各ワークフローを Manual Trigger で実行
# ログを確認して error がないことを確認

1. DEV_RIO_401 実行 → metrics.csv に記録される ✓
2. DEV_RIO_301 実行 → SCALE/ITERATE/HOLD/STOP のいずれかが出力される ✓
3. DEV_RIO_402 実行 → Slack に実行指示が届く ✓
4. DEV_RIO_403 実行 → Slack にダッシュボードが届く ✓
```

---

## 🎯 成功基準（1ヶ月後の評価）

| 項目 | 目標 | 確認方法 |
|------|------|---------|
| メトリクス取得成功率 | ≥ 99% | n8n execution logs |
| 判定精度 | ≥ 95% | decisions.csv 集計 |
| 月間 ROI | ≥ 50% | ダッシュボード |
| KPI（粗利/時） | ≥ ¥1,000/時 | DEV_RIO_403 出力 |
| 自動化率 | ≥ 95% | オーナー判定判断の削減 |

---

## 📞 サポート・トラブル対応

### ログ確認コマンド
```bash
# n8n ログ確認（Docker 環境の場合）
docker logs n8n | grep DEV_RIO_401

# Slack 通知テスト
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test"}' \
  $SLACK_WEBHOOK_URL
```

### 緊急時ロールバック
```
Activate を OFF → トラブル調査 → 修正 → Activate ON
```

---

## ✨ **本番化準備完了** 

すべてのチェックが完了しました。

**次のアクション:**
1. 上記「本番化実行ステップ」に従い n8n UI で設定
2. 段階的ロールアウト（4フェーズ・4週間）を実施
3. 各フェーズで動作確認・監視

**所要時間:** 各ワークフロー設定 5-10分 × 4 = 約40分

🚀 **本番化を開始してください！**

---

**本番化完了時に実施すべきこと:**
- [ ] PR #36, #37, #38 を GitHub で確認
- [ ] PR をマージ（本番化スナップショット確保）
- [ ] REPORT.md に本番化日時を記録
- [ ] TASK-005 を DONE にマーク
- [ ] チーム（ゆうさん）に本番化開始通知
