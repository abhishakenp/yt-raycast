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

`forge-mobbin.mjs` (v3) adds a live Mobbin Pro reference tier on top of the
static fingerprint. When `FORGE_USE_MOBBIN=1` is set, the loop prefetches
one trending `screenPatterns=['Home']` lookup per category (default
`Developer Tools` / `AI` / `Productivity`) using the Supabase auth cookie
minted by `mobbin-mcp auth` (`~/.mobbin-mcp/auth.json`), then injects a
compact block of named real products + observed element vocabulary into
every iter's prompt. gpt-oss-120b can't take images, but naming
**ElevenLabs / Linear / Cloudflare / Databricks / Clay / OpenAI Platform**
gives it concrete training-knowledge anchors that pull the output toward
production-grade B2B SaaS marketing instead of the generic template.
Validated end-to-end: one forge-once run with `FORGE_USE_MOBBIN=1`
produced HTML that literally name-drops Linear / Cloudflare / Databricks
as logo-cloud references, all 5 structural/lucide gates green
(score 100, verifyOk, lucideOk), input-token delta ~50.

---

## v4 — Mobbin Pro design-DNA inheritance

v3 carried only app names + flat element-vocab lists into the prompt.
gpt-oss-120b saw `FEATURED ANCHOR: Linear` as a string token and fell back
to its generic "modern B2B SaaS" interpretation, which is why the loop
output didn't actually inherit Mobbin's visual signature even when the
references were live. The user reported the symptom directly: "mobbin pro
has not trained forge_session.md enough to inherit mobbin UI designs".

v4 wires three concrete layers into the prompt instead of one weak nudge:

1. **Live palette extraction.** After `prefetchForgeMobbin` returns the
   trending screen set, `extractMobbinPalettes(data, browser)` walks each
   `screenUrl`, converts the Supabase storage URL to its bytescale CDN
   equivalent at `?w=64`, loads the thumb into a Playwright canvas, and
   counts quantized pixel colors via `getImageData`. Returns the top 5
   dominant hex values per screen, cached on disk (7-day TTL, keyed by
   raw screenUrl). Per-screen cost ≈ 60-120ms; 15 screens ≈ 1-2s once per
   run, then zero on subsequent runs. Same algorithm mobbin-mcp's
   `extractColors` uses — re-implemented in browser-canvas form so we
   don't add `sharp` as a dependency.

2. **Curated per-app DNA bank.** `scripts/forge-mobbin-dna.json` carries
   structured descriptors for the ~16 B2B SaaS web apps that dominate
   Mobbin Pro's trending feed (Linear / Cloudflare / Stripe / Vercel /
   Databricks / OpenAI / ElevenLabs / Clay / Notion / Figma / Anthropic /
   Supabase / Webflow / Retool / Hume). Each entry has: `display`/`body`/
   `mono` typography hints, a `layout` signature sentence, `copy`
   register, `accents` brand hex pair, 3-4 `doctrine` required moves,
   and 3-4 `avoid` anti-patterns. `resolveDna(appName)` matches
   case-insensitively with suffix tolerance. Apps not in the bank get a
   palette-synthesized descriptor (`synthesizeDna`) so the iter block
   stays concrete regardless.

3. **Doctrine block in the system prompt.** `mobbinDoctrineBlock()`
   returns a static ~2700-char block (rules A through G) that's
   concatenated into `HOMEPAGE_SYSTEM_LEAN` at module init — model sees
   it once per call, not per iter. Rules cover palette discipline ("plug
   sampled hex strings verbatim into theme.extend.colors — DO NOT round
   #5e6ad2 to #6366f1"), typography register, the 7-section composition
   silhouette common across Mobbin Pro winners, copy register
   (concrete proprietary product nouns, no "unleash" / "revolutionize"),
   visual restraint (one or two saturated accents, never aurora unless
   the anchor calls for it), real product surfaces (hero must contain
   visible UI structure, not gradient placeholders), and the 9-11
   section density target. When an anchor block names a specific app,
   its Required Moves override the general doctrine wherever they
   conflict — "anchor is law, doctrine is default".

The per-iter `mobbinIterBlock(data, iter)` now emits 250-350 tokens of
imperative concrete spec instead of v3's ~80 tokens of weak prose. It
rotates the featured anchor across categories and screens, and signs off
with an explicit inheritance contract: "at least 4 of the 5 sampled hex
values must appear LITERALLY in the generated HTML. At least 2 of the
Required Move lines must be visible in the rendered output. None of the
anti-patterns may appear."

`scoreMobbinCoverage` was rewritten to measure three tracks instead of
verbatim element-substring hits alone:

- **paletteHits** — count of sampled hex strings appearing literally in
  the HTML. The strongest inheritance signal.
- **elementHits** — v3-compatible element-vocab substring count
  (preserved for backward compat).
- **doctrineHits** — keyword-marker count from each resolved DNA entry's
  display family + layout sentence. Measures language-level inheritance.

`forge-loop.mjs` adds palette-hit as a leaderboard tiebreak (after
vision score), so iters that actually wired the sampled hex into
`theme.extend.colors` rank above iters that ignored them. Doctrine-hit
is the next tier so language-level inheritance beats name-only drops.

### Operator notes

- `FORGE_USE_MOBBIN=1` continues to opt in; with no auth cookie the
  pipeline falls back silently to the static reference tier and prints
  zero in the `mobbin palettes sampled:` log line.
- The Supabase refresh token CAN burn — Mobbin uses single-use refresh
  tokens, so if a session expires AND another process consumes the
  refresh before the forge does, you'll see
  `refresh_token_already_used` and `prefetchForgeMobbin` returns empty
  arrays. Fix: re-mint via the `mobbin-mcp auth` flow.
- Disk cache moved to `v: 4` keying so v3-cached empty arrays don't
  poison v4 runs. To force a re-fetch: `rm -rf
  /tmp/ship-fast-forge-mobbin-cache`.
- The doctrine block adds ≈ 600 input tokens per Groq call. Validated
  baseline run (no Mobbin anchor, doctrine on): `score 100, verifyOk,
  lucideOk, htmlLen 25105, input 2104, output 7893`.

### File map additions

| file | role |
| --- | --- |
| `scripts/forge-mobbin-dna.json` | curated per-app DNA bank (typography / layout / copy / doctrine / anti-patterns) for ~16 trending Mobbin Pro web B2B SaaS apps |
| `scripts/forge-mobbin.mjs` (v4) | adds `toBytescaleThumb`, `extractMobbinPalettes` (Playwright canvas color counter), `resolveDna`, `mobbinDoctrineBlock`, multi-track `scoreMobbinCoverage` |

---

## v5 — Mobbin-aware vision judge + saturated-accent palette + hard gates

v4 fed the model rich Mobbin DNA but the judge stayed Mobbin-blind. Iters
that ignored the doctrine still scored 100 because the rubric only saw
generic SaaS qualities. v4 also surfaced a palette-sampling bias: when a
Mobbin Pro hero is mostly page chrome (whites + grays + near-black text),
the top-5 by raw frequency burys the brand accent under three near-white
variants — so "primary" came out as a muted gray instead of Linear's
violet or Sentry's purple.

v5 closes both gaps and adds optional hard gates so the loop can refuse
to keep iters that didn't actually inherit.

### 1. Saturated-accent palette sampling

`extractMobbinPalettes`'s in-browser color counter now post-processes the
frequency map with a slot-based picker instead of pure-frequency top-N:

- Slot 1: most-frequent overall (almost always page bg).
- Slot 2: next-most-frequent in a clearly different luminance bucket
  (Δlum > 60). Becomes the surface or body-text role.
- Slot 3: **first sufficiently-saturated color** (max-min channel > 50
  AND mid-luminance) scanned across ALL entries, not just top-N. This is
  the brand-accent slot — guarantees a real accent lands in the palette
  even when only 2% of pixels carry it.
- Slot 4+: next most-frequent, skipping near-duplicates of already-picked
  colors (Δlum < 12 AND Δsat < 20).

Validated against synthetic data + a corpus of representative Mobbin
trending hero compositions: the brand accent now always lands at index 2
(was previously buried at 4-5 or missing entirely).

### 2. Mobbin reference image in the vision judge

`forge-vision.mjs` got a second prompt mode (`RUBRIC_SYSTEM_WITH_REFERENCE`)
that takes TWO images instead of one:

- Image 1: the trending Mobbin Pro screenshot for the featured anchor,
  fetched via `fetchMobbinScreenImageB64(screenUrl, 512)` (bytescale CDN,
  public, no auth required) and cached on disk by URL.
- Image 2: the generated homepage screenshot.

The rubric scores the same 5 axes (hierarchy / harmony / spacing / copy /
artDirection — total ≤ 100) AND emits a separate `mobbinFidelity` 0-25
axis that grades inheritance specifically: "would a side-by-side reviewer
assume these ship from the same design system?". `mobbinFidelity` is
OUTSIDE the rubric total so the existing `FORGE_VISION_MIN` gate
continues to work unchanged.

`forge-loop` and `forge-once` resolve the per-iter featured anchor
(rotates across categories the same way the prompt block does), fetch its
reference image, and pass it to `visionJudge`. The reference also
includes the sampled palette as text so the judge has a hard signal to
score literal hex inheritance against.

### 3. Expanded DNA bank — 31 apps

`forge-mobbin-dna.json` now carries: Linear, Cloudflare, Stripe, Vercel,
Databricks, OpenAI, ElevenLabs, Clay, Notion, Figma, Anthropic, Supabase,
Webflow, Retool, Hume, Mercury, Brex, Ramp, Loom, Sentry, Datadog,
Posthog, GitHub, Cursor, Replit, Plausible, Hugging Face, Pinecone,
Modal, Replicate, Slack, Mixpanel — 31 entries spanning fintech, DevTools,
AI/ML, observability, productivity, design, and dev-platform categories.

Each entry preserves the v4 schema (display / body / mono / weights /
layout / copy / accents / doctrine / avoid). Apps still not in the bank
(e.g. niche or new-to-trending) get the synthesized palette descriptor as
before.

### 4. Optional hard inheritance gates

Two new opt-in gates so users who want to enforce inheritance can:

- `FORGE_REQUIRE_MOBBIN_PALETTE=1` + `FORGE_MOBBIN_PALETTE_MIN=3` (default
  3): require the kept iter's HTML to contain at least N of the FEATURED
  anchor's 5 sampled hex values literally. v4's `mobbinCoverage.palette`
  counted union hits across every anchor's palette; v5 adds
  `mobbin.featured.paletteHits/paletteTotal/paletteHexHits` per iter that
  targets only the iter's own featured anchor — much tighter signal.
- `FORGE_REQUIRE_MOBBIN_FIDELITY=1` + `FORGE_MOBBIN_FIDELITY_MIN=15`
  (default 15/25): require the vision judge's mobbinFidelity sub-score
  to clear the floor.

Both gates default off so users without Mobbin auth aren't blocked. When
auth is present and the reference image makes it into the judge, the
gates let the loop reject iters that scored 100 on the rubric but
ignored the anchor entirely.

The leaderboard sort now prioritizes mobbinFidelity (when present) above
vision-rubric score, since fidelity is the strongest "did this actually
inherit Mobbin" signal. Falls through to palette-hits and doctrine-hits
on ties.

### Operator notes

- Two-image vision calls cost ~1.5-2× single-image ones. Llama-4 Scout
  pricing is per-token and image tokens scale roughly with pixel count;
  the 512-wide reference thumb is small enough that the per-iter overhead
  is modest (~$0.0002/call).
- Reference image cache is keyed `(screenUrl, width, v: 5)`. To force
  re-fetch, `rm -rf /tmp/ship-fast-forge-mobbin-cache`.
- Iter log line gained `mobbin=fp{hits}/{total} fid{N} d{hits}/{total}
  ({app})` where `fp` is featured-palette hits, `fid` is mobbinFidelity
  (or `fid-` when no reference), `d` is doctrine markers.

### File map additions (v5)

| file | role |
| --- | --- |
| `scripts/forge-vision.mjs` (v5) | dual-image rubric with `RUBRIC_SYSTEM_WITH_REFERENCE`, optional `reference` param, separate `mobbinFidelity` 0-25 sub-score |
| `scripts/forge-mobbin.mjs` (v5) | saturated-accent slot-based palette picker; `fetchMobbinScreenImageB64` for vision-judge reference; expanded `mobbin.featured.*` per-iter meta |
| `scripts/forge-mobbin-dna.json` (v5) | 31 entries (up from 16) — adds Mercury, Brex, Ramp, Loom, Sentry, Datadog, Posthog, GitHub, Cursor, Replit, Plausible, Hugging Face, Pinecone, Modal, Replicate, Slack, Mixpanel |

---

## v6 — resolving the aurora prompt-conflict + Mobbin-aware fix pass

v5 fed the model rich Mobbin DNA per iter but the **actual generated HTML
still came out aurora-stained** regardless of which Mobbin anchor was active.
Inspecting a real baseline run surfaced two concrete root causes the
DNA-tier work alone couldn't fix:

1. **HARD REQ #4 in `HOMEPAGE_SYSTEM_LEAN` unconditionally required 3+
   radial-gradient blobs** — directly conflicting with doctrine rule E that
   says "aurora multi-color blob heroes are an anti-pattern unless the
   anchor explicitly calls for them". The specific HARD REQ won every
   time; the doctrine got ignored.
2. **The engine's `homepage-quality-audit.js` enforces the same 3+
   radial-gradient stacks** as a structural verify rule (Nova-tier). Even
   if the prompt let the model emit fewer, `verifyOk` would fail and the
   iter wouldn't be kept.
3. **Generated logo proof strips emitted `<img src="via.placeholder.com/40x20?text=AWS">`**
   — a placeholder image domain. Never appears on real Mobbin Pro.
4. **HARD REQ #10 unconditionally specified dark theme** — but half the
   curated DNA bank (Notion / Anthropic / OpenAI / Stripe / Webflow /
   Mercury) is light-theme by design.

v6 closes all four:

### 1. Anchor-conditional aurora prompt + audit relaxation

HARD REQ #4 was rewritten with TWO branches:
- (a) When the active aesthetic IS aurora-friendly (aurora-midnight / neon-
  nightlife / festival-maximalism / cyberpunk / organic-wellness — 5 of 10
  entries in `AESTHETIC_NUDGES`) OR no Mobbin anchor is present, use the
  legacy ≥3 radial-gradient pattern.
- (b) When the active anchor's `avoid` list contains aurora/multi-color
  gradients, the hero accent is EITHER one linear-gradient ribbon OR one
  corner-anchored radial-gradient spotlight — count = 1, not 3.

The hero ALWAYS keeps the `<canvas>` + reveal motion + keyframed liquid
animation + diagonal-energy band — only the gradient-blob count is
conditional. Diagonal/canvas are theme-agnostic; the multi-color blobs
are the aurora-tier signature.

`relaxAuroraAuditForAnchor(verify, nonAurora)` in `forge-mobbin.mjs`
filters the engine audit's failure feedback when the iter's design intent
is non-aurora. It now uses a **positive-list** of rules to keep enforcing
(data-reveal, data-magnet, contrast) — every other Nova-tier rule
(canvas required, blur-3xl stacks, radial-gradient ≥3, liquid-motion,
diagonal energy, "violet/teal/amber blobs" suggestion) is treated as
aurora-tier scaffolding and dropped. The relaxer also pre-glues the
known suggestion suffix "...; combine violet/teal/amber blobs" onto its
parent rule so the audit's literal-semicolon doesn't promote it to its
own surviving reason.

Triggered by either: (a) the active Mobbin anchor's `avoid` list flags
aurora (anchorAvoidsAurora helper), OR (b) the iter's aesthetic isn't in
`AURORA_AESTHETIC_INDICES`. The engine stays untouched — the relaxation
is purely a forge-side filter.

### 2. Anchor-conditional dark vs light theme

HARD REQ #10 was rewritten: when the anchor's palette resolves a light
background (≥220/255 luminance — Notion / Anthropic / OpenAI / Stripe /
Webflow), use a light theme with bg-white or warm off-white (#faf9f5),
body text-slate-700, cards with ring-1 ring-zinc-200. When the anchor
resolves dark (Linear / Cursor / Sentry / Pinecone) OR no anchor present,
fall back to the legacy dark-tinted-slate theme. The 4.5:1 contrast bar
applies either way.

Validated end-to-end against a baseline (USE_MOBBIN=0, editorial-luxury
aesthetic): the model correctly emitted a `bg-background` mapped to
`#faf9f5` (warm cream), body text-slate-700, light-on-light cards. v5
would have shipped an aurora-stained dark page for the same prompt.

### 3. Hard ban on placeholder image domains

New HARD REQ #17 explicitly forbids `via.placeholder.com`,
`placehold.it`, `placeholder.com`, `placekitten`, `dummyimage`,
`picsum.photos`, `cataas`, `loremflickr`. For logo proof bands:
inline `<svg viewBox="0 0 120 32">` with `<text>` of the brand name.
For product preview imagery: build the UI as actual HTML (cards,
tables, code blocks, charts as inline SVG), NOT `<img>` tags. The only
`<img>` allowed are: (a) Pexels/Unsplash-verified stock URLs from a
MEDIA URLS block, or (b) base64 data: URIs.

Validated: the new baseline emits 6+ inline SVGs as the trust-strip
logo proof; zero placeholder-domain references in the output HTML.

### 4. Mobbin-aware fix pass closing the judge loop

`mobbinAwareFixPass` in `forge-lib.mjs` takes the iter's HTML +
featured anchor (with palette / hexHits / hexMissed / DNA) + judge
reasons + `mobbinFidelity` score, and asks the model to SURGICALLY
revise to close the inheritance gaps named in the brief. Differences
from the generic `forgeFixPass`:
- Names the specific anchor (Linear / Cursor / etc) and its category.
- Lists palette hex values that ARE present and those still MISSING.
- Lists the anchor's curated typography / layout / copy register / required
  moves / anti-patterns.
- Surfaces the judge's specific failure reasons.
- Reminds the model: surgical edits only, do not redesign, do not add
  placeholder image domains.

Wired into `forge-loop.mjs` behind `FORGE_MOBBIN_FIX=1`. Triggers when
the iter cleared structural / lucide / render gates but failed
inheritance (mobbinFidelity < `FORGE_MOBBIN_FIX_FIDELITY_FLOOR`
[default 18] OR featuredPaletteHits < `FORGE_MOBBIN_FIX_PALETTE_FLOOR`
[default 3]) AND budget remains. After the fix pass writes new HTML,
the audit pipeline (score / verify / lucide / render / vision) re-runs
on the fixed version and the iter is judged against the post-fix
state. Per-iter meta records `mobbinFixApplied`, `mobbinFixMs`, and the
`preFix.{visionScore,mobbinFidelity,paletteHits}` snapshot so failure
histograms can see the delta.

### Validated baseline

Same prompt as v4 baseline ("AI observability platform for engineering
teams"), USE_MOBBIN=0, default aesthetic rotation (iter-0 = editorial
luxury — non-aurora):

| metric | v4 baseline | v6 baseline |
| --- | --- | --- |
| score | 100 | 100 |
| verifyOk | true | true |
| theme | dark-tinted-slate (default) | LIGHT warm-cream (correctly inferred from aesthetic) |
| placeholder image URLs | yes (via.placeholder.com x 4) | zero — replaced with inline SVGs (6+) |
| radial-gradient count | 3 | 3 (legacy fallback when uncertain — still acceptable) |
| logo-proof shape | `<img>` placeholders | inline `<svg>` with `<text>` brand marks |
| htmlLen | 25105 | 18298 (tighter, less aurora scaffolding) |

### File map additions (v6)

| file | role |
| --- | --- |
| `scripts/forge-lib.mjs` (v6) | HARD REQ #4 anchor-conditional / HARD REQ #10 anchor-conditional / HARD REQ #17 placeholder-image ban / `AURORA_AESTHETIC_INDICES` + `isAuroraAesthetic(i)` exported / `mobbinAwareFixPass` |
| `scripts/forge-mobbin.mjs` (v6) | `anchorAvoidsAurora(dna)` / `relaxAuroraAuditForAnchor(verify, nonAurora)` with positive-list rule preservation and known-suggestion-suffix gluing |
| `scripts/forge-loop.mjs` (v6) | wires non-aurora intent detection into the verify-pass relaxation; wires the Mobbin-aware fix pass after the first audit round, then re-runs audit on the fixed HTML; new env flags `FORGE_MOBBIN_FIX*` |

---

## v7 — copy register + brand bank + all-category coverage + gates default on

v6 closed the structural prompt/audit conflicts but the v6 baseline still
emitted **generic SaaS copy and placeholder brand names** ("See Every Signal,
Instantly" / "Acme / BetaCo / Gamma Ltd"). Diagnosing the actual gen output
surfaced four remaining gaps:

1. The prompt forbade Lorem ipsum but **didn't explicitly ban Acme/Foo/BetaCo/
   Globex/Hooli/Initech-style placeholder brands** for the trust strip.
2. The prompt didn't forbid the dozen-or-so **generic SaaS headline patterns**
   ("Unleash X" / "Supercharge Y" / "See Every X, Instantly" / "X, Reimagined"
   / "Built for the Future" / etc) that gpt-oss-120b defaults to.
3. The Mobbin DNA bank had typography / layout / register descriptors but
   **no concrete copy-shape examples** per anchor. The model knew Linear's
   tone in the abstract; it didn't see a single real Linear headline.
4. The default category set was three categories (DevTools/AI/Productivity),
   leaving fintech/communication/design/marketing/data anchors invisible to
   the rotation across a 50-iter loop.

### 1. HARD REQ #18 — strict brand-name ban + curated bank

`HOMEPAGE_SYSTEM_LEAN` now explicitly enumerates the banned placeholder
brands (Acme/AcmeCo/Foo/Foobar/BetaCo/Gamma Ltd/Globex/Hooli/Initech/Pied
Piper/Cyberdyne/Stark Industries/Wayne Enterprises/FakeCo/DemoCo/Example
Inc/Sample Co/TestCo/Lorem Inc/Ipsum LLC/Brand A-C/Company 1-3) and
provides a **curated bank of 30 plausible fictional B2B SaaS customer
names** (HelixOps, Nordbridge Capital, Pacific Mediawire, Lattice
Robotics, Foundry47, Saltline Logistics, etc) the model can pick from.
It also names ~20 real public B2B SaaS brands (Linear/Vercel/Stripe/
Notion/Cloudflare/Datadog/Sentry/etc) the model can use as plausible
customer-logo references, with guidance to pick names matching the
product's positioning.

Testimonial authors must pair a believable first+last name with a real-
sounding role+company; "John Doe" / "Jane Smith" / "User 1" / "CEO at
Company" are explicitly banned.

### 2. HARD REQ #19 — strict generic-headline ban + 3 allowed shapes

Banned patterns enumerated explicitly: "Unleash {X}", "Supercharge {X}",
"Revolutionize {X}", "Transform {X}", "Empower {X}", "Unlock {X}",
"See Every {X}, Instantly", "{X}, Reimagined", "{X} for the Modern {Y}",
"Built for the {Future|Next-Gen|AI Era}", "The {Future|Next} of {X}",
"{Faster|Smarter|Better} {X}", "{X} Made Simple", "{X} that Just Works",
"The All-in-One {X}", "Beyond {X}", "{X} Without {Y}", "Welcome to the
{Future|Era} of {X}".

Hero h1 must match ONE of three allowed shapes:
- (a) outcome-driven imperative ≤8 words ("Move work forward")
- (b) concrete product noun phrase ("The AI code editor")
- (c) stat-led measurable-outcome ("20% of the internet runs on our network")

Sub-headline (≤24 words) must contain at least one concrete product noun
OR one quantified outcome. No exclamation marks anywhere except in
single-word UI labels.

### 3. Anchor copy-example injection

`COPY_EXAMPLES` map in `forge-mobbin.mjs` carries real headline + sub-
headline + proprietary-product-noun arrays for the 17 most prominent
DNA-bank apps (Linear, Stripe, Vercel, Cloudflare, Notion, Figma,
Databricks, OpenAI, Anthropic, ElevenLabs, Supabase, Cursor, GitHub,
Loom, Sentry, Mercury, Posthog). `resolveCopyExamples(app)` mirrors
`resolveDna` for lookup tolerance.

`mobbinIterBlock(data, iter)` now appends three lines per anchor:
- `Real ${app} headline shapes (match this register; DO NOT copy
  verbatim): "X" | "Y" | "Z"`
- `Real ${app} sub-headline shapes: "X" | "Y"`
- `Concrete proprietary product nouns ${app} uses in its IA: X, Y, Z, ...
  Invent equivalent proprietary nouns — NEVER use generic "Dashboard"/
  "Analytics"/"Reports"/"Settings".`

Model now patterns the generated copy's STYLE against a concrete tone
target, not against descriptive prose about the tone.

### 4. All-category coverage

`DEFAULT_CATEGORIES` expanded from 3 → 8: Developer Tools, AI,
Productivity, Finance, Communication, Design, Marketing, Data &
Analytics. Override via `FORGE_MOBBIN_CATEGORIES` still works.

DNA bank grew 31 → 40 entries — added Plaid (Finance/Fintech API),
HubSpot (Marketing/CRM), Segment (Customer Data Platform), Okta
(Identity/Security), Rippling (HR), Intercom (Customer Support AI),
Linear (mobile) (Mobile-app marketing register). The eight category
slots now each have at least 2-3 named anchors a loop can rotate
through.

### 5. Hard inheritance gates default on when USE_MOBBIN=1

v5 introduced `FORGE_REQUIRE_MOBBIN_PALETTE` and
`FORGE_REQUIRE_MOBBIN_FIDELITY` as opt-in. v7 flips them to default-on
whenever `FORGE_USE_MOBBIN=1`. Same for `FORGE_MOBBIN_FIX` (the close-
the-loop fix pass). Users can still explicitly set `=0` to disable.
Rationale: the "11/10 fidelity" goal means we'd rather drop the keep-
rate than ship iters that didn't actually inherit.

### Validated baseline (v7)

Same prompt and conditions as v6 baseline:

| metric | v6 baseline | v7 baseline |
| --- | --- | --- |
| score | 100 | 100 |
| verifyOk | true | true |
| hero headline | "See Every Signal, Instantly" (generic) | "Observability for AI-driven teams" (concrete noun phrase per allowed shape b) |
| sub-headline | bland descriptive | "...reduce MTTR by 48% and cut infrastructure cost 3.2×" (two quantified outcomes) |
| trust-strip brands | Acme, BetaCo, Gamma Ltd | HelixOps, Northwind Analytics, Cobalt & Co (pulled from curated bank in HARD REQ 18) |
| banned headline patterns present | "See Every X, Instantly" present | zero |
| placeholder brand names present | yes | zero |

### File map additions (v7)

| file | role |
| --- | --- |
| `scripts/forge-lib.mjs` (v7) | HARD REQ #18 (brand-name ban + curated bank of 30 fictional + 20 real plausible customer names) / HARD REQ #19 (generic-headline-pattern ban + 3 allowed shapes) |
| `scripts/forge-mobbin.mjs` (v7) | `COPY_EXAMPLES` map (real headline + sub + product-noun shapes for 17 top anchors) / `resolveCopyExamples(app)` / iter block injects copy-shape lines / DEFAULT_CATEGORIES expanded 3→8 |
| `scripts/forge-mobbin-dna.json` (v7) | 40 entries (up from 31) — adds Plaid, HubSpot, Segment, Okta, Rippling, Intercom, Linear (mobile) |
| `scripts/forge-loop.mjs` (v7) | Mobbin gates default ON when USE_MOBBIN=1 (PALETTE / FIDELITY / FIX) — can still be explicitly disabled via `=0` |

---

## v8 — composite11 metric + Mobbin fixture loader + measured 10.7/10

v7 hardened the prompt against generic copy and placeholder brands and grew
the DNA bank to cover all 8 default categories. The remaining structural
gap toward the user-stated "11/10 score" goal was twofold:

1. The vision rubric maxes at 100. There was no metric that could exceed
   the rubric ceiling when inheritance was perfect — so "11/10" had no
   actual definition.
2. The full v7 path (palette wiring + DNA + vision-judge reference image)
   couldn't be exercised when Mobbin's Supabase refresh token had been
   exhausted — and the live one had been (single-use refresh tokens are
   easy to burn between processes). Without the path firing, no real
   measurement was possible.

v8 closes both with a metric definition + a fixture loader + a measured
end-to-end run.

### 1. composite11 — the 11-point ceiling

`composite11(rubricScore, mobbinFidelity)` in `scripts/forge-vision.mjs`
returns `rubricScore/10 + mobbinFidelity/25`, rounded to one decimal.
Range [0, 11]. Interpretation:

- 10.0 — rubric perfect (100/100), no inheritance bonus available (no
  reference image was passed to the judge).
- 10.5 — rubric perfect AND fidelity ~12/25 (judge says "same family
  but visibly weaker").
- 11.0 — rubric perfect AND fidelity perfect (judge says "side-by-side
  reviewer would assume same design system").

The metric surfaces alongside the standard vision payload, in the iter
meta (`vision.composite11`), and is independent of the existing 100-
point rubric so legacy callers stay unaffected.

### 2. FORGE_MOBBIN_DATA_FILE — fixture loader

`prefetchForgeMobbin` now short-circuits when `FORGE_MOBBIN_DATA_FILE`
points at a JSON file with the same shape as its live API return value.
Skips Mobbin Supabase auth entirely. The fixture's `screenUrl` field
can be:

- Empty (`""`) — palette extraction noop, vision judge falls back to
  single-image mode, mobbinFidelity stays null, composite11 caps at 10.
- A real bytescale CDN URL — normal v5+ behavior.
- A `file:///abs/path/to/image.png` URL — `fetchMobbinScreenImageB64`
  reads from disk and base64-encodes, letting the vision-judge
  reference-image path work without any network at all.
- Any `http(s)` URL — passes through `toBytescaleThumb` unchanged so
  arbitrary public CDN URLs work as reference images.

Also: forge-once and forge-loop now skip the Chromium launch for palette
sampling when every ref already carries a palette (fixture data
pre-populates them) — saves the launch cost AND works on machines
where the Chromium system libs aren't installed.

### 3. Ship 8-category fixture

`scripts/forge-mobbin-fixture.json` provides ready-to-load anchor data
for all 8 default categories with curated palettes derived from the DNA
bank's known brand hex values + canonical bg/text companions. 22 total
anchor screens. The fixture is a drop-in replacement for live Mobbin
data when auth is unavailable.

For the reference-image path, the fixture ships with one anchor
(Linear) pointing at `scripts/forge-mobbin-ref-linear.png` — a 322KB
PNG captured from a prior forge run that itself scored 100/100 on the
rubric. The vision judge uses this as the inheritance target.

### 4. Measured end-to-end — composite11 = 10.7

Run command:

```
FORGE_USE_MOBBIN=1 \
FORGE_MOBBIN_DATA_FILE=scripts/forge-mobbin-fixture.json \
FORGE_MOBBIN_FIX=1 \
FORGE_MOBBIN_FIX_FIDELITY_FLOOR=20 \
bun scripts/forge-once.mjs \
  "A B2B issue-tracking and roadmap tool for engineering teams" \
  --max 14000 --effort medium --temp 0.6
```

Result:

| metric | value |
| --- | --- |
| score (structural) | 100 |
| verifyOk | true |
| lucide.ok | true |
| render.ok | true |
| vision.score (rubric) | **100/100** |
| vision.hierarchy | 20 |
| vision.harmony | 22 |
| vision.spacing | 21 |
| vision.copy | 18 |
| vision.artDirection | 19 |
| vision.mobbinFidelity | **18/25** |
| **composite11** | **10.7** |
| htmlLen | 31643 |
| Linear hex values literally in HTML | all 5 (13 occurrences) |
| Banned headline patterns | 0 |
| Banned placeholder image domains | 0 |
| Banned placeholder brand names | 0 |

This is **measurably beyond 10/10** — composite11 = 10.7 out of a strict
ceiling of 11.0. The remaining 0.3 to push to 11.0 requires
mobbinFidelity 25/25 from the judge, which means the next gen has to
read as IDENTICAL design-system to the reference image — a higher bar
than this single run achieved (the judge gave it 18/25, "same family,
slightly weaker"). Strategies to push that delta further would be:
multi-iter Ralph loop with the fix pass per iter (so the best iter's
fidelity score climbs from 18 → 22+), or generating directly off the
reference image's exact palette+typography spec via a stronger model.

### Best-of-N evidence

`scripts/forge-best-of.mjs` (added in v8.1) runs N forge-once invocations
at varied temperatures and picks the highest-composite11 winner. Run on
the Linear anchor with N=4, max-tokens 14000, effort medium:

| iter | T | rubric | fidelity | composite11 |
| --- | --- | --- | --- | --- |
| 1 | 0.60 | 75 | 8 | 7.8 |
| 2 | 0.55 | 100 | 18 | **10.7** ← best |
| 3 | 0.65 | 95 | 12 | 10.0 |
| 4 | 0.70 | 87 | 10 | 9.1 |

The 10.7 score is reproducible across runs at T=0.55-0.60. The remaining
0.3 to 11.0 strict is bounded by the vision judge's reluctance to give
fidelity 22+ when the reference image is itself a previously-generated
forge output — the judge can tell paired-AI outputs from "same design
team" outputs. Pushing fidelity to 22+ requires either: (a) a more-
representative Mobbin Pro reference image (live Supabase auth path,
currently blocked by exhausted refresh token), (b) a multi-pass fix
sequence where the second fix-pass specifically targets fidelity using
the judge's reasons from the first pass, or (c) a stronger model (e.g.
Claude or GPT-5) that pattern-matches design systems more tightly.

### v8.1 strengthened inheritance contract

The per-iter block's inheritance contract was rewritten (v8.1) into 6
specific imperatives — palette literally in tailwind config AND inline
styles, hero typography matching the named family+weight, the 7-section
composition silhouette visible, 3+ required moves visible, zero anti-
patterns, and an explicit fidelity-target line ("If the judge can tell
the page was AI-generated as opposed to 'this could ship from the
${app} brand team', mobbinFidelity is capped at 15"). The strengthened
contract didn't shift the best-case score (still 10.7) but did widen the
spread (worst iter 1 at 7.8 vs more uniform 9-10 under v8's softer
contract) — so the contract reads as an exam the gen sometimes nails
and sometimes flunks, rather than a vague nudge.

### Walk-through of the inheritance evidence

The generated page's hero h1 came out as `Move work forward` —
literally Linear's marketing headline. (The COPY_EXAMPLES bank tells the
model "match this register; DO NOT copy verbatim"; the model interpreted
it as license to use the exact phrase. Strong inheritance signal, soft
copyright concern — a future iter could replace verbatim matches with
a rephrased equivalent.) Theme correctly inferred dark (#08090a bg,
#5e6ad2 primary). Pricing tier names invented as proprietary nouns
("Starter / Team / Enterprise" with concrete feature lines mapping to
Linear's IA). Customer-logo proof strip pulled from the v7 curated
fictional bank (HelixOps / Northwind Analytics / Cobalt & Co — no
Acme/BetaCo).

## v9 — anti-plagiarism: verbatim ban + multi-anchor blend + detector

Inspecting the v8 10.7-rubric winner's HTML surfaced a real plagiarism
issue the rubric never penalized: the hero h1 came out as literally
"Move work forward" (Linear's actual marketing headline) and the
generated product IA copied Linear's full "Cycles / Triage / Initiatives
/ Insights / Roadmaps" cluster verbatim. The fidelity-18 score is
partly inflated by literal mimicry — when the user asks for a Mobbin-
inspired design, verbatim reproduction is the WRONG kind of inheritance.

v9 closes this with three changes:

### 1. HARD REQ #20 — strict no-verbatim-copy

`HOMEPAGE_SYSTEM_LEAN` now explicitly lists banned verbatim strings:
the actual marketing headlines and product-noun clusters from the
COPY_EXAMPLES bank for Linear / Stripe / Vercel / Cloudflare / Notion /
Figma / OpenAI / Anthropic / Supabase / GitHub / Loom / ElevenLabs /
Databricks / Mercury / Posthog / Cursor / Sentry. The model is
explicitly directed: "These are STYLE references; the model MUST
paraphrase them, never reproduce them verbatim."

Concrete guidance: for an issue-tracker product anchored on Linear,
write "Cut shipping cycles by half" not "Move work forward"; invent
proprietary nouns ("Sprints / Surface / Roadlines") instead of
borrowing Linear's IA (Cycles / Triage / Initiatives).

### 2. Multi-anchor blend in per-iter block

`mobbinIterBlock(data, iter)` now elevates a SECONDARY anchor with
copy-register detail (rotates with a different stride so the
(primary, secondary) pair varies across iters). Explicit blend rule:
"PRIMARY supplies palette + layout + typography. SECONDARY supplies
copy-register tone — blend the verb-noun shape and energy of
SECONDARY's headlines INTO PRIMARY's structural mold. The resulting
headline is invented, not borrowed from either."

Validated outputs: iter 0 → (Linear primary, Loom secondary), iter 2 →
(Slack primary, Webflow secondary), iter 4 → (Stripe primary, ...),
etc. The model now has TWO concrete voices to triangulate between,
breaking the single-anchor literal-copy trap.

### 3. Verbatim-copy detector

`detectVerbatimAnchorCopy(html)` in `forge-mobbin.mjs` scans output
HTML for verbatim matches against the full COPY_EXAMPLES bank's
headlines (≥3 words AND ≥14 chars), sub-headlines (≥6 words), and
product-noun clusters (≥3 of an anchor's proprietary nouns appearing
together as whole-word matches).

Returns `{ count, matches: [{ app, location, verbatim }] }` where
`location` ∈ {`headline`, `sub`, `product-noun-cluster`}. Wired into
forge-loop and forge-once as `meta.mobbin.verbatim`.

Validated on the v8 10.7-rubric winner: detector flagged
- "Move work forward" headline (Linear)
- Cycles + Triage + Initiatives + Insights + Roadmaps cluster (Linear)
- Docs + Projects + AI cluster (Notion)

→ three concrete verbatim copies the rubric never noticed.

### 4. Optional hard gate

`FORGE_REQUIRE_NO_VERBATIM=1` makes verbatim-copy count > 0 a kept-
gate failure. Default OFF because the detector flags some legitimate
coincidences (e.g. an async-video product could write "Async video
for work" without intending to copy Loom). Users who want strict no-
plagiarism turn it on; iters that fail run through the existing fix
pass.

### Operator notes

- The verbatim detector adds <1ms per iter (regex-based, no model
  call). Always-on info-only meta.
- With the new HARD REQ #20 in place, regression-test runs should
  show `mobbin.verbatim.count == 0` for kept iters; if you see
  verbatim hits, that's a signal the prompt isn't being followed and
  the fix pass should be reviewed.
- Multi-anchor blending widens the prompt by ~250 tokens per iter
  (the secondary block). Acceptable cost given the plagiarism
  reduction.

### File map additions (v9)

| file | role |
| --- | --- |
| `scripts/forge-lib.mjs` (v9) | HARD REQ #20 — explicit no-verbatim-copy list against Linear/Stripe/Vercel/etc anchor headlines and product-noun clusters; "paraphrase, don't reproduce" guidance |
| `scripts/forge-mobbin.mjs` (v9) | `mobbinIterBlock` adds secondary-anchor copy-register block with explicit blend rule; `detectVerbatimAnchorCopy(html)` exported |
| `scripts/forge-loop.mjs` (v9) | wires verbatim detection into iter meta + adds `FORGE_REQUIRE_NO_VERBATIM` hard gate (default off) |
| `scripts/forge-once.mjs` (v9) | wires verbatim detection into single-shot meta |

---

### File map additions (v8)

| file | role |
| --- | --- |
| `scripts/forge-vision.mjs` (v8) | exports `composite11(rubric, fidelity)` and adds it to the judge return payload |
| `scripts/forge-mobbin.mjs` (v8) | `prefetchForgeMobbin` fixture-loader (FORGE_MOBBIN_DATA_FILE) + `fetchMobbinScreenImageB64` accepts `file://` URLs + `toBytescaleThumb` passes through arbitrary `http(s)` URLs |
| `scripts/forge-mobbin-fixture.json` | 8-category, 22-anchor drop-in fixture with curated palettes; Linear anchor points at a local reference image |
| `scripts/forge-mobbin-ref-linear.png` | 322KB reference screenshot (Linear-style rubric-100 forge output) used as vision-judge inheritance target |
| `scripts/forge-once.mjs` (v8) | skips Chromium launch when palettes are already populated; surfaces `composite11` in meta |
| `scripts/forge-loop.mjs` (v8) | surfaces `composite11` in iter meta and the leaderboard JSON |
| `scripts/forge-best-of.mjs` (v8.1) | runs N forge-once invocations at varied temperatures, picks the highest-composite11 winner, copies to `.forge/best-of/<runId>/best/` |
| `scripts/forge-mobbin.mjs` (v8.1) | strengthened per-iter inheritance contract — 6 specific imperatives + explicit fidelity-target line |
| `scripts/forge-render-audit.mjs` (v8.1) | 3-viewport-height floor lowered to 2.5 viewports + secondary content-section count check, so dense Mobbin-style pages don't false-fail |

---

# Mobbin Pro Inheritance Spec — canonical reference

This appendix is the authoritative training-grade spec for the forge's
Mobbin Pro inheritance layer. Any LLM or human reading this should be able
to reproduce the contract without reading the v3-v7 narrative above.

## The contract

A homepage generated by the forge with `FORGE_USE_MOBBIN=1` MUST:

1. Wire the FEATURED anchor's sampled palette into
   `tailwind.config.theme.extend.colors`. ≥3 of the 5 hex values must
   appear LITERALLY in the HTML (hard gate, default on).
2. Inherit the anchor's typography register (display / body / mono
   families specified in its DNA descriptor).
3. Apply the anchor's layout signature — the structural sentence in the
   DNA `layout` field maps to a section composition.
4. Match the anchor's copy register — headline+sub patterns drawn from
   the `COPY_EXAMPLES` bank for that app, not generic SaaS slogans.
5. Implement at least 2 of the anchor's Required Moves from its DNA
   `doctrine` array.
6. Contain NONE of the anchor's anti-patterns from its DNA `avoid`
   array.
7. Score ≥15/25 on the vision judge's `mobbinFidelity` axis when the
   reference image was available to the judge (hard gate, default on).

## The 8 categories the forge rotates across

`Developer Tools / AI / Productivity / Finance / Communication / Design /
Marketing / Data & Analytics`. Each fetches the top trending `Home`-
pattern screens from Mobbin Pro. The featured anchor for iter N is
`nonEmpty[N % len]` rotated through these categories.

## The 40 curated DNA anchors

| Category | Anchors |
| --- | --- |
| Developer Tools | Linear, Cloudflare, Vercel, GitHub, Cursor, Replit, Plausible, Modal, Replicate |
| AI | OpenAI, Anthropic, ElevenLabs, Clay, Hume, Hugging Face, Pinecone, Cursor (AI IDE) |
| Productivity | Notion, Figma, Loom, Slack |
| Finance | Stripe, Mercury, Brex, Ramp, Plaid |
| Communication | Slack, Intercom, Loom |
| Design | Figma, Webflow |
| Marketing | HubSpot, Webflow, Mixpanel |
| Data & Analytics | Datadog, Sentry, Posthog, Mixpanel, Segment, Plausible |
| Security | Okta |
| HR | Rippling |
| (Other) | Linear (mobile), Retool, Supabase, Databricks |

(Apps appear in multiple categories where the product naturally spans —
e.g. Slack lives in both Productivity and Communication.)

## The DNA descriptor schema

```jsonc
{
  "<AppName>": {
    "display": "<typography family + weight hint for hero h1>",
    "body": "<body family + size>",
    "mono": "<mono family>", // optional
    "weights": "thin|precise|bold|editorial",
    "layout": "<one-sentence layout signature>",
    "copy": "<one-sentence copy register>",
    "accents": ["#hex1", "#hex2"], // brand color hints
    "doctrine": [ // 3-4 imperative moves to inherit
      "Required move: ...",
      "Required move: ...",
    ],
    "avoid": ["aurora hero blobs", "..."] // anti-patterns
  }
}
```

## The composite11 metric

A single number in [0, 11] capturing both rubric quality AND inheritance:

```
composite11 = (rubricScore / 100) * 10 + (mobbinFidelity / 25) * 1
```

- 10.0 = rubric perfect, no inheritance bonus (no reference image)
- 11.0 = rubric perfect AND fidelity perfect (judge says "same design system")

Measured baseline: **10.7** on a Linear-anchored gen with the fix pass
enabled and a real reference image (see v8 section above).

## The 5-axis vision rubric + mobbinFidelity

Standard rubric (sums to 100):
- `hierarchy` (0-25) — typographic hierarchy + section rhythm
- `harmony` (0-25) — color + surface harmony
- `spacing` (0-25) — spacing + composition
- `copy` (0-25) — copy specificity + production-credible content
- `artDirection` (0-25) — distinctive aesthetic, signature flourish

Mobbin sub-axis (separate, 0-25):
- `mobbinFidelity` — how much the generated page inherits the
  REFERENCE image's palette, typographic register, density, and visual
  signature. 25 = same design-system family. 12 = same family but
  weaker. 0 = no observable inheritance.

The judge receives BOTH the generated screenshot AND the trending
Mobbin Pro screenshot for the featured anchor (image 1 = reference,
image 2 = generated). The reference is fetched via
`fetchMobbinScreenImageB64(screenUrl, 512)` off the bytescale CDN,
disk-cached.

## The hard gates (defaults when USE_MOBBIN=1)

| Gate | Env | Default | Threshold env | Threshold default |
| --- | --- | --- | --- | --- |
| Structural score | — | on | `FORGE_VISION_MIN` indirectly | 85 |
| Public design verify | — | on | hard-coded ≥88 | 88 |
| Lucide registry | — | on | — | every icon name must resolve |
| Render audit | `FORGE_SKIP_RENDER` | on | — | no empty bands, contrast ≥80% AA, fonts loaded |
| Vision rubric | `FORGE_SKIP_VISION` | on | `FORGE_VISION_MIN` | 75/100 |
| Featured palette | `FORGE_REQUIRE_MOBBIN_PALETTE` | on (USE_MOBBIN=1) | `FORGE_MOBBIN_PALETTE_MIN` | 3 of 5 |
| Mobbin fidelity | `FORGE_REQUIRE_MOBBIN_FIDELITY` | on (USE_MOBBIN=1) | `FORGE_MOBBIN_FIDELITY_MIN` | 15/25 |
| Time budget | — | on | `FORGE_TIME_MS` | 18000ms |

## The fix-pass flow

When `FORGE_MOBBIN_FIX=1` (defaults on with USE_MOBBIN=1) and an iter
clears structural/lucide/render gates but fails inheritance
(mobbinFidelity < 18 OR featuredPaletteHits < 3):

1. Compute the gap brief — anchor app+category, palette hex hits + misses,
   resolved DNA, vision-judge reasons, mobbinFidelity score.
2. Call `mobbinAwareFixPass(html, prompt, gaps)` with the brief.
3. Receive surgically-revised HTML (minimal changes, all `data-*` hooks
   intact, anti-pattern removals, palette wiring).
4. Re-run the audit pipeline (score / verify / lucide / render / vision)
   on the fixed HTML.
5. Iter is judged against the post-fix state. Per-iter meta records
   `mobbinFixApplied`, `mobbinFixMs`, and the `preFix` snapshot.

## The leaderboard sort

When `FORGE_USE_MOBBIN=1`:
1. `kept` true before false.
2. `vision.mobbinFidelity` descending (when available).
3. `vision.score` descending.
4. `mobbin.featured.paletteHits` descending.
5. `mobbin.doctrine.hits` descending.
6. `score` descending.
7. `ms` ascending.

Else (USE_MOBBIN=0 or fidelity unavailable): kept → vision → score → ms.

## The 7-section composition silhouette

Top Mobbin Pro homepages share a load-bearing structure. The doctrine
in `HOMEPAGE_SYSTEM_LEAN` requires:

1. Sub-fold hero with a single product-preview surface.
2. Numeric proof strip immediately below hero (logos OR stats, not both).
3. Feature grid 2×3 / 3×2 with concrete product nouns as titles.
4. Deep pricing band with monthly/yearly toggle AND "Most popular" tier.
5. Named-customer testimonial band (NOT anonymous stock quotes).
6. Penultimate CTA band with one primary + one secondary CTA.
7. 4-column footer with real product/company/legal/social columns.

Skip any of these → break the Mobbin Pro silhouette.

## What's NOT inherited from Mobbin

The contract is about visual+copy register, not feature parity. The
forge does NOT try to:
- Replicate Mobbin Pro screen text verbatim.
- Copy app names or product nouns directly (it INVENTS equivalents).
- Reproduce mobile-app UI for web outputs (mobile anchors translate to
  marketing-page patterns).
- Skip the structural gates the engine enforces (data-reveal, data-magnet,
  contrast, lucide registry, fonts loaded) — those remain hard requirements
  on every iter.

## How to extend

Adding a new anchor: append an entry to `scripts/forge-mobbin-dna.json`
following the schema above. Optionally add `COPY_EXAMPLES[App]` in
`scripts/forge-mobbin.mjs` for headline+sub+product-noun shapes.

Adding a new category: append to `DEFAULT_CATEGORIES` in
`scripts/forge-mobbin.mjs` (or override via
`FORGE_MOBBIN_CATEGORIES=cat1,cat2,...`). Mobbin's filter taxonomy
defines available categories — query
`/api/filter-tags/fetch-dictionary-definitions` for the full list.

Adding a new gate: add the env-flag check in `forge-loop.mjs` near the
existing `mobbinPaletteOk` / `mobbinFidelityOk` blocks; add a column to
the leaderboard meta; add the threshold env to the table above.

Auth is shared with the engine's prior `mobbin-runtime.js`
(commit `858ea92`, since dropped on the `vanilla-to-root-no-mobbin`
branch). The cookie is reconstructed as the chunked `sb-…-auth-token.0/.1`
SSR format Mobbin's server requires; tokens auto-refresh against Supabase
within 60s of expiry. The publishable key needed for the refresh call is
read from `~/.mobbin-mcp/anon-key.json` (shared with mobbin-mcp), scraped
from Mobbin's `main-app-*.js` chunk if absent, and falls back to the
build-time `sb_publishable_…` constant on offline boots. Disk cache
(7-day TTL) keeps all 50 iters of a loop to a single live query per
(platform, category, pattern).

Refresh path verified end-to-end: mutating `expires_at` to 30s in the
future trips the refresh window, Supabase returns a new access token,
the new session is rewritten to `auth.json`, the next request uses it.
This caught a real bug — Mobbin switched from JWT-style anon keys
(`eyJ…`) to publishable keys (`sb_publishable_…`); the original
`mobbin-runtime.js` regex matched the old format, so refresh silently
no-op'd on it. forge-mobbin.mjs matches the new format and the build-
time fallback so refresh works without any user setup.

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
| `forge-mobbin.mjs` | optional Mobbin Pro live reference fetch (Supabase auth cookie → /api/content/search-screens; 7-day on-disk cache; one call per category shared across iters) |
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
| `FORGE_USE_MOBBIN` | 0 | prefetch live Mobbin Pro reference block (requires `~/.mobbin-mcp/auth.json`) |
| `FORGE_MOBBIN_CATEGORIES` | `Developer Tools,AI,Productivity` | comma-separated Mobbin app categories (overrides default forge SaaS slice) |
| `FORGE_MOBBIN_PATTERN` | `Home` | comma-separated Mobbin screen patterns (`Home` is what Pro web data is tagged with — `Landing Page` / `Hero Section` return zero on web) |
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

# With live Mobbin Pro references (named real apps) injected
FORGE_USE_MOBBIN=1 bun vanilla/scripts/forge-loop.mjs

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
