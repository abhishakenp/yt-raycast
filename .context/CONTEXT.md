# Dogfood Context - Ship-Fast Auth & Generation

## Session Info

- **Target URL**: http://localhost:7420/
- **Session Name**: ship-fast-auth-gen
- **Date**: 2026-06-05
- **Scope**: Authentication flow, website generation, and post-generation features

## App Architecture Understanding

### Key Findings

1. **Gallery vs Homepage**: The root path `/` serves a gallery of generated websites, NOT the homepage with generation UI
2. **Dashboard**: `/dashboard.html` has the generation interface with prompt input
3. **Authentication**: Uses Firebase with Google, GitHub, and email/password options
4. **Marketing Shell**: Has sign-in button in top actions bar (renderTopActions)
5. **Homepage**: Should include renderAuthOverlay() and renderTopActions() with sign-in

### Server Routes

- `GET /` - Serves gallery (not the prompt form)
- `GET /dashboard.html` - Generation dashboard with prompt input
- `POST /api/sessions` - Create new generation session (optionalAuth)
- Various auth-protected endpoints for post-generation features

### Authentication System

- Firebase-based auth with Google, GitHub, and email/password
- Auth middleware: requireAuth, optionalAuth, requireProvisionAuth
- Sign-in button ID: `signin-btn`
- Auth overlay ID: `auth-overlay`
- Dashboard has separate auth system (dashboard-auth.ts)

## Current Status — UPDATED 2026-06-05 (v2 dogfood complete)

- **Homepage `/`**: Has BOTH the prompt form (`#prompt-input`/`#prompt-form`) AND full auth UI (`#signin-btn`, `#auth-overlay`, google/github/email). Prior "auth UI missing" / "generate non-responsive" findings were WRONG (misunderstanding + agent-browser artifacts).
- **Generation**: Works end-to-end SERVER-side. `POST /api/sessions {prompt}` → generates + auto-deploys in ~15-25s. Session view at `/session/<id>`, preview at `/preview/<id>`.
- **Anon quota**: ~3 generations/IP/day. Reference completed session: `b9c6ba901b65` (BeanRoute coffee, deployed).
- **Setup**: server already runs via `bun --watch src/index.js` on 7420; `.env` (NOT Doppler) has GROQ/FIREBASE/etc keys. Do NOT restart it.

## v2 Dogfood Results — 17 issues, 0 critical (see report-summary-v2.md)

Reports: `report-auth-v2.md`, `report-generation-v2.md`, `report-postgen.md`, `report-summary-v2.md`.
6 High:

1. gen-001: after submit, SPA stuck on homepage — never renders `/session/<id>` view (manual reload needed). ← real bug behind old false "generate does nothing".
2. gen-002: generated body is off-topic boilerplate (yoga→cloud storage).
3. auth-001: Enter doesn't submit login (inputs not in a `<form>`).
4. auth-002: no way to close auth modal (no X, Esc/click-outside disabled).
5. postgen-001: deployed \*.ship-fast.io URLs 404 (caveat: local→prod domain, verify on real env).
6. postgen-002: anonymous Generate-from-session bypasses gating.
   Convergent: WebSocket `1006` unclean close every load (gen+postgen); weak anon gating/validation; export stuck "Building" forever; inert `<button>` nav (0 anchors) in generated output.
   Works: auth happy-path, OAuth redirects, server-side gen, device controls (1392/768/375 — recently-fixed, verified), direct `/session` & `/preview` loads.

## Old Next Steps (DONE)

~~Find homepage / test auth / test generation / test post-gen~~ — all completed in v2.

## Rules & Constraints

- Document issues immediately as found (don't batch)
- Use full repro with video for interactive issues
- Single annotated screenshot for static issues
- Save context every ~10k tokens to prevent loss
- Never delete output files mid-session
- Test like a real user, not a robot
