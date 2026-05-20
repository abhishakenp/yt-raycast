#!/usr/bin/env bun
/**
 * Forge amp-bed — Acceptable Marketing Prompt sandbox/safeguard.
 *
 * STANDALONE — NOT wired into forge-loop / forge-once by default. Sits here
 * as a guardrail you can invoke manually or plug into a gateway when the
 * forge starts accepting user-submitted briefs from the wild.
 *
 * Catches the absurd-brief case the user demoed: e.g. "make me a flight
 * simulator that will make me rich" — neither a marketing homepage nor a
 * realistic outcome. We don't want the forge spending 20 minutes generating
 * gates against a prompt that's never going to score.
 *
 * Two layers:
 *   1. Heuristic prefilter — deterministic regex pass, no API call. Catches
 *      obvious unrealistic / off-scope / sensitive / malformed cases in <1ms.
 *   2. LLM judge (opt-in, --llm) — Groq one-shot classification for nuanced
 *      cases the heuristic doesn't cover (e.g. "homepage for my paperclip
 *      optimizer" passes the regex but is plausibly off-scope).
 *
 * Verdicts: pass | unrealistic | off-scope | sensitive | malformed | ambiguous
 *
 * Usage:
 *   bun scripts/forge-amp-bed.mjs "your prompt"            human-readable
 *   bun scripts/forge-amp-bed.mjs --json "your prompt"     JSON output
 *   bun scripts/forge-amp-bed.mjs --llm  "your prompt"     also call LLM judge
 *   bun scripts/forge-amp-bed.mjs --demo                   run the canon tests
 *
 * Exit codes: 0 = pass, 1 = non-pass verdict, 2 = bad args.
 *
 * Programmatic:
 *   import { classifyPrompt, heuristicCheck, llmCheck } from './forge-amp-bed.mjs'
 *   const result = await classifyPrompt(prompt, { useLLM: true })
 *   if (result.verdict !== 'pass') { reject(result.reason); return }
 */

let _groqConfig = null
async function getGroqConfig() {
  if (_groqConfig) return _groqConfig
  try {
    // Lazy import — keeps the heuristic path zero-dependency.
    const cfg = await import('@ship-fast/engine/config.js')
    _groqConfig = {
      apiKey: cfg.GROQ_API_KEY,
      host: cfg.GROQ_HOST,
      model: process.env.FORGE_AMP_BED_MODEL || cfg.HOMEPAGE_MODEL || 'openai/gpt-oss-120b',
    }
    return _groqConfig
  } catch {
    _groqConfig = { apiKey: null, host: null, model: null }
    return _groqConfig
  }
}

// Tuned against the canon test set at the bottom of this file. False positives
// here block real briefs from running; false negatives let absurd prompts
// through to the LLM judge or the forge itself. Bias toward false negatives
// in this layer — the LLM judge catches the subtle cases.
const RED_FLAGS = {
  unrealistic: [
    /\bmake (me|us|you) rich\b/i,
    /\bget rich (quick|fast|easy)\b/i,
    /\bpassive income\b/i,
    /\bguaranteed (success|profit|returns?|income)\b/i,
    /\b(quick|easy) money\b/i,
    /\b\d+x (your|my) (income|revenue|salary)\b/i,
    /\bbecome a millionaire\b/i,
    /\b6-?figure\b.*\bin (a|one) (week|month)\b/i,
  ],
  'off-scope': [
    /\bflight sim(ulator)?\b/i,
    /\b(video|mobile|console) game\b/i,
    /\b(minecraft|fortnite|roblox|gta)\b/i,
    /\b3d (game|engine|world)\b/i,
    /\b(rom|emulator|jailbreak|crack|warez)\b/i,
    /\b(operating system|kernel|driver)\b/i,
    /\bcompil(er|ation toolchain)\b/i,
  ],
  sensitive: [
    /\bonlyfans\b/i,
    /\b(adult|porn|escort|cam ?girl)\b/i,
    /\b(pump.?and.?dump|shitcoin|rugpull)\b/i,
    /\b(weapon|firearm|gun shop|ammunition)\b/i,
    /\b(child|minor) (porn|abuse)\b/i,
    /\b(meth|cocaine|heroin|fentanyl)\b/i,
  ],
}

const SUGGESTIONS = {
  unrealistic:
    'rephrase without outcome promises — describe the product, not the wealth it generates. Forge scores on design quality, not earnings claims.',
  'off-scope':
    'forge builds B2B/DTC marketing homepages, not games / OSes / piracy tools. Describe a business or product you want a marketing site for.',
  sensitive: 'topic outside the supported scope for the forge pipeline.',
  malformed: 'prompt should be 10–2000 chars describing a business or product for the homepage.',
  ambiguous: 'brief is too vague — name the product, target user, and core value proposition.',
}

/**
 * Layer 1: pure-function regex check. Fast, deterministic, zero deps.
 * Returns the first verdict that fires; order of RED_FLAGS keys matters
 * (unrealistic > off-scope > sensitive intentionally — "rich" claims are
 * the most-likely to surface, "off-scope" is more specific).
 */
export function heuristicCheck(prompt) {
  const text = String(prompt || '').trim()
  if (text.length < 10) {
    return {
      verdict: 'malformed',
      layer: 'heuristic',
      reason: `prompt too short (${text.length} chars, min 10)`,
      suggestion: SUGGESTIONS.malformed,
    }
  }
  if (text.length > 2000) {
    return {
      verdict: 'malformed',
      layer: 'heuristic',
      reason: `prompt too long (${text.length} chars, max 2000)`,
      suggestion: SUGGESTIONS.malformed,
    }
  }
  for (const [verdict, patterns] of Object.entries(RED_FLAGS)) {
    for (const re of patterns) {
      const m = text.match(re)
      if (m) {
        return {
          verdict,
          layer: 'heuristic',
          reason: `matched ${re.source} → "${m[0]}"`,
          suggestion: SUGGESTIONS[verdict],
        }
      }
    }
  }
  return { verdict: 'pass', layer: 'heuristic', reason: 'no red flags', suggestion: null }
}

const LLM_SYSTEM = `You are a strict brief classifier for a B2B SaaS / DTC marketing homepage generator.

The generator builds Tailwind+vanilla HTML marketing homepages for real businesses. Briefs should describe a product/service, target user, and value proposition.

Classify the user's brief into exactly one verdict:
- pass: legitimate brief for a marketing homepage of a real or plausible business
- unrealistic: promises wealth/outcomes (get rich, passive income, guaranteed profit)
- off-scope: requests something that isn't a marketing homepage (game, OS, app binary, piracy tool)
- sensitive: adult / illegal / weapons / hard drugs / financial scams
- ambiguous: too vague to act on (e.g. "make me a website") — needs more detail

Reply with ONLY a single JSON object, no prose: {"verdict": "...", "reason": "<one short sentence>", "confidence": 0.0-1.0}.`

/**
 * Layer 2: Groq one-shot classification for prompts that pass the heuristic
 * but might still be unhelpful (vague, oddly framed, plausibly off-scope).
 * Returns the same shape as heuristicCheck. Skips silently with verdict=pass
 * if GROQ_API_KEY is missing — this is a safeguard, not a blocker.
 */
export async function llmCheck(prompt, { model, signal } = {}) {
  const cfg = await getGroqConfig()
  if (!cfg.apiKey) {
    return {
      verdict: 'pass',
      layer: 'llm',
      reason: 'GROQ_API_KEY not set — LLM layer skipped',
      suggestion: null,
    }
  }
  const useModel = model || cfg.model
  const body = {
    model: useModel,
    messages: [
      { role: 'system', content: LLM_SYSTEM },
      { role: 'user', content: String(prompt || '') },
    ],
    temperature: 0,
    max_tokens: 200,
    stream: false,
    response_format: { type: 'json_object' },
  }
  try {
    const res = await fetch(`${cfg.host}/openai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return {
        verdict: 'pass',
        layer: 'llm',
        reason: `LLM call failed (HTTP ${res.status}: ${text.slice(0, 100)}) — failing open`,
        suggestion: null,
      }
    }
    const json = await res.json()
    const raw = json.choices?.[0]?.message?.content || '{}'
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      return {
        verdict: 'pass',
        layer: 'llm',
        reason: 'LLM returned unparseable JSON — failing open',
        suggestion: null,
      }
    }
    const verdict = ['pass', 'unrealistic', 'off-scope', 'sensitive', 'ambiguous'].includes(parsed.verdict)
      ? parsed.verdict
      : 'pass'
    return {
      verdict,
      layer: 'llm',
      reason: parsed.reason || '(no reason)',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : null,
      suggestion: verdict === 'pass' ? null : SUGGESTIONS[verdict],
      model: useModel,
    }
  } catch (e) {
    // Fail open — this is a safeguard, not a hard gate. Network blips
    // shouldn't take down the forge pipeline.
    return {
      verdict: 'pass',
      layer: 'llm',
      reason: `LLM exception (${String(e?.message || e).slice(0, 100)}) — failing open`,
      suggestion: null,
    }
  }
}

/**
 * Combined entry point. Runs heuristic first (always); if it passes AND
 * useLLM is true, runs the LLM judge. Returns the first non-pass verdict
 * encountered, or { verdict: 'pass', ... } if both layers cleared.
 */
export async function classifyPrompt(prompt, { useLLM = false, model, signal } = {}) {
  const h = heuristicCheck(prompt)
  if (h.verdict !== 'pass') return h
  if (!useLLM) return h
  return await llmCheck(prompt, { model, signal })
}

// Canon test set — runnable with `--demo`. Add cases here as the forge
// encounters real-world adversarial briefs. Each tuple: [prompt, expected_verdict, layer_must_be].
const CANON = [
  ['make me a flight simulator that will make me rich', 'unrealistic', 'heuristic'],
  ['build a homepage for a B2B SaaS that monitors GPU utilization', 'pass', 'heuristic'],
  ['create a video game with multiplayer', 'off-scope', 'heuristic'],
  ['homepage for my OnlyFans landing page', 'sensitive', 'heuristic'],
  ['hi', 'malformed', 'heuristic'],
  ['homepage for Linear, a project management tool for engineering teams', 'pass', 'heuristic'],
  ['help me 6-figure in a month with my new course', 'unrealistic', 'heuristic'],
  ['marketing page for a pump and dump crypto scheme', 'sensitive', 'heuristic'],
  ['build me a homepage for a paperclip optimizer that will make me rich', 'unrealistic', 'heuristic'],
  ['homepage for Stripe — a payments API for developers', 'pass', 'heuristic'],
]

async function runDemo() {
  console.log('[amp-bed] running canon test set\n')
  let pass = 0
  let fail = 0
  for (const [prompt, expected, expectedLayer] of CANON) {
    const result = heuristicCheck(prompt)
    const ok = result.verdict === expected && result.layer === expectedLayer
    if (ok) pass++
    else fail++
    const icon = ok ? '✓' : '✗'
    console.log(`${icon} expected=${expected.padEnd(12)} got=${result.verdict.padEnd(12)} "${prompt.slice(0, 60)}${prompt.length > 60 ? '…' : ''}"`)
    if (!ok) console.log(`    reason: ${result.reason}`)
  }
  console.log(`\n[amp-bed] ${pass}/${CANON.length} canon cases pass`)
  return fail === 0
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  if (args.includes('--demo')) {
    const ok = await runDemo()
    process.exit(ok ? 0 : 1)
  }
  const json = args.includes('--json')
  const useLLM = args.includes('--llm')
  const prompt = args.filter((a) => !a.startsWith('--')).join(' ')
  if (!prompt) {
    console.error('usage: bun scripts/forge-amp-bed.mjs [--json] [--llm] "your prompt"')
    console.error('       bun scripts/forge-amp-bed.mjs --demo')
    process.exit(2)
  }
  const result = await classifyPrompt(prompt, { useLLM })
  if (json) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    const icon = result.verdict === 'pass' ? '✓' : '✗'
    console.log(`${icon} ${result.verdict.toUpperCase()}  (layer: ${result.layer}${result.model ? `, model: ${result.model}` : ''})`)
    console.log(`  reason: ${result.reason}`)
    if (result.confidence != null) console.log(`  confidence: ${result.confidence}`)
    if (result.suggestion) console.log(`  suggestion: ${result.suggestion}`)
  }
  process.exit(result.verdict === 'pass' ? 0 : 1)
}
