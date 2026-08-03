# n8n 自動投稿ワークフロー インポートガイド

## 📋 概要

修正版ワークフロー（毎日21:00自動投稿対応）を n8n にインポートする手順です。

**ファイル**: `/Users/tokudayuya/ai-net-business-sns-os/products/revenue-intelligence-os/workflows/n8n/DEV_RIO_705_Auto_Daily_Schedule.json`

---

## ✅ インポート手順（5分）

### 1. n8n Cloud にログイン
- https://yuu1988.app.n8n.cloud にアクセス

### 2. ワークフロー編集
- 既存ワークフロー「DEV_RIO_705_Threads_Rakuten_Prepare」を開く
- または、新規ワークフロー作成

### 3. ワークフロー JSON をインポート
- **メニュー** → **Workflow** → **Import from file**
- `DEV_RIO_705_Auto_Daily_Schedule.json` を選択
- ✅ 確認

### 4. Credentials 確認
- Threads API Token (Bearer Auth account ID: `EqL89RW6m6CtCIbm`)
- Rakuten Link Library データが読み込まれているか確認

### 5. 保存 & 有効化
- **Save** クリック
- ワークフロー状態を **Active** に変更

---

## 🚀 インポート完了後

自動投稿が以下のスケジュールで開始：
- **2026-08-04 21:00** → 投稿4
- **2026-08-05 21:00** → 投稿5
- **2026-08-06 21:00** → 投稿6

投稿キュー状態は `/data/posts_queue.csv` で確認できます。

---

## ❓ トラブルシューティング

**投稿が投稿されない場合**:
1. Cron Trigger が「毎日21:00」に設定されているか確認
2. Threads API Credentials が有効か確認
3. n8n のログを確認（n8n UI → Executions）

**投稿がコピペになっている場合**:
1. `Extract Next Post` ノードが投稿データを正しく取得しているか確認
2. `/data/threads_posts.csv` が正しい形式か確認
