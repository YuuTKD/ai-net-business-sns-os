# Go-Live Copy-Paste Guide
# Sell the Client Docs You Already Use

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
Sell the Client Docs You Already Use
```

### 1-2. 短い説明文（検索表示用、160文字以内）

```
Turn your proposals, intake forms, and messaging frameworks into paid templates.
For freelance copywriters and solo marketers.
```

### 1-3. 価格

```
$19（10件販売後に$29へ値上げ）
```

### 1-4. 割引コード（メール専用・商品ページには表示しない）

```
コード名：TEMPLATE5
割引額：$5 off
使用：Brevo Day 4メールのみ（末尾に控えめに記載）
商品ページには表示しない
```

### 1-5. タグ

```
copywriter, solo marketer, freelance, proposals, templates, client docs,
digital product, passive income, productize, messaging framework,
intake form, service provider, digital templates
```

### 1-6. 商品説明文全文

→ `platform_setup/gumroad_launch_kit_listing.md` の「3. Full Product Description」をコピーして貼り付ける

### 1-7. カバー画像テキスト（Canvaで作成）

```
メインヘッドライン：
Sell the Client Docs You Already Use

サブヘッドライン：
Turn your proposals, intake forms, and messaging frameworks
into paid templates — starting this week

下部ラベル：
For freelance copywriters and solo marketers
```

### 1-8. 公開後チェック

- [ ] 商品URLをコピーして保存する → {{GUMROAD_LINK}} を置換する
- [ ] TEMPLATE5割引コードが機能するか確認する
- [ ] テスト購入（100%offコード使用）で納品ファイルが届くか確認する

---

## STEP 2 — Tally診断クイズを公開する（所要：45〜60分）

### 2-1. フォームタイトル

```
What Paid Template Is Hidden Inside Your Client Docs?
```

### 2-2. フォーム説明文

```
Find out which of your client documents is worth selling as a paid template.
Takes 3 minutes. Free.
```

### 2-3. ウェルカムテキスト

```
If you're a freelance copywriter or solo marketer,
you're sending clients the same types of documents over and over.

Your proposal. Your intake form. Your messaging framework.
Your swipe file. Your onboarding process.

One of those documents — cleaned up and listed on Gumroad —
could earn you $19–$49 each time someone downloads it.

This quiz will help you find which one.
```

### 2-4. 10問 + 6結果ページ

→ `platform_setup/tally_readiness_quiz.md` の全文をコピーして貼り付ける

### 2-5. 結果ページ条件設定

| Q2の回答 | 表示する結果タイプ |
|---|---|
| A（提案書） | Proposal Template |
| B（ヒアリングシート） | Client Intake Template |
| C（メッセージングガイド） | Messaging Framework Template |
| D（コンテンツプラン） | Sales Page Checklist |
| E（チェックリスト） | Onboarding SOP |
| デフォルト | Proposal Template |

### 2-6. メールオプトイン（結果表示前）

```
見出し：Your template type is ready.
説明：Enter your email to see which of your client docs is worth selling
     and get a free resource to help you package it.
ボタン：Show my template type →
注記：No spam. Unsubscribe anytime.
```

### 2-7. 結果ページ後CTA

```
Ready to turn your best client doc into your first paid template?

The Starter Kit gives you 5 targeted tools to identify, clean up,
and list your first template on Gumroad — in under a week.

→ Get the Starter Kit for $19: {{GUMROAD_LINK}}
```

### 2-8. 公開後チェック

- [ ] クイズURLをコピーして保存する → {{TALLY_QUIZ_LINK}} を置換する
- [ ] テスト回答を完了し、6つの結果ページがすべて表示されるか確認する
- [ ] メール登録がBrevoに連携されるか確認する（ZapierまたはCSV手動）

---

## STEP 3 — Brevo 7日間メールシーケンスを有効化する（所要：30〜45分）

### 3-1. Day 0（即時送信）件名

```
Your template type is inside — here's where to start
```

### 3-2. Day 0 本文

→ `platform_setup/brevo_7day_email_sequence.md` の「DAY 0」セクションをコピーして貼り付ける

### 3-3. Day 1〜7 件名一覧

```
Day 1：The client doc you keep recreating is worth money
Day 2：How to find your first sellable doc in 30 minutes
Day 3：3 doc formats that sell — and which one you already have
Day 4：How to turn your client doc into a paid template (one afternoon)
Day 5：Where to sell your template (and what to charge)
Day 6：You don't need 5,000 LinkedIn followers to sell your first template
Day 7：Last email — this is what it comes down to
```

→ 各本文は `platform_setup/brevo_7day_email_sequence.md` から対応する日のセクションをコピーして貼り付ける

### 3-4. Day 4のTEMPLATE5コード（末尾に控えめに）

```
(Use code TEMPLATE5 at checkout if you'd like $5 off — expires in 48 hours.)
```

### 3-5. 有効化後チェック

- [ ] Day 0〜7の全メールがBrevoのオートメーションに登録されているか確認する
- [ ] テスト送信でレイアウトが崩れていないか確認する
- [ ] Tallyからのオプトインが自動でBrevoリストに追加されるか確認する（またはCSV手動運用）

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

## STEP 5 — LinkedInを主戦場に設定する（所要：30分）

### 5-1. LinkedIn プロフィール bio（追記）

```
I help freelance copywriters and solo marketers turn their client docs
into paid templates on Gumroad.

Free 3-min quiz → {{TALLY_QUIZ_LINK}}
```

### 5-2. Threads プロフィール bio

```
Freelance copywriters: your proposals and intake forms are worth selling.
Free quiz → {{TALLY_QUIZ_LINK}}
```

### 5-3. 最初の投稿

→ `content/global_x_threads_launch_posts_20.md` の **Post 08** を使う（クイズ告知）
→ {{TALLY_QUIZ_LINK}} を実際のURLに置換してから投稿する
→ LinkedInに投稿後、Threadsに短縮版をクロスポストする

---

## 完了チェックリスト

- [ ] Gumroad商品ページ公開済み（新タイトル：Sell the Client Docs You Already Use）
- [ ] TEMPLATE5割引コード作成済み（メール専用）
- [ ] Tally診断クイズ公開済み・テスト回答確認済み
- [ ] Brevo Day 0〜7設定済み・テスト送信確認済み
- [ ] {{GUMROAD_LINK}} → 実URLに置換済み
- [ ] {{TALLY_QUIZ_LINK}} → 実URLに置換済み
- [ ] {{SUPPORT_EMAIL}} → 実メールアドレスに置換済み
- [ ] LinkedIn プロフィール更新済み（クイズリンク設置）
- [ ] Threads プロフィール更新済み（クイズリンク設置）
- [ ] Post 08（クイズ告知投稿）LinkedIn に公開済み
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
| content/global_x_threads_launch_posts_20.md | LinkedIn/Threads投稿20本 |
| docs/38_120_point_prelaunch_offer_upgrade.md | 120点版仕様・公開前チェックリスト |
