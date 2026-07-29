#!/usr/bin/env node
/**
 * Full-path benchmark — runs the V3 engine AND the second SSR render that
 * happens inside completeGenerationAction, to measure the total time the
 * Convex action path takes (minus pure DB writes/scheduling).
 *
 * Usage:
 *   node scripts/bench-full-path.mjs "your prompt here"
 */
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const prompt =
  process.argv[2] ??
  'A SaaS landing page for a project management tool called TaskFlow with pricing, features, and testimonials'

const { runComposition } = await import('@ship-fast/engine')

const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-bench-full-'))

const phaseTimings = {}
const sessionCtx = {
  id: `bench-full-${Date.now()}`,
  broadcast: (payload) => {
    if (payload?.type === 'timings' && payload.phases) {
      Object.assign(phaseTimings, payload.phases)
    }
  },
  setPrompt: () => {},
  setTasks: () => {},
  updateTask: () => {},
  signalHomepageReady: () => {},
  signalOpenuiReady: () => {},
  setElapsed: () => {},
  setCost: () => {},
}

console.log(`\n🚀 Full-path benchmark (engine + second SSR render)`)
console.log(`   Prompt: "${prompt}"\n`)

// Phase 1: Run the V3 engine
const t_engine_start = Date.now()
await runComposition({ prompt, workspace, sessionCtx })
const t_engine_end = Date.now()
const engineMs = t_engine_end - t_engine_start

// Read the OpenUI source and site spec from the workspace
const openUiSource = existsSync(join(workspace, 'home.openui'))
  ? readFileSync(join(workspace, 'home.openui'), 'utf-8')
  : ''
let siteSpecJson = ''
try {
  siteSpecJson = readFileSync(join(workspace, 'site-spec.json'), 'utf-8')
} catch {}

// Phase 2: Second SSR render (mirrors completeGenerationAction)
let secondSsrMs = 0
let ssrImportMs = 0
let ssrRenderMs = 0
let ssrError = null
if (openUiSource.trim()) {
  const t_ssr_import = Date.now()
  const { renderOpenUIToHTMLWithTheme } =
    await import('@ship-fast/engine/openui-ssr.js')
  ssrImportMs = Date.now() - t_ssr_import

  const t_ssr_render = Date.now()
  try {
    await renderOpenUIToHTMLWithTheme(
      openUiSource,
      undefined,
      'en',
      undefined,
      undefined,
    )
    ssrRenderMs = Date.now() - t_ssr_render
  } catch (err) {
    ssrError = err.message
    ssrRenderMs = Date.now() - t_ssr_render
  }
  secondSsrMs = ssrImportMs + ssrRenderMs
}

const totalMs = engineMs + secondSsrMs

try {
  rmSync(workspace, { recursive: true, force: true })
} catch {}

// Print results
console.log(`\n${'='.repeat(75)}`)
console.log(`FULL-PATH TIMING BREAKDOWN (engine + Convex-side SSR)`)
console.log(`${'='.repeat(75)}\n`)

const colStep = 38
const colMs = 12
const colPct = 8
const colBar = 20
console.log(
  `${'Step'.padEnd(colStep)}${'Time (ms)'.padStart(colMs)}${'%'.padStart(colPct)}  ${'Bar'.padEnd(colBar)}`,
)
console.log(
  `${'-'.repeat(colStep)}${'-'.repeat(colMs)}${'-'.repeat(colPct)}  ${'-'.repeat(colBar)}`,
)

const allPhases = [
  ['language', 'Language resolution'],
  ['kind_inference', 'Kind inference'],
  ['prompt_build', 'Prompt construction (+kind LLM)'],
  ['cache_lookup', 'Plan cache lookup'],
  ['llm_call', 'LLM call (site-plan)'],
  ['stream_parse', 'Streaming parse'],
  ['retry_parse', 'Retry loop (parse+validate)'],
  ['quality_gate_retry', 'Quality gate retry'],
  ['svelte_validation', 'Svelte compile validation'],
  ['compile', 'Compile → OpenUI source'],
  ['ssr_render', 'SSR render #1 (in runComposition)'],
  ['translation', 'Post-render translation'],
  ['persist', 'Persist artifacts (workspace)'],
  ['__second_ssr_import', 'SSR #2: import module'],
  ['__second_ssr_render', 'SSR #2: render (completeGen)'],
]

for (const [key, label] of allPhases) {
  let ms
  if (key === '__second_ssr_import') ms = ssrImportMs
  else if (key === '__second_ssr_render') ms = ssrRenderMs
  else ms = phaseTimings[key] ?? 0
  const pct = totalMs > 0 ? (ms / totalMs) * 100 : 0
  const barLen = Math.round((ms / Math.max(totalMs, 1)) * (colBar - 2))
  const bar = `[${'█'.repeat(barLen)}${'·'.repeat(colBar - 2 - barLen)}]`
  console.log(
    `${label.padEnd(colStep)}${String(ms).padStart(colMs)}${pct.toFixed(1).padStart(colPct)}  ${bar}`,
  )
}

console.log(
  `${'-'.repeat(colStep)}${'-'.repeat(colMs)}${'-'.repeat(colPct)}  ${'-'.repeat(colBar)}`,
)
console.log(
  `${'Engine subtotal'.padEnd(colStep)}${String(engineMs).padStart(colMs)}${((engineMs / totalMs) * 100).toFixed(1).padStart(colPct)}  ${' '.repeat(colBar)}`,
)
console.log(
  `${'SSR #2 subtotal'.padEnd(colStep)}${String(secondSsrMs).padStart(colMs)}${((secondSsrMs / totalMs) * 100).toFixed(1).padStart(colPct)}  ${' '.repeat(colBar)}`,
)
console.log(
  `${'-'.repeat(colStep)}${'-'.repeat(colMs)}${'-'.repeat(colPct)}  ${'-'.repeat(colBar)}`,
)
console.log(
  `${'TOTAL (measured)'.padEnd(colStep)}${String(totalMs).padStart(colMs)}${'100.0'.padStart(colPct)}  ${' '.repeat(colBar)}`,
)

if (ssrError) {
  console.log(`\n   ⚠ SSR #2 failed: ${ssrError}`)
}

console.log(`\n📊 Summary:`)
console.log(`   Engine (runComposition):     ${(engineMs / 1000).toFixed(2)}s`)
console.log(`   SSR #2 (completeGen):  ${(secondSsrMs / 1000).toFixed(2)}s`)
console.log(`   Measured total:        ${(totalMs / 1000).toFixed(2)}s`)
console.log(`   `)
console.log(`   Convex DB overhead (NOT measured here, adds on top):`)
console.log(
  `     - Session creation mutation (idempotent lookup, quota, inserts)`,
)
console.log(`     - Scheduler dispatch latency (runAfter(0, startGeneration))`)
console.log(`     - Session load query + markStarted mutation`)
console.log(`     - addGenerationEvent mutations (status updates, streaming)`)
console.log(
  `     - completeGenerationInternal mutation (previews, events, metrics, export queue)`,
)
console.log(`     - Estimated: 3-8s depending on deployment load`)

console.log(`\n${'='.repeat(75)}\n`)
