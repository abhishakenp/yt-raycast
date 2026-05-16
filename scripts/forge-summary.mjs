#!/usr/bin/env bun
/**
 * Quick summary table for any forge run.
 *
 * Usage: bun scripts/forge-summary.mjs <runId|latest>
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const LOOP_DIR = join(ROOT, '.forge', 'loop')
let runId = process.argv[2] || 'latest'
if (runId === 'latest') runId = readdirSync(LOOP_DIR).sort().pop()
const RUN_DIR = join(LOOP_DIR, runId)
if (!existsSync(RUN_DIR)) {
  console.error(`run not found: ${RUN_DIR}`)
  process.exit(1)
}

let board
const lbPath = join(RUN_DIR, 'leaderboard.json')
if (existsSync(lbPath)) {
  board = JSON.parse(readFileSync(lbPath, 'utf8'))
} else {
  // Run was killed before final write — reconstruct from per-iter meta files.
  const iters = readdirSync(RUN_DIR).filter((d) => d.startsWith('iter-')).sort()
  board = []
  for (const d of iters) {
    const m = join(RUN_DIR, d, 'meta.json')
    if (existsSync(m)) {
      const meta = JSON.parse(readFileSync(m, 'utf8'))
      meta.dir = join(RUN_DIR, d)
      board.push(meta)
    }
  }
  board.sort((a, b) => {
    if (a.kept !== b.kept) return a.kept ? -1 : 1
    if ((b.vision?.score || 0) !== (a.vision?.score || 0)) return (b.vision?.score || 0) - (a.vision?.score || 0)
    return a.ms - b.ms
  })
}
const total = board.length
const kept = board.filter((b) => b.kept).length
const sub15 = board.filter((b) => b.kept && b.subBudget15).length
const visionAvgKept = kept > 0
  ? (board.filter((b) => b.kept).reduce((a, b) => a + (b.vision?.score || 0), 0) / kept).toFixed(1)
  : 0
const msAvgKept = kept > 0
  ? Math.round(board.filter((b) => b.kept).reduce((a, b) => a + b.ms, 0) / kept)
  : 0

console.log(`run: ${runId}`)
console.log(`iters: ${total}  kept: ${kept}/${total}  sub-15s kept: ${sub15}`)
console.log(`avg vision (kept): ${visionAvgKept}/100   avg gen ms (kept): ${msAvgKept}`)
console.log()
console.log('TOP 10:')
console.log('iter  ms     v    h  ha sp cp ad  k  s15  notes')
for (const b of board.slice(0, 10)) {
  const v = b.vision || {}
  const reasons = (v.reasons || []).join(' / ').slice(0, 50)
  console.log(
    `${String(b.iter).padStart(3)}   ${String(b.ms).padStart(5)}  ${String(v.score || 0).padStart(3)}  ${String(v.hierarchy || 0).padStart(2)} ${String(v.harmony || 0).padStart(2)} ${String(v.spacing || 0).padStart(2)} ${String(v.copy || 0).padStart(2)} ${String(v.artDirection || 0).padStart(2)}  ${b.kept ? 'Y' : 'n'}  ${b.subBudget15 ? 'Y' : 'n'}    ${reasons}`,
  )
}

const failures = board.filter((b) => !b.kept).map((b) => {
  const reasons = []
  if (!b.subBudget15 && !b.kept && b.ms > 18000) reasons.push('time')
  if (!b.subBudget15 && b.ms > 15000 && b.ms <= 18000) reasons.push('time(>15s)')
  if (!b.scoreOk) reasons.push('score')
  if (!b.verifyOk) reasons.push('verify')
  if (!b.lucide?.ok) reasons.push(`lucide:${(b.lucide?.unknown || []).join(',')}`)
  if (!b.render?.ok) reasons.push(`render:${(b.render?.issues || [])[0]?.slice(0, 30)}`)
  if ((b.vision?.score || 0) < 75) reasons.push(`vision<75`)
  return reasons.join('+')
})

const counts = {}
for (const f of failures) counts[f] = (counts[f] || 0) + 1
console.log()
console.log('FAILURE REASONS:')
for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(v).padStart(3)}× ${k}`)
}

const mobbinIters = board.filter((b) => b.mobbin && typeof b.mobbin.ratio === 'number')
if (mobbinIters.length) {
  const mean = mobbinIters.reduce((a, b) => a + b.mobbin.ratio, 0) / mobbinIters.length
  const keptMobbin = mobbinIters.filter((b) => b.kept)
  const meanKept = keptMobbin.length
    ? keptMobbin.reduce((a, b) => a + b.mobbin.ratio, 0) / keptMobbin.length
    : 0
  const byApp = {}
  for (const b of mobbinIters) {
    const app = b.mobbin.featuredApp || 'unknown'
    if (!byApp[app]) byApp[app] = { iters: 0, kept: 0, ratioSum: 0 }
    byApp[app].iters += 1
    byApp[app].kept += b.kept ? 1 : 0
    byApp[app].ratioSum += b.mobbin.ratio
  }
  console.log()
  console.log('MOBBIN COVERAGE:')
  console.log(`  iters with mobbin data: ${mobbinIters.length}`)
  console.log(`  mean element-coverage: ${(mean * 100).toFixed(1)}%  (kept iters: ${(meanKept * 100).toFixed(1)}%)`)
  console.log('  per featured-app (iters / kept / mean coverage):')
  const rows = Object.entries(byApp)
    .map(([app, s]) => ({ app, iters: s.iters, kept: s.kept, ratio: s.ratioSum / s.iters }))
    .sort((a, b) => b.kept - a.kept || b.ratio - a.ratio)
  for (const r of rows) {
    console.log(
      `    ${r.app.padEnd(22)} iters=${String(r.iters).padStart(2)}  kept=${String(r.kept).padStart(2)}  coverage=${(r.ratio * 100).toFixed(1)}%`,
    )
  }
}
