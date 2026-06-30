# URL Placeholder Replacement Map

## Purpose

Replace every placeholder with your real URL before going live.
Do this in one session, in the order listed below.

---

## The 6 Placeholders

| Placeholder | What it is | When you get it | Replace in which files |
|---|---|---|---|
| {{GUMROAD_LINK}} | Your Gumroad product page URL | After publishing your Gumroad product (Day 4) | All files listed below |
| {{TALLY_QUIZ_LINK}} | Your Tally quiz public URL | After publishing your Tally quiz (Day 2) | All files listed below |
| {{SUPPORT_EMAIL}} | Your email address for buyer support | You already have this | All files listed below |
| {{BREVO_FORM_LINK}} | Your Brevo email signup form URL | After setting up Brevo form (Day 3) | LinkedIn bio, Threads bio, posts |
| {{LINKEDIN_PROFILE_LINK}} | Your LinkedIn profile URL | You already have this | README, today_user_tasks |
| {{THREADS_PROFILE_LINK}} | Your Threads profile URL | You already have this | README, today_user_tasks |

---

## Files to Replace — By Placeholder

### {{GUMROAD_LINK}}

Replace in:
- `dist/gumroad_upload_package/README_START_HERE.md`
- `dist/gumroad_upload_package/Seven_Day_Launch_Email_and_Post_Pack.md`
- `platform_setup/brevo_7day_email_sequence.md`
- `platform_setup/gumroad_launch_kit_listing.md`
- `platform_setup/gumroad_post_purchase_message.md`
- `platform_setup/gumroad_setup_checklist.md`
- `operations/go_live_copy_paste_guide.md`
- `operations/today_user_tasks_after_registration.md`
- `content/global_x_threads_launch_posts_20.md`
- `docs/05_next_actions.md`
- `docs/38_120_point_prelaunch_offer_upgrade.md`

**Source:** Gumroad → Products → [your product] → Share button → Copy link

---

### {{TALLY_QUIZ_LINK}}

Replace in:
- `dist/gumroad_upload_package/Seven_Day_Launch_Email_and_Post_Pack.md`
- `platform_setup/brevo_7day_email_sequence.md`
- `platform_setup/tally_readiness_quiz.md`
- `platform_setup/tally_setup_checklist.md`
- `operations/go_live_copy_paste_guide.md`
- `operations/today_user_tasks_after_registration.md`
- `content/global_x_threads_launch_posts_20.md`
- `docs/05_next_actions.md`

**Source:** Tally → [your quiz] → Share → Copy link

---

### {{SUPPORT_EMAIL}}

Replace in:
- `dist/gumroad_upload_package/README_START_HERE.md`
- `dist/gumroad_upload_package/Sell_the_Client_Docs_You_Already_Use.md`
- `dist/gumroad_upload_package/Gumroad_Sales_Page_Template.md`
- `dist/gumroad_upload_package/LICENSE_AND_USAGE.md`
- `platform_setup/brevo_7day_email_sequence.md`
- `platform_setup/gumroad_launch_kit_listing.md`
- `platform_setup/gumroad_post_purchase_message.md`
- `operations/go_live_copy_paste_guide.md`

**Source:** Your own email address. Use a dedicated support email if possible (e.g. support@yourdomain.com or a Gmail alias).

---

### {{BREVO_FORM_LINK}}

Replace in:
- `platform_setup/brevo_setup_checklist.md`
- `operations/today_user_tasks_after_registration.md`
- `operations/go_live_copy_paste_guide.md`

**Source:** Brevo → Forms → [your signup form] → Share → Copy embed link or standalone URL

---

### {{LINKEDIN_PROFILE_LINK}}

Replace in:
- `operations/today_user_tasks_after_registration.md`
- `docs/05_next_actions.md`

**Source:** Your LinkedIn profile → Copy profile URL from the browser address bar

---

### {{THREADS_PROFILE_LINK}}

Replace in:
- `operations/today_user_tasks_after_registration.md`
- `docs/05_next_actions.md`

**Source:** Your Threads profile → share → copy link

---

## Replacement Order (Do This in Order)

**Before setup:**
1. Replace {{SUPPORT_EMAIL}} everywhere first — you already know this.

**Day 2:**
2. Publish your Tally quiz → replace {{TALLY_QUIZ_LINK}} everywhere.

**Day 3:**
3. Create your Brevo signup form → replace {{BREVO_FORM_LINK}} everywhere.

**Day 4:**
4. Publish your Gumroad product → replace {{GUMROAD_LINK}} everywhere.

**Day 5 (before first post):**
5. Confirm {{LINKEDIN_PROFILE_LINK}} and {{THREADS_PROFILE_LINK}} are in your bios.

---

## How to Verify — No Placeholders Remain

After replacing all URLs, run this check:

**Search for remaining placeholders (Terminal):**
```bash
grep -r "{{" dist/ platform_setup/ operations/ content/ docs/
```

If this returns no results: all placeholders are replaced. You're ready to publish.

If it returns results: open each file listed and replace the remaining placeholder.

---

## Quick Reference Card (Copy and Fill In)

```
GUMROAD_LINK:     https://[your-username].gumroad.com/l/[product-slug]
TALLY_QUIZ_LINK:  https://tally.so/r/[your-form-id]
SUPPORT_EMAIL:    [your@email.com]
BREVO_FORM_LINK:  https://[your-form-url]
LINKEDIN_PROFILE: https://linkedin.com/in/[your-handle]
THREADS_PROFILE:  https://threads.net/@[your-handle]
```
