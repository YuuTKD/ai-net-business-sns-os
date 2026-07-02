# Go-Live Copy-Paste Guide
# Sell the Client Docs You Already Use

このガイドは、Gumroad・Tally・Brevo・LinkedInを
コピペだけで公開できる手順書です。

**前提：**
- Gumroad / Tally / Brevo の登録は完了済み
- 各プラットフォームの詳細手順書（platform_setup/）も参照すること
- {{GUMROAD_LINK}} / {{TALLY_QUIZ_LINK}} / {{SUPPORT_EMAIL}} は公開後に実際のURLで置換する
- URL置換の詳細は `operations/url_placeholder_replacement_map.md` を参照

---

## STEP 1 — Gumroad商品ページを公開する（所要：30〜45分）

### 1-1. 商品タイトル

```
Sell the Client Docs You Already Use
```

### 1-2. サブタイトル / 短い説明文（検索表示用・160文字以内）

```
Use AI to turn your proposals, intake forms, and messaging frameworks into paid templates. For freelance copywriters and solo marketers.
```

### 1-3. 価格設定

```
価格：$19
"Name a fair price" 機能：OFF（固定価格）
返金ポリシー：30日間・理由不問（Trust向上のため推奨）
```

### 1-4. 割引コード（メール専用・商品ページには掲載しない）

```
コード名：TEMPLATE5
割引額：$5 off（$19 → $14）
用途：Brevo Day 4メールの末尾のみ・控えめに記載
商品ページには一切表示しない
```

### 1-5. タグ（Gumroad検索用）

```
copywriter, solo marketer, freelance, proposals, templates, client docs,
digital product, passive income, productize, messaging framework,
intake form, service provider, digital templates
```

### 1-6. 商品説明文全文

→ `platform_setup/gumroad_launch_kit_listing.md` の「Full Product Description」セクションをコピーして貼り付ける。

貼り付け後、以下を確認する：
- {{TALLY_QUIZ_LINK}} が実URLに置換済みか
- {{SUPPORT_EMAIL}} が実メールアドレスに置換済みか

### 1-7. カバー画像テキスト（Canvaで作成・1280×720px推奨）

```
Line 1（大）：Sell the Client Docs You Already Use
Line 2（中）：Turn your proposals, intake forms, and messaging frameworks
              into paid templates — starting this week
Line 3（小）：For freelance copywriters and solo marketers · $19
```

背景：ダークネイビー or チャコール / 文字：白

### 1-8. アップロードファイル

Gumroadの「Files」欄にアップロードするファイル：

```
Sell_the_Client_Docs_You_Already_Use_Gumroad_Package.zip
```

ZIPの作成方法：
```bash
cd dist
zip -r Sell_the_Client_Docs_You_Already_Use_Gumroad_Package.zip gumroad_upload_package/
```

ZIPの中身（9ファイル）：
- README_START_HERE.md
- Sell_the_Client_Docs_You_Already_Use.md
- Client_Docs_Inventory_Sheet.md
- Paid_Template_Idea_Finder.md
- Template_Offer_Builder.md
- Gumroad_Sales_Page_Template.md
- Seven_Day_Launch_Email_and_Post_Pack.md
- BONUS_AI_PROMPTS.md
- LICENSE_AND_USAGE.md

### 1-9. 購入後メッセージ（Gumroad Thank You Page）

```
Thank you for buying Sell the Client Docs You Already Use.

Your download is attached above — click to download and save the ZIP.

Start with README_START_HERE.md, then follow the 7-day path.

Questions? Email {{SUPPORT_EMAIL}}
I respond to every message.
```

### 1-10. 返金ポリシー文（商品ページの末尾）

```
30-day refund. No questions asked.
If it's not useful, email {{SUPPORT_EMAIL}} for a full refund.
```

### 1-11. 公開後チェックリスト

- [ ] 商品URLをコピーして保存する
- [ ] `url_placeholder_replacement_map.md` を開き、{{GUMROAD_LINK}} を全ファイルで置換する
- [ ] TEMPLATE5割引コードが作成済みか確認する（Gumroad → Discounts）
- [ ] テスト購入（100% OFFコード使用）で：
  - [ ] ZIPファイルがダウンロードできるか
  - [ ] ZIPを開いて9ファイルが全て存在するか
  - [ ] 購入後メッセージが表示されるか
  - [ ] Brevo Day 0メールが5分以内に届くか（Tally→Brevo連携が前提）

**STEP 1完了後：** → コピーした商品URLをメモする

---

## STEP 2 — Tally診断クイズを公開する（所要：45〜60分）

### 2-1. フォームタイトル

```
What Paid Template Is Hidden Inside Your Client Docs?
```

### 2-2. フォーム説明文（Tally公開ページ表示用）

```
Find out which of your client documents is worth selling as a paid template.
Takes 3 minutes. Free.
```

### 2-3. ウェルカムテキスト（Tallyの最初の画面）

```
If you're a freelance copywriter or solo marketer,
you're sending clients the same types of documents over and over.

Your proposal. Your intake form. Your messaging framework.
Your swipe file. Your onboarding process.

One of those documents — cleaned up and listed on Gumroad —
could earn you $19–$49 each time someone downloads it.

This quiz will help you find which one.
```

### 2-4. 10問の質問と選択肢

→ `platform_setup/tally_readiness_quiz.md` の「質問リスト（10問）」セクションを全文コピーして貼り付ける。

### 2-5. 6つの結果ページ

→ `platform_setup/tally_readiness_quiz.md` の「結果ページ（6種）」セクションを全文コピーして貼り付ける。

結果表示ロジック（Q2の回答が主決定因子）：

| Q2の回答 | 表示する結果 |
|---|---|
| A（提案書・見積書） | Proposal Template |
| B（ヒアリングシート） | Client Intake Template |
| C（メッセージングガイド） | Messaging Framework Template |
| D（コンテンツプランなど） | Sales Page Checklist |
| E（チェックリスト・SOP） | Onboarding SOP |
| Q2=D かつ Q5=E | Swipe File Template |
| デフォルト | Proposal Template |

### 2-6. メールオプトイン（結果表示前に設置）

```
見出し：Your template type is ready.

説明文：
Enter your email to see which of your client docs is worth selling
and get a free resource to help you package it.

ボタンラベル：Show my template type →

注記：No spam. Unsubscribe anytime.
```

### 2-7. 結果ページ後のCTA（全6結果ページ共通）

```
Ready to turn your best client doc into your first paid template?

The Starter Kit gives you 5 targeted tools to identify, clean up,
and list your first template on Gumroad — in under a week.

→ Get the Starter Kit for $19: {{GUMROAD_LINK}}
```

**{{GUMROAD_LINK}} を実URLに置換してから貼り付けること。**

### 2-8. Brevo連携設定

TallyとBrevoの連携方法（2択）：
- 方法A：Tally → Integrations → Zapier → Brevo list へ自動追加
- 方法B：Tally → Submissions → CSVエクスポート → Brevo → Contacts → Import（手動・週次）

方法Aが推奨。Zapier無料枠（100タスク/月）で十分。

### 2-9. 公開後チェックリスト

- [ ] クイズURLをコピーして保存する
- [ ] `url_placeholder_replacement_map.md` を開き、{{TALLY_QUIZ_LINK}} を全ファイルで置換する
- [ ] テスト回答を完了し、6つの結果ページが全て表示されるか確認する
- [ ] メール登録テスト：登録後にBrevoのリストにメールアドレスが追加されるか確認する
- [ ] 結果ページのGumroadリンクが実URLになっているか確認する（プレースホルダーが残っていないか）

**STEP 2完了後：** → コピーしたクイズURLをメモする

---

## STEP 3 — Brevo 7日間メールシーケンスを有効化する（所要：30〜45分）

### 3-1. リスト名

```
Paid Templates - Main List
```

### 3-2. オートメーション名

```
Paid Templates 7-Day Sequence
```

### 3-3. トリガー条件

```
トリガー：メール登録（Tallyからの連携またはBrevoフォームへの直接登録）
開始条件：Contact added to list "Paid Templates - Main List"
```

### 3-4. Day 0〜7 件名一覧

```
Day 0（即時）：Your template type is inside — here's where to start
Day 1（24h後）：The client doc you keep recreating is worth money
Day 2（48h後）：How to find your first sellable doc in 30 minutes
Day 3（72h後）：3 doc formats that sell — and which one you already have
Day 4（96h後）：How to turn your client doc into a paid template (one afternoon)
Day 5（120h後）：Where to sell your template (and what to charge)
Day 6（144h後）：You don't need 5,000 LinkedIn followers to sell your first template
Day 7（168h後）：Last email — this is what it comes down to
```

### 3-5. 各メール本文

→ `platform_setup/brevo_7day_email_sequence.md` の対応日のセクションをコピーして各メールに貼り付ける。

置換するURL：
- {{GUMROAD_LINK}} → Gumroad商品URL
- {{TALLY_QUIZ_LINK}} → TallyクイズURL
- {{SUPPORT_EMAIL}} → サポートメールアドレス

### 3-6. Day 4のTEMPLATE5コード（本文末尾・控えめに）

Day 4メールの本文末尾のみに以下を追加する：

```
(Use code TEMPLATE5 at checkout if you'd like $5 off — expires in 48 hours.)
```

他のメールには記載しない。商品ページにも掲載しない。

### 3-7. プレビューテキスト（各メール）

| Day | プレビューテキスト |
|---|---|
| Day 0 | Based on your quiz, here's which client doc to sell first |
| Day 1 | You're not charging enough for what's sitting in your Google Drive |
| Day 2 | Look at your last 5 client projects — it's already there |
| Day 3 | Not all templates sell equally. Here's what buyers actually buy. |
| Day 4 | AI does most of the work. Here's the exact process. |
| Day 5 | Gumroad setup takes under 30 minutes. Here's the pricing guide. |
| Day 6 | Here's what actually works from a small audience |
| Day 7 | You already have the document. You just haven't listed it yet. |

### 3-8. 有効化後チェックリスト

- [ ] Day 0〜7の全メールがBrevoのオートメーションに登録されているか確認する
- [ ] 各メールのURLプレースホルダーが全て実URLに置換されているか確認する
- [ ] テスト送信（Brevo → Send a test）でレイアウトが崩れていないか確認する
- [ ] オートメーションの状態が「Active」になっているか確認する（「Paused」のまま公開しない）
- [ ] TallyからのオプトインがBrevoリストに自動追加されるか動作確認する

**STEP 3完了後：** → オートメーション「Active」状態であることを確認する

---

## STEP 4 — LinkedInを主戦場に設定する（所要：30分）

### 4-1. LinkedIn プロフィールのbio（ヘッドライン部分に追記）

```
I help freelance copywriters and solo marketers turn their client docs
into paid templates on Gumroad.

Free 3-min quiz → {{TALLY_QUIZ_LINK}}
```

**{{TALLY_QUIZ_LINK}} を実URLに置換してから設定する。**

### 4-2. Threads プロフィールのbio

```
Freelance copywriters: your proposals and intake forms are worth selling.
Free quiz → {{TALLY_QUIZ_LINK}}
```

**{{TALLY_QUIZ_LINK}} を実URLに置換してから設定する。**

### 4-3. 最初の投稿（Day 1 — Post 1）

→ `content/global_x_threads_launch_posts_20.md` の **Post 01** をコピーして投稿する。

投稿前チェック：
- Gumroadリンクは投稿本文ではなく「最初のコメント」に貼る（LinkedInのリーチ確保）
- ハッシュタグは使わない（LinkedInではリーチが下がる）
- 投稿後1時間以内にコメント欄にGumroadリンクを追加する

### 4-4. クイズ告知投稿（Post 08）

→ `content/global_x_threads_launch_posts_20.md` の **Post 08** をコピーして投稿する。
（LinkedIn版 + Threads短縮版の2種あり）

Threads版：
- 3〜4行以内
- クイズリンクを直接本文に含める

### 4-5. 監視する指標（最初の48時間）

| 指標 | 最初の48h目標 |
|---|---|
| LinkedIn投稿インプレッション | 200+ |
| クイズ回答数（Tally） | 3+ |
| メール登録数（Brevo） | 2+ |
| Gumroadページビュー | 30+ |
| 販売数 | 0〜1（realistic） |

---

## STEP 5 — 公開後チェックリスト（すべてのSTEP完了後）

### 5-1. Gumroad確認

- [ ] 商品ページが公開状態（Published）になっている
- [ ] 商品URLにアクセスすると購入ページが表示される
- [ ] 購入ボタンが表示され、クリックできる
- [ ] ZIPファイルが添付されている（Files欄）
- [ ] テスト購入でZIPがダウンロードできる
- [ ] ZIPを展開すると9ファイルが全て存在する

### 5-2. Tally確認

- [ ] クイズURLにアクセスすると10問が表示される
- [ ] テスト回答で6つの結果ページが表示される
- [ ] 各結果ページのGumroadリンクが実URLになっている（プレースホルダーなし）
- [ ] メール登録後にBrevoリストに追加される
- [ ] 「No spam. Unsubscribe anytime.」の注記が表示される

### 5-3. Brevo確認

- [ ] Day 0メールがTallyのテスト登録後5分以内に届く
- [ ] Day 0メールのGumroadリンクが実URLになっている
- [ ] メール本文にプレースホルダー（{{ }}）が残っていない
- [ ] Day 1メールが24時間後に予約送信されている（オートメーションのフロー確認）
- [ ] オートメーションの状態が「Active」である

### 5-4. LinkedIn/Threads確認

- [ ] LinkedInのbioにクイズリンクが設置されている（実URLで）
- [ ] ThreadsのbioにクイズリンクURLが設置されている（実URLで）
- [ ] LinkedIn最初の投稿が公開されている
- [ ] 投稿のコメント欄にGumroadリンクが追加されている

### 5-5. プレースホルダー残存確認（最終チェック）

以下のコマンドで残っているプレースホルダーを検索する：

```bash
grep -r "{{" dist/ platform_setup/ operations/ content/ docs/
```

結果が0件 → 全置換完了。公開OK。
結果がある → 表示されたファイルを開いて置換してから再確認する。

---

## 公開完了後のネクストアクション

```
STEP 1〜5完了 → 公開済み

↓

Day 1（公開当日）：LinkedIn Post 01を投稿
Day 2：LinkedIn Post 02を投稿
Day 3：LinkedIn Post 03を投稿（実用的なヒント）
Day 4：LinkedIn Post 08を投稿（クイズ告知 — メイン集客）
Day 5〜7：LinkedIn Post 04〜07を順次投稿

7日後：
- Tally回答数、Brevo登録数、Gumroad販売数を確認
- 5件販売 → 価格を$29に変更
- 20件販売 → $49 Bundleを追加

```

---

## 参照ファイル一覧

| ファイル | 内容 |
|---|---|
| platform_setup/gumroad_launch_kit_listing.md | Gumroad商品ページ全文 |
| platform_setup/gumroad_setup_checklist.md | Gumroad設定手順 |
| platform_setup/gumroad_post_purchase_message.md | 購入後メッセージ |
| platform_setup/tally_readiness_quiz.md | Tallyクイズ全文（10問・6結果） |
| platform_setup/tally_setup_checklist.md | Tally設定手順 |
| platform_setup/brevo_7day_email_sequence.md | Brevo 7日間メール全文 |
| platform_setup/brevo_setup_checklist.md | Brevo設定手順 |
| content/global_x_threads_launch_posts_20.md | LinkedIn/Threads投稿20本 |
| operations/url_placeholder_replacement_map.md | URL置換の詳細マップ |
| operations/first_48h_after_launch_action_plan.md | 公開後48時間アクションプラン |
| dist/gumroad_upload_package/ | Gumroadアップロード用パッケージ（9ファイル） |
| dist/gumroad_upload_package/ZIP_STRUCTURE.md | ZIPの構成とzip作成コマンド |
