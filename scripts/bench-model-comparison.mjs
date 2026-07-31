#!/usr/bin/env node
/**
 * Model comparison benchmark — runs the V3 composition engine with different
 * Groq models to measure latency vs output quality tradeoffs.
 *
 * Usage:
 *   bun scripts/bench-model-comparison.mjs "your prompt here"
 *   bun scripts/bench-model-comparison.mjs   # uses default prompt
 *
 * Env: reads GROQ_API_KEY from .env.local
 */
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const prompt =
  process.argv[2] ??
  'A cozy neighborhood coffee shop called Brew & Bloom with online ordering, a blog about brewing techniques, and a photo gallery'

// Models to test — from fastest to most capable
const MODELS_TO_TEST = [
  'llama-3.1-8b-instant', // Fastest: ~1000+ tok/s, no reasoning
  'llama-3.3-70b-versatile', // Fast: ~400 tok/s, no reasoning, strong quality
  'openai/gpt-oss-20b', // Medium: ~960 tok/s, reasoning (low effort)
  'openai/gpt-oss-120b', // Current default: ~300 tok/s, reasoning (low effort)
]

const { runComposition } = await import('@ship-fast/engine')

function makeSessionCtx(id) {
  const events = []
  return {
    id,
    broadcast: (payload) => events.push(payload),
    setPrompt: () => {},
    setTasks: () => {},
    updateTask: () => {},
    signalHomepageReady: () => {},
    signalOpenuiReady: () => {},
    setElapsed: () => {},
    setCost: () => {},
    _events: events,
  }
}

async function runOne(model, prompt) {
  const workspace = mkdtempSync(
    join(tmpdir(), `ship-fast-bench-${model.replace(/[^a-z0-9]/g, '')}-`),
  )
  const sessionCtx = makeSessionCtx(`bench-${model}-${Date.now()}`)

  const t0 = Date.now()
  let result, error
  try {
    result = await runComposition({
      prompt,
      workspace,
      sessionCtx,
      model,
    })
  } catch (err) {
    error = err
  }
  const wallMs = Date.now() - t0

  // Read the raw LLM output and compiled source for quality analysis
  let rawSize = 0,
    sourceSize = 0,
    sectionCount = 0,
    pageCount = 0
  let rawPreview = ''
  if (!error) {
    try {
      rawSize = readFileSync(
        join(workspace, 'composition-spec.json'),
        'utf8',
      ).length
      const raw = result.raw || ''
      rawPreview = raw.slice(0, 200)
      // Count sections and pages
      sectionCount = (raw.match(/@section/g) || []).length
      pageCount = (raw.match(/@page/g) || []).length + 1 // +1 for home
      sourceSize = result.source?.length || 0
    } catch {}
  }

  // Clean up
  try {
    rmSync(workspace, { recursive: true, force: true })
  } catch {}

  return {
    model,
    wallMs,
    error: error?.message,
    rawSize,
    sourceSize,
    sectionCount,
    pageCount,
    rawPreview,
    hasReasoning: error ? false : (result?.raw || '').includes('<reasoning>'),
  }
}

console.log(`\n${'='.repeat(80)}`)
console.log(`MODEL COMPARISON BENCHMARK`)
console.log(`${'='.repeat(80)}`)
console.log(`  Prompt: "${prompt}"\n`)

const results = []
for (const model of MODELS_TO_TEST) {
  process.stdout.write(`  Testing ${model}...`)
  const r = await runOne(model, prompt)
  results.push(r)
  if (r.error) {
    console.log(` FAIL (${r.wallMs}ms): ${r.error}`)
  } else {
    console.log(
      ` ${r.wallMs}ms | ${r.sectionCount} sections, ${r.pageCount} pages, ${r.sourceSize} chars source${r.hasReasoning ? ' [REASONING]' : ''}`,
    )
  }
}

console.log(`\n${'='.repeat(80)}`)
console.log(`RESULTS TABLE`)
console.log(`${'='.repeat(80)}\n`)

const header = `${'Model'.padEnd(35)} ${'Time'.padStart(8)} ${'Sections'.padStart(8)} ${'Pages'.padStart(5)} ${'Src chars'.padStart(9)} ${'Reasoning'.padStart(9)}`
console.log(header)
console.log('-'.repeat(header.length))

for (const r of results) {
  if (r.error) {
    console.log(`${r.model.padEnd(35)} ${'FAIL'.padStart(8)}`)
    continue
  }
  console.log(
    `${r.model.padEnd(35)} ${`${r.wallMs}ms`.padStart(8)} ${String(r.sectionCount).padStart(8)} ${String(r.pageCount).padStart(5)} ${String(r.sourceSize).padStart(9)} ${r.hasReasoning ? 'YES' : 'NO'.padStart(9)}`,
  )
}

// Speedup vs the 120b baseline
const baseline = results.find(
  (r) => r.model === 'openai/gpt-oss-120b' && !r.error,
)
if (baseline) {
  console.log(
    `\n📊 Speedup vs current default (gpt-oss-120b @ ${baseline.wallMs}ms):`,
  )
  for (const r of results) {
    if (r.error || r.model === 'openai/gpt-oss-120b') continue
    const speedup = (baseline.wallMs / r.wallMs).toFixed(2)
    console.log(
      `   ${r.model}: ${speedup}x faster (${r.wallMs}ms vs ${baseline.wallMs}ms)`,
    )
  }
}

// Show output previews for quality comparison
console.log(`\n${'='.repeat(80)}`)
console.log(`OUTPUT PREVIEWS (first 200 chars of raw LLM output)`)
console.log(`${'='.repeat(80)}\n`)
for (const r of results) {
  if (r.error) continue
  console.log(`--- ${r.model} ---`)
  console.log(r.rawPreview || '(empty)')
  console.log()
}
