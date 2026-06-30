# Tally Setup Checklist

## Time needed: ~60 minutes

---

## Step 1: Create a New Form

- [ ] Log in to Tally → click **New form**
- [ ] Form title: `AI Digital Product Readiness Quiz`
- [ ] Choose template: **Start from scratch**

---

## Step 2: Add Welcome Text

- [ ] Click **+** to add block → select **Text**
- [ ] Copy and paste the welcome message from:
  `platform_setup/tally_readiness_quiz.md` → Welcome Text section
- [ ] Format: bold the key phrases

---

## Step 3: Add All 10 Questions

For each question:
- [ ] Click **+** → select **Multiple Choice**
- [ ] Copy question text from `tally_readiness_quiz.md`
- [ ] Add all answer choices
- [ ] Set as **Required**
- [ ] Repeat for all 10 questions

Question summary:
1. Current situation (5 choices)
2. What people ask for help with (5 choices)
3. Content creation comfort level (4 choices)
4. Priority outcome (4 choices)
5. Time available per week (4 choices)
6. Natural product type (5 choices) ← **KEY QUESTION for result logic**
7. Online income history (4 choices)
8. Self-description (4 choices)
9. AI tool experience (4 choices)
10. Biggest fear (5 choices)

---

## Step 4: Add Email Opt-in

- [ ] Click **+** → select **Email** field
- [ ] Label: `Email address`
- [ ] Required: Yes
- [ ] Add heading block above it with opt-in copy from:
  `platform_setup/tally_readiness_quiz.md` → Email Opt-in Copy section

---

## Step 5: Set Up Result Pages (Thank You pages)

Tally allows conditional endings based on answers.
Use Q6 (product type question) as the main condition.

For each result type:

**Result A — Template Creator (Q6 = A)**
- [ ] Add conditional Thank You page
- [ ] Condition: Q6 answer = "A ready-to-use template, checklist, or spreadsheet"
- [ ] Copy headline and result copy from `tally_readiness_quiz.md` → Result Type 1
- [ ] Replace {{GUMROAD_LINK}} with your actual Gumroad URL
- [ ] Add CTA button: "Get the Kit for $19 →" linking to Gumroad

**Result B — Mini-Course Creator (Q6 = B)**
- [ ] Add conditional Thank You page
- [ ] Condition: Q6 = "A step-by-step guide, ebook, or mini-course"
- [ ] Copy Result Type 2 content

**Result C — Affiliate Funnel Builder (Q6 = C)**
- [ ] Add conditional Thank You page
- [ ] Condition: Q6 = "Recommending and explaining tools and resources"
- [ ] Copy Result Type 3 content

**Result D — Coaching / Consulting Offer (Q6 = D)**
- [ ] Add conditional Thank You page
- [ ] Condition: Q6 = "A coaching program or consulting package"
- [ ] Copy Result Type 5 content

**Result E — Automation Kit Builder (Q6 = E)**
- [ ] Add conditional Thank You page
- [ ] Condition: Q6 = "A system, workflow, or automation kit"
- [ ] Copy Result Type 6 content

**Default result — Content-to-Product Creator**
- [ ] Add default Thank You page (shown when no condition matches)
- [ ] Copy Result Type 4 content

---

## Step 6: Brevo Integration (or temporary workaround)

**If using Zapier (recommended for free plan):**
- [ ] Go to Tally → Settings → Integrations → Zapier
- [ ] Create Zap:
  - Trigger: Tally — New Submission
  - Action: Brevo — Create/Update Contact
  - Map: Email → Email, Name → First name
  - List: AI Digital Product Launch — Main List

**If integration not set up yet (temporary workaround):**
- [ ] Export Tally responses weekly: Tally → Responses → Export CSV
- [ ] Import CSV to Brevo: Contacts → Import → Upload CSV
- [ ] This keeps the funnel working without automation

---

## Step 7: Publish the Quiz

- [ ] Click **Publish** (top right)
- [ ] Copy the Tally quiz URL
- [ ] Save it — you need this for:
  - X / Threads bio link
  - Brevo email sequence (replace {{TALLY_QUIZ_LINK}})
  - Social posts CTA
  - Beacons profile page

---

## Step 8: Test the Quiz

- [ ] Open quiz in incognito window
- [ ] Complete all 10 questions
- [ ] Enter a real email address
- [ ] Submit
- [ ] Verify: correct result page is shown
- [ ] Verify: Gumroad link in result page is correct
- [ ] Verify: email arrives in Brevo (if integration is set up)

---

## Final Checklist Before Sharing

- [ ] All 10 questions are present and required
- [ ] All 6 result pages are set up with correct content
- [ ] {{GUMROAD_LINK}} replaced in all result pages
- [ ] Email field is present and required
- [ ] Quiz URL is copied and saved
- [ ] Test submission completed successfully
- [ ] Result page looks clean on mobile (Tally is mobile-friendly by default)

---

## Where to Put the Quiz URL

- [ ] X (Twitter) bio link field
- [ ] Threads bio link field
- [ ] Instagram bio link (via Beacons or Linktree)
- [ ] All social posts CTA
- [ ] Brevo Day 0 and Day 6 email
- [ ] Gumroad profile page bio
