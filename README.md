# AI Net Business SNS OS

このプロジェクトは、X・Threads・Instagramを使ってAI Digital Productを
グローバルに収益化するためのSNS自動化OSです。

## 目的

- SNS投稿の自動生成（英語・日本語）
- AI Digital Productのグローバル販売（Gumroad）
- 無料診断（Tally）からメール登録（Brevo）への導線設計
- 7日間ステップ配信による販売自動化
- 投稿インサイト分析・勝ち投稿の再利用
- 商品階段設計（$19 → $49〜$99 → 高単価相談）

## グローバル展開方針

- **販売プラットフォーム**：Gumroad ✅ 登録済み
- **メール配信**：Brevo ✅ 登録済み
- **無料診断**：Tally ✅ 登録済み
- **LP**：Carrd または Notion Sites（後回し）
- **集客SNS**：X（英語圏主力）+ Threads + Instagram
- **制作ツール**：Google Docs / Google Sheets / Canva
- **AI自動化**：Claude Code（文章生成）+ ChatGPT（Deep Research・改善）

初期費用：**$0**

## 現在のフェーズ

**Phase 2: 販売導線を公開する**
- Gumroad商品ページを公開
- Tally診断クイズを公開
- Brevo Day 0メールを設定
- X/Threadsプロフィールにクイズリンクを設置
- 1日1投稿を開始

参照：`operations/today_user_tasks_after_registration.md`

## 運用ルール

- 店舗事業の YU Business OS とは分離管理する
- Google Sheets名は **AI-NET-BUSINESS-OS** に統一する
- commit前は必ず変更ファイル一覧を表示してユーザー確認待ちにする
- push前は必ずユーザー確認待ちにする
- 公開リポジトリには絶対にpushしない
- 秘密情報・APIキー・トークン・.env は絶対にコミットしない

## 実装しないこと（当面）

- Remotion実装
- Instagram/Threads API自動投稿
- Claude APIクライアント実装
- ブログ/SEO記事自動生成
- 動画生成基盤
- 高額有料ツールの前提導入（$50/月以上）
- note/LINE/Tips中心への回帰
