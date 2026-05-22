---
description: Severe Kimi K2.5 publication judge loop for playground-engine-ui-ship (ACPX)
---

# Ship Publication Severe Judge (Kimi K2.5 + ACPX)

## Scripts overview

| Script | Purpose |
|--------|---------|
| `engine-quad-judge.mjs` | Run **ship, kimi, forge, gpt** on one brief → Kimi K2.5 score /100 each |
| `ship-improve-loop.mjs` | Regenerate **ship** with judge feedback until score ≥ 90 (`--max=0` = unlimited) |
| `run-ship-severe-judge.mjs` | ACPX flow: generate → judge → replan loop |

Multi-agent loop inspired by `multi-agent-loop.md`:

1. **Generate** — `generateShipHomepage` + structural preflight + screenshot
2. **Severe judge** — Kimi K2.5 via `cursor-agent --model kimi-k2.5` (strict publication rubric)
3. **Retry** — Cursor summarizes fixes; feedback injected into next seed (max 3 loops)

## Quick run

```bash
# Quality path (hybrid Gemini + Groq)
bun playground-engine-ui-ship/scripts/run-ship-severe-judge.mjs

# Fast Groq-only path (recommended for iteration)
SHIP_FAST=1 bun playground-engine-ui-ship/scripts/run-ship-severe-judge.mjs --max=3

# Direct ACPX flow
acpx --approve-all --cwd /Users/livio/Documents/ship-fast flow run \
  playground-engine-ui-ship/workflows/ship-publication-severe-judge.flow.ts \
  --input-json '{"brief":"A blog about dogs...","slug":"blog-dogs","max_loops":3,"fast":true}'
```

## Standalone steps

```bash
# Generate one attempt
bun playground-engine-ui-ship/scripts/ship-judge-run.mjs --run-id=test --attempt=1

# Kimi K2.5 judge only (needs cursor-agent + kimi-k2.5)
bun playground-engine-ui-ship/scripts/ship-severe-judge-kimi.mjs .forge/ship-severe-judge/test/a1
```

## Pass criteria

- Kimi K2.5 judge score ≥ **85**
- No critical defects (SaaS hero, empty placeholders, missing grid)
- Structural preflight: publicationOk + 4+ photo thumbnails

Artifacts: `.forge/ship-severe-judge/<runId>/a<N>/` — `blog-dogs.html`, `.png`, `verdict.json`

## Requirements

- `acpx` (global): `npm i -g acpx`
- `cursor-agent` with `kimi-k2.5` model access
- `GROQ_API_KEY` (+ Gemini keys unless `SHIP_FAST=1`)
- Optional: `agent-browser` for screenshots fed to the judge prompt
