# Dogfood Report — Post-Generation / Session Viewer

**Target URL:** http://localhost:7420/
**Sessions exercised:** b9c6ba901b65 (BeanRoute coffee), 3578acdef6d3 (Dog Boutique blog), 9a9d7c5b29f3 (inadvertently generated — see ISSUE-002)
**Session:** df-postgen (agent-browser, 1440×900, reduced-motion)
**Date:** 2026-06-05
**Scope:** Post-generation features as an anonymous non-owner (viewer, device controls, export, deploy, edit)

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 2 |
| Medium   | 3 |
| Low      | 1 |
| **Total**| **6** |

## Happy path (WORKS, verified)
- Session shell loads; preview iframe renders styled BeanRoute (not blank), scrollable to 4531px, below-fold sections + images render, no viewer JS errors. (01, 04)
- **Device controls (the recently-fixed feature) WORK:** Desktop/Tablet/Mobile set iframe width to exactly 1392 / 768 / 375; content reflows (mobile hamburger + single column); Desktop restores. Confirmed on a 2nd session. (02, 03, 11)
- Reload, Select-component, Annotate (aria-pressed toggles), Clear annotations all respond. (06, 10)
- Viewer consistent across a 2nd gallery session — not a one-off.

## Issues

### ISSUE-001: Deployed/published URLs return 404 "Site not found" (High)
- **Type:** Functional / deploy
- **Repro Video:** N/A
- **Description:** Viewer advertises deploy via WS `{"type":"deployed","slug":"sunny-comet","url":"https://sunny-comet.ship-fast.io"}` and "Open preview in new tab" → that URL. Visiting it returns HTTP 404 "Site not found". Systemic: a 2nd deploy URL produced during testing (`fresh-mango-10.ship-fast.io`) also 404s.
- **Evidence:** screenshots-postgen/07-deployed.png; `curl` → 404 body "Site not found" for both subdomains.
- **Expected:** deploy URL serves the generated site. **Actual:** every *.ship-fast.io deploy 404s; published artifact unreachable.
- **CAVEAT (for triage):** testing was against the LOCAL server. The deploy slug targets the *production* `ship-fast.io` domain, which the local generation may not actually publish to (or which may prune ephemeral test deploys). Confirm against the real deployed environment before treating as a prod bug — but at minimum the viewer advertises a URL that does not serve content.

### ISSUE-002: Anonymous Generate from inside a session bypasses gate (High)
- **Type:** Functional / rate-limit gating
- **Repro Video:** N/A
- **Description:** The bottom "Describe your next website…" textarea + Generate, used as an anonymous user, immediately navigates to a NEW session and runs a full generation+deploy — no login, no payment modal, no submit-time rate-limit. b9c6ba901b65 → 9a9d7c5b29f3 on click; console WS: prompt → status(openui) → homepage_ready → openui_stream_done → deployed(fresh-mango-10).
- **Evidence:** screenshots-postgen/09-generate-gate.png + console.
- **Expected:** anonymous user (quota ~exhausted) gated before consuming a generation. **Actual:** gen+deploy proceed silently. (Triggered once; consumed a generation, not repeated.)

### ISSUE-003: Export stuck on "Building" forever (Medium)
- **Type:** Functional / export
- **Repro Video:** N/A
- **Description:** Rail Export popover "Ship this exact UI in the stack you need" (HTML/React/Next.js) shows every target "BUILDING…" and never resolves; no download; Export badge persistently "Building" even on an old session.
- **Evidence:** screenshots-postgen/12-export.png, 13-export-after-wait.png (still BUILDING after ~10s).
- **Expected:** builds + offers download. **Actual:** stuck indefinitely.

### ISSUE-004: Site rail availability inconsistent across sessions (Medium)
- **Type:** UX / consistency
- **Repro Video:** N/A
- **Description:** Right rail (Edit content, E-commerce, Color palette, GitHub, Export, Assign custom domain, 3D-soon, Undo/Redo/Cancel/Done) is `display:none` on b9c6ba901b65 (reproduced twice; debug-burger click didn't reveal it) but `display:flex`/248px visible on 3578acdef6d3.
- **Evidence:** screenshots-postgen/11-gallery-3578.png (rail visible).
- **Expected:** consistent availability or an obvious toggle. **Actual:** hidden on one session, shown on another, no discoverable toggle on the hidden one.

### ISSUE-005: Generated nav/footer are inert buttons — dead in-page nav (Medium)
- **Type:** Functional / generated-output quality
- **Repro Video:** N/A
- **Description:** In the previewed generated site, all nav/footer items are `<button>` with no href/behavior; preview has 0 `<a href>` anchors, yet target ids pricing/features/faq exist (unreachable). Clicking "Plans" → scrollY stays 0, nothing happens.
- **Expected:** nav scrolls/anchors to sections. **Actual:** inert buttons; no working internal navigation.

### ISSUE-006: Preview WebSocket error + 1006 unclean close every load (Low)
- **Type:** Console error / resilience
- **Repro Video:** N/A
- **Description:** Each load logs `[WebSocket] Error: {code:"UNKNOWN", message:"[object Event]"}` then `Closed {code:1006, wasClean:false}` before a successful reconnect+replay. Recovers functionally but surfaces an error each load.
- **Expected:** clean connect / silent retry. **Actual:** error + unclean close logged every load.

## Notes / not-bugs
- Example preview briefly first-painted "Fresh beans at your doorstep" then render swapped to "Fresh Coffee Delivered Monthly"; hard reload consistently shows the former. Treated as render/cache nuance, not filed.
- Custom-domain/payment/re-deploy not triggered (per instructions); auth + payment modals exist in DOM, not exercised.

## Verdict
Viewer + device-controls work well (Desktop/Tablet/Mobile = 1392/768/375, recently-fixed feature verified); but deploy and export — the two "ship it" payoffs — appear broken (404 deploys, perpetual "Building" export), and the anonymous Generate path bypasses gating.
