# PROGRESS — Fast Beautiful Homepage Generation Engine

**Status:** working prototype that hits the goal. Read this top-to-bottom to take over.
**Branch:** `vanilla-to-root-no-mobbin` · **Folder:** `playground-engine-ui/`
**Ignore:** `playground-engine-ui-gpt/` — a *different* agent works there; not part of this effort.
**Companion doc:** `playground-engine-ui/UI-GENERATION-ENGINE.md` (longer history/narrative; this PROGRESS file is the current source of truth — where it disagrees, trust PROGRESS).

---

## 1. The one goal (north star)

Generate a **single-file HTML homepage** that is:
1. **Under 20 seconds** wall-clock (hard max; faster is nice but not required), and
2. **Visually close to Kimi K2.5** design quality.

That's the *only* win condition. Reliability, planner speed, etc. matter only insofar as they serve those two. We are explicitly allowed to throw away approaches and try new ones.

### Hard constraints (from the real product pipeline — do not violate)
- **Tailwind via CDN only.** No custom `<style>`, no `@apply`, no CSS-from-scratch. One framework, one system.
- **No generated graphics.** Icons and images are injected *downstream* in the real product:
  - **Icons** → emit `<i data-lucide="name">` placeholders, never `<svg>`.
  - **Images** → emit `<div data-img="short subject">` placeholder boxes, never inline images/SVG. The real pipeline fills these from **Pexels**.
  - This is a feature: it keeps token output small (→ fast) and focuses the model on **structure / UX / layout**.
- **No JavaScript.** No `<script>` (beyond what we inject for preview), no scroll-reveal/IntersectionObserver, no `opacity-0`-until-JS. Page must be fully visible/styled on load.
- **Full-width bands.** Every top-level `<section class="w-full">` with one inner `mx-auto max-w-7xl px-6` wrapper. No fixed-width structural blocks.

### Models available (no npm — use **bun**; prefix shell with `rtk` per repo CLAUDE.md)
| Model | Where | Speed | Use |
|---|---|---|---|
| `openai/gpt-oss-120b` | Groq | fast (~600-900 tps) | planner + body "tail"; reliable, structurally sound, aesthetically flatter |
| `gemini-3.5-flash` | Google API (`GEMINI_API_KEY`/`GOOGLE_API_KEY`) | slow (~255 tps) | the **only** Kimi-close design taste; used for the hero/top |
| `qwen/qwen3-32b` | Groq | mid | rejected as planner (leaks reasoning → breaks JSON) |
| Kimi K2.5 | `cursor-agent --model kimi-k2.5` | ~2-3 min | **reference target only**, far too slow to ship |

Disable Gemini "thinking" (`thinkingConfig.thinkingBudget: 0`) — it wastes the budget.

---

## 2. The current engine (THE answer): `scripts/forge-gemini-native.mjs`

This is the latest and best path. **Run it:**
```bash
bun playground-engine-ui/scripts/forge-gemini-native.mjs            # canonical 8 verticals
bun playground-engine-ui/scripts/forge-gemini-native.mjs riso fleet # subset by slug
```
Artifacts → `.forge/gemini-native/<runId>/<slug>.{html,png,plan.json}`, and it opens every page in the browser.

### Pipeline
```
1. Planner (GPT-OSS-120B, ~2s)
     → JSON: { archetype, layoutMode, art{bg,surface,text,muted,accent,accent2,
               fontDisplay,fontBody,radius,mood,reference,decor}, sections[6-9] }
     → retry once at low temp if JSON is unparseable.

2a. layoutMode "vertical-doc" (almost everything): HYBRID, two PARALLEL legs
      • Gemini  → head + tailwind.config + nav + hero + first 2-3 sections
                  (capped topN=3; the "money shot" where craft is judged and
                  Gemini is reliable). This call is the wall (~15-16s).
      • GPT-OSS → the remaining sections + footer (fast, reliably full-width;
                  flatness matters least below the fold).
      • Both bound to the SAME exact-hex palette/fonts/decor contract → seam invisible.

2b. layoutMode "app-shell" (genuine ops tools only — dashboard/console):
      • ONE Gemini pass builds the whole coherent 2D interface (no stitching;
        a sidebar/grid app can't be composed from independent legs).

3. Stitch + sanitize():
      • balanceTopDivs() — close any net-unclosed <div> in the Gemini-top so it
        can't swallow the GPT-OSS tail (this was the #1 cause of whole-page
        collapse into a narrow column).
      • repairAttrs() — fix hallucinated `class WORD="..."` → `class="..."`.
      • strip ALL model <script>/<style> EXCEPT the Tailwind CDN + tailwind.config.
      • inject: Lucide CDN loader (so data-lucide icons render in preview) +
        a preview-only style that (a) forces any reveal/opacity-0 content
        visible, (b) renders [data-img] as a labelled striped "image slot" so
        empty placeholders read as intentional, not broken.
```

### Why this shape (hard-won — don't relitigate without reading this)
- **Gemini alone can't do a full dense page < 20s** (255 tps): single-pass either truncates (~11K) or blows past 20s.
- **Chunked parallel Gemini** (3 independent chunks) reintroduces *narrow-column collapse* — chunks build in isolation and render lone cards instead of full-width grids.
- **GPT-OSS** is fast + reliably full-width but flat.
- So: **Gemini where craft is judged (top), GPT-OSS where it isn't (tail), in parallel.** wall ≈ Gemini's top call ≈ ~16s.

### Prompt rules that keep it from breaking (in `contract()`)
- GRID RULE: collections → responsive grid spanning full inner width; never a lone narrow column.
- PROSE RULE: long text in its own `max-w-2xl` block or a balanced 2-col split; never a narrow grid cell.
- SIMPLE-LAYOUT RULE: no `absolute`/`fixed`/negative-margins/rotation/overlapping cards; shallow nesting; every `<div>` closed.
- IMAGES: sensible aspect ratios; never a giant full-bleed empty; never an image-only section.
- HERO: clean headline+subhead+CTAs(+optional side visual); no forms/widgets crammed in.

---

## 3. Current results (8 verticals, latest runs)

All **under 20s**, dense (19-24K chars), Kimi-grade heroes, coherent full-width bodies after the fixes:

| vertical | wall | notes |
|---|---|---|
| saas | ~17s | product brand hub |
| ecommerce | ~17.8s | herbal editorial catalog |
| restaurant | ~17s | coffee catalog + storybook |
| portfolio | ~18.4s | editorial gallery (circular portrait = `data-img` slot) |
| agency | ~18s | was the worst (cascade collapse) — now clean top-to-bottom |
| fitness | ~18.3s | membership portal + class grid |
| wellness | ~17.1s | membership + media grid |
| hotel | ~17.4s | was 20.7s → capped Gemini-top scope |

Mean ~17.5s. Verified by full-page screenshot, scrolling through every section, not just heroes.

### Known residual (cosmetic, not structural)
- A colored **circular portrait** `data-img` (e.g. portfolio) reads as a solid colored circle in preview until Pexels fills it. Not broken — just preview optics.
- Occasional slightly-unbalanced 2-col split in the Gemini-top. Rare.
- The aesthetic is close to Kimi but the GPT-OSS *tail* is still a touch flatter than the Gemini *top*. Acceptable; further closing this is the main open quality lever.

---

## 4. How the experiments got here (other scripts in `scripts/`)
Run any with `bun playground-engine-ui/scripts/<file> [args]`. They write to `.forge/<tool>/<runId>/` and open results in the browser.

| script | what it explores |
|---|---|
| **forge-gemini-native.mjs** | **← the current engine (hybrid).** Start here. |
| forge-creative.mjs | earlier engine: planner + single-pass GPT-OSS (vertical) / single Gemini (app-shell). Reliable but flatter. Default planner = GPT-OSS-120B. |
| forge-playground.mjs | thin runner over forge-creative across 8 verticals (table + browser open) |
| forge-vs-kimi.mjs | OURS vs **Kimi K2.5** (via `cursor-agent`) on 4 briefs — the reference comparison harness |
| forge-planner-ab.mjs | A/B planner models (gpt-oss vs gemini vs qwen), build pipeline held constant |
| forge-gemini-combo.mjs / forge-gemini-timing.mjs | early Gemini probes (single-shot 66-72s; hero-split ~10s) |
| forge-lib.mjs | shared Groq plumbing: `forgeGenerate`, `detectSiteType`, `buildSiteTypeBlock`, split3/two-stage, SITE_TYPE_PACKS. (NOTE: a teammate heavily rewrote forge-mobbin/loop/once/lib on this branch for a production Mobbin port — those live alongside.) |
| forge-genomes.mjs / forge-critic.mjs / forge-primitives.mjs | older deterministic palette-merge + heuristic critic + layout primitives (pre-Gemini era) |

The production engine integration lives **outside this folder** at `packages/ship-fast-engine/src/pipeline/genome-merge.js` (+ wired in `runner.js`, gated by `SHIPFAST_USE_GENOME_MERGE=1`). The Gemini hybrid is **not yet** folded into production.

---

## 5. Suggested next steps (for the colleague taking over)
1. **Fold the hybrid into production.** Port `forge-gemini-native.mjs`'s pipeline into `packages/ship-fast-engine` as the homepage path (behind a flag). It already emits the exact placeholder contract the product expects (data-lucide icons, data-img → Pexels).
2. **Close the tail flatness.** Options: feed the GPT-OSS tail a real Kimi page as a style exemplar (we have Kimi outputs in `.forge/vs-kimi/*/kimi.html`), or have Gemini build one more tail section.
3. **Harden div-balance.** `balanceTopDivs()` is a blunt counter; a real per-section tag validator would be more robust.
4. **Re-run `forge-vs-kimi.mjs`** to re-measure the gap to Kimi after any change (it's the scoreboard).

### Env / setup
- `GEMINI_API_KEY` or `GOOGLE_API_KEY` (in `.env.local`), `GROQ_API_KEY` (in `.env`). Both already present locally.
- bun only (no npm/npx). Prefix shell commands with `rtk` (repo convention).
- Playwright is used for screenshots.
