# Claude Publish Operator
# Sell the Client Docs You Already Use — Go-Live Guide

このファイルを上から順に進めるだけで公開できます。
Claude Codeがやること：ナビゲーション・テキスト準備・URL置換・KPI記録
ユーザーがやること：ログイン・2FA・アップロード・公開ボタン・URL共有

---

## Phase 1 — Open Pages

**ターミナルで実行：**

```bash
bash operations/open_all_publish_pages.sh
```

または手動で以下の5ページを開く：

| # | サービス | URL |
|---|---|---|
| 1 | Gumroad（新商品作成） | https://app.gumroad.com/products/new |
| 2 | Tally（フォーム一覧） | https://tally.so/forms |
| 3 | Brevo（コンタクト） | https://app.brevo.com/contact/list |
| 4 | LinkedIn（プロフィール） | https://www.linkedin.com/in/ |
| 5 | Threads（プロフィール） | https://www.threads.net/ |

**ユーザーの作業：**
☐ 各サービスにログイン（2FA含む）
☐ 全ページが表示されたらPhase 2へ

---

## Phase 2 — Gumroad Input

### 2-1. 商品タイトル欄に貼る

```
Sell the Client Docs You Already Use
```

### 2-2. 短い説明文欄に貼る（「Summary」または「Subtitle」欄）

```
Turn your proposals, intake forms, and messaging frameworks into paid templates. For freelance copywriters and solo marketers.
```

### 2-3. 価格欄に入力

```
19
```

「Name a fair price」はOFF（固定価格に設定）

### 2-4. 商品説明文（Description欄）に貼る

```
You already have the product.

Every proposal you've refined across 20 clients.
Every intake form you send before starting a project.
Every messaging framework you explain on discovery calls.

Those aren't just internal tools.
They're documents other copywriters and marketers would pay $19–$49 for.

The problem isn't that you lack ideas.
The problem is that you've been giving your best documents away —
one client at a time.

Sell the Client Docs You Already Use is a 5-part kit that helps
freelance copywriters and solo marketers identify, clean up, and list
one client document as a paid template on Gumroad — in under a week.

Use AI to do most of the work in a single afternoon.

────────────────────────────────────
WHAT'S INSIDE (5 ASSETS)
────────────────────────────────────

✓ Client Docs Inventory Sheet
  A structured worksheet to list every document you send to clients —
  proposals, intake forms, messaging guides, SOPs — and evaluate
  which one is worth selling first. Includes AI prompts to speed up the audit.

✓ Paid Template Idea Finder
  Answer 8 questions about your most reused document.
  Walk away with a product title, target buyer, price point, and format.

✓ Template Offer Builder
  Step-by-step AI prompts to clean up your document,
  remove client-specific details, and structure it for general sale.
  Includes a fill-in-the-blank table of contents template.

✓ Gumroad Sales Page Template
  A fill-in-the-blank Gumroad product description.
  Write your listing page in under 30 minutes.
  No copywriting experience needed.

✓ 7-Day Launch Email + Post Pack
  7 email templates + 7 LinkedIn posts for your first launch week.
  Designed to drive buyers to your template without sounding salesy.

────────────────────────────────────
WHO THIS IS FOR
────────────────────────────────────

✓ Freelance copywriters who reuse proposal structures, intake forms, or copy briefs
✓ Solo marketers who have built messaging frameworks or brand voice guides
✓ Strategists who run the same discovery or audit process with every client
✓ Any service provider who sends the same type of document to multiple clients
✓ People who want additional income from work they've already done

────────────────────────────────────
WHO THIS IS NOT FOR
────────────────────────────────────

✗ Anyone looking for a get-rich-quick system
✗ People who haven't done any client or service work yet
✗ Those who want fully automated, zero-effort income

────────────────────────────────────
FREQUENTLY ASKED QUESTIONS
────────────────────────────────────

Q: Do I need a large LinkedIn following to sell my first template?
A: No. The kit includes a 7-Day Launch Email + Post Pack designed to work
   from a small or brand-new audience.

Q: What types of documents can I sell?
A: Proposals, intake forms, brand voice guides, messaging frameworks,
   content calendars, SOPs, copy briefs, swipe files — any document
   you send clients repeatedly.

Q: What AI tools do I need?
A: Claude or ChatGPT (both have free tiers). No paid AI subscription required.

Q: How long will this take?
A: Most people complete their first template in one afternoon.
   The 7-day launch plan takes 1–2 hours per day.

Q: Where do I sell the templates?
A: Gumroad is the recommended platform. Free to start, handles payment
   and delivery automatically. Setup takes under 30 minutes.
   The Gumroad Sales Page Template included in this kit walks you through it.

Q: What if my document is too client-specific to sell?
A: The Template Offer Builder includes AI prompts that help you generalize
   any client document into a reusable format — removing client details
   while keeping all the structure and value.

────────────────────────────────────
REFUND POLICY
────────────────────────────────────

30-day refund. No questions asked.
If it's not useful, email [YOUR_EMAIL] for a full refund.
```

**※ [YOUR_EMAIL] を自分のメールアドレスに変更してから貼ること**

### 2-5. ファイルアップロード（Files欄）

アップロードするファイル：

```
dist/Sell_the_Client_Docs_You_Already_Use_Gumroad_Package.zip
```

ZIPがまだ未作成の場合は先にこのコマンドを実行してください（Claude Codeが実行できます）：

```bash
cd /home/user/ai-net-business-sns-os/dist
zip -r Sell_the_Client_Docs_You_Already_Use_Gumroad_Package.zip gumroad_upload_package/
```

### 2-6. カバー画像テキスト（Canvaで1280×720px作成）

```
Line 1（大）：Sell the Client Docs You Already Use
Line 2（中）：Turn your proposals, intake forms, and messaging frameworks
              into paid templates — starting this week
Line 3（小）：For freelance copywriters and solo marketers · $19
```

背景色：ダークネイビー (#1a2744) or チャコール (#2d2d2d)
文字色：白

### 2-7. 購入後メッセージ（Post-Purchase Message欄）

```
Thank you for buying Sell the Client Docs You Already Use.

Your download is attached above — click to download and save the ZIP.

Start with README_START_HERE.md, then follow the 7-day path.

Questions? Email [YOUR_EMAIL]
I respond to every message.
```

**※ [YOUR_EMAIL] を自分のメールアドレスに変更してから貼ること**

### 2-8. 割引コード（Discounts欄で作成）

```
コード名：TEMPLATE5
割引額：$5 off
対象商品：Sell the Client Docs You Already Use
有効期限：なし（Day 4メールで使用時のみ案内）
表示場所：商品ページには掲載しない
```

### 2-9. タグ（Tags欄に1つずつ追加）

```
copywriter
solo marketer
freelance
proposals
templates
client docs
digital product
passive income
productize
messaging framework
intake form
service provider
digital templates
```

### 2-10. 公開前チェックリスト

- [ ] タイトル：Sell the Client Docs You Already Use
- [ ] 短い説明文：入力済み（160文字以内）
- [ ] 説明文：貼り付け済み（[YOUR_EMAIL] を置換済み）
- [ ] 価格：$19（固定）
- [ ] ZIPファイル：アップロード済み
- [ ] カバー画像：アップロード済み
- [ ] 購入後メッセージ：設定済み（[YOUR_EMAIL] を置換済み）
- [ ] TEMPLATE5割引コード：作成済み
- [ ] タグ：追加済み

### 2-11. ユーザーの作業

☐ 上のチェックリストを確認して「Publish」ボタンを押す

### 2-12. URL取得（公開後）

公開後にGumroadの商品URLをここに記録する：

```
GUMROAD_LINK = [ここに貼る]
例：https://yournamehere.gumroad.com/l/client-docs
```

URLを貼ったら：「GumroadのURLを貼りました：[URL]」と教えてください。
Claude Codeが全ファイルのプレースホルダーを一括置換します。

---

## Phase 3 — Tally Input

### 3-1. フォームタイトル

```
What Paid Template Is Hidden Inside Your Client Docs?
```

### 3-2. フォーム説明文

```
Find out which of your client documents is worth selling as a paid template.
Takes 3 minutes. Free.
```

### 3-3. ウェルカムテキスト（最初の画面）

```
If you're a freelance copywriter or solo marketer,
you're sending clients the same types of documents over and over.

Your proposal. Your intake form. Your messaging framework.
Your swipe file. Your onboarding process.

One of those documents — cleaned up and listed on Gumroad —
could earn you $19–$49 each time someone downloads it.

This quiz will help you find which one.

Answer based on what you actually use with clients right now.
At the end, you'll get your template type + a free resource to package it.
```

### 3-4. 10問の質問と選択肢（順番通りに入力）

**Q1. What best describes your primary work right now?**
- A: Freelance copywriting (sales pages, emails, ads, website copy)
- B: Content marketing (blog posts, newsletters, social content)
- C: Brand strategy or messaging consulting
- D: Fractional CMO or solo marketing work
- E: Something else / I'm exploring

**Q2. Which of these do you send most often to clients?**
- A: A project proposal or scope of work
- B: A client intake form or discovery questionnaire
- C: A brand voice or messaging guide
- D: A content plan or editorial calendar
- E: A checklist or onboarding process document

**Q3. How often do you create the same type of document for different clients?**
- A: Nearly every project uses the same basic structure
- B: Similar structure but I spend hours customizing each time
- C: Projects vary enough that I start mostly from scratch
- D: I'm still building my first client processes

**Q4. Which document takes the longest to build for each new client?**
- A: The intake questionnaire / discovery questions
- B: The project proposal or scope of work
- C: The brand voice or messaging strategy document
- D: The content plan or campaign framework
- E: The sales or landing page copy itself

**Q5. Which phrase best describes your most reused document?**
- A: A list of questions I ask every new client before starting
- B: A template I fill in to pitch new projects and set expectations
- C: A framework I walk clients through to define their messaging
- D: A checklist I run before delivering copy or content
- E: A curated set of example copy I reference across projects

**Q6. What format do your most reused documents take?**
- A: Google Docs (written guides, briefs, copy scripts)
- B: Notion pages (brand guides, strategy docs, SOPs)
- C: Google Slides or Canva (decks, frameworks, presentations)
- D: Google Sheets (content calendars, tracking, audits)
- E: A combination depending on the client

**Q7. What do clients most often say about how you work?**
- A: You ask great questions and get to the heart of what they need
- B: You always know what information to request upfront
- C: You have a clear, consistent way of defining brand and messaging
- D: You know what good copy looks like and can explain why it works
- E: You have a reliable process that keeps projects moving

**Q8. If you packaged your most reused document as a sellable template, who would buy it?**
- A: Newer copywriters figuring out their onboarding process
- B: Copywriters who want a proven proposal or brief format
- C: Brand strategists or marketers who need a messaging framework
- D: Content marketers who want a planning or editorial template
- E: Copywriters who want a curated swipe file to reference

**Q9. How long would it take someone else to use your document?**
- A: Under 30 minutes — it's a short questionnaire or checklist
- B: 1–2 hours — it requires thinking and filling in details
- C: Half a day — it's a structured process to work through
- D: Longer — it involves multiple steps and client input
- E: I'm not sure what it would look like as a standalone template

**Q10. What's your biggest hesitation about packaging a client doc as a paid template?**
- A: I'm not sure anyone would pay for it
- B: It feels too client-specific to generalize
- C: I'm not sure which document to start with
- D: I worry it's not polished enough
- E: I don't know how to price or list it

### 3-5. メールオプトイン（結果表示前に設置）

```
見出し：Your template type is ready.

説明文：Enter your email to see which of your client docs is worth selling
       and get a free resource to help you package it.

ボタン：Show my template type →

注記：No spam. Unsubscribe anytime.
```

### 3-6. 6つの結果ページ（条件分岐設定）

| 条件 | 表示する結果ページ |
|---|---|
| Q2 = A | Result Type 1: Proposal Template |
| Q2 = B | Result Type 2: Client Intake Template |
| Q2 = C | Result Type 3: Messaging Framework Template |
| Q2 = D（Q5 ≠ E） | Result Type 4: Sales Page Checklist |
| Q2 = D かつ Q5 = E | Result Type 5: Swipe File Template |
| Q2 = E | Result Type 6: Onboarding SOP |
| デフォルト | Result Type 1: Proposal Template |

**各結果ページの本文は `platform_setup/tally_readiness_quiz.md` の「6 Result Types — Full Copy」からコピーする。**

各結果ページのGumroadリンク挿入箇所：

```
{{GUMROAD_LINK}} → GumroadのURL（Phase 2で取得したURL）
```

**Phase 2完了後、Gumroad URLを取得してから結果ページに貼ること。**

### 3-7. 結果ページ後のCTA（全6ページ共通・結果本文の下に追加）

```
Ready to turn your best client doc into your first paid template?

The Starter Kit gives you 5 targeted tools to identify, clean up,
and list your first template on Gumroad — in under a week.

→ Get the Starter Kit for $19: [GumroadのURL]
```

### 3-8. 公開前チェックリスト

- [ ] フォームタイトル：入力済み
- [ ] ウェルカムテキスト：貼り付け済み
- [ ] 10問全て入力済み（順番正しいか確認）
- [ ] メールオプトイン：設置済み（結果の前）
- [ ] 6つの結果ページ：作成済み（条件分岐設定済み）
- [ ] 全結果ページのGumroadリンク：実URLに置換済み（{{GUMROAD_LINK}} が残っていない）

### 3-9. ユーザーの作業

☐ 上のチェックリストを確認して「Publish」ボタンを押す

### 3-10. URL取得（公開後）

```
TALLY_QUIZ_LINK = [ここに貼る]
例：https://tally.so/r/wxxxxxx
```

URLを貼ったら：「TallyのURLを貼りました：[URL]」と教えてください。
Claude Codeが全ファイルのプレースホルダーを一括置換します。

---

## Phase 4 — Brevo Input

### 4-1. リスト作成（Contacts → Lists → Create）

```
リスト名：Paid Templates - Main List
```

### 4-2. オートメーション作成（Email → Automations → Create a workflow）

```
ワークフロー名：Paid Templates 7-Day Sequence
トリガー：Contact added to list → "Paid Templates - Main List"
```

### 4-3. Day 0〜7 件名と入力内容

**各メールの本文は `platform_setup/brevo_7day_email_sequence.md` からコピーする。**
**コピー後、以下を置換してから貼り付けること：**
- `{{GUMROAD_LINK}}` → Gumroadの実URL
- `{{TALLY_QUIZ_LINK}}` → Tallyの実URL
- `{{SUPPORT_EMAIL}}` → 自分のメールアドレス

| Day | 送信タイミング | 件名 | プレビューテキスト |
|---|---|---|---|
| Day 0 | 即時 | Your template type is inside — here's where to start | Based on your quiz, here's which client doc to sell first |
| Day 1 | 24h後 | The client doc you keep recreating is worth money | You're not charging enough for what's sitting in your Google Drive |
| Day 2 | 48h後 | How to find your first sellable doc in 30 minutes | Look at your last 5 client projects — it's already there |
| Day 3 | 72h後 | 3 doc formats that sell — and which one you already have | Not all templates sell equally. Here's what buyers actually buy. |
| Day 4 | 96h後 | How to turn your client doc into a paid template (one afternoon) | AI does most of the work. Here's the exact process. |
| Day 5 | 120h後 | Where to sell your template (and what to charge) | Gumroad setup takes under 30 minutes. Here's the pricing guide. |
| Day 6 | 144h後 | You don't need 5,000 LinkedIn followers to sell your first template | Here's what actually works from a small audience |
| Day 7 | 168h後 | Last email — this is what it comes down to | You already have the document. You just haven't listed it yet. |

### 4-4. Day 4のTEMPLATE5コード（末尾に追加・控えめに）

Day 4メールの本文末尾のみ、以下を追加する：

```
(Use code TEMPLATE5 at checkout if you'd like $5 off — expires in 48 hours.)
```

### 4-5. 送信者メールアドレス

Brevoで確認済みのメールアドレスを使用する。
未確認の場合：Brevo → Senders → Add a new sender → 確認メールをクリック

### 4-6. TallyとBrevoの連携（2択）

**方法A（推奨）：Zapier無料枠**
1. Zapier → New Zap → Trigger: Tally → New Submission
2. Action: Brevo → Add Contact to List
3. Zap名：Tally to Brevo — Paid Templates

**方法B（手動・初期はこれでOK）：**
1. Tally → Submissions → Export CSV
2. Brevo → Contacts → Import → CSV選択
3. 週1回手動でインポートする

### 4-7. 有効化前チェックリスト

- [ ] リスト作成済み：Paid Templates - Main List
- [ ] ワークフロー作成済み：Paid Templates 7-Day Sequence
- [ ] Day 0〜7の全メール入力済み
- [ ] 全URLプレースホルダーが実URLに置換済み（{{}} が残っていない）
- [ ] Day 4のTEMPLATE5コードが末尾に追加済み
- [ ] 送信者メールアドレスが確認済み
- [ ] テスト送信でレイアウトが崩れていないか確認済み

### 4-8. ユーザーの作業

☐ 上のチェックリストを確認してワークフローを「Active」に切り替える

### 4-9. 完了確認

☐ Brevoのオートメーションが「Active」状態になっている
☐ テスト登録して Day 0 メールが届くか確認する

---

## Phase 5 — LinkedIn / Threads

### 5-1. LinkedIn プロフィール bio（ヘッドラインまたはAbout欄）

```
I help freelance copywriters and solo marketers turn their client docs
into paid templates on Gumroad.

Free 3-min quiz → [TallyのURL]
```

**[TallyのURL] をPhase 3で取得した実URLに置換してから設定する。**

### 5-2. Threads プロフィール bio

```
Freelance copywriters: your proposals and intake forms are worth selling.
Free quiz → [TallyのURL]
```

### 5-3. 最初の投稿（Post 08 — LinkedIn版）

```
What paid template is hidden inside your client docs?

I built a 3-minute quiz for freelance copywriters and solo marketers.

It looks at the specific documents you use with clients —
proposals, intake forms, messaging frameworks, SOPs, swipe files —
and tells you which one is worth selling first.

Not the one you think is most polished.
The one that scores highest on reusability, demand,
and how easy it is to remove the client-specific parts.

6 results:
→ Proposal Template
→ Client Intake Template
→ Messaging Framework Template
→ Sales Page Checklist
→ Swipe File Template
→ Onboarding SOP

Free. 3 minutes. No email required to start.

Take it here: [TallyのURL]

(Link in first comment)
```

**投稿後、最初のコメントにGumroadリンクを追加する：**

```
Quiz link: [TallyのURL]
Starter Kit ($19): [GumroadのURL]
```

### 5-4. Threads版（Post 08の短縮版・投稿本文にURLを含める）

```
What paid template is already inside your client docs?

Free 3-min quiz for freelance copywriters and solo marketers.

It tells you which of your existing documents — proposals, intake forms,
messaging frameworks — is worth selling first on Gumroad.

6 results. No email required to start.

→ [TallyのURL]
```

### 5-5. LinkedIn投稿のルール

- ハッシュタグは使わない（リーチが下がる）
- URLは投稿本文ではなく「最初のコメント」に貼る
- 投稿後1時間以内にコメント欄にリンクを追加する

### 5-6. 完了判定

- [ ] LinkedIn bio更新済み（Tallyリンク設置）
- [ ] Threads bio更新済み（Tallyリンク設置）
- [ ] Post 08 LinkedIn版を投稿済み
- [ ] 投稿のコメント欄にTallyリンク + Gumroadリンクを追加済み
- [ ] Threads版をクロスポスト済み

---

## Phase 6 — URL Collection

全URLが取得できたら、ここに記録する：

```
GUMROAD_LINK    = [ここに貼る]
TALLY_QUIZ_LINK = [ここに貼る]
SUPPORT_EMAIL   = [ここに貼る]
BREVO_FORM_LINK = [ここに貼る（Brevoサインアップフォームを作成した場合）]
```

URLを全て貼ったら：「URL回収完了です」と教えてください。
Claude Codeが以下を実行します：
1. 全ファイルの `{{GUMROAD_LINK}}` を一括置換
2. 全ファイルの `{{TALLY_QUIZ_LINK}}` を一括置換
3. 全ファイルの `{{SUPPORT_EMAIL}}` を一括置換
4. 置換後の確認コマンドを実行（プレースホルダー残存チェック）
5. コミット（変更ファイル一覧をユーザーに確認してから）

---

## Phase 7 — After Publish

### 7-1. プレースホルダー一括置換（Claude Codeが実行）

URLを受け取り次第、以下のコマンドを実行します：

```bash
# 例（ユーザーからURLを受け取った後にClaude Codeが実行）
GUMROAD_URL="https://yournamehere.gumroad.com/l/client-docs"
TALLY_URL="https://tally.so/r/wxxxxxx"
SUPPORT="your@email.com"

find /home/user/ai-net-business-sns-os -name "*.md" -o -name "*.sh" | \
  xargs grep -l "{{GUMROAD_LINK}}\|{{TALLY_QUIZ_LINK}}\|{{SUPPORT_EMAIL}}" | \
  while read f; do
    sed -i "s|{{GUMROAD_LINK}}|$GUMROAD_URL|g" "$f"
    sed -i "s|{{TALLY_QUIZ_LINK}}|$TALLY_URL|g" "$f"
    sed -i "s|{{SUPPORT_EMAIL}}|$SUPPORT|g" "$f"
  done

grep -r "{{" /home/user/ai-net-business-sns-os --include="*.md" | head -20
```

### 7-2. KPI記録

公開後、KPIを `operations/kpi_tracker.md` に記録する。
Claude Codeがファイルを更新します。

### 7-3. 24時間後チェック

24時間後に以下の指標をClaude Codeに報告する：

```
Gumroadページビュー：___
Tally診断回答数：___
Brevo登録数：___
LinkedIn投稿インプレッション：___
販売数：___
```

Claude Codeが次のアクションを作成します。

### 7-4. 48時間後チェック

48時間後に同じ指標を報告する。
Claude Codeが改善提案（投稿文修正、Gumroadページ改善）を作成します。

---

## 完了チェックリスト（全Phase）

- [ ] Phase 1: 全ページ開いた・ログイン済み
- [ ] Phase 2: Gumroad公開済み・URL取得済み
- [ ] Phase 3: Tally公開済み・URL取得済み
- [ ] Phase 4: Brevo Day 0〜7設定済み・有効化済み
- [ ] Phase 5: LinkedIn bio更新・Post 08投稿済み・Threads クロスポスト済み
- [ ] Phase 6: 全URL記録済み・Claude Codeに共有済み
- [ ] Phase 7: プレースホルダー一括置換完了・残存なし

**全チェック完了 → 公開完了。KPI監視フェーズへ。**
