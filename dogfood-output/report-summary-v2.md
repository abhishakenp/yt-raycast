# Ship-Fast Dogfood — Consolidated Summary (v2)

**Date:** 2026-06-05 · **Scope:** Auth + Generation + Post-generation (the critical, previously-untested flows)
**Method:** 3 parallel agent-browser sessions (df-auth, df-gen, df-postgen) against the live local server (localhost:7420).

## Context correction (important)
The earlier reports were largely **wrong / artifacts**:
- `report.md` (gallery): ALL GREEN — navigation/pagination/footer/gallery-clicks genuinely work; prior "broken nav" was an agent-browser smooth-scroll + header pointer-events artifact (since fixed).
- `report-auth.md` & `report-auth-generation.md`: their "login UI inaccessible" / "generate non-responsive" findings were **misunderstandings** — the homepage `/` has both the prompt form AND full auth UI, and generation works end-to-end server-side (generates + auto-deploys in ~15–25s). Superseded by the v2 reports below.

## Totals (17 issues, 0 critical)

| Area | Crit | High | Med | Low | Report |
|------|------|------|-----|-----|--------|
| Auth | 0 | 2 | 1 | 2 | `report-auth-v2.md` |
| Generation | 0 | 2 | 2 | 1 | `report-generation-v2.md` |
| Post-generation | 0 | 2 | 3 | 1 | `report-postgen.md` |
| **Total** | **0** | **6** | **6** | **4** | |

## The 6 High-severity issues (fix first)
1. **Generation: client never leaves homepage after submit** (gen ISSUE-001). Backend generates + deploys fine, but the SPA never renders the `/session/<id>` progress/preview view — no spinner, no redirect that actually re-renders. Only a manual hard reload shows the result. **This is the real bug behind the old false "generate button does nothing" report.**
2. **Generation: off-topic content** (gen ISSUE-002). Yoga prompt → cloud-storage SaaS body; gibberish → digital agency. Brand/nav correct, body is unrelated boilerplate.
3. **Auth: Enter does not submit the login form** (auth ISSUE-001). Inputs aren't in a `<form>`; only the button works. Contradicts a recent "submit on Enter" change.
4. **Auth: no way to close the auth modal** (auth ISSUE-002). No X, Esc disabled, click-outside disabled → user must reload.
5. **Post-gen: deployed *.ship-fast.io URLs 404** (postgen ISSUE-001). Viewer advertises a deploy URL that serves 404. *Caveat: local→prod-domain; verify on real deploy env.*
6. **Post-gen: anonymous Generate bypasses gating** (postgen ISSUE-002) — full gen+deploy with no login/quota check from inside a session.

## Convergent themes (seen by multiple agents)
- **WebSocket error + `1006` unclean close on every preview/session load** (gen ISSUE-001 console + postgen ISSUE-006). Recovers via reconnect but logs an error each load. Recurring → worth fixing at the source.
- **Weak anonymous gating / validation**: gibberish prompts accepted + deployed and burn quota (gen ISSUE-003), no quota indicator (gen ISSUE-005 note), generate-from-session ungated (postgen ISSUE-002).
- **"Ship it" payoff features broken**: deploy 404 (postgen ISSUE-001) + export stuck "Building" forever (postgen ISSUE-003).
- **Generated-output quality**: off-topic body (gen ISSUE-002) + inert `<button>` nav with 0 anchors / dead in-page nav (postgen ISSUE-005).

## What genuinely works (verified)
- Auth happy path: email/pw sign-in + sign-out, Google/GitHub OAuth redirects, transparent blurred backdrop, click-outside-disabled.
- Generation server-side: reliable, ~15–25s prompt→deployed; suggestion chips, rotating placeholder, language row.
- Session viewer: preview iframe renders styled sites; **device controls (Desktop/Tablet/Mobile = 1392/768/375) work** — the recently-fixed feature verified; annotate/select-component/reload respond.
- Direct loads of `/session/<id>` and `/preview/<id>` render correctly (it's the post-submit transition that fails).
