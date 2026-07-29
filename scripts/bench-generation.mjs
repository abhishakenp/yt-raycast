#!/usr/bin/env node
/**
 * Standalone generation benchmark — runs the V3 engine (runComposition) directly
 * with a mock session context, capturing per-phase timings. This is the same
 * engine code that runs inside the Convex `startGeneration` action, so the
 * timings reflect the real production path minus Convex overhead (session
 * load, scheduling, persistence mutations — typically 1-3s combined).
 *
 * Usage:
 *   node scripts/bench-generation.mjs "your prompt here"
 *   node scripts/bench-generation.mjs   # uses a default prompt
 *
 * Env: reads GROQ_API_KEY etc. from .env / .env.local (auto-loaded by the engine).
 */
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const prompt =
  process.argv[2] ??
  'A cozy neighborhood coffee shop with online ordering and a blog about brewing techniques'

// The engine auto-loads .env / .env.local via env.ts on import.
const { runComposition } = await import('@ship-fast/engine')

const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-bench-'))

const events = []
const phaseTimingsFromBroadcast = {}

const sessionCtx = {
  id: `bench-${Date.now()}`,
  broadcast: (payload) => {
    events.push(payload)
    if (payload?.type === 'timings' && payload.phases) {
      Object.assign(phaseTimingsFromBroadcast, payload.phases)
    }
  },
  setPrompt: (msg) => events.push({ type: 'log', message: msg }),
  setTasks: (tasks) => {},
  updateTask: (task) => {},
  signalHomepageReady: () => {},
  signalOpenuiReady: () => {},
  setElapsed: () => {},
  setCost: () => {},
}

console.log(`\n🚀 Running V3 generation benchmark`)
console.log(`   Prompt: "${prompt}"`)
console.log(`   Workspace: ${workspace}`)
console.log(
  `   Model: ${process.env.HOMEPAGE_MODEL ?? process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b'} (default)`,
)
console.log(`   (plan cache disabled for benchmark — forces full LLM call)\n`)

const t_start = Date.now()
let result
let error
try {
  result = await runComposition({
    prompt,
    workspace,
    sessionCtx,
    // No planCacheClient / promptCacheKey → forces full LLM call (worst case)
  })
} catch (err) {
  error = err
}
const t_end = Date.now()
const wallClockMs = t_end - t_start

// Clean up workspace
try {
  rmSync(workspace, { recursive: true, force: true })
} catch {}

if (error) {
  console.error(`\n❌ Generation failed: ${error.message}\n`)
  console.error(error.stack)
  process.exit(1)
}

console.log(`\n${'='.repeat(70)}`)
console.log(`V3 GENERATION TIMING BREAKDOWN`)
console.log(`${'='.repeat(70)}\n`)

const phases = phaseTimingsFromBroadcast

// Define the order and labels
const phaseOrder = [
  ['language', 'Language resolution'],
  ['kind_inference', 'Kind inference (heuristic)'],
  ['prompt_build', 'Prompt construction'],
  ['cache_lookup', 'Plan cache lookup'],
  ['llm_call', 'LLM call (site-plan generation)'],
  ['stream_parse', 'Streaming parse'],
  ['retry_parse', 'Retry loop (parse + validate)'],
  ['quality_gate_retry', 'Content quality gate retry'],
  ['svelte_validation', 'Svelte compile validation'],
  ['compile', 'Compile site-plan → OpenUI source'],
  ['ssr_render', 'SSR render → index.html'],
  ['translation', 'Post-render translation'],
  ['persist', 'Persist artifacts + integrations'],
]

const total = phases.total ?? wallClockMs

// Print table
const colStep = 32
const colMs = 12
const colPct = 8
const colBar = 24
const header = `${'Step'.padEnd(colStep)}${'Time (ms)'.padStart(colMs)}${'%'.padStart(colPct)}  ${'Bar'.padEnd(colBar)}`
console.log(header)
console.log(
  `${'-'.repeat(colStep)}${'-'.repeat(colMs)}${'-'.repeat(colPct)}  ${'-'.repeat(colBar)}`,
)

for (const [key, label] of phaseOrder) {
  const ms = phases[key] ?? 0
  const pct = total > 0 ? (ms / total) * 100 : 0
  const barLen = Math.round((ms / Math.max(total, 1)) * (colBar - 2))
  const bar = `[${'█'.repeat(barLen)}${'·'.repeat(colBar - 2 - barLen)}]`
  console.log(
    `${label.padEnd(colStep)}${String(ms).padStart(colMs)}${pct.toFixed(1).padStart(colPct)}  ${bar}`,
  )
}

console.log(
  `${'-'.repeat(colStep)}${'-'.repeat(colMs)}${'-'.repeat(colPct)}  ${'-'.repeat(colBar)}`,
)
console.log(
  `${'TOTAL (engine)'.padEnd(colStep)}${String(total).padStart(colMs)}${'100.0'.padStart(colPct)}  ${' '.repeat(colBar)}`,
)
console.log(
  `${'Wall clock'.padEnd(colStep)}${String(wallClockMs).padStart(colMs)}${((wallClockMs / wallClockMs) * 100).toFixed(1).padStart(colPct)}  ${' '.repeat(colBar)}`,
)

console.log(`\n📊 Summary:`)
console.log(`   Engine total:   ${(total / 1000).toFixed(2)}s`)
console.log(`   Wall clock:     ${(wallClockMs / 1000).toFixed(2)}s`)
console.log(
  `   Overhead:       ${((wallClockMs - total) / 1000).toFixed(2)}s (workspace setup, event dispatch, cleanup)`,
)

// Identify the bottleneck
const sortedPhases = phaseOrder
  .map(([key, label]) => ({ key, label, ms: phases[key] ?? 0 }))
  .sort((a, b) => b.ms - a.ms)

console.log(`\n🔍 Top 3 bottlenecks:`)
for (let i = 0; i < Math.min(3, sortedPhases.length); i++) {
  const p = sortedPhases[i]
  if (p.ms > 0) {
    console.log(
      `   ${i + 1}. ${p.label}: ${(p.ms / 1000).toFixed(2)}s (${((p.ms / total) * 100).toFixed(1)}%)`,
    )
  }
}

console.log(`\n${'='.repeat(70)}\n`)
