# Tally Build Guide — Freelance Client Pipeline Kit

更新: 2026-07-01
目的: $29 Kit購入者を診断→CTA→購入に誘導するTallyクイズ

---

## フォーム基本情報

| 項目 | 内容 |
|---|---|
| Form Title | What's Blocking Your Freelance Pipeline? |
| Description | Answer 6 quick questions to find out what's stopping clients from saying yes. |
| Welcome text | "Takes 2 minutes. No email required to see your result." |
| Button text | Start the Quiz |

---

## 6問の設問（コピペ用）

### Q1（必須）
**Type:** Multiple Choice
**Question:** How long have you been freelancing?

A. Less than 1 year
B. 1–3 years
C. 3–5 years
D. 5+ years

---

### Q2（最重要・結果分岐）
**Type:** Multiple Choice
**Question:** What's the biggest challenge in getting new clients right now?

A. I don't know how to reach out without feeling pushy
B. Prospects show interest but then disappear
C. I get on calls, but they don't convert to projects
D. I get projects, but clients don't come back or refer me

---

### Q3
**Type:** Multiple Choice
**Question:** How often do you send outreach messages to potential clients?

A. I rarely or never send outreach
B. A few times a month, inconsistently
C. Weekly, with mixed results
D. I have a system and send consistently

---

### Q4
**Type:** Multiple Choice
**Question:** What usually happens after you send a proposal?

A. I don't send formal proposals — I just give a price verbally
B. Most prospects go silent and I don't follow up
C. I follow up once or twice, then let it go
D. I have a follow-up process that usually gets a response

---

### Q5
**Type:** Multiple Choice
**Question:** When a client says "I need to think about it," what do you do?

A. Wait and hope they get back to me
B. Follow up once, then move on
C. I have specific scripts for handling this — I use them consistently
D. I freeze up and don't know what to say

---

### Q6（オプトイン）
**Type:** Email input
**Question:** Get your full result + a free resource by email:

Label: Your email (optional)
Required: No

Tally→Brevo連携: Brevoのリストに自動追加される（Zapierまたは手動CSV）

---

## 4つの結果タイプ

### Result 1: Visibility Problem
**Trigger:** Q2 = A

**Title:** Your Pipeline Problem: Not Enough Outreach

**Body:**
You're not reaching enough potential clients — and when you do reach out, it doesn't feel right.

The good news: this is the easiest problem to fix.

The Freelance Client Pipeline Kit includes 5 outreach templates designed to feel natural, not pushy. They're specific. They lead with something about the client, not about you.

Most freelancers who use them see responses within the first 10 sends.

**CTA Button:** Get the Kit ($29) → [GUMROAD_KIT_LINK]
**Secondary:** Learn more → [GUMROAD_KIT_LINK]

---

### Result 2: Conversion Problem
**Trigger:** Q2 = B or Q4 = B

**Title:** Your Pipeline Problem: Proposals That Don't Close

**Body:**
You're getting interest, but prospects are going quiet.

This is usually one of two things: your proposal isn't creating urgency, or you're not following up correctly.

The kit includes a one-page proposal template that gets decisions, and a 3-email follow-up sequence that turns silence into either a yes or a clear no.

**CTA Button:** Get the Kit ($29) → [GUMROAD_KIT_LINK]

---

### Result 3: Call Conversion Problem
**Trigger:** Q2 = C or Q5 = A or D

**Title:** Your Pipeline Problem: Discovery Calls That Don't Convert

**Body:**
Clients are getting on calls with you — but they're not signing.

This usually means the call structure isn't surfacing what the client really needs, or you're pitching before you've built enough trust.

The kit includes a 12-question discovery call framework that helps you understand the client's situation before you say anything about what you can do.

**CTA Button:** Get the Kit ($29) → [GUMROAD_KIT_LINK]

---

### Result 4: Follow-Through Problem
**Trigger:** Q2 = D

**Title:** Your Pipeline Problem: Retention and Referrals

**Body:**
You're getting clients — but not consistently, and not from referrals.

The Freelance Client Pipeline Kit focuses on the front end of your pipeline: outreach, discovery, proposals, and follow-up. If you already have those systems, you may need to focus on what happens after the project closes.

But if any part of your pipeline still feels improvised, the kit can help you systematize it.

**CTA Button:** Get the Kit ($29) → [GUMROAD_KIT_LINK]
**Note:** [Optional — mention this is for front-end pipeline, not retention]

---

## Tally作成手順（ユーザー向け）

1. tally.so にログイン
2. New Form → Blank
3. Title: What's Blocking Your Freelance Pipeline?
4. Q1〜Q6を上記の通り追加
5. 各Qをこの順番で追加: Multiple Choice × 5 → Email × 1
6. Result pageを4つ作成（Conditional logic: Q2の選択肢で分岐）
7. 各ResultにCTA Button追加（URL: [Gumroad Kit URL — 公開後に設定]）
8. Publish
9. URLをClaude Codeに共有

---

## Tally公開後URL記録欄

```
NEW_TALLY_KIT_URL = [ここに貼る]
```

公開後: `operations/current_master_status.md` を更新し、LinkedIn投稿文のCTAを差し替える

---

## Brevo連携

**方法A（推奨・無料）:** ZapierでTally→Brevo連携
- Tally Q6のメールをBrevoリストに自動追加
- Trigger: New form submission
- Action: Add subscriber to list

**方法B（手動）:** 週1でTallyから回答CSVをダウンロードしてBrevoに手動インポート
- Tally: Submissions → Export CSV
- Brevo: Contacts → Import → CSV

---

## 参照先

Gumroad素材: `operations/client_acquisition_kit_publish_ready.md`
LinkedIn投稿文: `content/client_acquisition_kit_linkedin_launch_post.md`
