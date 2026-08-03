# n8n パイプライン拡張仕様書
## Multi-Channel Distribution System（DEV_RIO_800 系）

**作成日**: 2026-08-03  
**対象**: Threads + note + Instagram 統合自動投稿  
**ステータス**: 開発前仕様書 (開発チーム実装開始まで確定版)

---

## A. 概要

### 目的
- **単一ワークフロー** で Threads + note + Instagram への投稿をスケジュール・自動化
- **posts_queue_v2.csv** を単一ソース・オブ・トゥルースに → 複数媒体 一括管理
- 各媒体の QA ゲート + エラーハンドリング を統一

### スコープ
| 対象 | 現状 | 拡張後 |
|------|------|--------|
| Threads | ✅ 運用中（DEV_RIO_705） | ✅ 既存統合 |
| note | 🔨 ドライラン（DEV_RIO_201） | 🚀 本運用 API 実装 |
| Instagram | ❌ 未実装 | 🚀 新規実装 |

### 非スコープ
- Google Business Profile 投稿（9月以降検討）
- YouTube Shorts への転記（同上）
- TikTok / X / LinkedIn（スコープ外）

---

## B. 技術スタック

### 既存資産（活用予定）
- **n8n cloud**: ワークフローエンジン
- **Anthropic Claude API**: テキスト生成（リプライ・ハッシュタグ）
- **Threads API** (`graph.threads.net`): 投稿
- **Rakuten Affiliate API**: リンク検証（未使用 → CSV マッピング利用）

### 新規依存
- **note.com API** (OAuth 2.0): 記事投稿 / 更新
- **Meta Graph API** (Instagram): 投稿 / Reels 作成
- **Mailchimp / Zapier**: メルマガ登録フォーム連携
- **Google Drive**: 画像保管（eye-catch 自動生成結果）

---

## C. 拡張スキーマ：posts_queue_v2.csv

### カラム定義

```csv
id | content_id | media | scheduled | status | approver_action | url | 
channels | include_rakuten | note_eye_catch_prompt | ig_hashtags | 
utm_source | utm_campaign | mailchimp_segment
```

| # | カラム | 型 | 例 | 説明 |
|----|--------|------|-----|------|
| 1 | `id` | string | `post_4` | 投稿ID（一意） |
| 2 | `content_id` | string | `threads_draft_004` | コンテンツ素材ID（DEV_RIO_103 output） |
| 3 | `media` | string | `multi` | 媒体種別（threads / note / instagram / multi） |
| 4 | `scheduled` | timestamp | `2026-08-04T21:00:00+09:00` | 投稿予定日時 |
| 5 | `status` | enum | `scheduled` | scheduled / scheduled_pending / rejected / published |
| 6 | `approver_action` | string | `yuya_tokuda` | 承認者（GitHub ユーザー名） |
| 7 | `url` | string | `https://brain...` | 販売誘導リンク（Brain / note） |
| 8 | `channels` | string (CSV) | `threads;note;instagram` | 対象チャネル（`;` 区切り） |
| 9 | `include_rakuten` | boolean | `true` | Threads への楽天リプライ生成（DEV_RIO_705 流用） |
| 10 | `note_eye_catch_prompt` | string | `"スマートフォンでGoogle口コミを返信する手元写真"` | note eye-catch 画像生成用プロンプト |
| 11 | `ig_hashtags` | string (CSV) | `#口コミ返信,#店舗集客,#GoogleBusiness` | Instagram ハッシュタグ（`,` 区切り） |
| 12 | `utm_source` | string | `threads` | UTM: source（media によって自動設定も可） |
| 13 | `utm_campaign` | string | `reply-template-001` | UTM: campaign（実験ID） |
| 14 | `mailchimp_segment` | string | `warmers` | メルマガセグメント（warmers / customers / vip） |

### 例データ（post_4）

```csv
post_4,ca-reply-template-001,multi,2026-08-04T21:00:00+09:00,scheduled,yuya_tokuda,https://www.brain.co.jp/u/ai_store_yuya/A_reply_template_kit,threads;note;instagram,true,"スマートフォンでGoogle口コミ返信画面を操作する動画（30秒）",#口コミ返信 #店舗集客 #GoogleBusiness,threads,reply-template-001,warmers
```

---

## D. ワークフロー構造

### D-1. DEV_RIO_800: Multi-Channel Distributor (親ワークフロー)

**目的**: posts_queue_v2.csv を読み込み → スケジュール判定 → 各媒体分岐

#### ノード構成

```
1. Manual Trigger
   └─ 毎日 21:00 実行 (Cloud Scheduler)

2. Read posts_queue_v2.csv
   ├─ Google Drive / AWS S3 から CSV 読込
   └─ 今日のスケジュール行のみフィルタ

3. Filter Scheduled Items
   ├─ scheduled_at == today?
   └─ status == "scheduled"?

4. QA Validation Gate
   ├─ content_id が DEV_RIO_103 出力に存在?
   ├─ approver_action がホワイトリストメンバー?
   └─ channels が有効フォーマット?

5. Channel Router (Switch/If nodes)
   ├─ if "threads" in channels
   │  └─ Execute DEV_RIO_700 (下記)
   ├─ if "note" in channels
   │  └─ Execute DEV_RIO_801 (下記)
   └─ if "instagram" in channels
      └─ Execute DEV_RIO_802 (下記)

6. Merge Results
   └─ 全媒体の実行結果をまとめる

7. Log & Alert
   ├─ 成功 → Slack 通知 (ops-team)
   ├─ 部分失敗 → Google Chat 通知 (dev-team)
   └─ 完全失敗 → Email alert (yuya_tokuda@...)
```

#### ノード詳細（n8n Code）

**Node: Read posts_queue_v2.csv**
```javascript
// posts_queue_v2.csv を Google Drive から読込
// https://drive.google.com/uc?export=download&id=XXXXX
const csvUrl = 'https://docs.google.com/spreadsheets/d/.../export?format=csv';
const rows = await (await fetch(csvUrl)).text().then(text => {
  const lines = text.trim().split('\n');
  const [header, ...data] = lines;
  const cols = header.split(',');
  return data.map(line => {
    const vals = line.split(',');
    return Object.fromEntries(cols.map((c, i) => [c.trim(), vals[i]?.trim() || '']));
  });
});
return rows.map(r => ({ json: r }));
```

**Node: Filter Scheduled Items**
```javascript
// status が "scheduled" で、scheduled 日時が「今日」の行のみ
const i = $input.first().json;
const today = new Date().toISOString().split('T')[0];
const scheduledDate = new Date(i.scheduled).toISOString().split('T')[0];
if (i.status === 'scheduled' && scheduledDate === today) {
  return [{ json: i }];
}
return [];
```

**Node: Channel Router**
```javascript
// channels を ";" で分割して各媒体フラグを立てる
const i = $input.first().json;
const chans = (i.channels || '').split(';').map(c => c.trim());
return [{ json: {
  ...i,
  to_threads: chans.includes('threads'),
  to_note: chans.includes('note'),
  to_instagram: chans.includes('instagram')
} }];
```

---

### D-2. DEV_RIO_700: Threads Publisher (既存DEV_RIO_705拡張)

**目的**: Threads 本体投稿 + 楽天リプライ自動生成

**親から受け取る**: posts_queue_v2 row (to_threads=true の時のみ)

#### ノード差分（既存DEV_RIO_705 との違い）

| ノード | 既存 | 拡張 |
|--------|------|------|
| Link Library | LINK_LIBRARY 定数 | CSV ロード (rakuten_link_library.csv) |
| Reply Gate | QA_PASS のみ | + `include_rakuten=true` フィルタ |
| メルマガ CTA | 無し | メルマガ登録 QR コード 自動生成ノード 追加 |
| 結果ログ | Slack | Slack + n8n DB 記録 |

#### 追加ノード: Mailchimp QR Generator

```javascript
// メルマガ登録フォーム URL から QR コード生成
const form_url = 'https://typeform.com/to/XXXXX';
const qr_api = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(form_url)}`;
return [{ json: {
  content_id: $input.first().json.content_id,
  mailchimp_qr_url: qr_api,
  form_url
} }];
```

---

### D-3. DEV_RIO_801: note Publisher (新規)

**目的**: note.com API で 記事投稿 / 販売設定 / メルマガ CTA 挿入

#### ノード構成

```
1. Prepare note Payload
   ├─ content_id から threads_post テキスト取得
   ├─ note_draft_body に メルマガ CTA + 割引コード 挿入
   └─ eye-catch 画像 URL 設定

2. Generate Eye-Catch (Optional)
   ├─ Anthropic Vision で テキスト → 画像プロンプト
   └─ Stable Diffusion / Replicate で 画像生成

3. note API: Create Draft
   └─ POST /api/v1/notes (OAuth 2.0)

4. Publish Decision
   ├─ if approved_by == yuya_tokuda
   │  └─ Publish (status: published)
   └─ else
      └─ Draft のまま (status: draft)

5. UTM Link Builder
   ├─ Brain キット link + utm_source=note + utm_campaign
   └─ note 本文に埋め込み

6. Result Logger
   └─ n8n DB に 記事ID / published_at / note_url 記録
```

#### note API 実装詳細

**認証**:
```
Authorization: Bearer <NOTE_API_TOKEN>
Content-Type: application/json
```

**POST /api/v1/notes** (記事作成)
```json
{
  "title": "待ち時間クレームへの返信例 25 パターン限定公開",
  "body": "【テンプレ 25 本セット】Google 口コミで『待ち時間が長い』というクレームをもらったとき…\n\n…(本文)…\n\n---\n## 全 30 パターンが欲しい方は\n\n『ChatGPTで7日分のGoogle投稿・口コミ返信・SNS投稿を30分で作る 店舗集客立て直しキット』で完全版を公開中です。\n\n👉 [Brain で全パターン購入](https://brain-market.com/...?utm_source=note&utm_campaign=reply_template)",
  "eye_catch_image_url": "https://drive.google.com/...",
  "price": 980,
  "status": "published"
}
```

**note URI 規則**:
```
https://note.com/@ai_store_lab/{title-slug}
```

#### Eye-Catch 自動生成フロー（Optional）

```javascript
// note_eye_catch_prompt → Anthropic → 画像生成
const prompt = $input.first().json.note_eye_catch_prompt;
const api_resp = await (await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': $env.ANTHROPIC_API_KEY,
    'content-type': 'application/json',
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-opus',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `あなたは画像生成プロンプトエンジニアです。次のブログ記事の内容を表現する、DALL-E 用の英文プロンプトを生成してください。\n\n記事テーマ: ${prompt}\n\n要件:\n- 1-2文で簡潔に\n- 色使い豊か（日本風）\n- テキストはなし\n- 16:9 アスペクト比\n\nプロンプト:\n`
    }]
  })
})).json();
const img_prompt = api_resp.content[0].text;
// 次に Stable Diffusion / Replicate で画像生成
return [{ json: { note_eye_catch_prompt: img_prompt } }];
```

---

### D-4. DEV_RIO_802: Instagram Publisher (新規)

**目的**: Meta Graph API で Instagram 投稿 / Reels 投稿

#### ノード構成

```
1. Instagram Payload Builder
   ├─ Threads post → Instagram キャプション 変換
   ├─ ハッシュタグ 自動選択 (ig_hashtags CSV → セレクタ)
   └─ Brain キット リンク + QR コード 埋め込み

2. Media Type Detector
   ├─ if テキストのみ
   │  └─ Carousel (複数カード)
   ├─ if 画像あり
   │  └─ Image Single
   └─ if 動画あり
      └─ Reels (推奨)

3. Create Instagram Container
   └─ POST /ig_user_id/media (Meta Graph API)

4. Handle Media Response
   ├─ media_id 取得
   └─ caption_url 取得

5. Publish Media
   └─ POST /media_id?fields=status_code

6. Link to Bio
   ├─ Instagram BIO の「リンク集」に投稿 URL 追加
   └─ n8n DB に記録

7. Result Logger
   └─ instagram_post_id, insights_url 記録
```

#### Meta Graph API 実装詳細

**認証**:
```
Authorization: Bearer <META_GRAPH_API_TOKEN>
User Agent: AINETBusiness/1.0
```

**POST /ig_user_id/media** (Carousel)
```json
{
  "media_type": "CAROUSEL",
  "children": [
    {
      "media_type": "IMAGE",
      "image_url": "https://drive.google.com/img1.jpg"
    },
    {
      "media_type": "IMAGE",
      "image_url": "https://drive.google.com/img2.jpg"
    }
  ],
  "caption": "【Google 口コミ返信テンプレ 3 NG パターン】\n\n❌ NG1: [店舗名]書き換え忘れ\nNG2: 強い否定\nNG3: 口コミをお願いする\n\n✅ 正解例は Brain キット (¥1,980) で全 30 パターン公開中👇\n\n#口コミ返信 #店舗集客 #GoogleBusiness #飲食店 #美容室"
}
```

**POST /media_id/publish** (本公開)
```json
{
  "creation_timestamp": "2026-08-11T10:00:00Z"
}
```

---

### D-5. DEV_RIO_803: Mailchimp Integrator (新規)

**目的**: メルマガ登録フォーム連携 + セグメント別 CFI 自動発火

#### ノード構成

```
1. Typeform / Zapier Webhook 受信
   └─ form_submission イベント (form_id = メルマガ登録)

2. Email Validation
   ├─ 正規表現チェック
   └─ 既存登録済みチェック (Mailchimp API)

3. Segment Assignment
   ├─ mailchimp_segment 値から セグメント ID 取得
   └─ warmers / customers / vip へ自動振り分け

4. Welcome Email Automation
   ├─ Warmers 層
   │  └─ Vol.1「はじめまして + ¥300 割引クーポン」
   ├─ Customers 層
   │  └─ Vol.1「お疲れさま + 次商品案内」
   └─ VIP 層
      └─ Vol.1「スペシャルオファー + 先行販売」

5. UTM Tagging
   └─ メルマガ内 リンク全てに utm_source=mailchimp + utm_segment 付与

6. Result Logger
   └─ Mailchimp contact ID / segment 記録
```

#### Mailchimp API 実装詳細

**POST /lists/{list_id}/members** (リード登録)
```json
{
  "email_address": "customer@example.com",
  "status": "subscribed",
  "tags": ["from_typeform", "segments_warmers"],
  "merge_fields": {
    "FNAME": "太郎",
    "SEGMENT": "warmers"
  }
}
```

**POST /automations/{automation_id}/emails/{email_id}/queues** (CFI 発火)
```json
{
  "email_address": "customer@example.com"
}
```

---

## E. エラーハンドリング

### E-1. 各ステージのエラーケース

| ステージ | エラー | 対応 |
|---------|--------|------|
| CSV 読込 | ファイルなし | Slack alert + manual retry |
| QA Gate | content_id 不一致 | rejected に変更 + Slack 通知 |
| Threads API | 認証失敗 | token refresh → retry (max 3) |
| note API | OAuth 失敗 | manual re-auth (browser use) + retry |
| Instagram API | rate limit | 1時間待機 → retry (exponential backoff) |
| Mailchimp | 重複登録 | skip (merge_existing=true) |

### E-2. Retry 戦略

```javascript
// Exponential backoff (最大 3 回試行)
const retry = async (fn, maxAttempts = 3) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === maxAttempts - 1) throw e;
      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      await new Promise(r => setTimeout(r, delay));
    }
  }
};
```

### E-3. Rollback 手順

**Threads 投稿済みだが note 失敗 → 部分回復**
```
1. Threads post_id を記録
2. note API retry (max 3)
3. 最終失敗時: posts_queue_v2 status = "partial_published_threads_only"
4. Manual review: ゆうさんが note 手動投稿 or キャンセル判定
```

---

## F. 依存ワークフロー

### 上流ワークフロー
- **DEV_RIO_103** (Content QA): posts_queue_v2 の content_id が DEV_RIO_103 出力と突合
- **DEV_RIO_101/102** (Evidence Build): Threads post テキスト生成元

### 下流ワークフロー
- **DEV_RIO_301** (Performance Decision): 投稿後 24-72 時間でエンゲージメント測定
- **DEV_RIO_401** (Metrics Ingestion): posts_queue_v2 投稿ログを BQ へ入力

---

## G. 実装前チェックリスト

### API 認証
- [ ] note.com OAuth 2.0 token（テスト・本番）
- [ ] Meta Graph API token（Instagram ビジネスアカウント）
- [ ] Mailchimp API key & list ID
- [ ] Anthropic API key（既存・確認）

### スキーマ・データ準備
- [ ] posts_queue_v2.csv テンプレ ＆ Google Sheets 作成
- [ ] rakuten_link_library.csv を n8n Code ノード へ転記
- [ ] ハッシュタグ辞書（ig_hashtags 用）作成
- [ ] メルマガセグメント（warmers/customers/vip）定義

### n8n セットアップ
- [ ] DEV_RIO_800 (親) ワークフロー 作成
- [ ] DEV_RIO_700 (Threads 既存) から分岐処理 抽出
- [ ] DEV_RIO_801 (note) 新規作成 ＆ テスト
- [ ] DEV_RIO_802 (Instagram) 新規作成 ＆ テスト
- [ ] DEV_RIO_803 (Mailchimp) 新規作成 ＆ テスト

### テスト・QA
- [ ] 単体テスト: 各ワークフロー ドライラン
- [ ] 統合テスト: posts_queue_v2 サンプル行で全媒体実行
- [ ] 失敗テスト: API 404 / 403 / timeout シミュレーション
- [ ] ユーザー受け入れテスト: ゆうさんによる承認フロー確認

### ドキュメント
- [ ] 本仕様書最終版
- [ ] ワークフロー ノード 説明書
- [ ] トラブルシューティング ガイド
- [ ] ロールバック 手順書

---

## H. スケジュール

### Week 1 (Aug 4-10)
- [ ] APIs 認証準備 & トークン取得（dev 4h）
- [ ] DEV_RIO_800/801/802/803 骨組み作成（dev 8h）
- [ ] posts_queue_v2.csv & テンプレ準備（ops 2h）
- [ ] ハッシュタグ辞書作成（writer 1h）

### Week 2 (Aug 11-17)
- [ ] DEV_RIO_801 (note) テスト完了（dev 4h）
- [ ] DEV_RIO_802 (Instagram) テスト完了（dev 4h）
- [ ] DEV_RIO_803 (Mailchimp) テスト完了（dev 3h）
- [ ] 統合テスト & バグ修正（dev 4h）

### Week 3-4 (Aug 18-31)
- [ ] 本運用 ロールアウト（ops 2h）
- [ ] 監視 & エラーハンドリング調整（dev 2h）
- [ ] 初月 LTV 測定準備（analyst 2h）

---

## 最終成果物リスト

1. ✅ 本仕様書（このファイル）
2. ✅ n8n 5 ワークフロー JSON
   - DEV_RIO_800_Multi_Channel_Distributor.json
   - DEV_RIO_701_Threads_Extended.json (既存 DEV_RIO_705 更新版)
   - DEV_RIO_801_Note_Publisher.json
   - DEV_RIO_802_Instagram_Publisher.json
   - DEV_RIO_803_Mailchimp_Integrator.json
3. ✅ posts_queue_v2.csv テンプレ
4. ✅ トラブルシューティング ガイド
5. ✅ ロールバック 手順書

---

**仕様書完成**: 2026-08-03 15:30 UTC+9  
**開発開始予定**: 2026-08-04 09:00 UTC+9
