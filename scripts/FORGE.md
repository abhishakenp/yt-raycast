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
| `forge-once.mjs` | single-shot generator with full gating (struct + render + vision + lucide) |
| `forge-loop.mjs` | Ralph 50-iter loop with leaderboard + best/ symlink + Playwright top-K screenshots |
| `forge-shots.mjs` | re-screenshot a prior run's top-K |
| `forge-promote.mjs` | copy winning HTML + emit engine-patch sketch |
| `forge-summary.mjs` | post-run analyzer with leaderboard table, failure histogram, Mobbin A/B split (mobbin=on vs off when `FORGE_MOBBIN_MIX=1`), Mobbin status counts, coverage-tier vs kept-rate table, per-featured-app breakdown |
| `audit-vibe-palettes.mjs` | freshness audit for `theme-contrast.js` VIBE_PALETTES — pulls live Mobbin trending per vibe, flags drift between cited apps and current top-10 |

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
| `FORGE_MOBBIN_MIX` | 0 | mixed A/B mode — even iters use Mobbin, odd iters don't. `meta.mobbin` is populated only on the on-arm; `forge-summary` splits stats per arm |
| `FORGE_MOBBIN_CATEGORIES` | `Developer Tools,AI,Productivity` | comma-separated Mobbin app categories (override per run) |
| `FORGE_MOBBIN_PATTERN` | `Home` | comma-separated Mobbin screen patterns — `Home` is what Pro web data is tagged with; `Landing Page` / `Hero Section` exist in the filter UI but return zero |
| `FORGE_FIX_PASS` | 0 | enable self-critique pass when budget allows |
| `FORGE_SKIP_VISION` | 0 | skip vision judge (debug only) |
| `FORGE_SKIP_RENDER` | 0 | skip Playwright audit (debug only) |
| `FORGE_VISION_MODEL` | `meta-llama/llama-4-scout-17b-16e-instruct` | Groq vision model |

Outputs live under `vanilla/.forge/` (gitignored). Each run has its own
`vanilla/.forge/loop/<runId>/` directory with per-iter HTML + meta.json +
shot.png + a `best/` copy + `leaderboard.json`.
