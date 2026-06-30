# AI Net Business SNS OS

このプロジェクトは、フリーランサー・コンサルタント向けの
AI Digital Productをグローバルに販売するためのSNS・販売OSです。

## 最終2商品（確定・変更禁止）

### 商品1（主力・最初に売る）

**Sell the Client Docs You Already Use**
- サブタイトル：Use AI to turn your proposals, intake forms, and messaging frameworks into paid templates.
- 価格：$19（10件販売後 → $29）
- 対象：Freelance copywriters / Solo marketers
- 販売：Gumroad ✅ 登録済み
- 無料診断：What Paid Template Is Hidden Inside Your Client Docs?（Tally）
- メール：Brevo 7日間ステップ配信

### 商品2（アップセル・2番手）

**Paid Template Product Audit**
- 価格：$99
- タイミング：商品1で5件販売後に公開

## 最終商品階段

| ステップ | 商品 | 価格 |
|---|---|---|
| Free | What Paid Template Is Hidden Inside Your Client Docs? | $0 |
| Entry | Sell the Client Docs You Already Use | $19→$29 |
| Core | Client Docs to Paid Templates Bundle | $49 |
| Secondary | Paid Template Product Audit | $99 |
| Premium | Custom Review（1on1） | $249〜$499 |

## グローバル展開方針

- **販売プラットフォーム**：Gumroad ✅ 登録済み
- **メール配信**：Brevo ✅ 登録済み（7日間シーケンス設定済み）
- **無料診断**：Tally ✅ 登録済み
- **LP**：Carrd または Notion Sites（売上が出てから）
- **集客SNS**：LinkedIn（主力）+ Threads（短縮クロスポスト）+ Reddit（調査コメントのみ）
- **制作ツール**：Google Docs / Google Sheets / Canva
- **AI自動化**：Claude Code（文章生成）+ ChatGPT（Deep Research・改善）

初期費用：**$0**

## 現在のフェーズ

**Phase 3: 販売導線を公開する**

→ `operations/go_live_copy_paste_guide.md` を開いてSTEP 1〜5を実行する

**ユーザーがやること（3タスク）：**

1. **Gumroadパッケージ確認 → 公開**
   - `dist/gumroad_upload_package/` の9ファイルを確認する
   - ZIPを作成して Gumroad にアップロードする（手順：`dist/gumroad_upload_package/ZIP_STRUCTURE.md`）
   - STEP 1の内容に従って商品ページを設定・公開する

2. **Tally + Brevo を有効化**
   - STEP 2: Tallyクイズを公開する
   - STEP 3: Brevo Day 0〜7メールを有効化する
   - STEP 4: URL置換（`operations/url_placeholder_replacement_map.md` 参照）

3. **LinkedIn・Threads 最初の投稿**
   - STEP 5: LinkedIn bio + Threads bio を更新する
   - Post 08（クイズ告知）をLinkedInに投稿する
   - Threads版をクロスポストする

## 運用ルール

- 店舗事業の YU Business OS とは分離管理する
- Google Sheets名は **AI-NET-BUSINESS-OS** に統一する
- commit前は必ず変更ファイル一覧を表示してユーザー確認待ちにする
- push前は必ずユーザー確認待ちにする
- 公開リポジトリには絶対にpushしない
- 秘密情報・APIキー・トークン・.env は絶対にコミットしない

## 販売禁止・実装禁止事項（確定）

- AI副業・AIプロンプト集・ChatGPT使い方PDF商品に戻らない
- Canvaテンプレ単体・Notionテンプレ単体に戻らない
- 物販・POD・AI画像グッズ・在庫商品に戻らない
- Email Funnelを単体商品にしない
- 商品候補をこれ以上増やさない
- note/LINE/Tipsに戻らない
- Remotion実装しない
- Instagram/Threads API自動投稿実装しない
- Claude APIクライアント実装しない
- ブログ/SEO記事自動生成しない
- 動画生成基盤を作らない
- 高額有料ツール（$50/月以上）を前提にしない
