# GPT Engine UI Playground

Self-contained homepage generation experiment for the GPT-OSS 120B on Groq path.

The engine keeps the old forge lessons but isolates them from `playground-engine-ui`:

- GPT-OSS 120B on Groq is the primary planner and builder.
- A tiny Gemini identity fragment is optional for app shells only.
- Offline Mobbin DNA is local in `data/mobbin-dna.json`; there is no live Mobbin auth or quota path.
- Vertical document pages build in one GPT pass to avoid chunk collisions.
- App shells use a deterministic outer frame and only ask GPT to fill inner islands.

## API

```js
import { generateGptHomepage } from './src/engine.js'

const result = await generateGptHomepage('Homepage for ...', { seed: 'demo-1' })
// { html, plan, route, metrics, audits }
```

## CLI

```bash
bun playground-engine-ui-gpt/scripts/playground.mjs
bun playground-engine-ui-gpt/scripts/playground.mjs saas ops-console
bun playground-engine-ui-gpt/scripts/compare-variety.mjs "Homepage for a Tokyo coffee roaster" --count 2
```

Artifacts are written under `playground-engine-ui-gpt/.runs/`.

## Verification

Mocked tests:

```bash
bunx vitest run playground-engine-ui-gpt/tests
```

Real smoke requires `GROQ_API_KEY`; optional app-shell Gemini identity requires `GEMINI_API_KEY` or `GOOGLE_API_KEY`.
