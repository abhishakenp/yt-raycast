# Free Engine System — How to Generate & Evaluate Tests

> All commands run from the **repo root** (`ship-fast/`).  
> Set the required env vars first (or load via Doppler):
> ```sh
> export GROQ_API_KEY=…        # required by kimi + triple-compare
> export GEMINI_API_KEY=…      # required by kimi quality path + gemini engine
> # GOOGLE_API_KEY is an alias for GEMINI_API_KEY if you prefer
> ```

---

## 1 · Single-engine generation — `kimi-native.mjs`

Runs the **Kimi K2 visual engine** on a fixed set of pre-written briefs (or a custom subset) and saves HTML + plan JSON to `.forge/kimi-native/<runId>/`.

```sh
# Run the default 8 briefs (saas, ecommerce, restaurant, portfolio, agency, fitness, wellness, hotel)
bun playground-engine-ui-kimi/scripts/kimi-native.mjs

# Run only specific slugs
bun playground-engine-ui-kimi/scripts/kimi-native.mjs saas riso fleet

# Available slugs
# saas | ecommerce | restaurant | portfolio | agency | fitness
# wellness | hotel | fleet | riso | music | butchery
```

**Output per brief** (inside `.forge/kimi-native/<runId>/`):
| File | Contents |
|------|----------|
| `<slug>.html` | Standalone generated homepage |
| `<slug>.plan.json` | Engine plan, routing decision, metrics, quality audits |

If Playwright is installed (`bun add -D playwright`), PNG screenshots are also captured at 1440 × 900 px.

---

## 2 · Three-engine side-by-side compare — `engine-triple-compare.mjs`

Runs the same brief through **three engines in parallel** and produces a compare HTML page:

| Engine | Package |
|--------|---------|
| `kimi` | `playground-engine-ui-kimi` (Gemini top + Groq tail, grammar routing) |
| `forge-gemini-native` | `playground-engine-ui` (Gemini full-page, no routing) |
| `gpt` | `playground-engine-ui-gpt` |

```sh
# Positional brief
bun playground-engine-ui-kimi/scripts/engine-triple-compare.mjs "Homepage for Aura Analytics, a real-time revenue intelligence platform for B2B SaaS"

# Flag form — useful when brief contains hyphens
bun playground-engine-ui-kimi/scripts/engine-triple-compare.mjs --prompt "Homepage for Aura Analytics…"

# Vision gate — Groq Llama-4 Scout scores each screenshot (recommended for design decisions)
bun playground-engine-ui-kimi/scripts/engine-triple-compare.mjs "…" --vision --no-open

# Vision + comparative ranking across the three variants
bun playground-engine-ui-kimi/scripts/engine-triple-compare.mjs "…" --vision --vision-compare --no-open

# Skip Playwright screenshots (faster, no browser required — vision disabled without PNGs)
bun playground-engine-ui-kimi/scripts/engine-triple-compare.mjs "…" --skip-shots

# Serve the compare page on a local port after generation
bun playground-engine-ui-kimi/scripts/engine-triple-compare.mjs "…" --serve --port 7421

# Suppress auto-open (recommended — use the gallery at http://localhost:7420/ instead)
bun playground-engine-ui-kimi/scripts/engine-triple-compare.mjs "…" --no-open
```

Output lands in `.forge/engine-triple/<runId>/`. The compare page shows each engine's card with:
- **Generation time** badge (amber pill)
- kimi-score, build mode, character count
- **Vision score** when `--vision` is set (pass/fail vs `FORGE_VISION_MIN`, default 75)
- Full-page PNG thumbnail (when Playwright is present)
- Link to open the isolated HTML page

---

## 2b · Phase 1 benchmark — `engine-benchmark.mjs`

Batch triple-compare across the **8 canonical verticals** (same briefs as `kimi-native.mjs`). Produces a leaderboard at `.forge/benchmark/<runId>/`.

```sh
# Full 8-vertical benchmark with vision gate (~45–60 min)
bun playground-engine-ui-kimi/scripts/engine-benchmark.mjs --vision --no-open

# Subset + comparative vision ranking
bun playground-engine-ui-kimi/scripts/engine-benchmark.mjs saas restaurant portfolio --vision --vision-compare --no-open

# Heuristic-only (faster, no vision API calls)
bun playground-engine-ui-kimi/scripts/engine-benchmark.mjs --no-open

# Serve leaderboard
bun playground-engine-ui-kimi/scripts/engine-benchmark.mjs --vision --serve --port 7422
```

Per brief: `.forge/benchmark/<runId>/<slug>/` contains the same artifacts as a single triple-compare run. Root `summary.json` aggregates wins, mean kimi-score, and mean vision score per engine.

---

## 3 · Gallery — `kimi-gallery-build.mjs`

Aggregates the **latest run** from `.forge/kimi-native/` into a browsable gallery served locally.

```sh
# Build the gallery index (reads latest kimi-native run automatically)
bun playground-engine-ui-kimi/scripts/kimi-gallery-build.mjs

# Skip screenshots (uses existing PNGs if any)
bun playground-engine-ui-kimi/scripts/kimi-gallery-build.mjs --skip-shots

# Start the gallery server (after building)
bun .forge/kimi-gallery/serve.mjs
# → open http://localhost:7420/ in the Cursor embedded browser
```

---

## 4 · Variety bench — `kimi-bench-variety.mjs`

Generates **N variants** of the same brief and computes a *variety distance* score across them. Useful for verifying that the seeding / grammar-routing produces meaningfully different outputs.

```sh
# Default: 3 variants
bun playground-engine-ui-kimi/scripts/kimi-bench-variety.mjs "Homepage for Tessellate, Berlin electronic label"

# Control count via env
KIMI_VARIETY_COUNT=5 bun playground-engine-ui-kimi/scripts/kimi-bench-variety.mjs "…"
```

Results written to `.forge/kimi-variety/<runId>/`. Prints a table of palette, section count, and pairwise variety distances.

---

## 5 · Richness evaluator — `kimi-eval-richness.mjs`

Static scorer — reads **existing HTML files** from a directory and prints `kimi-score` + `richness-score` for each without calling any LLM.

```sh
# Point at any directory of .html files
bun playground-engine-ui-kimi/scripts/kimi-eval-richness.mjs .forge/kimi-native/<runId>
bun playground-engine-ui-kimi/scripts/kimi-eval-richness.mjs .forge/engine-triple/<runId>
```

Output columns: `kimi=<0-100>  richness=<0-100>  sections=<n>  kinds=<list>`

---

## 6 · Head-to-head vs legacy — `kimi-vs-legacy.mjs`

Compares **kimi** vs **forge-gemini-native** on three canonical briefs (`saas`, `riso`, `fleet`).

```sh
# All three briefs
bun playground-engine-ui-kimi/scripts/kimi-vs-legacy.mjs

# Single slug
bun playground-engine-ui-kimi/scripts/kimi-vs-legacy.mjs saas
```

---

## Typical end-to-end workflow

```sh
# 1. Generate a batch with kimi
bun playground-engine-ui-kimi/scripts/kimi-native.mjs

# 2. Build + browse the gallery
bun playground-engine-ui-kimi/scripts/kimi-gallery-build.mjs
bun .forge/kimi-gallery/serve.mjs   # http://localhost:7420/

# 3. Compare kimi vs other engines on a custom brief
bun playground-engine-ui-kimi/scripts/engine-triple-compare.mjs \
  --prompt "SaaS dashboard for DevOps teams" --skip-shots --no-open

# 4. Spot-check quality of any generated HTML dir
bun playground-engine-ui-kimi/scripts/kimi-eval-richness.mjs .forge/kimi-native/$(ls .forge/kimi-native | tail -1)
```

---

## Environment variables

| Variable | Used by | Notes |
|----------|---------|-------|
| `GROQ_API_KEY` | kimi, triple-compare, benchmark, vision | Llama-3 tail calls via Groq; vision judge uses Llama-4 Scout |
| `GEMINI_API_KEY` | kimi quality path, gemini engine, triple-compare, benchmark | Also accepted as `GOOGLE_API_KEY` |
| `FORGE_VISION_MIN` | triple-compare `--vision`, benchmark | Vision pass threshold (default 75) |
| `KIMI_APP_SHELL_MODE=gemini-full` | kimi-native | Force full Gemini 2D app-shell (~18 s) |
| `KIMI_VARIETY_COUNT` | kimi-bench-variety | Number of variants to generate (default 3) |
