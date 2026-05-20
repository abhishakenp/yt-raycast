#!/usr/bin/env bun
/**
 * Quick timing probe: how long does Gemini take to generate one homepage
 * in *this* context (same prompt the forge feeds GPT-OSS / split3)?
 *
 * Reuses buildVariantPrompt so the payload matches what the engine sends —
 * brief + site-type pack + reference + density rigor — for an apples-to-apples
 * wall-clock comparison against the split3 baseline (~16-18s).
 *
 * Requires GEMINI_API_KEY (Google AI Studio key). The model ID just shipped
 * (Gemini 3.5 Flash) and isn't in context7 yet, so pass it explicitly:
 *
 *   GEMINI_API_KEY=... bun scripts/forge-gemini-timing.mjs gemini-3.5-flash
 *   GEMINI_API_KEY=... GEMINI_MODEL=gemini-3.5-flash bun scripts/forge-gemini-timing.mjs
 *   GEMINI_API_KEY=... bun scripts/forge-gemini-timing.mjs gemini-3.5-flash "Custom brief here"
 *
 * Output: .forge/gemini/<runId>/{index.html, meta.json}
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildVariantPrompt } from './forge-lib.mjs'

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
if (!API_KEY) {
  console.error('[gemini] GEMINI_API_KEY (or GOOGLE_API_KEY) not set.')
  console.error('[gemini] Get one at https://aistudio.google.com/apikey and re-run:')
  console.error('[gemini]   GEMINI_API_KEY=... bun scripts/forge-gemini-timing.mjs gemini-3.5-flash')
  process.exit(1)
}

const argv = process.argv.slice(2)
const MODEL = argv[0] || process.env.GEMINI_MODEL || 'gemini-3.5-flash'
const BRIEF =
  argv[1] ||
  'Homepage for Sumida, a single-origin coffee roaster in Tokyo. Subscriptions, retail bags, wholesale to cafes. Family-run since 1987. Curated Ethiopian and Colombian beans, slow-roasted in small batches.'

const ROOT = process.cwd()
const RUN_ID = String(Date.now())
const OUT_DIR = join(ROOT, '.forge', 'gemini', RUN_ID)
mkdirSync(OUT_DIR, { recursive: true })

const userPrompt = buildVariantPrompt(BRIEF, 0, { includeReference: true })

console.log(`[gemini] model: ${MODEL}`)
console.log(`[gemini] brief: ${BRIEF.slice(0, 90)}…`)
console.log(`[gemini] prompt chars: ${userPrompt.length}`)
console.log(`[gemini] generating…`)

const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`
const THINK = process.env.GEMINI_THINK !== '0' // GEMINI_THINK=0 disables reasoning
const MAX_OUT = parseInt(process.env.GEMINI_MAX_OUT || '32000', 10)
const generationConfig = {
  temperature: 0.55,
  maxOutputTokens: MAX_OUT,
}
if (!THINK) generationConfig.thinkingConfig = { thinkingBudget: 0 }
const body = {
  contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
  generationConfig,
}
console.log(`[gemini] thinking: ${THINK ? 'on (default)' : 'off'}  maxOutputTokens: ${MAX_OUT}`)

const t0 = Date.now()
let res
try {
  res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
} catch (e) {
  console.error(`[gemini] network error: ${e?.message || e}`)
  process.exit(1)
}
const wall = Date.now() - t0

const raw = await res.text()
if (!res.ok) {
  console.error(`[gemini] HTTP ${res.status}: ${raw.slice(0, 500)}`)
  writeFileSync(join(OUT_DIR, 'error.txt'), raw, 'utf8')
  process.exit(1)
}

let json
try {
  json = JSON.parse(raw)
} catch {
  console.error('[gemini] non-JSON response')
  writeFileSync(join(OUT_DIR, 'raw.txt'), raw, 'utf8')
  process.exit(1)
}

const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || ''
const usage = json?.usageMetadata || {}
const html = text
  .replace(/^```[a-z]*\n?/i, '')
  .replace(/```\s*$/i, '')
  .trim()

writeFileSync(join(OUT_DIR, 'index.html'), html, 'utf8')
const meta = {
  model: MODEL,
  brief: BRIEF,
  wallMs: wall,
  promptChars: userPrompt.length,
  htmlChars: html.length,
  promptTokens: usage.promptTokenCount,
  outputTokens: usage.candidatesTokenCount,
  thinkingTokens: usage.thoughtsTokenCount ?? (usage.totalTokenCount != null && usage.promptTokenCount != null && usage.candidatesTokenCount != null ? usage.totalTokenCount - usage.promptTokenCount - usage.candidatesTokenCount : null),
  totalTokens: usage.totalTokenCount,
  finishReason: json?.candidates?.[0]?.finishReason,
  thinking: THINK,
}
writeFileSync(join(OUT_DIR, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8')

const tps =
  usage.candidatesTokenCount && wall ? Math.round((usage.candidatesTokenCount / wall) * 1000) : null

console.log(`\n[gemini] === RESULT ===`)
console.log(`  wall:          ${wall}ms`)
console.log(`  html chars:    ${html.length}`)
console.log(`  prompt tokens: ${usage.promptTokenCount ?? '?'}`)
console.log(`  output tokens: ${usage.candidatesTokenCount ?? '?'}`)
console.log(`  throughput:    ${tps ? tps + ' tps' : '?'}`)
console.log(`  finish:        ${json?.candidates?.[0]?.finishReason ?? '?'}`)
console.log(`\n[gemini] baseline: forge split3 ~16-18s, twostage ~22s`)
console.log(`[gemini] artifacts: ${OUT_DIR}`)
console.log(`[gemini] open: ${OUT_DIR}/index.html`)
