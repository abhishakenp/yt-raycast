# Kimi engine — quality assessment

## Honest score (May 2026)

Earlier automated **kimi-score ~86** was misleading: it rewarded schematic signals (gradient art blocks, blur orbs, grid count) that look like craft but read as generated HTML. User-facing quality was closer to **~40%** of Kimi K2 / releasable bar.

Reference engines in this repo that get closer to **~85–90%**:

| Engine | Path | Why it looks better |
|--------|------|---------------------|
| **forge-gemini-native** | `playground-engine-ui/scripts/forge-gemini-native.mjs` | Gemini builds hero + first 2–3 sections in one coherent pass; full design contract; simple `data-img` placeholders |
| **playground-engine-ui-gpt** | `playground-engine-ui-gpt/src/engine.js` | Single-pass full document (7600 tokens) with retries for section count |

## What changed (quality default)

1. **Default pipeline = gemini-native hybrid** (`vertical-doc-gemini-hybrid`): Gemini top + Groq tail in parallel (~15–18s).
2. **Full design contract** (grid / prose / simple-layout / no rotation stacks) — not the 6-line fast contract.
3. **Art-surface injection OFF by default** (`KIMI_ART_SURFACES=1` to re-enable schematic blocks).
4. **Stricter kimi-score** — penalizes blur noise, rotations, schematic labels, missing font/config.
5. **Planner** runs hotter (0.88) and asks for distinctive decor + 6–9 concrete sections.

## Bench modes

```bash
# Quality (default) — use for gallery / production
bun playground-engine-ui-kimi/scripts/kimi-native.mjs

# Fast Groq-only — speed experiments only
KIMI_FAST=1 bun playground-engine-ui-kimi/scripts/kimi-native.mjs
```

## Remaining gap

- No real photography (still `data-img` placeholders; pipeline downstream swaps Pexels).
- Tail is still Groq — can drift from Gemini top on palette/spacing.
- **kimi-score ~60–70** after fix is intentional; treat **human screenshot review** as the release gate.

## Next improvements (if chasing 90%)

1. Gemini tail for last 2 sections (slower, ~25s) or single Gemini full-page for portfolio/agency.
2. Wire Pexels (or project image step) before gallery screenshots.
3. Human-quality gate script: Playwright screenshot + optional vision critique (offline only).
