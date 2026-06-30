# Go-Live Copy-Paste Guide
# Turn Your Client Work Into Paid Templates with AI

このガイドは、Gumroad・Tally・Brevoを公開するときに
コピペするだけで完了できる手順書です。

**前提：**
- Gumroad / Tally / Brevo の登録は完了済み
- 各プラットフォームの設定手順書（platform_setup/）も参照すること
- {{GUMROAD_LINK}} / {{TALLY_QUIZ_LINK}} / {{SUPPORT_EMAIL}} は公開後に実際のURLで置換する

---

## STEP 1 — Gumroad商品ページを公開する（所要：30〜45分）

### 1-1. 商品タイトル

```
Turn Your Client Work Into Paid Templates with AI
```

### 1-2. 短い説明文（検索表示用、160文字以内）

```
Turn the work you already do for clients into templates you can sell repeatedly.
AI-powered system for freelancers and consultants.
```

### 1-3. 価格

```
$19（10件販売後に$29へ値上げ）
```

### 1-4. 割引コード

```
コード名：TEMPLATE5
割引額：$5 off
使用期限：Brevo Day 4メール配信後48時間
```

### 1-5. タグ

```
freelancer, consultant, templates, digital product, client work,
passive income, productize, solopreneur, AI tools, side income,
service provider, digital templates, productization
```

### 1-6. 商品説明文全文

→ `platform_setup/gumroad_launch_kit_listing.md` の「3. Full Product Description」をコピーして貼り付ける

### 1-7. カバー画像テキスト（Canvaで作成）

```
メインヘッドライン：
Turn Your Client Work Into Paid Templates with AI

サブヘッドライン：
Extract the templates hiding in your existing work
and sell them on Gumroad — starting this week

下部ラベル：
For freelancers, consultants, coaches & service providers
```

### 1-8. 公開後チェック

- [ ] 商品URLをコピーして保存する → {{GUMROAD_LINK}} を置換する
- [ ] TEMPLATE5割引コードが機能するか確認する
- [ ] テスト購入（100%offコード使用）で納品ファイルが届くか確認する

---

## STEP 2 — Tally診断クイズを公開する（所要：45〜60分）

### 2-1. フォームタイトル

```
What Paid Template Is Hidden Inside Your Client Work?
```

### 2-2. フォーム説明文

```
Find out which type of sellable template is hiding inside
the work you already do for clients.
Takes 3 minutes. Free.
```

### 2-3. ウェルカムテキスト

```
If you do any kind of client or service work —
freelancing, consulting, coaching, design, writing, development —
there's almost certainly a sellable template hiding in what you do.

This quiz will help you find it.

Answer honestly based on what you actually do, not what you wish you did.
At the end, you'll get your template type + a free resource to help you package it.
```

### 2-4. 10問 + 6結果ページ

→ `platform_setup/tally_readiness_quiz.md` の全文をコピーして貼り付ける

### 2-5. メールオプトイン（結果表示前）

```
見出し：Your template type is ready.
説明：Enter your email to see what's hiding in your client work
     and get a free resource to help you package it.
ボタン：Show my template type →
注記：No spam. Unsubscribe anytime.
```

### 2-6. 結果ページ後CTA

```
Ready to turn your client work into your first digital product?

The Starter Kit gives you every template, worksheet, and AI prompt
you need to go from client work to Gumroad listing in under a week.

→ Get the Starter Kit for $19: {{GUMROAD_LINK}}
```

### 2-7. 公開後チェック

- [ ] クイズURLをコピーして保存する → {{TALLY_QUIZ_LINK}} を置換する
- [ ] テスト回答を完了し、6つの結果ページがすべて表示されるか確認する
- [ ] メール登録がBrevoに連携されるか確認する（Zapierまたは手動CSV）

---

## STEP 3 — Brevo 7日間メールシーケンスを有効化する（所要：20〜30分）

### 3-1. Day 0（即時送信）件名

```
Your template type is inside — here's where to start
```

### 3-2. Day 0 本文

→ `platform_setup/brevo_7day_email_sequence.md` の「DAY 0」セクションをコピーして貼り付ける

### 3-3. Day 1〜7 件名一覧

```
Day 1：The thing most freelancers never realize about their own work
Day 2：How to find your first template in under an hour (3-step audit)
Day 3：3 template formats that sell — and which one fits your work
Day 4：How to create your template with AI (+ $5 off today only)
Day 5：Where to sell your template (and what to charge)
Day 6：You don't need 10,000 followers to sell your first template
Day 7：Last email — and a reminder of what's at stake
```

→ 各本文は `platform_setup/brevo_7day_email_sequence.md` から対応する日のセクションをコピーして貼り付ける

### 3-4. Day 4 TEMPLATE5コードの埋め込み

```
Use code TEMPLATE5 for $5 off the Starter Kit:
→ {{GUMROAD_LINK}}

Brings it to $14. Code expires in 48 hours.
```

### 3-5. 有効化後チェック

- [ ] Day 0〜7の全メールがBrevoのオートメーションに登録されているか確認する
- [ ] テスト送信でレイアウトが崩れていないか確認する
- [ ] Tallyからのオプトインが自動でBrevoリストに追加されるか確認する

---

## STEP 4 — URL置換作業（全ファイル一括）

Gumroad URL と Tally URL が確定したら、以下のファイルのプレースホルダーを置換する。

**置換対象ファイル：**

| ファイル | 置換するプレースホルダー |
|---|---|
| platform_setup/gumroad_launch_kit_listing.md | {{TALLY_QUIZ_LINK}} |
| platform_setup/tally_readiness_quiz.md | {{GUMROAD_LINK}} |
| platform_setup/brevo_7day_email_sequence.md | {{GUMROAD_LINK}}, {{SUPPORT_EMAIL}} |
| content/global_x_threads_launch_posts_20.md | {{TALLY_QUIZ_LINK}}, {{GUMROAD_LINK}} |

**置換する値（公開後に入力）：**

```
{{GUMROAD_LINK}} = [Gumroad公開後のURL]
{{TALLY_QUIZ_LINK}} = [Tally公開後のURL]
{{SUPPORT_EMAIL}} = [サポートメールアドレス]
```

---

## STEP 5 — SNS導線を整える（所要：30分）

### 5-1. X（Twitter）プロフィール bio

```
Helping freelancers & consultants turn client work into passive income.
Free quiz → [{{TALLY_QUIZ_LINK}}]
```

### 5-2. Threads プロフィール bio

```
Freelancers: your client work is worth more than one fee.
Take the free quiz → {{TALLY_QUIZ_LINK}}
```

### 5-3. LinkedIn プロフィール bio（追記）

```
I help freelancers & consultants turn their existing client work
into digital templates that sell on Gumroad.
Free 3-min quiz: {{TALLY_QUIZ_LINK}}
```

### 5-4. 最初の投稿

→ `content/global_x_threads_launch_posts_20.md` の **Post 08** を使う（クイズ告知）
→ {{TALLY_QUIZ_LINK}} を実際のURLに置換してから投稿する

---

## 完了チェックリスト

- [ ] Gumroad商品ページ公開済み
- [ ] TEMPLATE5割引コード作成済み
- [ ] Tally診断クイズ公開済み・テスト回答確認済み
- [ ] Brevo Day 0〜7設定済み・テスト送信確認済み
- [ ] {{GUMROAD_LINK}} → 実URLに置換済み
- [ ] {{TALLY_QUIZ_LINK}} → 実URLに置換済み
- [ ] {{SUPPORT_EMAIL}} → 実メールアドレスに置換済み
- [ ] X / Threads / LinkedIn プロフィール更新済み
- [ ] Post 08（クイズ告知投稿）公開済み
- [ ] TallyとBrevoの連携確認済み（テスト登録）
- [ ] Gumroadのテスト購入確認済み

---

## 参照ファイル一覧

| ファイル | 内容 |
|---|---|
| platform_setup/gumroad_launch_kit_listing.md | Gumroad商品ページ全文 |
| platform_setup/gumroad_setup_checklist.md | Gumroad設定手順 |
| platform_setup/tally_readiness_quiz.md | Tallyクイズ全文 |
| platform_setup/tally_setup_checklist.md | Tally設定手順 |
| platform_setup/brevo_7day_email_sequence.md | Brevo 7日間メール全文 |
| platform_setup/brevo_setup_checklist.md | Brevo設定手順 |
| content/global_x_threads_launch_posts_20.md | SNS投稿20本 |
| docs/36_final_two_offer_decision.md | 最終2商品決定書 |
