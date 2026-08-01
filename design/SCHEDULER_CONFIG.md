# SCHEDULER_CONFIG.md — n8n 自動実行スケジューラー設定

## 概要

DEV_RIO_101-402 パイプラインの完全自動化。日次・週次・月次でのメトリクス取得・判定・実行を自動化。

---

## スケジューラー構成

### 日次スケジューラー（23:00 UTC ← 翌朝 8:00 JST）

**DEV_RIO_401 Daily Metrics Ingestion**
```
Cron: 0 23 * * * (毎日 23:00 UTC)
実行内容:
  1. Gumroad/Brain API から売上取得
  2. YU HOLDINGS AI MCP からメトリクス取得
  3. metrics.csv に記録
状態: 次日の判定準備完了
```

### 週次スケジューラー（毎週金曜 23:30 UTC ← 土曜朝 8:30 JST）

**DEV_RIO_301 Weekly Performance Decision**
```
Cron: 30 23 * * 5 (毎週金曜 23:30 UTC)
実行内容:
  1. 直近 7 日間のメトリクス集計
  2. SCALE/ITERATE/HOLD/STOP 判定
  3. DEV_RIO_402 へ判定結果を渡す
状態: スケーリング判定完了
```

**DEV_RIO_402 Weekly Scaling Execution**
```
Cron: 0 0 * * 6 (毎週土曜 00:00 UTC = 23:30+30分後)
前提: DEV_RIO_301 完了
実行内容:
  1. SCALE 判定時: 増産指示を生成（DEV_RIO_103 を複数回実行）
  2. ITERATE 判定時: プロンプト調整・variant テスト実行
  3. HOLD 判定時: 継続観察レポート送信
  4. STOP 判定時: アーカイブ提案通知
状態: 実行完了・Slack 通知送信
```

### 月次スケジューラー（毎月最終金曜 23:00 UTC）

**DEV_RIO_403 Monthly Dashboard Generation**
```
Cron: 0 23 ? * 5L (毎月最終金曜 23:00 UTC)
実行内容:
  1. 月間売上・ROI サマリー生成
  2. KPI トレンドグラフ生成
  3. スケーリング提案レポート生成
  4. Slack/Email に配信
状態: 意思決定レポート配信完了
```

---

## n8n 設定手順

### 1. ワークフロー active フラグを ON に変更

```json
{
  "active": true,  // false → true に変更
  "trigger": {
    "type": "cron",
    "expression": "0 23 * * *"  // 日次の場合
  }
}
```

### 2. n8n UI での設定手順

各ワークフロー を n8n で開く
  ↓
右上メニュー → Settings
  ↓
Activate スイッチ を ON
  ↓
（オプション）Trigger を設定: 
  - Type: Cron
  - Expression: 上記 Cron 表現を入力
  - Timezone: Asia/Tokyo (JST)
  ↓
Save & Close

### 3. 実行順序（依存関係）

```
DEV_RIO_401 (日次 23:00)
  ↓ 完了待ち
DEV_RIO_301 (週次 23:30 金)  ← 7 日間のデータ集計
  ↓ 完了待ち
DEV_RIO_402 (週次 00:00 土)  ← 判定結果を自動ルーティング
  ↓
Slack 通知（自動送信）
```

---

## トラブルシューティング

### スケジューラーが実行されない場合

1. ワークフローの `active` フラグを確認
2. n8n インスタンスの時刻が正確か確認
3. Credential（API キー等）が有効か確認
4. n8n ログで error を検索

### データが取得できない場合

1. Gumroad/Brain API キーの有効性確認
2. YU HOLDINGS AI MCP の接続確認（`mcp ls`）
3. API の rate limit に達していないか確認
4. DEV_RIO_401 ログを確認

---

## 監視・アラート

### 推奨設定

- DEV_RIO_401 失敗時: Slack エラー通知
- DEV_RIO_301 判定完了時: Slack 判定レポート
- DEV_RIO_402 実行完了時: Slack 実行結果
- 月次: Email で重要なアラート

### メトリクス監視

```
- 日次売上: metrics.csv で自動記録
- 週次判定: decisions.csv に記録
- 月次 ROI: dashboard.json で集計
```

---

## 本番化チェックリスト

- [ ] ワークフロー JSON の `active: true` に変更
- [ ] Credential（API キー）が有効
- [ ] Cron expression が正確
- [ ] Timezone が Asia/Tokyo に設定
- [ ] Slack Webhook URL が有効
- [ ] YU HOLDINGS AI MCP が接続可能
- [ ] 実行ログに error がない
- [ ] 本番環境で 1 週間の試験運用実施
- [ ] ROI がプラス確認（SCALE 判定が出るまで）
