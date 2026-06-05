# Dogfood Report: Ship-Fast Auth & Generation Flow

**Target URL:** http://localhost:7420/
**Session Name:** ship-fast-auth-gen
**Date:** 2026-06-05
**Scope:** Authentication flow, website generation, and post-generation features
**Verification:** agent-browser (real browser clicks)

## Summary

| Severity | Open | Fixed |
|----------|------|-------|
| Critical | 0 | 0 |
| High     | 0 | 0 |
| Medium   | 0 | 0 |
| Low      | 0 | 0 |
| **Total**| **0** | **0** |

## Issues

### ISSUE-001: Homepage Generation Interface Inaccessible (High)
**Status:** Found during exploration

**Description:** The root path `/` serves a gallery of generated websites instead of the expected homepage with the prompt form and authentication UI. The server code indicates that `GET /` should call `renderHomePage(siteSettings)` which includes `renderAuthOverlay()` and `renderTopActions()` with a sign-in button, but the actual rendered page shows only the gallery grid.

**Impact:** Users cannot access the main generation interface or authentication flow from the root URL. The `/dashboard.html` route exists but doesn't function properly without a session ID, and the generate button is non-responsive.

**Evidence:**
- Screenshot: `/dogfood-output/screenshots/auth-gen-gallery-top.png` - Shows gallery grid at root path
- Screenshot: `/dogfood-output/screenshots/auth-gen-dashboard.png` - Shows dashboard with prompt input but non-functional generate button
- Server code indicates `renderHomePage()` should include auth UI and prompt form
- Dashboard code expects session ID from URL path: `const SESSION_ID = location.pathname.split('/session/')[1]`

**Expected Behavior:** Root path should show the homepage with:
- Prompt input form for describing websites
- Sign in button (id="signin-btn")
- Auth overlay (id="auth-overlay")
- Top actions bar with pricing link

**Actual Behavior:** Root path shows gallery grid with generated websites only.

**Repro Steps:**
1. Navigate to http://localhost:7420/
2. Observe gallery grid of generated websites
3. No prompt form or sign-in button visible
4. No way to access generation interface from root path

**Repro Video:** N/A (static issue)

### ISSUE-002: Dashboard Generate Button Non-Responsive (High)
**Status:** Found during exploration

**Description:** The generate button on `/dashboard.html` does not trigger any visible generation process. The prompt input can be filled, but clicking the "GENERATE" button produces no UI changes, no loading state, no error messages, and no console errors.

**Impact:** Users cannot generate websites from the dashboard interface. Combined with ISSUE-001, this means there is no functional way to generate new websites in the current application state.

**Evidence:**
- Screenshot: `/dogfood-output/screenshots/auth-gen-dashboard-after-generate.png` - Shows prompt filled but no generation started
- Console shows only WebSocket warnings, no JavaScript errors
- No loading indicators, progress bars, or task list updates appear
- Dashboard code expects session ID: `const SESSION_ID = location.pathname.split('/session/')[1]`

**Expected Behavior:** Clicking generate should:
1. Show loading state or progress indicator
2. Create a new generation session
3. Display task list with generation steps
4. Update preview iframe with generated content

**Actual Behavior:** Clicking generate produces no visible response. The prompt text remains in the input field with no UI changes.

**Repro Steps:**
1. Navigate to http://localhost:7420/dashboard.html
2. Fill in the prompt input: "Describe your next website..."
3. Click the "GENERATE" button
4. Observe no UI changes, no loading state, no error messages
5. Wait 5+ seconds - still no response

**Repro Video:** N/A (static issue - no visible response to button click)

## Test Scope Limitations

Due to the two critical issues identified above, the following areas could not be tested:

- **Authentication Flow**: Cannot access sign-in button or auth overlay because the homepage with auth UI is not visible
- **Website Generation**: Cannot test generation flow because neither the homepage prompt form nor dashboard generate button are functional
- **Post-Generation Features**: Cannot test preview, edit, export, or deploy features because no generation can be initiated
- **Edge Cases**: Cannot test error handling in generation because the generation interface is inaccessible

## Root Cause Analysis

The two issues appear to be related:

1. **Homepage Routing Issue**: The server route `GET /` calls `renderHomePage(siteSettings)` which should include the auth overlay and prompt form, but the client-side appears to be showing the gallery view instead. This suggests a client-side routing or view switching problem.

2. **Dashboard Session ID Dependency**: The dashboard expects a session ID from the URL path (`location.pathname.split('/session/')[1]`), but when accessed directly without a session ID, the generate button has no context to create a new session.

## Recommendations

1. **Fix Homepage Routing**: Investigate why the gallery view is showing instead of the homepage with the prompt form and auth UI. Check client-side routing logic in `homepage.ts` and view switching functions like `showAnonymousApp()` vs `showApp()`.

2. **Fix Dashboard Session Handling**: Either:
   - Allow dashboard to generate new sessions without requiring a session ID in the URL, OR
   - Redirect users to the homepage first to create a session, then redirect to dashboard with session ID

3. **Add Error Messaging**: The generate button should provide visual feedback (loading state, error messages) when clicked, even if it fails due to missing session ID.

## Screenshots

- `/dogfood-output/screenshots/auth-gen-gallery-top.png` - Gallery view at root path
- `/dogfood-output/screenshots/auth-gen-dashboard.png` - Dashboard with prompt input
- `/dogfood-output/screenshots/auth-gen-dashboard-after-generate.png` - Dashboard after generate click (no response)
