# India Mode — Implementation Plan

## Overview

Add an opt-in "India Mode" that activates automatically when the user's English prompt references a supported Indian language. When active:
- Content generation phases route to **hex-1 via RunPod**
- Structural/reasoning phases continue using **Groq**
- Indian design aesthetics are injected at prompt and component level

This is purely additive — the existing English pipeline is untouched.

---

## Step 0: hex-1 Supported Languages ✅ Confirmed

hex-1 supports exactly these 5 languages:
- Hindi (`hi`)
- Tamil (`ta`)
- Telugu (`te`)
- Kannada (`kn`)
- Malayalam (`ml`)

---

## Step 1: Environment Configuration

**File:** `src/env.js` + `.env.local`

Add new env vars:

```
RUNPOD_API_URL=https://<your-endpoint>.runpod.net/v1
RUNPOD_API_KEY=<your-runpod-key>
RUNPOD_MODEL=budecosystem/hex-1
```

No other changes to existing env vars. Groq vars stay as-is.

---

## Step 2: Config — Indian Language Registry

**File:** `src/config.js`

Add a new section:

```js
export const SUPPORTED_INDIAN_LANGUAGES = [
  { code: 'hi', name: 'Hindi',     keywords: ['hindi', 'हिंदी'] },
  { code: 'te', name: 'Telugu',    keywords: ['telugu', 'తెలుగు'] },
  { code: 'ta', name: 'Tamil',     keywords: ['tamil', 'தமிழ்'] },
  { code: 'kn', name: 'Kannada',   keywords: ['kannada', 'ಕನ್ನಡ'] },
  { code: 'ml', name: 'Malayalam', keywords: ['malayalam', 'മലയാളം'] },
]

export const INDIAN_DESIGN_TOKENS = {
  colors: {
    primary:    ['#FF6B35', '#FF9933', '#FFD700'],  // saffron, orange, gold
    accent:     ['#138808', '#0B6623', '#006400'],  // India green variants
    decorative: ['#9B2335', '#C41E3A', '#800020'],  // deep reds
    secondary:  ['#00356B', '#1B4F8A', '#003580'],  // peacock blue
  },
  typography: {
    hindi:     { fontFamily: 'Noto Sans Devanagari, sans-serif' },
    telugu:    { fontFamily: 'Noto Sans Telugu, sans-serif' },
    tamil:     { fontFamily: 'Noto Sans Tamil, sans-serif' },
    kannada:   { fontFamily: 'Noto Sans Kannada, sans-serif' },
    malayalam: { fontFamily: 'Noto Sans Malayalam, sans-serif' },
  },
  patterns: [
    'geometric mandala border accents',
    'paisley motif dividers',
    'lotus decorative elements',
    'rangoli-inspired section dividers',
  ],
}
```

---

## Step 3: hex-1 LLM Client

**File:** `src/llm/hex1.js` *(new file)*

Mirror the structure of `src/llm/groq.js`:

- `hex1Complete(prompt, options)` — calls RunPod endpoint via fetch
- Handles auth header (`Authorization: Bearer RUNPOD_API_KEY`)
- Returns same shape as Groq responses so callers are interchangeable
- Add `hex1Parallel(prompts)` for parallel content generation (mirrors `groqParallel`)
- Error handling: if RunPod is unreachable, throw with clear message (no silent fallback to Groq — fail loudly so the user knows)

---

## Step 4: Language Detection Utility

**File:** `src/pipeline/detect-india-mode.js` *(new file)*

```
detectIndiaMode(userPrompt) → { isIndian: bool, language: { code, name } | null }
```

Logic:
1. Lowercase the prompt
2. Iterate `SUPPORTED_INDIAN_LANGUAGES` and check if any keyword appears in the prompt
3. Also check patterns like `"in hindi"`, `"in tamil"`, `"<lang> language"`, `"<lang> website"`, `"<lang> version"`
4. Return the first match found, or `{ isIndian: false, language: null }`

This runs once at the very start of the pipeline and the result is passed through all phases via the session context.

---

## Step 5: Session Context — India Mode Flag

**File:** `src/pipeline/runner.js`

At the top of `runAll()`:
1. Call `detectIndiaMode(userPrompt)`
2. Attach result to the session context object: `ctx.indiaMode = { isIndian, language }`
3. Pass `ctx` through all phases as already done

No phase needs to import `detectIndiaMode` directly — they read from `ctx`.

---

## Step 6: LLM Router Utility

**File:** `src/llm/router.js` *(new file)*

```js
// Returns the right LLM client function based on ctx and phase type
export function getContentLLM(ctx) {
  return ctx.indiaMode?.isIndian ? hex1Complete : groqComplete
}

export function getStructuralLLM(_ctx) {
  return groqComplete  // always Groq for structural phases
}
```

Phases import from the router instead of importing groq/hex1 directly.

---

## Step 7: Prompt Injection — Indian Design Aesthetics

**File:** `src/prompts/design-brief.js`

When `ctx.indiaMode.isIndian`:
- Append to the design brief prompt: inject `INDIAN_DESIGN_TOKENS` (color palette, typography for the target language, pattern suggestions)
- Instruct the LLM to create a design brief rooted in Indian visual tradition while keeping it modern and web-appropriate

**File:** `src/prompts/homepage.js`

When `ctx.indiaMode.isIndian`:
- Inject language instruction: `"Generate all text content in {language.name}"`
- Inject font family from `INDIAN_DESIGN_TOKENS.typography[language.code]`
- Inject color palette and decorative pattern hints

**File:** `src/prompts/page.js`

Same injections as `homepage.js` — all page content goes through hex-1 with Indian language + design hints.

---

## Step 8: Component-Level Design Changes (Renderers)

### 8a. Shared Renderer Utilities

**File:** `src/renderers/shared.js`

Add `getIndianStyleDefaults(ctx)` that returns:
- CSS custom properties for Indian color tokens
- `@import` for Google Fonts Noto Sans (script-specific)
- Base ornamental CSS classes (mandala borders, rangoli dividers as SVG or CSS patterns)

### 8b. HTML Renderer

**File:** `src/renderers/html/index.js`

When `ctx.indiaMode.isIndian`:
- Inject `<link>` tag for Noto Sans script font in `<head>`
- Apply Indian CSS custom properties to `:root`
- Add decorative section dividers between major sections

### 8c. React Renderer

**File:** `src/renderers/react/index.js`

When `ctx.indiaMode.isIndian`:
- Add `IndianThemeProvider` wrapper component (generated inline, not a dependency)
- Inject font import in `index.css`
- Pass Indian color tokens as CSS variables

### 8d. Next.js Renderer

**File:** `src/renderers/nextjs/index.js`

When `ctx.indiaMode.isIndian`:
- Add font config to `layout.jsx` using `next/font/google` for Noto Sans script
- Inject CSS variables in `globals.css`

---

## Step 9: Phase Routing — Use LLM Router

Update these phases to use `getContentLLM(ctx)` instead of hardcoded groq calls:

| File | Change |
|---|---|
| `src/pipeline/phase-homepage.js` | `getContentLLM(ctx)` for content generation call |
| `src/pipeline/phase-template.js` | `getContentLLM(ctx)` for page content calls |

These phases stay on Groq (use `getStructuralLLM(ctx)`):

| File | Reason |
|---|---|
| `src/pipeline/phase-detect.js` | Site type detection — structural |
| `src/pipeline/phase-context.js` | Requirements extraction — structural |
| `src/pipeline/phase-design.js` | Design brief generation — structural (but with Indian hints injected in prompt) |
| `src/pipeline/phase-site-spec.js` | Site spec — structural |
| `src/pipeline/phase-tasks.js` | Task derivation — structural |
| `src/pipeline/phase-navfix.js` | Nav fix — structural |

---

## Step 10: UI Feedback (WebSocket)

**File:** `src/server/websocket.js`

When India Mode is active, emit an additional status event early in the pipeline:

```json
{ "type": "india-mode", "language": "Hindi", "model": "hex-1" }
```

The dashboard can display a badge like `"Generating in Hindi via hex-1"` — this is a minor UI touch, implementation in the dashboard template is optional for v1.

---

## File Change Summary

| File | Action |
|---|---|
| `src/config.js` | Add `SUPPORTED_INDIAN_LANGUAGES`, `INDIAN_DESIGN_TOKENS` |
| `src/env.js` | Add RunPod env var loading |
| `src/llm/hex1.js` | **New** — hex-1 RunPod client |
| `src/llm/router.js` | **New** — LLM routing utility |
| `src/pipeline/detect-india-mode.js` | **New** — language detection from prompt |
| `src/pipeline/runner.js` | Call `detectIndiaMode`, attach to ctx |
| `src/prompts/design-brief.js` | Inject Indian design tokens when India Mode |
| `src/prompts/homepage.js` | Inject language + font + design hints |
| `src/prompts/page.js` | Same as homepage |
| `src/pipeline/phase-homepage.js` | Use `getContentLLM(ctx)` |
| `src/pipeline/phase-template.js` | Use `getContentLLM(ctx)` |
| `src/renderers/shared.js` | Add `getIndianStyleDefaults()` |
| `src/renderers/html/index.js` | Apply Indian styles when India Mode |
| `src/renderers/react/index.js` | Apply Indian styles when India Mode |
| `src/renderers/nextjs/index.js` | Apply Indian styles when India Mode |
| `src/server/websocket.js` | Emit `india-mode` status event |
| `.env.local` | Add RunPod vars |

---

## What is NOT changing

- `src/llm/groq.js` — untouched
- `src/llm/claude.js` — untouched
- All payment, auth, export, GitHub, session management code — untouched
- The English generation pipeline — fully preserved
- Existing site types, spec schema, renderers base behavior — untouched

---

## V1 Scope Boundary

- Supports exactly the 5 languages hex-1 is trained on (confirm in Step 0)
- Auto-detection only — no manual language picker UI in v1
- No mixed-language pages in v1 (either fully Indian or fully English)
- No translation of existing English sessions — India Mode only applies to new generations
