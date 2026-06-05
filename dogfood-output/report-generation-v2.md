# Ship Fast — Website Generation Dogfood Report (v2)

**App URL:** http://localhost:7420/  •  **Entry:** `/` (prompt form)
**Sessions created:** `d72e0b3bb467` (gibberish), `30204e47a53e` (yoga/Stillpoint)  •  **Reference:** `b9c6ba901b65` (BeanRoute)
**Date:** 2026-06-05  •  **Scope:** generation flow only (prompt → generate → session view → preview), tested via `agent-browser` session `df-gen`.
**Quota consumed:** 2 (1 gibberish unexpectedly accepted; 1 meaningful yoga prompt).

## Summary
| Severity | Count |
|---|---|
| Critical | 0 |
| High | 2 |
| Medium | 2 |
| Low | 1 |

| Issue | Sev | Title |
|---|---|---|
| ISSUE-001 | High | After submit, UI stuck on homepage — never renders session/progress view |
| ISSUE-002 | High | Generated content is off-topic boilerplate (yoga→cloud storage; gibberish→agency) |
| ISSUE-003 | Medium | Meaningless prompts not rejected server-side; gibberish deploys + burns quota |
| ISSUE-004 | Medium | Transient "Could not load saved preview" / ERR_CONNECTION_REFUSED post-deploy |
| ISSUE-005 | Low | Short prompts blocked by silently-disabled button, no message |

**Verdict:** Generation works end-to-end server-side (prompt reliably generates + auto-deploys in ~15–25s). But client UX is broken: after submit the page never leaves the homepage, so no progress/redirect/preview unless the user manually reloads `/session/<id>`. Content quality is also poor (off-topic boilerplate).

---

### ISSUE-001: After submit, UI stuck on homepage — never renders session/progress view (High)
**Type:** Client-side SPA routing/render bug.
**Description:** Submitting a valid prompt starts backend generation immediately (WS streams status/openui/deployed), but the browser never transitions off the homepage. No spinner, no progress, no redirect. The URL is eventually pushState-updated to `/session/<id>`, yet the rendered DOM is still the homepage (`isSessionView:false`, h1="Ship Fast AI website generator"). The real Dashboard view (progress 100%, logs, live preview iframe) appears only after a manual hard reload of `/session/<id>` — proving content exists and this is a pure client render failure.
**Repro:** 1) Open `/`. 2) Enter "A modern landing page for a yoga studio called Stillpoint with class schedule and pricing". 3) Click GENERATE. 4) URL stays `/`, page stays homepage while console WS streams generation. 5) URL becomes `/session/30204e47a53e` but page is still homepage. 6) Reload that URL → proper Dashboard renders.
**Evidence:** screenshots-gen/07-meaningful-prompt-filled.png, 08-stuck-homepage-after-generate.png (URL=/session/… but homepage shown), 04/09 (correct view after reload). Eval post-submit: `{"h1":"Ship Fast AI website generator","isHomepage":true,"isSessionView":false}`. Reproduced on both sessions d72e0b3bb467 and 30204e47a53e.
**Console:** recurring `[error] [WebSocket] Error {code:"UNKNOWN", message:"[object Event]"}` then `Closed {code:1006, wasClean:false}` + reconnect.
**Expected:** redirect to/render `/session/<id>` Dashboard with live progress. **Actual:** stuck on homepage, no feedback.

### ISSUE-002: Generated content is off-topic boilerplate (High)
**Type:** Generation quality.
**Description:** Sites use the prompt brand name + a couple nav labels but fill the body with unrelated stock copy.
- Yoga prompt → title "Stillpoint", nav Home/Schedule/Pricing/About (correct), but hero = "Storage that scales with your ambitions / VaultCloud keeps your files safe, synced…" with cloud-storage tiers ("100 GB secure storage", "Desktop sync (macOS, Windows, Linux)"). A cloud-storage SaaS template; nothing about yoga.
- Gibberish prompt → title "PawWell", a generic digital-agency page ("We craft digital experiences that define brands", "Selected work", "Numbers that speak volumes").
**Repro:** generate yoga prompt → open `/preview/30204e47a53e` → read body.
**Evidence:** screenshots-gen/10-yoga-preview-mismatched-hero.png, 05-gibberish-generated-pawwell.png.
**Expected:** body themed to prompt (classes/schedule/instructors/wellness). **Actual:** unrelated SaaS/agency boilerplate.

### ISSUE-003: Meaningless prompts not rejected; gibberish deploys + burns quota (Medium)
**Type:** Server validation gap.
**Description:** "aaaaaaaaaaaaaaaaaaaaaaaa" (24 chars) passes the client min-length gate and is accepted server-side; generates + deploys (slug urban-prism-10), consuming an anon generation. No "meaningful description" 400 for clearly meaningless input.
**Repro:** type 24 'a's, submit → session d72e0b3bb467 created + deployed.
**Evidence:** screenshots-gen/02-meaningless-prompt-filled.png, 03-meaningless-accepted-session.png, 05-gibberish-generated-pawwell.png.
**Expected:** 400 "Please provide a meaningful description…", no quota spent. **Actual:** accepted, deployed, quota consumed.

### ISSUE-004: Transient "Could not load saved preview"/ERR_CONNECTION_REFUSED post-deploy (Medium)
**Type:** Reliability/race.
**Description:** Right after deploy, `/preview/<id>` first returned "Could not load saved preview. Try refreshing this page." then `net::ERR_CONNECTION_REFUSED`; after ~8–10s of retries it loaded fine. Preview endpoint briefly unavailable post-deploy, so clicking through immediately shows a raw error.
**Repro:** generate, then open `/preview/<id>` immediately.
**Evidence:** observed on `/preview/30204e47a53e`: "Could not load saved preview" → ERR_CONNECTION_REFUSED → eventually Stillpoint page (bodyLen 3867).
**Expected:** preview ready (or graceful retry) when dashboard shows 100%/deployed. **Actual:** hard error states for several seconds.

### ISSUE-005: Short prompts blocked by silently-disabled button, no message (Low)
**Type:** UX/affordance.
**Description:** Prompts < ~12 chars keep Generate disabled with no explanation. "test" → greyed button, submit no-op, no hint text.
**Repro:** type "test"; button stays disabled; no error appears.
**Evidence:** threshold probe (len 9/10/11 disabled, 15+ enabled); submit attempt with "test": `{"btnDisabled":true,"anyError":[],"url":".../"}`.
**Expected:** inline hint ("add more detail"). **Actual:** silent disabled button.

---

## Happy path (works)
- Homepage form clean: required textarea, disabled-when-empty button, rotating placeholder (varied examples), 4 suggestion chips (Image studio / Pet wellness / SaaS dashboard / Hindi gym site).
- Chips populate textarea via data-prompt and enable the button; language-selector row reveals on input.
- Server generation + auto-deploy reliable & fast (~15–25s to `deployed`). Direct loads of `/session/<id>` render a proper Dashboard (progress, logs, live preview). Reference `/preview/b9c6ba901b65` renders BeanRoute correctly ("Fresh beans at your doorstep").

## Rate-limit UX
No visible remaining-generations counter/quota indicator on the homepage for anon users; no warning before quota is spent (worsens ISSUE-003). Hard limit not reached this run (2 generations succeeded), so the limit-reached message wasn't captured.
