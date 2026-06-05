# Dogfood Report — Authentication Flow (v2)

**Target URL:** http://localhost:7420/
**Session:** df-auth (agent-browser 0.25.3, viewport 1280×800, reduced-motion)
**Date:** 2026-06-05
**Scope:** Authentication only
**Credentials:** liviogama@gmail.com / liviogama

> Supersedes `report-auth.md` (whose "navigation broken / no login UI" findings were
> agent-browser tooling artifacts, since fixed). The homepage `/` DOES contain the full
> auth UI (`#signin-btn`, `#auth-overlay`, Google/GitHub/email sign-in).

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 2 |
| Medium   | 1 |
| Low      | 2 |
| **Total**| **5** |

## Issues

### ISSUE-001: Enter key does NOT submit the login form (High)
- **Type:** Interactive / broken feature (contradicts claimed recent change "submit on Enter")
- **Repro Video:** N/A (verified via DOM state)
- **Description:** Pressing Enter in `#auth-password` OR `#auth-email` does nothing — no validation, no Firebase call, modal stays open. Root cause: the auth inputs are NOT wrapped in a `<form>` element (`#auth-overlay` contains 0 forms; `hasForm:false`), so there is no native submit-on-Enter.
- **Repro Steps:** open `/` → click `#signin-btn` → fill `#auth-email`=liviogama@gmail.com, `#auth-password`=liviogama → focus a field → press Enter → overlay still `display:flex`, not signed in. Clicking `#email-signin-btn` then immediately signs in — proving creds/logic are fine and only Enter is broken.
- **Evidence:** screenshots-auth-v2/11-enter-no-submit.png (verified twice)
- **Expected:** Enter submits. **Actual:** Enter is a no-op; only the button click submits.

### ISSUE-002: No way to close the auth modal from the UI (High)
- **Type:** Interactive / UX trap
- **Repro Video:** N/A
- **Description:** Once the auth modal opens there is no close affordance. Esc does NOT close it; click-outside is disabled (intended); and there is NO X/close/cancel button in `#auth-overlay` (0 close candidates). A user who opens sign-in by mistake is stuck and must reload the page.
- **Repro Steps:** open `/` → `#signin-btn` → press Escape (overlay stays `flex`) → click backdrop at (100,400) (overlay stays `flex`) → no close control exists.
- **Evidence:** screenshots-auth-v2/02-modal-open.png, 03-modal-after-clickoutside.png
- **Expected:** an X button and/or Esc to dismiss. **Actual:** no dismissal path without page reload.

### ISSUE-003: Raw Firebase error strings leaked to users (Medium)
- **Type:** UX / error handling
- **Repro Video:** N/A
- **Description:** Auth failures display the raw SDK error in `#auth-error`, e.g. `Firebase: Error (auth/invalid-email).` and `Firebase: Error (auth/invalid-credential).`, instead of friendly copy. Also exposes the backend tech (Firebase).
- **Repro Steps:** bad email format → `Firebase: Error (auth/invalid-email).`; wrong password → `Firebase: Error (auth/invalid-credential).` (empty-field case IS handled nicely: "Email and password required").
- **Evidence:** screenshots-auth-v2/04-bad-email.png, 05-wrong-password.png
- **Expected:** user-friendly messages (e.g. "Incorrect email or password"). **Actual:** raw Firebase error codes.

### ISSUE-004: Login inputs lack labels / accessible names (Low)
- **Type:** Accessibility (contradicts claimed "proper form semantics")
- **Repro Video:** N/A
- **Description:** `#auth-email` and `#auth-password` have placeholders only — no `<label>` in the modal (0 labels), no `aria-label`/`aria-labelledby`. The modal container has no `role="dialog"`. (`type`/`autocomplete` ARE correct: email / current-password.)
- **Evidence:** screenshots-auth-v2/02-modal-open.png
- **Expected:** associated labels + dialog role. **Actual:** placeholder-only inputs, no dialog semantics.

### ISSUE-005: Signed-in state shows no account identity (Low)
- **Type:** Cosmetic / UX
- **Repro Video:** N/A
- **Description:** After sign-in the header swaps `Sign in` → `Sign out` only; no user email/name/avatar or account menu, so a user can't confirm WHICH account is active.
- **Evidence:** screenshots-auth-v2/06-signed-in.png

## What works (happy path verified)
- Modal opens on `#signin-btn`; backdrop transparent (`rgba(0,0,0,0)`) + `backdrop-filter: blur(8px)` — recent change confirmed. Click-outside-to-close disabled — confirmed.
- Empty submit → friendly "Email and password required".
- Email/password sign-in via button: succeeds, clears error, closes overlay, swaps header to Sign out, stays on `/`. (06-signed-in.png)
- Sign-out returns to signed-out state. (07-signed-out.png)
- Google OAuth: full-page redirect to accounts.google.com (Firebase client_id, `ship-fast-saas.firebaseapp.com` redirect_uri). (08)
- GitHub OAuth: redirect to github.com/login, scope `user:email,repo`. (09) — *note: `repo` scope is broad for mere auth.*
- Generating while signed-out did not open auth modal nor block — anonymous generation allowed (observation).
- No JS console errors at any point.

## Verdict
Auth works end-to-end via button click (email/pw sign-in, sign-out, OAuth redirects all functional), BUT two claimed recent changes are NOT actually true: Enter-to-submit is broken (no `<form>` element) and "proper form semantics" are missing (no labels/form/dialog role). Also no UI path to close the modal once opened.
