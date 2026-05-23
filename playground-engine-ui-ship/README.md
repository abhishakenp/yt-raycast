# playground-engine-ui-ship

Unified Ship-Fast homepage engine — consolidates learnings from `playground-engine-ui-kimi`, `forge-gemini-native`, and `playground-engine-ui-gpt`.

**Goal:** Kimi-grade design under 20s, with first-class site-kind routing so briefs like **"a blog about dogs"** produce a publication index (featured post + post grid), not a SaaS marketing hero.

## Quick start

```bash
# Requires GROQ_API_KEY + GEMINI_API_KEY (or GOOGLE_API_KEY) for quality path
bun playground-engine-ui-ship/scripts/ship-native.mjs
bun playground-engine-ui-ship/scripts/ship-native.mjs blog-dogs saas

# Fast Groq-only single pass (no Gemini)
SHIP_FAST=1 bun playground-engine-ui-ship/scripts/ship-native.mjs blog-dogs

# Compare vs production groqHomepage
bun playground-engine-ui-ship/scripts/ship-vs-production.mjs blog-dogs

# Severe Kimi K2.5 judge loop (ACPX: generate → judge → retry)
SHIP_FAST=1 bun playground-engine-ui-ship/scripts/run-ship-severe-judge.mjs --max=3

# Four-engine benchmark + Kimi K2.5 scores (ship | kimi | forge | gpt)
bun playground-engine-ui-ship/scripts/engine-quad-judge.mjs "A blog about dogs…"

# Improve ship until Kimi judge ≥ 90 (--max=0 for unlimited)
SHIP_FAST=1 bun playground-engine-ui-ship/scripts/ship-improve-loop.mjs --target=90 --max=0

# Unit tests (no API keys)
cd playground-engine-ui-ship && bun run test
```

Artifacts: `.forge/ship-native/<runId>/`

### Gallery grid (8 verticals at http://localhost:7420/)

```bash
# 1. Generate the 8 canonical verticals (~2–3 min quality path)
bun playground-engine-ui-ship/scripts/ship-native.mjs

# 2. Build the gallery (desktop screenshots + index)
bun playground-engine-ui-ship/scripts/ship-gallery-build.mjs

# 3. Serve — open http://localhost:7420/ in Cursor browser
bun .forge/ship-gallery/serve.mjs
```

Skip Playwright re-capture if ship-native already wrote PNGs:

```bash
bun playground-engine-ui-ship/scripts/ship-gallery-build.mjs --skip-shots
```

## Architecture

1. **Router** — `inferSiteHint` + page grammar + Mobbin DNA anchors
2. **Planner** — GPT-OSS-120B compact genome (blog sections forced for publication briefs)
3. **Composer**
   - **Default:** Gemini top + Groq tail (hybrid, ~15–18s)
   - **`SHIP_FAST=1`:** GPT-OSS single pass
   - **`app-shell`:** Gemini full 2D pass for ops consoles
4. **Audits** — kimi-score + publication-fit penalties for blog drift

## Env

| Variable | Default | Purpose |
|----------|---------|---------|
| `GROQ_API_KEY` | — | Required |
| `GEMINI_API_KEY` / `GOOGLE_API_KEY` | — | Required for quality hybrid path |
| `GEMINI_MODEL` | `gemini-3.5-flash` | Hero/top builder |
| `SHIP_ENGINE_GROQ_MODEL` | `openai/gpt-oss-120b` | Planner + body |
| `SHIP_FAST` | off | `1` = Groq single-pass bench |
| `SHIP_APP_SHELL_MODE` | `gemini-full` | App-shell build mode |

## Production integration

The main pipeline uses this engine by default when `GROQ_API_KEY` and `GEMINI_API_KEY`/`GOOGLE_API_KEY` are available. Use `SHIPFAST_HOMEPAGE_ENGINE=0` to roll back to the legacy homepage path. `SHIPFAST_HOMEPAGE_ENGINE=ship` still forces this engine for local experiments.

## Relation to other playgrounds

| Folder | Role |
|--------|------|
| `playground-engine-ui-ship/` | **Canonical unified engine** (this package) |
| `playground-engine-ui-kimi/` | Kimi K2 research fork (superseded by ship for new work) |
| `playground-engine-ui/` | Legacy forge scripts (`forge-gemini-native.mjs`) |
| `playground-engine-ui-gpt/` | GPT single-pass experiment |
