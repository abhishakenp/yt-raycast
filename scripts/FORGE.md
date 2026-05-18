# Forge — GPT-OSS-120b homepage forge

Closed-loop pipeline that generates marketing homepages with GPT-OSS-120b under
strict structural + render + visual gates, ranks them, and promotes the
winner. Built so we can sweep many iterations cheaply, then port the prompt
+ knobs into the production engine.

## Files

| file | role |
| --- | --- |
| `forge-lib.mjs` | direct Groq caller (bypasses engine reasoning_effort='high'); audit-aware system prompt; variation axes (aesthetic × hero × pricing × composition); temperature schedule; winner-seed builder; self-critique fix-pass |
| `forge-reference.mjs` | distills `design-03-saas-homepage.html` into a compact density-target block |
| `forge-render-audit.mjs` | Playwright pass: empty bands, contrast (WCAG AA), console errors, fonts loaded |
| `forge-vision.mjs` | Groq Llama-4 Scout vision rubric (hierarchy / harmony / spacing / copy / artDirection — 0-25 each) |
| `forge-lucide-validate.mjs` | mirrors `lucide-static@latest` icon registry once; flags any `data-lucide` name not in the registry |
| `forge-assets.mjs` | optional Pexels image-hints prefetch (one call shared across all iters) |
| `forge-mobbin.mjs` | optional live Mobbin Pro reference fetch (Supabase auth cookie → /api/content/search-screens; 7-day on-disk cache; per-iter rotation across categories; element-coverage scoring) |
| `BRAND_ANCHORS` + `buildRigorBlock(iter)` in `forge-lib.mjs` | auth-free structural sibling of Mobbin: curated B2B SaaS anchor brands grouped by category (developer-tools / ai / productivity / data-infra / b2b-saas-generic), rotated deterministically per iter, plus non-negotiable structural rules (social proof, pricing, hero, feature copy, CTA) |
| `forge-once.mjs` | single-shot generator with full gating (struct + render + vision + lucide) |
| `forge-loop.mjs` | Ralph 50-iter loop with leaderboard + best/ symlink + Playwright top-K screenshots |
| `forge-shots.mjs` | re-screenshot a prior run's top-K |
| `forge-promote.mjs` | copy winning HTML + emit engine-patch sketch |
| `forge-summary.mjs` | post-run analyzer with leaderboard table, failure histogram, Mobbin A/B split (mobbin=on vs off when `FORGE_MOBBIN_MIX=1`), Mobbin status counts, coverage-tier vs kept-rate table, per-featured-app breakdown, plus a parallel Rigor A/B split (rigor=on vs off when `FORGE_RIGOR_MIX=1`) with per-category breakdown |
| `audit-vibe-palettes.mjs` | freshness audit for `theme-contrast.js` VIBE_PALETTES — pulls live Mobbin trending per vibe, flags drift between cited apps and current top-10 |
| `forge-mobbin-snapshot.mjs` | one-shot scraper that vendors Mobbin Pro top-20-per-category as `data/mobbin-snapshot.json` so the forge can run with `FORGE_USE_MOBBIN_SNAPSHOT=1` (zero auth, zero network). Refresh quarterly when `audit-vibe-palettes` flags HIGH drift |
| `forge-amp-bed.mjs` | **standalone safeguard, NOT wired in by default** — Acceptable Marketing Prompt sandbox. Heuristic + optional LLM classifier for catching absurd briefs ("make me a flight simulator that will make me rich"). Plug into a gateway when accepting user briefs from the wild. CLI: `bun scripts/forge-amp-bed.mjs "your prompt"` or `--demo` for canon tests |

## Composite kept condition

An iteration is `kept=true` only if **all** are true:

- `underBudget` — generation ms ≤ `FORGE_TIME_MS` (default 15000)
- `structuralOk` — `scoreRalphHomepage.ok && passesHomepagePublicDesignVerification.ok`
- `lucideOk` — every `data-lucide` name resolves in the registry
- `renderOk` — Playwright audit passes (no empty bands, body contrast ≥ 80% AA, fonts loaded)
- `visionOk` — vision judge total ≥ `FORGE_VISION_MIN` (default 75)

Leaderboard sort: `kept` first, then `vision.score` desc, then `score` desc, then `ms` asc.

## Usage

```bash
# Single shot
bun vanilla/scripts/forge-once.mjs "your brief"

# 50-iter Ralph loop
FORGE_ITERS=50 bun vanilla/scripts/forge-loop.mjs

# With Pexels images injected
FORGE_USE_ASSETS=1 bun vanilla/scripts/forge-loop.mjs

# Validate Mobbin auth + fetch chain (silent failure is the original sin)
bun scripts/forge-mobbin.mjs --check

# With live Mobbin Pro references (rotating featured anchor per iter)
FORGE_USE_MOBBIN=1 bun vanilla/scripts/forge-loop.mjs

# A/B mixed mode — even iters get Mobbin, odd iters are control. Single run
# eliminates cross-run drift. forge-summary splits the two arms statistically.
FORGE_MOBBIN_MIX=1 FORGE_ITERS=40 bun vanilla/scripts/forge-loop.mjs

# Auth-free rigor block — curated brand anchors + structural rules, no API.
# Sibling to FORGE_USE_MOBBIN: same anchor-density mechanic, pure JS.
FORGE_USE_RIGOR=1 bun vanilla/scripts/forge-loop.mjs

# Rigor A/B mixed mode — even iters get rigor, odd are control.
FORGE_RIGOR_MIX=1 FORGE_ITERS=40 bun vanilla/scripts/forge-loop.mjs

# Drift audit — does theme-contrast.js still cite the apps Mobbin trends?
bun scripts/audit-vibe-palettes.mjs           # all vibes
bun scripts/audit-vibe-palettes.mjs tech saas # subset

# With self-critique fix pass
FORGE_FIX_PASS=1 bun vanilla/scripts/forge-loop.mjs

# Re-shoot top-10 of latest run
bun vanilla/scripts/forge-shots.mjs latest 10

# Copy best HTML + emit engine-patch sketch
bun vanilla/scripts/forge-promote.mjs latest --copy-html --patch

# Post-run summary (leaderboard + failures + mobbin coverage)
bun vanilla/scripts/forge-summary.mjs latest
```

## Env knobs

| var | default | role |
| --- | --- | --- |
| `FORGE_ITERS` | 50 | iter count |
| `FORGE_TIME_MS` | 15000 | wall-clock budget per iter |
| `FORGE_VISION_MIN` | 75 | min vision-judge total to keep |
| `FORGE_TOPK` | 5 | top-K screenshots + leaderboard cut |
| `FORGE_PORT` | 9889 | static server port |
| `FORGE_MAX_TOK` | 10000 | Groq `max_tokens` |
| `FORGE_PROMPT` | (lib default) | base brief |
| `FORGE_USE_ASSETS` | 0 | prefetch Pexels block |
| `FORGE_USE_MOBBIN` | 0 | prefetch live Mobbin Pro references (requires `~/.mobbin-mcp/auth.json` — run `mobbin-mcp auth` once to mint it; verify with `bun scripts/forge-mobbin.mjs --check`) |
| `FORGE_USE_MOBBIN_SNAPSHOT` | 0 | route `forge-mobbin` through the vendored snapshot at `data/mobbin-snapshot.json` instead of the live API. Zero-auth, zero-network. Refresh with `bun scripts/forge-mobbin-snapshot.mjs` |
| `FORGE_MOBBIN_MIX` | 0 | mixed A/B mode — even iters use Mobbin, odd iters don't. `meta.mobbin` is populated only on the on-arm; `forge-summary` splits stats per arm |
| `FORGE_MOBBIN_CATEGORIES` | `Developer Tools,AI,Productivity` | comma-separated Mobbin app categories (override per run) |
| `FORGE_MOBBIN_PATTERN` | `Home` | comma-separated Mobbin screen patterns — `Home` is what Pro web data is tagged with; `Landing Page` / `Hero Section` exist in the filter UI but return zero |
| `FORGE_USE_RIGOR` | 0 | enable curated brand-anchor + structural-rules block on every iter — auth-free sibling to `FORGE_USE_MOBBIN` (pure JS, no API). Rotates category per iter across developer-tools / ai / productivity / data-infra / b2b-saas-generic |
| `FORGE_RIGOR_MIX` | 0 | mixed A/B mode for rigor — even iters get rigor, odd iters don't. `meta.rigor` is populated only on the on-arm; `forge-summary` splits stats per arm and per category |
| `FORGE_FIX_PASS` | 0 | enable self-critique pass when budget allows |
| `FORGE_SKIP_VISION` | 0 | skip vision judge (debug only) |
| `FORGE_SKIP_RENDER` | 0 | skip Playwright audit (debug only) |
| `FORGE_VISION_MODEL` | `meta-llama/llama-4-scout-17b-16e-instruct` | Groq vision model |

Outputs live under `vanilla/.forge/` (gitignored). Each run has its own
`vanilla/.forge/loop/<runId>/` directory with per-iter HTML + meta.json +
shot.png + a `best/` copy + `leaderboard.json`.

## Vendored snapshot (offline Mobbin)

The forge pipeline can run without Mobbin auth or network access by reading a
vendored JSON snapshot of trending Mobbin Pro screens. This is option 3 of the
Mobbin-independence path — it trades freshness for zero external dependency.

```bash
# Refresh the snapshot (writes data/mobbin-snapshot.json).
# Requires working Mobbin auth at the time of refresh.
bun scripts/forge-mobbin-snapshot.mjs

# Use the snapshot instead of the live API (no auth required at runtime).
FORGE_USE_MOBBIN_SNAPSHOT=1 FORGE_USE_MOBBIN=1 bun scripts/forge-loop.mjs

# Validate the snapshot (skips auth chain when SNAPSHOT=1).
FORGE_USE_MOBBIN_SNAPSHOT=1 bun scripts/forge-mobbin.mjs --check
```

How it relates to the live path:

- The live path (`FORGE_USE_MOBBIN=1` alone) hits Mobbin's
  `/api/content/search-screens` per run, behind the Supabase auth cookie. Always
  fresh, requires auth + network.
- The snapshot path (`FORGE_USE_MOBBIN_SNAPSHOT=1`) reads
  `data/mobbin-snapshot.json` and skips auth + network entirely. Same return
  shape as the live path; `_status.reason` is `snapshot` instead of `ok`.
- Refresh cadence is tied to `audit-vibe-palettes.mjs` — when the audit flags
  drift between cited apps and current Mobbin trends, regenerate the snapshot.

The snapshot covers a broad category set (Developer Tools, AI, Productivity,
Business, Shopping, Food & Drink, Health & Fitness, Education, Travel, Real
Estate, Finance, Lifestyle, Social) with up to 20 top-trending Home-pattern
web screens per category. `FORGE_MOBBIN_CATEGORIES` selects the subset used at
runtime.
