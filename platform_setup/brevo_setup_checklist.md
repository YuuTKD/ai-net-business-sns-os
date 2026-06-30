# Brevo Setup Checklist

## Time needed: ~60 minutes

---

## Step 1: Create a Contact List

- [ ] Log in to Brevo → click **Contacts** → **Lists** → **Create a list**
- [ ] List name: `AI Digital Product Launch — Main List`
- [ ] Click **Create**
- [ ] Note: All Tally quiz submissions will go into this list

---

## Step 2: Create a Signup Form (optional — if not using Tally integration)

- [ ] Go to **Email** → **Subscription forms** → **New form**
- [ ] Form name: `AI Digital Product Quiz Signup`
- [ ] Add field: Email (required)
- [ ] Add field: First name (optional)
- [ ] Connect to list: `AI Digital Product Launch — Main List`
- [ ] Save and copy embed code (for later use on Carrd or Notion)

---

## Step 3: Set Up the 7-Day Automation (Email Sequence)

- [ ] Go to **Automations** → **Create a workflow**
- [ ] Workflow name: `7-Day AI Digital Product Sequence`
- [ ] Trigger: **Contact added to list** → select `AI Digital Product Launch — Main List`
- [ ] Click **Save trigger**

Now add each email as a step:

**Day 0 (send immediately):**
- [ ] Add step: **Send an email**
- [ ] Email name: `Day 0 — Welcome`
- [ ] Subject: copy from `brevo_7day_email_sequence.md` → Day 0 Subject
- [ ] Preview text: copy from Day 0 Preview text
- [ ] Body: copy from Day 0 Body
- [ ] Replace {{GUMROAD_LINK}}, {{TALLY_QUIZ_LINK}}, {{SUPPORT_EMAIL}} with real URLs

**Day 1 (send 1 day after Day 0):**
- [ ] Add step: **Wait** → 1 day
- [ ] Add step: **Send an email**
- [ ] Subject: Day 1 Subject
- [ ] Body: Day 1 Body
- [ ] Replace all placeholders

**Day 2 (send 1 day after Day 1):**
- [ ] Add step: **Wait** → 1 day
- [ ] Add step: **Send an email**
- [ ] Subject: Day 2 Subject / Body: Day 2 Body

**Day 3:**
- [ ] Wait → 1 day → Send Day 3 email

**Day 4:**
- [ ] Wait → 1 day → Send Day 4 email (LAUNCH5 coupon day)

**Day 5:**
- [ ] Wait → 1 day → Send Day 5 email

**Day 6:**
- [ ] Wait → 1 day → Send Day 6 email

**Day 7:**
- [ ] Wait → 1 day → Send Day 7 email (final reminder)

---

## Step 4: Sender Settings

- [ ] Go to **Settings** → **Senders & IP** → **Add a sender**
- [ ] Sender name: your name (e.g., "Yu" or "Yu Tokuda")
- [ ] From email: your email address
- [ ] Verify email (Brevo will send a confirmation)

---

## Step 5: Replace All Placeholders

Before activating the automation, find and replace:

| Placeholder | Replace with |
|---|---|
| {{GUMROAD_LINK}} | Your Gumroad product URL |
| {{TALLY_QUIZ_LINK}} | Your Tally quiz URL |
| {{SUPPORT_EMAIL}} | Your support email address |

---

## Step 6: Test the Sequence

- [ ] Click **Test** on each email
- [ ] Send a test to your own email
- [ ] Check: subject line, preview text, body formatting, links
- [ ] Confirm all links go to the correct pages

---

## Step 7: Connect Tally to Brevo

**Option A: Native integration (if available in your Tally plan)**
- Tally → Settings → Integrations → Brevo → Connect
- Map the email field to Brevo contact email
- Select list: `AI Digital Product Launch — Main List`

**Option B: Zapier (free plan)**
- Create Zap: Trigger = Tally form submission
- Action = Add/update Brevo contact → select list
- Map: Tally email field → Brevo email field

**Option C: Manual (temporary, before integration)**
- Download Tally responses as CSV weekly
- Import CSV to Brevo list manually

---

## Step 8: Activate the Automation

- [ ] Review all 7 emails one more time
- [ ] Click **Activate** on the workflow
- [ ] Submit a test entry on your Tally quiz with a real email
- [ ] Confirm Day 0 email arrives within 5 minutes

---

## Final Checklist Before Going Live

- [ ] List name is correct
- [ ] Automation is named and activated
- [ ] All 7 emails are in the sequence with correct wait times
- [ ] All placeholders replaced with real URLs
- [ ] Sender email is verified
- [ ] Test email received successfully
- [ ] Tally integration is working (test with real quiz submission)

---

## Sending Schedule Reference

| Email | Wait time | Send day |
|---|---|---|
| Day 0 | Immediately | Day 0 (signup day) |
| Day 1 | +1 day | Day 1 |
| Day 2 | +1 day | Day 2 |
| Day 3 | +1 day | Day 3 |
| Day 4 | +1 day | Day 4 |
| Day 5 | +1 day | Day 5 |
| Day 6 | +1 day | Day 6 |
| Day 7 | +1 day | Day 7 |
