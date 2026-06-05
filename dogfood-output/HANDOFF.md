You are picking up a bug-fix task on **ship-fast** (branch `vanilla-to-root-no-mobbin`). A full dogfood of the auth, generation, and post-generation flows was just completed. 17 issues found, 0 critical, 6 High. Your job: triage and fix the High-severity issues, starting with the one that makes generation *appear* completely broken.

## Environment (already set up — do NOT change)
- Server is ALREADY running on http://localhost:7420 via `bun --watch src/index.js`. Do NOT restart/kill it; `--watch` picks up edits.
- Local secrets are in `.env` (NOT Doppler — Doppler is not installed). Real GROQ/FIREBASE/PEXELS keys are present. Generation works locally.
- Auth test account: liviogama@gmail.com / liviogama.
- Anonymous generation quota is ~3/IP/day — be frugal when testing generation; reuse completed session `b9c6ba901b65` (BeanRoute coffee, already generated + deployed) to inspect post-gen state without spending quota.

## Verifying via agent-browser (the tool races; the app is usually fine)
- Use the `agent-browser` binary directly (NOT npx). Set reduced motion, viewport ≥1280×800, and `scrollIntoView({block:'center'})` any below-fold control before clicking its `@ref`. Assert via `get url` + DOM, not screenshots alone. (A prior run filed many false "navigation broken" bugs purely from tool races — don't repeat that.)

## What already works (don't "fix" these — verify you didn't break them)
- Homepage `/` has BOTH the prompt form (`#prompt-input`/`#prompt-form`) and full auth UI (`#signin-btn`, `#auth-overlay`, google/github/email). It is not just a gallery.
- Auth happy path: email/pw sign-in + sign-out, Google/GitHub OAuth redirects, transparent blurred modal backdrop, click-outside-to-close disabled (intended).
- Server-side generation: reliable, ~15–25s prompt→deployed. Direct loads of `/session/<id>` and `/preview/<id>` render correctly.
- Session viewer device controls (Desktop/Tablet/Mobile = 1392/768/375 px) — recently fixed, verified working.

## Full reports (read these for repro steps + screenshots)
`dogfood-output/report-summary-v2.md` (start here), `report-auth-v2.md`, `report-generation-v2.md`, `report-postgen.md`. Screenshots in `dogfood-output/screenshots-{auth-v2,gen,postgen}/`. Project notes in `.context/CONTEXT.md`.

## Fix in this order (6 High, then convergent themes)

### P0 — gen-001: After submit, the SPA never renders the session view (HIGHEST IMPACT)
This is the real bug behind the old false "generate button does nothing." Backend generates + auto-deploys correctly (WS streams status/openui/deployed), and the URL is pushState-updated to `/session/<id>`, but the rendered DOM stays the homepage (`isSessionView:false`, h1 still "Ship Fast AI website generator"). Only a manual hard reload of `/session/<id>` renders the progress/preview Dashboard. → Pure client-side route/render-transition failure: the pushState to `/session/<id>` doesn't trigger the view swap. Find where the prompt-submit handler updates history and wire it to actually render the session/Dashboard view (or navigate). Likely in the homepage client script (`src/scripts/homepage.ts` and the session-shell/embed scripts). Verify: submit a prompt → page transitions to a live progress/preview view with no manual reload.

### P1 — auth-001: Enter does not submit the login form
`#auth-overlay` inputs (`#auth-email`, `#auth-password`) are NOT wrapped in a `<form>`, so there's no native submit-on-Enter; only clicking `#email-signin-btn` works. Wrap them in a `<form>` (or add an Enter keydown handler) so Enter submits. (A recent commit claimed "proper form semantics" / "submit on Enter" — it didn't land.)

### P1 — auth-002: No way to close the auth modal
Once `#auth-overlay` opens there's no dismissal: no X/cancel button, Esc disabled, click-outside disabled (intended). Add a visible close (X) button and/or Esc-to-close so a user who opens it by mistake isn't forced to reload.

### P1 — postgen-002: Anonymous "Generate" bypasses gating
The in-session "Describe your next website…" Generate (and the homepage form) lets an anonymous user run a full gen+deploy with no login and no submit-time quota check, even when quota is exhausted. Add server-side + client gating before consuming a generation.

### P1 — postgen-001: Deployed `*.ship-fast.io` URLs return 404 "Site not found"
The viewer advertises a deploy URL (e.g. `https://sunny-comet.ship-fast.io`) that returns 404. CAVEAT: testing was local against a production domain — the local server may not actually publish to prod, or prod prunes ephemeral deploys. First confirm whether deploys are expected to be reachable from local at all; if not, the viewer shouldn't advertise a dead URL. Verify on the real deployed environment before treating as a prod bug.

### P2 — gen-002: Generated body content is off-topic
Brand name + nav match the prompt, but the body is unrelated boilerplate (yoga prompt → cloud-storage SaaS hero/pricing). Generation-quality issue in the engine/prompts (`packages/ship-fast-engine/`), lower priority than the UX breakers above.

## Convergent themes worth a sweep (seen by multiple testers)
- **WebSocket error + code 1006 unclean close on every preview/session load** (then reconnect+replay). Recovers but logs an error each load — fix at the source (`src/island/openui/*`).
- **Weak anon validation**: gibberish ("aaaa…" 24 chars) passes and deploys, burning quota; no quota/remaining indicator shown to anon users.
- **Export stuck "Building" forever** (HTML/React/Next never resolves, no download) — postgen ISSUE-003.
- **Generated nav/footer are inert `<button>`s with 0 `<a href>` anchors** → dead in-page navigation in generated sites — postgen ISSUE-005.

## Rules
- Check git history before implementing (CLAUDE.md rule) — several of these touch recently-changed files; don't reintroduce reverted work.
- After fixing, VERIFY each fix in a real browser via agent-browser (don't claim fixed without proof). Run repo-wide `tsc`/lint once centrally after the batch.
- Don't delete the dogfood-output reports/screenshots.
