# playground-engine-ui-kimi

Kimi K2-target homepage engine for Ship Fast. Goal: **Kimi-grade design under 20 seconds** on Groq GPT-OSS-120B + Gemini 3.5 Flash, with **high same-brief variety**.

## Architecture

Visual-first compiler (not “ask the LLM to invent every layout detail”):

1. **Router** — Mobbin DNA anchor pair + seeded page grammar + variety axes
2. **Planner** (GPT-OSS-120B, ~1.5–2s) — compact genome: visual world, media strategy, sections
3. **Composer**
   - `vertical-doc` — Gemini hero/top + GPT-OSS tail (parallel, ~15–17s)
   - `app-shell` — deterministic 2D sidebar frame + GPT-OSS island JSON (+ optional Gemini identity)
4. **Postprocess** — light `data-img` placeholders (no schematic art-surface injection by default), palette merge, honest kimi audits

## Quick start

```bash
# Requires GROQ_API_KEY + GEMINI_API_KEY (or GOOGLE_API_KEY)
bun playground-engine-ui-kimi/scripts/kimi-native.mjs
bun playground-engine-ui-kimi/scripts/kimi-native.mjs riso fleet

# Same-brief variety (3 variants)
bun playground-engine-ui-kimi/scripts/kimi-bench-variety.mjs "Homepage for Aerie Skincare..."

# Compare kimi score vs forge-gemini-native
bun playground-engine-ui-kimi/scripts/kimi-vs-legacy.mjs saas riso fleet

# Unit tests (no API keys)
cd playground-engine-ui-kimi && bun run test
```

Artifacts: `.forge/kimi-native/<runId>/`

## Env

| Variable | Default | Purpose |
|----------|---------|---------|
| `GROQ_API_KEY` | — | Required |
| `GEMINI_API_KEY` / `GOOGLE_API_KEY` | — | Required for vertical-doc hybrid |
| `GEMINI_MODEL` | `gemini-3.5-flash` | Identity/hero builder |
| `KIMI_ENGINE_GROQ_MODEL` | `openai/gpt-oss-120b` | Planner + body |
| `KIMI_APP_SHELL_MODE` | `hybrid` | `hybrid` or `gemini-full` for true 2D (~18s) |
| `KIMI_FAST` | off | `1` = fast Groq-only bench (lower craft) |
| `KIMI_ART_SURFACES` | off | `1` = inject deterministic gradient art blocks (usually uglier) |
| `KIMI_PREVIEW_LABELS` | off | `1` = show data-img labels in preview |

**Default path** matches `forge-gemini-native`: Gemini builds hero + first 2–3 sections; Groq tail in parallel; full design contract (grid/prose/simple-layout rules).

## Quality gates

- **kimi-score** ≥ 72 (stricter — penalizes schematic blocks, blur noise, rotations)
- **under20s** wall-clock on production path
- **variety**: same brief → different grammar/palette/treatment (see `kimi-bench-variety.mjs`)

## Kimi exemplars

Reference patterns live in `data/kimi-exemplars/exemplar-index.json` (fleet console, riso catalog, butchery, music label). Ingest HTML from `.forge/vs-kimi/*/kimi.html` when available.

## Production integration

```js
import { generateKimiHomepage } from './playground-engine-ui-kimi/src/index.js'

const { html, plan, metrics, audits } = await generateKimiHomepage(brief, { seed })
// html uses data-lucide + data-img placeholders (Pexels downstream)
```

## Relation to other playgrounds

| Folder | Role |
|--------|------|
| `playground-engine-ui/` | Current shipped hybrid (`forge-gemini-native.mjs`) |
| `playground-engine-ui-gpt/` | GPT-OSS single-pass + deterministic app shell |
| `playground-engine-ui-kimi/` | Kimi K2 target: grammars + media compiler + variety |
