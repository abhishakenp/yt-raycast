# Fast Beautiful HTML Homepage Generation Engine

> **Status:** experimental / active research. This is the canonical reference for the
> "forge" effort — generating a beautiful, complete, single-file HTML homepage for any
> brand, fast. Read this before touching any `scripts/forge-*.mjs` file or the engine's
> homepage pipeline. It captures the full journey: every approach tried, why, what
> worked, what failed, and the constraints — so none of it has to be re-derived.

---

## 1. Purpose & North Star

Generate a **beautiful, complete, single-file HTML homepage** for *any* brand, *fast*.

- **Quality bar = Kimi K2.5.** The team considers Kimi K2.5 (run via `cursor-agent`)
  best-in-class for design quality. It is the reference target — the whole effort is
  about **matching Kimi's quality without its latency**.
- Kimi is too slow to ship (≈ 2–3 minutes per page, agentic). The forge exists to get
  Kimi-grade output in seconds.
- The output is a single self-contained `index.html`: Tailwind via CDN, Google Fonts,
  real (non-lorem) content. No build step, no framework.

The effort is internally called **"the forge."** Everything lives in `scripts/forge-*.mjs`
plus a thin integration into the production engine
(`packages/ship-fast-engine/src/pipeline/`).

---

## 2. Hard Constraints

These are non-negotiable. Collected from the working sessions and `CLAUDE.md`.

| # | Constraint | Detail |
|---|-----------|--------|
| 1 | **Time budget** | **Under 20s wall-clock per homepage is the hard max. Under 12s is the aspiration.** The bar was originally "sub-20s"; the team is happiest sub-12s but accepts up to 20s. Speed must NOT regress to gain variety. |
| 2 | **Single-file HTML** | One `index.html`. Tailwind via `<script src="https://cdn.tailwindcss.com">`. Google Fonts via `<link>` + inline `tailwind.config`. |
| 3 | **Real content** | No lorem, no placeholder text. Named brands, real prices, real copy. |
| 4 | **Least-deterministic prompting** | Variety must come from **creative freedom**, NOT hardcoded per-vertical templates. Do **not** enforce structure ("must have a hero") in prompts. The earlier `SITE_TYPE_PACKS` approach (hardcoded section prescriptions) is the *opposite* of this principle and was superseded for that reason. |
| 5 | **Two axes of variety** | (a) **ARCHETYPE variety** — a SaaS should be able to render as a real product UI (dashboard / console), not always a marketing landing. (b) **DESIGN variety** — palettes / fonts / layouts genuinely different across brands (not the same light-grey template every time). |
| 6 | **No npm** | Use `bun` / `bunx`. Never `npm` / `npx`. |
| 7 | **RTK prefix** | Prefix shell commands with `rtk` (token-optimized passthrough). See `CLAUDE.md`. |
| 8 | **Mobbin is quota-limited** | Use the local snapshot `data/mobbin-snapshot.json` (`FORGE_USE_MOBBIN_SNAPSHOT=1`), NOT live, unless `FORGE_USE_MOBBIN_LIVE=1`. |
| 9 | **Always open output** | Standing instruction in the playground/combo scripts: always render a screenshot AND open the page in the browser, never metrics-only. |

### Model roster

| Model | Where | Speed | Role | Notes |
|-------|-------|-------|------|-------|
| **GPT-OSS-120B** | Groq (`openai/gpt-oss-120b`) | fast, ~600–1000 tps | Body builder; main HTML legs | `reasoning_effort` / `reasoning_format` are GPT-OSS-only on Groq — other models 400 if these are sent. Can **refuse** ("I'm sorry, but I can't fulfill that request"). |
| **llama-3.3-70b-versatile** | Groq | fast | **Creative-director planner** (v2, current) | High temp (0.95), ~1.2s. Invents archetype + palette + fonts + layout + decor. |
| **qwen/qwen3-32b** | Groq | ~3.8s plan | Two-stage skeleton planner (earlier era) | Promoted over llama-3.1-8b after a side-by-side: dramatically better vertical-specific plans (real Tokyo coffee houses vs llama's US-press brand bleed, correct math, no SaaS-default leaks). |
| **llama-3.1-8b-instant** | Groq | ~1.3s | Legacy two-stage planner | Too weak — picked `mockType:"terminal"` for a coffee shop (SaaS-default bleed). Revert via `FORGE_SKELETON_MODEL=llama-3.1-8b-instant`. |
| **Gemini 3.5 Flash** | Google AI Studio (`gemini-3.5-flash`) | slow, ~255 tps | High-design-quality identity/hero chunk | Released ~2026-05-19; **newer than the assistant's training** — context7 only lists `gemini-3-flash-preview`. Has a "thinking" mode that **must be disabled** (`thinkingConfig.thinkingBudget: 0`) for speed. Its ~255 tps throughput is exactly why it is only used for the **small** identity chunk. |
| **Kimi K2.5** | via `cursor-agent --model kimi-k2.5` | ~2–3 min (agentic) | **Reference only** — quality target | Builds the whole coherent 2D layout in one pass. Wins on app UIs. |

---

## 3. Architecture Evolution (chronological, with WHY)

The forge went through ~8 distinct architectural eras. Each row says what changed and why.

| Era | Commit(s) | What | Why |
|-----|-----------|------|-----|
| **0. Mobbin integration** | `13e3b58`, `8849157`, `6727740` | Live Mobbin Pro references injected as design anchors (per-iter rotation across categories; element-coverage scoring); rebuilt `VIBE_PALETTES` from Mobbin research; made Mobbin failure loud + statistically validated. | Ground the model in real, current top-app design instead of "modern SaaS" averages. |
| **1. Mobbin independence** | `56ec529`, `6bee215` | Three independence paths: (a) **rigor rules** — `buildRigorBlock(iter)` + curated `BRAND_ANCHORS`, an auth-free structural sibling of Mobbin; (b) **vendored snapshot** — `data/mobbin-snapshot.json` via `forge-mobbin-snapshot.mjs`, zero auth/network; (c) **amp-bed** safeguard for absurd briefs. Rigor block demoted to opt-in after ablation. | Mobbin is quota-limited and auth-gated. Need a path that runs offline and a safety net for garbage briefs. |
| **2. Multi-vertical site-type packs** | `1027ad7` | `detectSiteType(brief)` (regex keyword pass, most-specific-first) + `SITE_TYPE_PACKS` (11 verticals: saas / ecommerce / restaurant / portfolio / agency / fitness / wellness / hotel / fintech / education / realestate / nonprofit). Each pack overrides section prescription, brand anchors, aesthetic steer, copy voice, and banned sections. `buildSiteTypeBlock` emits a markdown block; pack wins over universal HARD REQS. Plus an experimental Best-of-K judge. | A restaurant needs menus, not pricing tiers; a portfolio needs case studies. One SaaS-shaped prompt produced wrong sections for non-SaaS briefs. **NB:** this is *deterministic* prompting — later abandoned for variety reasons (constraint #4), but the detector is still used informationally. |
| **3. Density parity via split3** | `9e1567c`, `cbc7a6d`, `1a5b0eb` | `forgeGenerateSplit3` — **3 parallel Groq calls** (system prompts PART_A / PART_B / PART_C), each building a slice, stitched at `SPLIT_MARKER` boundaries. Hit "Kimi K2.5 density in 15–17s", then "parity at 18s — dense hero mock + use-cases". | A single GPT-OSS call truncates before reaching Kimi's density. Three parallel calls each carry a third of the page → Kimi-level density at parallel (not serial) cost. |
| **4. Two-stage planner→builder** | `25a8ebb`, `2d67eda` | `forgeGenerateTwoStage`: **Stage A** = planner (llama-3.1-8b → promoted to qwen3-32b) emits strict JSON skeleton (siteType, hero, stats, sections w/ layout primitives, genome, theme, voice); **Stage B** = GPT-OSS split3 expands the skeleton verbatim. Skeleton injected as the highest-priority "APPROVED SKELETON" block. | GPT-OSS spends reasoning budget deciding *what* sections/anchors/palette to use before writing HTML. A cheap fast planner decides structure in 1–3s, leaving the 120B a tighter task: "expand this approved plan into dense HTML." Wall ≈ 18–22s. |
| **5. Genomes + deterministic merge + critic/repair** | `86c8a40`, `6ab8399`, `0c11472` | **6 style genomes** (`data/style-genomes/*.json`: vercel-apple, linear-raycast, stripe-resend, editorial-warm, boutique-organic, bold-conversion). `mergeWithGenome()` does deterministic regex token rewrites (collapse slate/zinc/gray/neutral/stone → the genome's target family + ensure root class on `<body>`), fixing the **palette-drift bug** (planner says terracotta, GPT-OSS renders blue/purple). **Heuristic critic** (`forge-critic.mjs`, zero-LLM regex) flags structural failures; **repair** is a single LLM call **kind-gated to `saas-leak` + `palette-drift`** only (full rewrite is ~35s, only worth it for those). 20 **layout primitives** (`forge-primitives.mjs`) give the planner a structural vocabulary. Engine integration (`genome-merge.js` in the pipeline) behind `SHIPFAST_USE_GENOME_MERGE=1`; forge-side behind `FORGE_USE_GENOME_MERGE=1` / `FORGE_USE_CRITIC=1`. | Cross-model palette drift was the #1 visible defect of two-stage. A deterministic ~50ms regex pass fixes it without an LLM round-trip. Critic catches the two high-confidence, high-cost-justified defects; everything else is left to next-pass codegen (false-positive-prone otherwise). |
| **6. Gemini single-shot probe** | (`forge-gemini-timing.mjs`) | Fed Gemini 3.5 Flash the *same* `buildVariantPrompt` payload split3 gets, measured wall-clock. | Gemini's design quality is excellent. Tested if it could just replace the whole pipeline. **Verdict: too slow alone — 66–72s single-shot** at ~255 tps. Rejected as a solo engine. |
| **7. Parallel-hero combo (the winning recipe)** | `9229ae4` (`forge-gemini-combo.mjs` `hero` mode) | Use each model where it's strongest: **Gemini builds the small, design-critical identity region (hero + nav + `<head>`)** while **GPT-OSS builds the body in 2 parallel halves**. Stitch. Then deterministic genome merge unifies the palette across the Gemini↔GPT-OSS seam. Wall ≈ `max(legs)` ≈ **10–12s**. | Gemini is gorgeous but slow → give it only ~2200–2900 tokens (the part where its quality shines). GPT-OSS is fast → give it the bulk, split in two so neither OSS leg becomes the wall. The genome merge (from era 5) is what makes the seam palette-coherent. |
| **8. 8-vertical playground + concurrency tuning** | `9229ae4` (`forge-playground.mjs`) | Generalize the combo to ANY vertical; run all 8 verticals concurrently. Discovered the bottleneck at scale is **Groq concurrency, not Gemini**: each vertical fires 2 Groq calls → 8 verticals = 16 concurrent Groq calls → saturation → body legs balloon to ~15s and some return empty. A **concurrency pool** (`CONCURRENCY=4` → ≤8 in-flight Groq calls) keeps each page near its solo ~10–11s. | Naive `Promise.all` over all 8 verticals melts the Groq concurrency limit. The pool restores per-page latency. |
| **9. Creative-director planner (v2 current)** | `e82f6e0`, `0f464d4` (`forge-creative.mjs`) | Replaced the deterministic hero+genome structure with a **high-temp llama-3.3-70b creative director** (~1.2s) that invents archetype + exact-hex palette + fonts + layout + decor + a 3-chunk breakdown. Also decides `layoutMode` (`app-shell` vs `vertical-doc`). The 3-leg build (Gemini chunk1 + 2× GPT-OSS) follows. `generateCreativeHomepage` is the extracted, pure entry point. | The deterministic packs/genomes gave consistency but killed variety (constraint #4/#5). A creative director invents a *distinctive visual world* per brand — different ground, different fonts, different archetype — restoring both archetype and design variety while keeping the fast parallel build. |
| **10. Kimi-vs-ours comparison harness** | `0f464d4` (`forge-vs-kimi.mjs`) | Side-by-side on 4 deliberately diverse/unusual briefs: **fleet ops console, riso print shop, music label, butchery supper club**. OURS (~12s) vs KIMI (~2–3 min). Screenshots both, opens both. | Every optimization is shooting in the dark without a numerical + visual gap measurement against the reference. |
| **11. v2 layout-aware attempt** | `e82f6e0` | Planner emits `layoutMode` + decor. Tried **slot-injection** for app-shells (Gemini owns the whole shell with named empty `data-slot` placeholders; GPT-OSS fills them as inner fragments), then fell back to **stacked composition** (render even app-shells as full-width vertical bands — top bar + KPI strip + primary panel — never a left sidebar). | Independently-generated chunks collide when each invents its own outer 2D frame. Stacking everything as full-width bands is the only composition that reliably survives independent legs (see §4). |

---

## 4. What Worked / What Failed

### The CORE UNSOLVED PROBLEM

> **Independent-leg parallel composition reliably produces coherent *vertical-document*
> pages — marketing, catalog, editorial, gallery — but CANNOT reliably produce true 2D
> *app-shell* UIs (dashboards / consoles with sidebars / fixed panels).**

When each leg is generated independently and stitched, app-shell chunks **collide** (each
invents its own absolute/fixed outer frame and they overlap) or the page **degrades into a
marketing page**. **Kimi wins on app UIs because it builds the whole coherent 2D layout in
one pass** — there is no seam to go wrong. The current v2 mitigation is to render even
`app-shell` archetypes as **stacked full-width horizontal bands** (top app bar → KPI strip
→ full-width primary panel → more full-width panels), explicitly forbidding left sidebars
and `position:fixed`/`absolute` on frames. This *survives* independent legs but produces a
"dashboard-flavored vertical-doc," not a real 2D operator console.

### Matrix

| Item | Outcome | Notes |
|------|---------|-------|
| split3 (3 parallel Groq) | ✅ works | Kimi-level density at parallel cost (~15–18s). Stitched at `SPLIT_MARKER` boundaries. |
| Parallel-hero combo (Gemini identity ∥ 2× GPT-OSS body) | ✅ works | The winning recipe. Wall ≈ max(legs) ≈ 10–12s. |
| Deterministic genome merge | ✅ works | ~50ms regex pass; fixes cross-model palette drift; makes the Gemini↔GPT-OSS seam coherent. |
| Concurrency pool (8-vertical playground) | ✅ works | `CONCURRENCY=4` restores per-page ~10–11s; without it, Groq saturates and legs balloon/empty. |
| Vertical-doc pages (catalog / editorial / gallery / marketing) | ✅ works | Coherent and attractive. Riso catalog + butchery supper club were good in the **first** comparison run. |
| Creative-director planner for design variety | ✅ works | Genuinely different palettes/fonts/grounds per brand; restores archetype + design variety. |
| Gemini single-shot as solo engine | ❌ too slow | 66–72s. Rejected; relegated to the small identity chunk only. |
| llama-3.1-8b as planner | ❌ too weak | SaaS-default bleed (terminal mock for a coffee shop). Replaced by qwen3-32b. |
| **True 2D app-shell composition from independent legs** | ❌ **unsolved** | Chunk layout collision; the central open problem. |
| Slot injection (`data-slot` placeholders for Gemini) | ❌ unreliable | **Gemini ignores `data-slot` placeholders**; shells truncate **without `</body>`**. Abandoned for stacked composition. |
| GPT-OSS refusals | ⚠️ guarded | Legs sometimes return "I'm sorry, but I can't fulfill that request." Guarded by `badLeg()` (drops the leg) + `stripRefusal()`. |
| Planner over-classification | ⚠️ regressed | The planner **over-classifies everything as app-shell**. In the **second** comparison run this mis-classified the *butchery* brief as an app-shell "dashboard," regressing what had been a good vertical-doc page. Default is biased toward `vertical-doc` precisely to fight this. |
| Two-stage palette drift | ⚠️ fixed downstream | Planner says terracotta, GPT-OSS renders blue/purple. Not fixed in prompt; fixed by the deterministic genome merge. |

### Observed failure modes (catalogue)

- **Chunk layout collision** — independently generated chunks each emit an
  absolute/fixed outer frame; the frames overlap. Mitigation: forbid fixed/absolute on
  frames, force normal-flow full-width bands.
- **Empty slots** — Gemini ignores `data-slot` placeholders; shells truncate without
  `</body>`. Mitigation: stacked composition + force-close `</body></html>` if missing.
- **GPT-OSS refusals leaking** — "I'm sorry, but I can't fulfill that request" stitched
  into the page. Mitigation: `badLeg()` drop + `stripRefusal()` strip.
- **Planner over-classifying as app-shell** — too many briefs become "dashboards."
  Mitigation: prompt biases hard to `vertical-doc` ("when in doubt, choose vertical-doc";
  app-shell ONLY for a genuine operational tool an operator stares at all day).

---

## 5. Current Engine Internals (`forge-creative.mjs`, v2)

The current entry point is `generateCreativeHomepage(brief, opts)` → returns
`{ html, archetype, layoutMode, plan, metrics }` (pure; no file writes).

### Stage A — creative-director planner (~1.2s)

- Model: `llama-3.3-70b-versatile` (override `PLANNER_MODEL`), `temperature: 0.95`,
  `maxTokens: 1300`.
- System: "daring art director and product designer… Output ONLY compact JSON."
- Decides, with deliberate variety: **archetype**, **layoutMode** (`app-shell` |
  `vertical-doc`, default vertical-doc), a distinctive visual identity, and EXACTLY 3
  build chunks that **stack vertically** as full-width bands.

**Planner JSON shape:**

```jsonc
{
  "archetype": "short label (e.g. 'fleet ops console', 'editorial lookbook')",
  "layoutMode": "app-shell" | "vertical-doc",
  "art": {
    "bg": "#hex", "surface": "#hex", "text": "#hex", "muted": "#hex",
    "accent": "#hex", "accent2": "#hex or null",
    "fontDisplay": "Google Font name", "fontBody": "Google Font name",
    "radius": "edge language", "mood": "3-6 words",
    "layout": "one-sentence layout philosophy",
    "reference": "a concrete design reference",
    "decor": "concrete decorative treatment (grain/duotone/sticker/offset shadow/...)"
  },
  "chunks": [
    { "role": "chunk 1", "contains": "concrete elements, specific to this brand" },
    { "role": "chunk 2", "contains": "..." },
    { "role": "chunk 3 (ends with footer for vertical-doc)", "contains": "..." }
  ]
}
```

The `decor` field is injected into **every** leg, matching Kimi's richer art direction
(film grain, duotone blocks, sticker/tape, hard offset shadows, hairline rules, marquee,
glassmorphism, halftone).

### Stage B — 3-leg parallel build (`buildStacked`)

All three legs run via `Promise.all`. Wall ≈ `max(leg)`.

| Leg | Model | Token cap | Builds |
|-----|-------|-----------|--------|
| chunk 1 | **Gemini 3.5 Flash** (`thinkingBudget:0`, temp 0.65) | `maxOut` = **2900 (app-shell) / 2400 (vertical-doc)** | `<!DOCTYPE>` + `<head>` (Tailwind CDN + Google Fonts + inline tailwind.config + base bg/text on `<body>`) + `<body>` open + chunk 1 region. Does NOT close `</body>`/`</html>`. **The ~10s floor is this Gemini leg** (~255 tps). |
| chunk 2 | **GPT-OSS-120B** (temp 0.7, `reasoningEffort:'low'`) | `maxTokens: 5000` | Appends a full-width band. No `<!DOCTYPE>`/`<head>`/`<body>`. Does NOT close `</body>`/`</html>`. |
| chunk 3 | **GPT-OSS-120B** (temp 0.7, `reasoningEffort:'low'`) | `maxTokens: 5000` | Appends final full-width band, matching `<footer>`, then closes `</body></html>`. |

**Shared visual contract** (`buildContract`) is prepended to every leg: exact hexes as
Tailwind arbitrary values (`bg-[#hex]`), the two fonts, edge language, mood, layout,
reference, and decor — so the independently-built parts form one coherent page.

**Layout-mode framing** — the ONLY difference between modes is how chunk 1 is framed:
- `vertical-doc`: chunk 1 is a compact identity-defining opening band (~120–200 lines).
- `app-shell`: chunk 1 is an operational interface rendered as STACKED FULL-WIDTH BANDS
  (top app bar → KPI/status strip → full-width primary panel). HARD rules: **no left
  sidebar, no `position:fixed`/`absolute` on frame/bar/panels** — everything in normal
  vertical document flow. This structurally prevents the chunk collision that broke
  dashboards.

### Guards & stitching

- `badLeg(s)` — drops a GPT-OSS leg if empty, < 300 chars, or a refusal with zero block
  tags. Dropped legs recorded in `metrics.dropped`.
- `stripRefusal(s)` — strips leading/trailing "I'm sorry…" prose from a leg that still
  had usable HTML.
- `stripFences(s)` — removes ```` ```html ```` fences.
- Stitch: `h1 + "\n" + h2 + "\n" + h3`; force-close `</body></html>` on chunk 3 if missing.

### Metrics returned

```jsonc
{
  wall, chars, layoutMode,
  palette: "<bg>/<accent>", fonts: "<display>+<body>", decor,
  plannerMs, geminiMs, ossC2Ms, ossC3Ms,
  dropped: "c2" | "c3" | "c2+c3" | null
}
```

---

## 6. Measured Numbers

Concrete latencies / char-counts observed across the sessions.

| Configuration | Wall-clock | Notes |
|---------------|-----------|-------|
| Gemini single-shot (full page) | **66–72s** | Too slow alone — rejected as solo engine. |
| split3 (3 parallel Groq) | ~15–18s | Kimi-density era. |
| Two-stage (qwen3-32b plan + split3) | ~18–22s | Plan ~3.8s + build ~16–18s. |
| **Parallel-hero combo** | **10.4–10.7s** | The winning recipe. |
| **8-vertical playground** | **mean ~11–12.5s**, with **5–7 of 8 under 12s** | With `CONCURRENCY=4`. Solo pages ~9.7–10.5s. |
| Ours (in vs-kimi comparison) | **11–29s** | Wider spread on the 4 diverse/unusual briefs (app-shell legs run longer). |
| **Kimi K2.5** (reference) | **100–184s** (~2–3 min) | Best quality; far too slow to ship. |
| Gemini leg throughput | ~255 tps | The reason it only builds the small identity chunk. |
| GPT-OSS throughput | ~600–1000 tps | Carries the bulk in 2 parallel legs. |
| Genome merge | ~50ms | Zero-LLM regex pass. |
| Critic | ~50ms | Zero-LLM regex pass. |
| Repair (when triggered) | ~35s on a 53K-char page | Full-doc rewrite — why it is kind-gated to saas-leak/palette-drift only. |

### Qualitative reference observations

- Kimi's **fleet console** was a genuinely production-grade dashboard: KPI strip, live
  zone map, incident feed, fleet table — a real 2D operator UI.
- Kimi's **riso page** had true duotone riso prints + tape/sticker accents.
- **Ours** is cleaner / flatter, breaks on app UIs, but vertical-doc pages (riso catalog,
  butchery supper club in the **first** run) were coherent and attractive.
- The **second** comparison run regressed butchery by mis-classifying it as an app-shell
  "dashboard" — direct evidence of the planner-over-classification failure mode.

---

## 7. Open Questions / Next Ideas

### Proposals on the table

| Option | Idea | Status |
|--------|------|--------|
| A | **Shared layout shell with named slots** — one model owns the outer 2D frame; legs fill named slots. | Tried (slot-injection); failed because Gemini ignores `data-slot`. Could revisit with a stricter contract or a different shell owner. |
| B | **Archetype-conditioned composition** — pick a composition strategy per archetype rather than one stacked strategy for all. | Open. |
| C | **Richer art direction / decor** — explicit decor spec injected into every leg. | **Partially shipped** (the `decor` field in v2). |
| D | **Post-stitch collision repair** — detect overlapping absolute/fixed frames after stitching and repair them. | Open. |
| E | **Density bump** — push GPT-OSS legs denser to close the remaining gap to Kimi. | Open (legs currently capped ~5000 tokens). |

### The app-shell dilemma (realistic options)

For true 2D operator UIs there are only two honest paths today:

1. **Single-model Gemini pass** — coherent 2D layout, but **~17–20s** and lower density
   (one slow model carrying the whole page).
2. **Accept "dashboard-flavored vertical-doc"** — the current stacked-bands approach:
   fast and reliable, but not a real sidebar/fixed-panel console.

Kimi sidesteps this entirely by building the whole coherent layout in one (slow) pass.
Matching that on app UIs without the latency is the central unsolved research question.

---

## 8. File / Artifact Map

All run artifacts land in `.forge/<tool>/<runId>/`.

| File | Role | Produces |
|------|------|----------|
| `scripts/forge-creative.mjs` | **v2 current engine** — creative planner + Gemini/GPT-OSS legs. `generateCreativeHomepage()` (pure). | `{ html, archetype, layoutMode, plan, metrics }` |
| `scripts/forge-lib.mjs` | Core: `detectSiteType`, `SITE_TYPE_PACKS`, `buildVariantPrompt`, `buildSiteTypeBlock`, `forgeGenerate`, `forgeGenerateSplit3`, `forgeGenerateTwoStage`, `getSkeletonSystem`, `buildRigorBlock`, `BRAND_ANCHORS`, temperature schedule, winner-seed. | n/a (library) |
| `scripts/forge-genomes.mjs` | 6 style genomes + `mergeWithGenome` deterministic palette rewrite + `describeGenomes`. CLI: `describe`, `merge <html> <genome>`. | `<file>.merged.html` |
| `scripts/forge-critic.mjs` | Heuristic zero-LLM critic (`critique`) + kind-gated `repair` (saas-leak / palette-drift only) + `criticAndRepair`. | issues JSON / repaired HTML |
| `scripts/forge-primitives.mjs` | 20 layout primitives (`data/primitives.json`) — structural vocabulary for the skeleton planner. `describePrimitives`, `suggestPrimitive`. | n/a (library) |
| `scripts/forge-playground.mjs` | 8-vertical parallel runner over `generateCreativeHomepage`, concurrency pool (`CONCURRENCY`). | per-slug `<slug>.html` + `.png` + `.plan.json` + `results.json` |
| `scripts/forge-gemini-timing.mjs` | Gemini single-shot timing probe (same `buildVariantPrompt` payload). | `index.html` + `meta.json` |
| `scripts/forge-gemini-combo.mjs` | Gemini×GPT-OSS combos: `planner` mode (Gemini skeleton → split3) and `hero` mode (parallel-hero — the recipe that became v2). | `index.html` + `meta.json` + `shot.png` |
| `scripts/forge-vs-kimi.mjs` | Reference comparison: ours vs Kimi K2.5 (via cursor-agent) on 4 diverse briefs. `OURS_ONLY=1` to skip Kimi. | per-slug `ours.html`/`kimi.html` + `.png` + `results.json` |
| `scripts/forge-twostage.mjs` | Two-stage runner (qwen3-32b plan → GPT-OSS split3). | `skeleton.json` + `index.html` + `shot.png` |
| `scripts/forge-bench-diverse.mjs` | Multi-vertical split3 benchmark over 8 site types, with render audit. | per-slug `index.html` + `shot.png` + `meta.json` |
| `scripts/forge-bench-kimi.mjs` | Forge-vs-Kimi numerical bench (render audit + vision judge both sides). | `forge.*` / `kimi.*` + `comparison.json` |
| `scripts/forge-mobbin.mjs` / `forge-mobbin-snapshot.mjs` | Live Mobbin Pro fetch / one-shot snapshot vendor → `data/mobbin-snapshot.json`. | snapshot JSON |
| `packages/ship-fast-engine/src/pipeline/genome-merge.js` | Engine port of the genome merge: `pickGenome` (siteType/brief heuristics), `mergeWithGenome`, `applyGenomeMerge`. | rewritten homepage HTML |
| `packages/ship-fast-engine/src/pipeline/runner.js` | Production pipeline; calls `applyGenomeMerge(homepage, …)` between LLM output and `writeFile`, gated by `SHIPFAST_USE_GENOME_MERGE=1`. | `index.html` in workspace |
| `data/style-genomes/*.json` | The 6 genome definitions (vercel-apple, linear-raycast, stripe-resend, editorial-warm, boutique-organic, bold-conversion). | n/a (data) |
| `data/primitives.json` | The 20 layout primitives. | n/a (data) |
| `data/mobbin-snapshot.json` | Vendored Mobbin Pro reference snapshot (zero-auth fallback). | n/a (data) |
| `scripts/FORGE.md` | Original forge README (loop / gating / vision / promotion docs). | n/a (docs) |

### Relevant env flags

| Flag | Effect |
|------|--------|
| `GEMINI_API_KEY` / `GOOGLE_API_KEY` | Gemini auth (required for creative engine). |
| `GROQ_API_KEY` | Groq auth (required). |
| `GEMINI_MODEL` | Override Gemini model id (default `gemini-3.5-flash`). |
| `PLANNER_MODEL` | Override creative-director planner (default `llama-3.3-70b-versatile`). |
| `FORGE_SKELETON_MODEL` | Override two-stage planner (default `qwen/qwen3-32b`; revert with `llama-3.1-8b-instant`). |
| `CONCURRENCY` | Playground Groq concurrency pool size (default 4 → ≤8 in-flight Groq calls). |
| `FORGE_USE_GENOME_MERGE=1` | Enable genome merge in two-stage (forge side). |
| `FORGE_USE_CRITIC=1` | Enable critic+repair in two-stage. |
| `SHIPFAST_USE_GENOME_MERGE=1` | Enable genome merge in the production engine pipeline. |
| `FORGE_USE_MOBBIN_SNAPSHOT=1` | Use vendored snapshot (default behavior unless live forced). |
| `FORGE_USE_MOBBIN_LIVE=1` | Force live Mobbin fetch (quota-limited). |
| `OURS_ONLY=1` | `forge-vs-kimi.mjs` — skip the slow Kimi leg. |

---

## 9. TL;DR for the next reader

- **Goal:** Kimi-K2.5-grade single-file homepage in **< 20s (ideally < 12s)**.
- **Winning recipe (v2):** high-temp llama-3.3-70b creative director invents the
  archetype + visual world + 3 stacked chunks → **Gemini builds the small identity chunk
  in parallel with 2 GPT-OSS body legs** → stitch → genome merge for palette coherence.
  Wall ≈ max(legs) ≈ 10–12s.
- **What's solved:** fast, varied, coherent **vertical-document** pages (marketing,
  catalog, editorial, gallery) with genuine design variety.
- **What's NOT solved:** true 2D **app-shell** UIs (sidebars/fixed panels) from
  independent legs — they collide or degrade. Current mitigation renders them as stacked
  full-width bands ("dashboard-flavored vertical-doc"). Kimi wins here only because it
  builds the whole layout in one slow pass.
- **Don't:** make Gemini carry the whole page (66–72s), use llama-8b as planner
  (SaaS bleed), trust Gemini to honor `data-slot` placeholders, or fire all verticals at
  Groq without a concurrency pool. And don't reintroduce hardcoded per-vertical structure
  in prompts — variety must come from creative freedom.
