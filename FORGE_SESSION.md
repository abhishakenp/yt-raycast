# Forge — GPT-OSS-120b Homepage Generation Session

End-to-end recap of the design forge built in this session: what we set out to
do, what we built, what failure modes we caught, and how the pipeline now
ranks GPT-OSS-120b output against a vision-judged rubric in a closed loop.

---

## Goal

Generate B2B SaaS marketing homepages with GPT-OSS-120b that are visually
competitive with Kimi-K2 output, at production-grade structural integrity, in
under 15 seconds per generation. Everything had to plug into the existing
ship-fast / vanilla pipeline so the winning prompt could later be ported
directly into the engine without rewrites.

The 50-iteration Ralph loop was the harness for that exploration: a fixed
brief, varied art direction, a leaderboard, and a single best/ folder we
could promote.

---

## Where things started

The vanilla pipeline already had:

- `groqHomepageWithModel` in `vanilla/packages/ship-fast-engine/src/llm/groq.js`
- `scoreRalphHomepage` + `passesHomepagePublicDesignVerification` in
  `vanilla/src/pipeline/ralph-homepage-score.js`
- A `browser-design-ralph.mjs` script that exercised the full `runAll`
  pipeline (multi-phase, slow)

Two blocking issues were baked into the engine for GPT-OSS-120b:

1. `reasoning_effort: 'high'` was hardcoded for `openai/gpt-oss-120b`, so
   every call cost ~30s minimum on Groq.
2. `max_tokens: 20000` for the homepage call let the model spend its budget
   on reasoning before emitting any HTML — at lower token caps, runs
   returned empty content.

A baseline run through `runAll` came in at **34s, score 100, audit failing
on aurora detail**. Not shippable for a sub-15s SLO.

---

## v1 — direct lean caller

`vanilla/scripts/forge-lib.mjs` shipped a parallel Groq caller that bypassed
the engine's hardcoded knobs. The caller used the same prompt contract as
production, but with:

- `reasoning_effort: 'low'`
- `max_tokens: 12000`
- A ~3k-token system prompt that distilled every signal scored by
  `scoreRalphHomepage` + the homepage quality audit (canvas hero, ≥3
  radial-gradient stacks, theme.extend keyframes liquid drift, ≥4
  data-reveal blocks, ≥2 data-magnet CTAs, accordion ≥5 items, monthly /
  yearly pricing toggle, multi-column footer, real anchors, real button
  count, …)

`forge-once.mjs` ran a single call against this lib; `forge-loop.mjs` did
Ralph-style 50 iterations across 10 aesthetic nudges × 5 temperatures, with
a leaderboard sorted kept-first → score → speed.

Single-shot baseline collapsed from 34s → **14.1s, score 100, verifyOk
true**. Loop run hit **17/50 iters kept under 15s** (34%). Best visual was
iter-48 — festival maximalism, full sections, 13.7s.

That state landed as commit
`8ceb703 feat(forge): GPT-OSS-120b homepage forge — 14s avg, score 100,
17/50 kept under 15s budget`.

---

## What v1 missed

The structural-only audit had real gaps. Manual screenshot review of the
"verified" iters revealed three failure modes the audit accepted:

1. **Empty bands.** Iter-32 from v1 scored 100, verifyOk true, but its
   screenshot was a hero on top of ~1500px of empty navy boxes. Sections
   existed in the DOM, contained their data-* hooks, but had no content
   inside the `<section>` element.
2. **Dead Lucide icon names.** Generated HTML used `data-lucide="github"` /
   `"twitter"` / `"chart"` etc. — names that don't exist in
   `lucide@latest`. The audit didn't check the registry, so they passed,
   but at runtime `lucide.createIcons()` silently no-ops on each one and
   the page renders blank squares.
3. **Non-Google-hosted display fonts.** Prompts asked for "Cabinet Grotesk"
   or "Geist" — Google Fonts 404s those silently and the page falls back to
   default sans, but the structural audit didn't notice.

This was the trigger for v2.

---

## v2 — five composite gates

`e6574f2 feat(forge): v2 — 5-gate composite scoring (vision + render +
lucide), composition variance, reference fingerprint`.

Every iteration now passes through five independent gates. `kept=true` only
when all five fire:

1. **structuralOk** — the existing `scoreRalphHomepage` +
   `passesHomepagePublicDesignVerification` pair (unchanged).
2. **lucideOk** — every `data-lucide` name resolves in the
   `lucide-static@latest` registry, mirrored once into
   `vanilla/.forge/_ref/lucide-names.json` (1951 names). The system prompt
   was updated to explicitly ban brand icons (github / twitter / linkedin /
   discord / facebook / instagram / youtube — none exist in lucide), `x`
   (use `x-circle`), `chart` (use `bar-chart-3` / `pie-chart`), and to
   instead use inline `<svg viewBox="0 0 24 24">` for brand/social icons.
3. **renderOk** — Playwright pass that:
   - Forces `reveal-ready` class on `<html>` and clears any `opacity-0` /
     `translate-y-*` on `[data-reveal]` blocks before measuring (otherwise
     scroll-reveal animations false-positive as empty bands).
   - Flags any section measured at 60px..180px with <20 chars of text
     (empty bands).
   - Computes WCAG contrast (color vs nearest non-transparent ancestor
     bg) for up to 200 text samples; ≥4.5 for normal text, ≥3 for ≥18px or
     bold text. Fails the gate if >20% of samples don't meet the bar.
   - Filters network-noise console errors (cdn.tailwindcss.com /
     fonts.googleapis.com / unpkg.com / cdnjs failures) so the gate doesn't
     fail on transient CDN hiccups, but still surfaces real `pageerror`
     events.
   - Whitelists the Google-hosted display fonts (Fraunces, Syne, Outfit,
     DM Serif Display, Playfair Display, Space Grotesk, Bricolage
     Grotesque, Instrument Serif, Manrope, Sora) and rejects pages where
     `document.fonts` doesn't contain at least one match.
4. **visionOk** — Groq Llama-4 Scout vision rubric scores hierarchy /
   harmony / spacing / copy / artDirection 0-25 each. Default min total
   75/100. This gate alone cleanly distinguished iter-32 (45 — empty
   bands) from iter-48 (100) in our v1 retro.
5. **underBudget** — wall-clock ≤ `FORGE_TIME_MS` (default 18000ms).
   `subBudget15` is reported per iter for the tight ≤15s target so the
   summary shows both buckets.

Composition variance: each iter mixes one aesthetic nudge × one hero
archetype (split / centered / bento / editorial / poster) × one pricing
archetype × one section-rhythm nudge. Real layout exploration, not
recolored skeletons.

`forge-reference.mjs` distills `public/designs/design-03-saas-homepage.html`
(extracted from the project's git history into
`vanilla/.forge/_ref/design-03-saas-homepage.html`) into a single line of
density signals (section ids, link count, button count, radial-gradient
count) appended to every prompt — the model has a numeric target to match
without copying.

Winner seeding: the first iter that satisfies all five gates with the
highest vision score has its `tailwind.config.theme.extend` snippet +
section-id list extracted via `buildWinnerSeed` and appended as a soft
palette/typography anchor for iters 12+. Stops the loop drifting.

`temperatureForIter(i)` anneals 0.6 → 0.65/0.7/0.75 (explore) → 0.6
(converge) across 50 iters.

Optional knobs:

- `FORGE_FIX_PASS=1` — second model call asks for the 3 weakest details
  in the freshly-generated HTML and emits a patched version, only when the
  remaining time budget permits.
- `FORGE_USE_ASSETS=1` — calls the engine's existing
  `resolvePexelsImageHints` once per run and injects the verified-stock
  block into every iter's user prompt. One Pexels API hit, not 50.

---

## Failure-reason histogram

`forge-summary.mjs` post-run analyzer (commit `8433cb3` for the radial-
gradient prompt tightening that introduced the analyzer; commit `51cb0da`
for the leaderboard-fallback when a run was killed mid-flight) tabulates
each non-kept iter's failure reasons.

Across the final v2 50-iter run:

```
   29× time
    3× time + render: empty bands
    2× time + verify (audit feedback)
    2× time + lucide: chart
    1× time + render: 35/113 contrast fails on body text
    1× time + lucide: chart
    1× time + lucide: chart-3
    1× time + verify
```

Time was 80% of failures — quality gates rarely failed alone. Vision was
**100/100 on every kept iter**.

---

## Final v2 numbers

Run id `1777980514602` (last run of the session):

| metric | value |
| --- | --- |
| iters | 50 |
| kept (5-gate composite) | 9/50 |
| sub-15s kept | 1 (iter-39) |
| avg vision score (kept) | 100 / 100 |
| avg gen ms (kept) | 16.8s |
| best | iter-39 — 13.8s, vision 100, "Engineered Intelligence" nordic SaaS |

The run's `best/` folder (`vanilla/.forge/loop/1777980514602/best/`)
contains iter-39's HTML, screenshot, and meta.

---

## File map

`vanilla/scripts/`:

| file | role |
| --- | --- |
| `forge-lib.mjs` | direct Groq caller (bypasses engine's reasoning_effort='high'); audit-aware system prompt; variation axes; temperature schedule; winner-seed builder; self-critique fix-pass |
| `forge-reference.mjs` | distills design-03-saas-homepage.html into the reference tier prompt block |
| `forge-render-audit.mjs` | Playwright pass: empty bands, contrast (WCAG AA), console errors, fonts loaded |
| `forge-vision.mjs` | Groq Llama-4 Scout vision rubric (hierarchy / harmony / spacing / copy / artDirection — 0-25 each) |
| `forge-lucide-validate.mjs` | mirrors lucide-static@latest icon registry once; flags any `data-lucide` name not in the registry |
| `forge-assets.mjs` | optional Pexels image-hints prefetch (one call shared across all iters) |
| `forge-once.mjs` | single-shot generator with full gating |
| `forge-loop.mjs` | Ralph 50-iter loop with leaderboard + best/ + Playwright top-K screenshots |
| `forge-shots.mjs` | re-screenshot a prior run's top-K |
| `forge-promote.mjs` | copy winning HTML + emit engine-patch sketch |
| `forge-summary.mjs` | post-run analyzer with failure histogram (falls back to per-iter meta when leaderboard.json is absent) |
| `FORGE.md` | usage reference |

Outputs land in `vanilla/.forge/` (gitignored).

---

## Knobs

| env | default | role |
| --- | --- | --- |
| `FORGE_ITERS` | 50 | iter count |
| `FORGE_TIME_MS` | 18000 | wall-clock budget per iter |
| `FORGE_TIGHT_TIME_MS` | 15000 | tight target reported as `subBudget15` |
| `FORGE_VISION_MIN` | 75 | min vision-judge total to keep |
| `FORGE_TOPK` | 5 | top-K screenshots + leaderboard cut |
| `FORGE_PORT` | 9889 | static server port |
| `FORGE_MAX_TOK` | 10000 | Groq `max_tokens` |
| `FORGE_PROMPT` | (lib default) | base brief |
| `FORGE_USE_ASSETS` | 0 | prefetch Pexels block |
| `FORGE_FIX_PASS` | 0 | enable self-critique pass when budget allows |
| `FORGE_SKIP_VISION` | 0 | skip vision judge (debug only) |
| `FORGE_SKIP_RENDER` | 0 | skip Playwright audit (debug only) |
| `FORGE_VISION_MODEL` | meta-llama/llama-4-scout-17b-16e-instruct | Groq vision model |

---

## How to use

```bash
# Single shot under all 5 gates
bun vanilla/scripts/forge-once.mjs "your brief"

# 50-iter Ralph loop
FORGE_ITERS=50 bun vanilla/scripts/forge-loop.mjs

# With Pexels images injected
FORGE_USE_ASSETS=1 bun vanilla/scripts/forge-loop.mjs

# Self-critique fix pass when budget allows
FORGE_FIX_PASS=1 bun vanilla/scripts/forge-loop.mjs

# Re-shoot top-10 of any prior run
bun vanilla/scripts/forge-shots.mjs latest 10

# Post-run summary with failure histogram
bun vanilla/scripts/forge-summary.mjs latest

# Copy best HTML + emit engine-patch sketch
bun vanilla/scripts/forge-promote.mjs latest --copy-html --patch
```

---

## How to ship the win into the engine

`forge-promote.mjs latest --patch` writes
`vanilla/.forge/promoted/engine-patch.txt` with the exact knobs to port
back into `vanilla/packages/ship-fast-engine/src/llm/groq.js`'s
`groqHomepageCore`:

1. Replace the hardcoded `reasoning_effort: 'high'` for
   `openai/gpt-oss-120b` with `'low'`.
2. Cap `max_tokens` at 10000 (override-respecting).
3. Replace the LANDING-PAGE branch of the homepage system prompt with the
   audit-aware `HOMEPAGE_SYSTEM_LEAN` from `forge-lib.mjs`.

Best forge run that this patch is validated against:
`1777980514602`, iter 39 (ms=13775, vision=100, scoreOk=true).

---

## Commits on `feat/vanilla-gpt-oss-120b`

1. `8ceb703` — v1 forge (14s avg, 17/50 kept ≤15s, structural-only audit)
2. `e6574f2` — v2 5-gate composite (vision + render + lucide) + composition
   variance + reference fingerprint + winner seeding + fix-pass scaffold
3. `8433cb3` — tightened radial-gradient rule, added forge-summary post-run
   analyzer
4. `51cb0da` — fix-forge-summary fallback when leaderboard.json absent
