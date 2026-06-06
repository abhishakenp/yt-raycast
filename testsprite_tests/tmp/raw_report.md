
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** ship-fast
- **Date:** 2026-06-06
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Create a new website generation session
- **Test Code:** [TC001_Create_a_new_website_generation_session.py](./TC001_Create_a_new_website_generation_session.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/7bc2f6e3-06bb-46f0-b778-22552efebee3/9bbe4b77-dc78-4fc3-865a-26573d90c8cb
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Show authentication prompt when anonymous quota is exhausted
- **Test Code:** [TC002_Show_authentication_prompt_when_anonymous_quota_is_exhausted.py](./TC002_Show_authentication_prompt_when_anonymous_quota_is_exhausted.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/7bc2f6e3-06bb-46f0-b778-22552efebee3/b7c8fbed-1cd9-420a-8ced-d0a4b0c8896b
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 View live generation progress on a session dashboard
- **Test Code:** [TC003_View_live_generation_progress_on_a_session_dashboard.py](./TC003_View_live_generation_progress_on_a_session_dashboard.py)
- **Test Error:** TEST BLOCKED

The session dashboard could not be inspected because the session page did not render — the page shows 'Session not found'.

Observations:
- The page displays the text 'Session not found' and no dashboard content is present.
- There are 0 interactive elements and no visible generation progress logs or preview area to verify.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/7bc2f6e3-06bb-46f0-b778-22552efebee3/fb11ced5-6d4f-4e0a-9749-13318f16775d
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 Start a Stripe checkout from the session export flow
- **Test Code:** [TC004_Start_a_Stripe_checkout_from_the_session_export_flow.py](./TC004_Start_a_Stripe_checkout_from_the_session_export_flow.py)
- **Test Error:** Result: Stripe checkout not found / cannot be started.

Summary of what was done and observed:
- Signed-in attempt made with example@gmail.com (credentials submitted) and a session was opened (/session/d77c948d0922).
- The 'Unlock ZIP exports' payment modal is present. Modal interactive elements: close [9251], Not now [9284], Continue [9287].
- Modal copy explicitly states: "Secure checkout with Razorpay — complete payment in the Razorpay window." No Stripe provider text or Stripe-specific iframe was observed.
- The payment-confirm button (index 9287) was clicked twice; neither click initiated an embedded Stripe checkout in the current tab or revealed a Stripe iframe. Multiple iframes are present on the page, but no Stripe checkout frame was produced by the clicks.

Conclusion:
- The application uses Razorpay for checkout, not Stripe. Because a Stripe checkout is not present in the UI, the requested action (start a Stripe checkout) cannot be performed. The test requirement to start Stripe checkout is therefore unfulfillable in this environment.

Observations:
- Payment modal copy: "Secure checkout with Razorpay — complete payment in the Razorpay window." (visible in browser_state)
- Payment modal remained after clicking Continue; no Stripe iframe detected.
- Continue button (index 9287) clicked twice without starting a Stripe checkout.

Result: Task finished — requested Stripe checkout was not available. Set success=false.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/7bc2f6e3-06bb-46f0-b778-22552efebee3/3ee87389-0fb4-421c-aa17-5511c269c8a0
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 Download the exported site when eligible
- **Test Code:** [TC005_Download_the_exported_site_when_eligible.py](./TC005_Download_the_exported_site_when_eligible.py)
- **Test Error:** TEST BLOCKED

The test could not be run — the UI requires valid credentials to sign in and the provided test credentials were rejected.

Observations:
- The login form shows 'Firebase: Error (auth/invalid-credential).' below the sign-in button.
- The page remains on the login dialog (no navigation to an authenticated session), so export functionality cannot be reached.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/7bc2f6e3-06bb-46f0-b778-22552efebee3/01d17eed-f38a-465a-b54e-79c9650f155c
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 See export targets and subscription status on a session
- **Test Code:** [TC006_See_export_targets_and_subscription_status_on_a_session.py](./TC006_See_export_targets_and_subscription_status_on_a_session.py)
- **Test Error:** TEST BLOCKED

The test could not be run because sign-in failed and no valid credentials are available to reach a signed-in session/dashboard.

Observations:
- The sign-in attempt returned an error shown on the page: "Firebase: Error (auth/invalid-credential)."
- The sign-in modal remained visible after submitting credentials, and no signed-in UI or session/dashboard page was reached.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/7bc2f6e3-06bb-46f0-b778-22552efebee3/8c0a820f-f7f4-4cfb-91b7-1a50ad81e420
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 Refine a site through chat from the session dashboard
- **Test Code:** [TC007_Refine_a_site_through_chat_from_the_session_dashboard.py](./TC007_Refine_a_site_through_chat_from_the_session_dashboard.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/7bc2f6e3-06bb-46f0-b778-22552efebee3/bafc4227-2cb5-4e85-868f-6e6b861b9268
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 Sign in with email from the top navigation
- **Test Code:** [TC008_Sign_in_with_email_from_the_top_navigation.py](./TC008_Sign_in_with_email_from_the_top_navigation.py)
- **Test Error:** TEST FAILURE

Email sign-in did not complete — the app returned an authentication error and the UI did not show a signed-in account.

Observations:
- The sign-in modal remained visible after submitting credentials and the top navigation still shows 'Sign in'.
- The page displayed the error message: "Firebase: Error (auth/invalid-credential)".
- One sign-in submission was performed with the provided credentials (example@gmail.com / password123).
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/7bc2f6e3-06bb-46f0-b778-22552efebee3/1f192a0d-5ee8-4430-8ff0-1828dcf5a2eb
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Edit preview text inline and save changes
- **Test Code:** [TC009_Edit_preview_text_inline_and_save_changes.py](./TC009_Edit_preview_text_inline_and_save_changes.py)
- **Test Error:** TEST BLOCKED

The feature could not be reached — the inline editing flow is blocked by a persistent Sanity Studio / Chat overlay and an unprovisioned CMS connection required by the session.

Observations:
- A Sanity Studio / Chat overlay is displayed over the live preview and remains after multiple attempts to dismiss it (clicked the preview iframe twice, clicked the chat/studio iframe, closed the provisioning modal, and scrolled the page).
- The live preview tab at http://localhost:3001 returned {"error":"Not found"}, so the external preview cannot be used to perform inline edits.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/7bc2f6e3-06bb-46f0-b778-22552efebee3/4333a31e-c9e1-4fba-9848-fd1ea78b9ac4
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Refresh the preview after generation updates
- **Test Code:** [TC010_Refresh_the_preview_after_generation_updates.py](./TC010_Refresh_the_preview_after_generation_updates.py)
- **Test Error:** TEST BLOCKED

The session preview feature could not be tested because the requested session page is missing.

Observations:
- The session page at /session/example-session displays the text 'Session not found'.
- No preview area or refresh/regenerate controls are present on the page.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/7bc2f6e3-06bb-46f0-b778-22552efebee3/8bf9f9d1-de62-4b12-9e74-beb46cae23bc
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 Edit preview styles and save changes
- **Test Code:** [TC011_Edit_preview_styles_and_save_changes.py](./TC011_Edit_preview_styles_and_save_changes.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/7bc2f6e3-06bb-46f0-b778-22552efebee3/34b142e5-26cc-4fb9-b59c-0e5e1215e1a0
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Sign out from the account menu
- **Test Code:** [TC012_Sign_out_from_the_account_menu.py](./TC012_Sign_out_from_the_account_menu.py)
- **Test Error:** TEST BLOCKED

The sign-out flow could not be tested because authentication could not complete — the app failed to sign in due to a Firebase network error.

Observations:
- The sign-in modal remains visible after submitting credentials and shows the error: 'Firebase: Error (auth/network-request-failed).'
- No account/avatar or account menu appeared on the homepage after the attempted sign-in, so there is no signed-in session to sign out from.

Because the prerequisite (successful sign-in) was blocked by a network/auth error surfaced in the UI, the sign-out functionality could not be exercised.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/7bc2f6e3-06bb-46f0-b778-22552efebee3/dc3d3358-f5e6-45da-a2c2-db89832d96fa
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Restore an earlier preview version
- **Test Code:** [TC013_Restore_an_earlier_preview_version.py](./TC013_Restore_an_earlier_preview_version.py)
- **Test Error:** TEST FAILURE

The preview-edit + history-restore feature is not available — the application does not expose inline preview editing or a restore/history UI reachable from the preview or the Ship Fast builder page.

Observations:
- The preview page /preview/d77c948d0922 showed no editable elements after two searches and the session's live preview iframe had previously failed to load.
- The Ship Fast builder page was inspected; a prompt textarea inside a shadow DOM was present but no controls or links labeled 'history', 'restore', 'revisions', or 'edit' were found.
- No UI for viewing or restoring previous versions was discovered on either the preview or the Ship Fast pages.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/7bc2f6e3-06bb-46f0-b778-22552efebee3/769676ca-6c22-4dcd-91e6-f48891edd8ef
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 Toggle the session preview size
- **Test Code:** [TC014_Toggle_the_session_preview_size.py](./TC014_Toggle_the_session_preview_size.py)
- **Test Error:** TEST BLOCKED

The session dashboard could not be reached — the page displays 'Session not found' and no preview controls are available.

Observations:
- Navigated to /session/example-session and the page shows the plain text 'Session not found'.
- The page contains 0 interactive elements; no preview size toggle controls were present to interact with.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/7bc2f6e3-06bb-46f0-b778-22552efebee3/ff255371-ad1f-434b-a151-27864cc3c83d
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015 Update CMS site settings and save them
- **Test Code:** [TC015_Update_CMS_site_settings_and_save_them.py](./TC015_Update_CMS_site_settings_and_save_them.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/7bc2f6e3-06bb-46f0-b778-22552efebee3/8ebb7a05-29fe-45b5-b8ac-a091c5d7d26d
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **33.33** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---