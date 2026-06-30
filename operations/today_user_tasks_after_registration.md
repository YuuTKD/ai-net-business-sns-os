# Today's 3 Tasks (After Gumroad / Brevo / Tally Registration)

You've registered all 3 services. Great.

Now your only job is to set up each one so the funnel is live.
Here are the 3 tasks for today — in order. Do them one at a time.

The full go-live guide is at: `operations/go_live_copy_paste_guide.md`

---

## TASK 1: Set Up Gumroad Product Page

**Estimated time:** 30–45 minutes

**What you're doing:**
Creating and publishing the product listing for
Sell the Client Docs You Already Use ($19).

**Where to find the copy:**
`platform_setup/gumroad_launch_kit_listing.md`

**Step-by-step:**

1. Log in to Gumroad
2. Click **New Product** → select **Digital Product**
3. Product name: `Sell the Client Docs You Already Use`
4. Open `gumroad_launch_kit_listing.md` Section 2 → copy the short description → paste
5. Open Section 3 → copy the full description → paste into Gumroad Description field
6. Set price to **$19**
7. For now, upload a placeholder PDF (even a 1-page "Coming soon" is fine)
   — you'll replace this with the final product PDF after review
8. Cover image: create in Canva using the text from Section 4 of the listing file
9. Post-purchase message: copy from `platform_setup/gumroad_post_purchase_message.md`
   and replace {{SUPPORT_EMAIL}} with your email
10. Create discount code: **TEMPLATE5** → $5 off → active (for email use only)
11. Add tags from Section 5 of the listing file
12. Set to **Public** and click **Publish**
13. Copy your product URL — save it somewhere you can find it

**Completion check:**
- [ ] Product is live and visible to the public
- [ ] Title shows: Sell the Client Docs You Already Use
- [ ] Price shows $19
- [ ] Description looks clean
- [ ] Post-purchase message is set
- [ ] TEMPLATE5 discount code is active
- [ ] Product URL is copied and saved

---

## TASK 2: Set Up Tally Quiz

**Estimated time:** 45–60 minutes

**What you're doing:**
Creating and publishing the quiz
"What Paid Template Is Hidden Inside Your Client Docs?"
that captures emails and leads people toward your Gumroad product.

**Where to find the copy:**
`platform_setup/tally_readiness_quiz.md`

**Step-by-step:**

1. Log in to Tally
2. Click **New form** → Start from scratch
3. Title: `What Paid Template Is Hidden Inside Your Client Docs?`
4. Add welcome text block (from tally_readiness_quiz.md → Welcome Text)
5. Add 10 multiple choice questions (copy from Questions section)
   — make all questions required
6. Add Email field with opt-in copy (from Email Opt-in Copy section)
7. Set up result pages using Q2 as the main condition:
   - Q2 = A → Proposal Template
   - Q2 = B → Client Intake Template
   - Q2 = C → Messaging Framework Template
   - Q2 = D → Sales Page Checklist
   - Q2 = E → Onboarding SOP
   - Default → Proposal Template
   (Copy result copy for each type — replace {{GUMROAD_LINK}} with your real URL)
8. Click **Publish**
9. Copy the Tally quiz URL — save it

**Completion check:**
- [ ] Quiz is published and accessible via URL
- [ ] All 10 questions are in the correct order
- [ ] Email field appears before results
- [ ] 6 result pages are set up with your real Gumroad link
- [ ] Quiz URL is copied and saved

**Note on integration:**
For today, you don't need to connect Tally to Brevo automatically.
Collect emails manually:
- Tally → Responses → Export CSV → import into Brevo list weekly
- Set up Zapier automation later if needed

---

## TASK 3: Set Up Brevo Day 0 Email

**Estimated time:** 30–45 minutes

**What you're doing:**
Setting up the welcome email that goes out as soon as someone joins your list.
The full 7-email automation can be completed tomorrow or this weekend.
Today: just get Day 0 live.

**Where to find the copy:**
`platform_setup/brevo_7day_email_sequence.md` → DAY 0 section

**Step-by-step:**

1. Log in to Brevo
2. Go to **Contacts** → **Lists** → **Create a list**
   List name: `Client Docs Templates — Main List`
3. Go to **Email** → **Campaigns** → **Automations** → **Create a workflow**
   Workflow name: `7-Day Sell the Client Docs Sequence`
4. Trigger: Contact added to list → select the list you just created
5. Add first step: **Send an email**
6. Email name: `Day 0 — Welcome`
7. Subject: `Your template type is inside — here's where to start`
8. Body: copy Day 0 email body → replace all placeholders:
   - {{GUMROAD_LINK}} → your Gumroad URL
   - {{TALLY_QUIZ_LINK}} → your Tally quiz URL
   - {{SUPPORT_EMAIL}} → your email address
9. Verify your sender email address (Brevo will send a verification email)
10. Activate the workflow (you can add Days 1–7 tomorrow)

**Completion check:**
- [ ] Brevo list is created
- [ ] Day 0 email is written and saved in the automation
- [ ] All placeholders replaced with real URLs
- [ ] Sender email is verified
- [ ] Automation is active

---

## After You Complete All 3 Tasks

**Do this immediately:**

1. Copy your Tally quiz URL
2. Add it to your LinkedIn bio and your Threads bio
3. Post your first social post on LinkedIn
   (choose Post 08 from `content/global_x_threads_launch_posts_20.md` — it's the quiz announcement)
   Replace {{TALLY_QUIZ_LINK}} with your real URL before posting

**Your funnel is now live.**

Someone can:
→ See your post on LinkedIn or Threads
→ Click the Tally quiz link in your bio
→ Complete the quiz (3 minutes)
→ Enter their email to see their result
→ Join your Brevo email list
→ Receive Day 0 welcome email immediately
→ Land on a result page that links to your $19 Gumroad product

That's the whole funnel. Live. For $0.

---

## What to Do Tomorrow

1. Finish setting up Brevo Days 1–7 (use `platform_setup/brevo_setup_checklist.md`)
2. Post your Day 2 LinkedIn post (Post 01 from the content file)
3. Upload the real product PDF to Gumroad

---

## If You Get Stuck

For Gumroad: check their help docs or reply to any Gumroad onboarding email.
For Brevo: their in-app onboarding is detailed — follow the prompts.
For Tally: Tally has in-app guides for each block type.

Or: note your question and bring it to the next Claude Code session.
