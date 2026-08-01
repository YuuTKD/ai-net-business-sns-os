# GO-LIVE MANUAL v2 — 収益化自動化パイプライン本番化手順

**目標**: DEV_RIO_101-403 パイプラインの完全自動化・本番化を実現
**期限**: 2026-08-15（TASK-005 完了日）
**前提**: PR #36, #37, #38 が main にマージ済み

---

## 本番化前最終チェックリスト

### 環境確認
- [ ] Anthropic API キーが n8n に登録済み（test 実行で確認）
- [ ] Gumroad API キーが登録済み
- [ ] Brain API キーが登録済み
- [ ] Slack Webhook URL が有効（test メッセージ送信で確認）
- [ ] YU HOLDINGS AI MCP が接続可能（`mcp ls` で確認）

### ワークフロー確認
- [ ] DEV_RIO_101-403 が n8n にインポート済み
- [ ] 全ワークフロー JSON が `active: false` 状態
- [ ] 全ワークフロー dry-run テスト完了（エラーなし）
- [ ] Manual Trigger で手動実行確認完了

### スケジューラー準備
- [ ] SCHEDULER_CONFIG.md を読了
- [ ] Cron 表現を確認（Asia/Tokyo タイムゾーン）
- [ ] n8n インスタンスの時刻が正確か確認

---

## 本番化手順（段階的ロールアウト）

### フェーズ 1: メトリクス取得層の本番化（Week 1）

**1. DEV_RIO_401 を本番化**

n8n UI：
```
DEV_RIO_401_Metrics_Ingestion を開く
  ↓
Settings → Activate をON
  ↓
Trigger 設定:
  Type: Cron
  Expression: 0 23 * * *  (毎日 23:00 UTC)
  Timezone: Asia/Tokyo
  ↓
Save & Activate
```

実行確認:
```bash
# 実行ログで error を確認
n8n logs | grep DEV_RIO_401
```

期間: 3 日間試験運用（月～水）
確認: metrics.csv に日次データが記録される

### フェーズ 2: 判定層・実行層の本番化（Week 1 末）

**2. DEV_RIO_301/402 を本番化**

```
DEV_RIO_301_Performance_Revenue_Decision を開く
  ↓
Settings → Activate をON
  ↓
Trigger: Cron Expression: 30 23 * * 5 (毎週金 23:30 UTC)
  ↓
Save & Activate
```

```
DEV_RIO_402_Scaling_Execution を開く
  ↓
Settings → Activate をON
  ↓
Trigger: Cron Expression: 0 0 * * 6 (毎週土 00:00 UTC)
  ↓
Save & Activate
```

期間: 2 週間試験運用（金/土 の判定・実行を観察）
確認: Slack に SCALE/ITERATE/HOLD/STOP 判定が届く

### フェーズ 3: ダッシュボード・レポート層の本番化（Week 2）

**3. DEV_RIO_403 を本番化**

```
DEV_RIO_403_Dashboard_Generator を開く
  ↓
Settings → Activate をON
  ↓
Trigger: Cron Expression: 0 23 ? * 5L (毎月最終金曜 23:00 UTC)
  ↓
Save & Activate
```

期間: 月末に 1 回実行確認
確認: Slack に 月次ダッシュボード（売上・ROI・KPI）が届く

### フェーズ 4: コンテンツ生成層の本番化（Week 3 以降・オプション）

DEV_RIO_101-103 の自動スケジューリングは、SCALE 判定後に段階的に実施。
最初は Manual Trigger のままで、需要に応じて Scheduler ON.

```
DEV_RIO_101 を開く
  ↓
Settings → Trigger を Schedule に設定
  ↓
Frequency: Weekly (毎週月曜 09:00 JST)
  ↓
Save & Activate
```

同様に DEV_RIO_102/103 も Activate.

---

## 本番環境での監視

### ダッシュボード監視項目

```
【日次】
- Gumroad/Brain 売上が取得できているか
- API エラーがないか
- データが metrics.csv に記録されているか

【週次】
- SCALE/ITERATE/HOLD/STOP 判定が正確か
- Slack 通知が届いているか
- KPI（粗利/時）が正数か

【月次】
- 月間 ROI が前月比で向上したか
- スケーリング提案が実行可能か
- オーナー稼働時間は目標内か
```

### トラブルシューティング

**DEV_RIO_401 が実行されない**
```bash
# n8n ログを確認
docker logs n8n | grep DEV_RIO_401

# Credential を確認
n8n Settings → Credentials → Gumroad/Brain が有効?

# API 呼び出しを手動テスト
curl -H "Authorization: Bearer $GUMROAD_API_KEY" https://api.gumroad.com/v2/products
```

**Slack 通知が届かない**
```bash
# Webhook URL を確認
echo $SLACK_WEBHOOK_URL

# テストメッセージを送信
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test"}' \
  $SLACK_WEBHOOK_URL
```

**YU HOLDINGS AI MCP が接続できない**
```bash
# MCP 接続確認
mcp ls | grep YU_HOLDINGS_AI

# MCP コンソールで test
mcp call YU_HOLDINGS_AI get_cash_flow_status
```

---

## ロールバック計画

本番化後に問題が発生した場合：

1. **即座の停止**: n8n UI で該当ワークフロー Activate を OFF
2. **原因調査**: ログ・Credential・API 確認
3. **修正実施**: JSON 修正 → n8n 再インポート
4. **再テスト**: Manual Trigger で dry-run 確認
5. **再本番化**: Activate を ON に戻す

---

## 成功基準

本番化 1 ヶ月後の評価：

✅ **メトリクス取得**
- 日次データが完全に取得される（欠損ゼロ）
- API 呼び出し成功率 ≥ 99%

✅ **判定精度**
- SCALE/ITERATE 判定の実装成功率 ≥ 95%
- 誤判定ゼロ（STOP 判定後の ROI が実際に負）

✅ **ビジネス成果**
- 月間 ROI ≥ 50% を達成
- KPI（粗利/時） ≥ ¥1,000/時 を達成
- 稼働効率（価値生成/オーナー時間）が 50% 向上

✅ **運用自動化**
- オーナーの判定・実行判断が不要（提案ベース）
- スケーリング決定が 24 時間以内に自動実行

---

## サポート・ドキュメント

- 質問: GitHub Issues でタスク ID 付きで報告
- ログ確認: `docker logs n8n | grep "DEV_RIO"`
- API テスト: Postman collection 参照（design/API_TESTS.postman_collection.json）
- 月次確認: metrics.csv / decisions.csv を CSV ビューア（Excel/Sheets）で確認

---

**本番化完了チェック**: すべてのチェックボックスに ✓ を入れた時点で Go-Live！

🎉 **完全自動化された収益化ループへようこそ！**
