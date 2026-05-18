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

// Accept multiple run IDs to merge boards across runs (e.g. resume after a
// broken Mobbin auth: keep the valid mobbin=off iters from run A, run a fresh
// mobbin=on-only run B, then `forge-summary A B` produces the combined view).
// Each iter is tagged with `_run` so per-iter breakdowns can be traced back.
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const runIds = args.length ? args : ['latest']

function loadBoard(rawId) {
  let id = rawId
  if (id === 'latest') id = readdirSync(LOOP_DIR).sort().pop()
  const dir = join(LOOP_DIR, id)
  if (!existsSync(dir)) {
    console.error(`run not found: ${dir}`)
    process.exit(1)
  }
  const lbPath = join(dir, 'leaderboard.json')
  let b
  if (existsSync(lbPath)) {
    b = JSON.parse(readFileSync(lbPath, 'utf8'))
  } else {
    // Run was killed before final write — reconstruct from per-iter meta files.
    const iters = readdirSync(dir).filter((d) => d.startsWith('iter-')).sort()
    b = []
    for (const d of iters) {
      const m = join(dir, d, 'meta.json')
      if (existsSync(m)) {
        const meta = JSON.parse(readFileSync(m, 'utf8'))
        meta.dir = join(dir, d)
        b.push(meta)
      }
    }
  }
  return { id, board: b.map((row) => ({ ...row, _run: id })) }
}

const loaded = runIds.map(loadBoard)
const runId = loaded.map((r) => r.id).join('+')
let board = loaded.flatMap((r) => r.board)

// When merging multiple runs, deduplicate against a "use this iter only if it
// has live Mobbin data, else fall back to off-arm" rule: keep all iters from
// the first run, but drop iters from subsequent runs that would create a
// duplicate (iter,run) collision. Practically this never fires for the resume
// flow — different runIds always produce different iter sets — but it's a
// safety net.
const seen = new Set()
board = board.filter((row) => {
  const key = `${row._run}:${row.iter}`
  if (seen.has(key)) return false
  seen.add(key)
  return true
})

board.sort((a, b) => {
  if (a.kept !== b.kept) return a.kept ? -1 : 1
  if ((b.vision?.score || 0) !== (a.vision?.score || 0)) return (b.vision?.score || 0) - (a.vision?.score || 0)
  return a.ms - b.ms
})
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

// Mobbin analysis: split into "on" (USE_MOBBIN was true) and "off" buckets.
// Treats `b.mobbin === null` as off — the loop only writes a mobbin block
// when USE_MOBBIN is set, so absence = off. Within "on", further analyse:
//   - status counts (how many iters actually got live data vs. fell back)
//   - coverage tier vs. kept rate (does element-naming correlate with quality?)
//   - per-featured-app kept rate
const mobbinOn = board.filter((b) => b.mobbin)
const mobbinOff = board.filter((b) => !b.mobbin)
if (mobbinOn.length || mobbinOff.length) {
  console.log()
  console.log('MOBBIN A/B:')
  const fmtSide = (label, arr) => {
    if (!arr.length) {
      console.log(`  ${label.padEnd(8)} n=0`)
      return
    }
    const keptN = arr.filter((b) => b.kept).length
    const meanMs = Math.round(arr.reduce((a, b) => a + (b.ms || 0), 0) / arr.length)
    const meanOut = Math.round(arr.reduce((a, b) => a + (b.outputTokens || 0), 0) / arr.length)
    const meanVis = (arr.reduce((a, b) => a + (b.vision?.score || 0), 0) / arr.length).toFixed(1)
    console.log(
      `  ${label.padEnd(8)} n=${String(arr.length).padStart(2)}  kept=${keptN}/${arr.length} (${((keptN / arr.length) * 100).toFixed(0)}%)  meanMs=${String(meanMs).padStart(5)}  meanOutTok=${String(meanOut).padStart(5)}  meanVision=${meanVis}`,
    )
  }
  fmtSide('mobbin=on', mobbinOn)
  fmtSide('mobbin=off', mobbinOff)
  // n<10 per side is too small to claim anything — flag explicitly.
  const small = Math.min(mobbinOn.length, mobbinOff.length)
  if (small < 10 && small > 0) {
    console.log(`  ⚠ n<10 on smaller side — treat deltas as directional, not significant`)
  }
}

// Rigor A/B: same shape as Mobbin. Splits on b.rigor?.on (absence = off).
const rigorOn = board.filter((b) => b.rigor?.on)
const rigorOff = board.filter((b) => !b.rigor?.on)
if (rigorOn.length || rigorOff.length) {
  console.log()
  console.log('RIGOR A/B:')
  const fmtRigorSide = (label, arr) => {
    if (!arr.length) {
      console.log(`  ${label.padEnd(9)} n=0`)
      return
    }
    const keptN = arr.filter((b) => b.kept).length
    const meanMs = Math.round(arr.reduce((a, b) => a + (b.ms || 0), 0) / arr.length)
    const meanOut = Math.round(arr.reduce((a, b) => a + (b.outputTokens || 0), 0) / arr.length)
    const meanVis = (arr.reduce((a, b) => a + (b.vision?.score || 0), 0) / arr.length).toFixed(1)
    console.log(
      `  ${label.padEnd(9)} n=${String(arr.length).padStart(2)}  kept=${keptN}/${arr.length} (${((keptN / arr.length) * 100).toFixed(0)}%)  meanMs=${String(meanMs).padStart(5)}  meanOutTok=${String(meanOut).padStart(5)}  meanVision=${meanVis}`,
    )
  }
  fmtRigorSide('rigor=on', rigorOn)
  fmtRigorSide('rigor=off', rigorOff)
  const smallR = Math.min(rigorOn.length, rigorOff.length)
  if (smallR < 10 && smallR > 0) {
    console.log(`  ⚠ n<10 on smaller side — treat deltas as directional, not significant`)
  }
}

if (rigorOn.length) {
  // Per-category breakdown so we can see if developer-tools brands lift
  // harder than ai or data-infra (same shape as per-featured-app for mobbin).
  const byCat = {}
  for (const b of rigorOn) {
    const cat = b.rigor.featuredCategory || 'unknown'
    if (!byCat[cat]) byCat[cat] = { iters: 0, kept: 0, visSum: 0 }
    byCat[cat].iters += 1
    byCat[cat].kept += b.kept ? 1 : 0
    byCat[cat].visSum += b.vision?.score || 0
  }
  console.log()
  console.log('RIGOR per category (iters / kept / vision):')
  const rows = Object.entries(byCat)
    .map(([cat, s]) => ({ cat, iters: s.iters, kept: s.kept, vision: s.visSum / s.iters }))
    .sort((a, b) => b.kept - a.kept || b.vision - a.vision)
  for (const r of rows) {
    console.log(
      `  ${r.cat.padEnd(22)} iters=${String(r.iters).padStart(2)}  kept=${String(r.kept).padStart(2)}  vis=${r.vision.toFixed(1)}`,
    )
  }
}

if (mobbinOn.length) {
  // Status counts — distinguishes "Mobbin healthy with low coverage" from
  // "auth expired so coverage is zero by construction".
  const statusCounts = {}
  for (const b of mobbinOn) {
    const s = b.mobbin.status || 'unknown'
    statusCounts[s] = (statusCounts[s] || 0) + 1
  }
  console.log()
  console.log('MOBBIN STATUS (USE_MOBBIN=1 iters):')
  for (const [k, v] of Object.entries(statusCounts).sort((a, b) => b[1] - a[1])) {
    const marker = k === 'ok' ? '✓' : '✗'
    console.log(`  ${marker} ${String(v).padStart(3)}× ${k}`)
  }

  // Only iters that actually got live data — drop preflight-failed ones from
  // the coverage analysis so they don't drag the mean to 0.
  const live = mobbinOn.filter((b) => b.mobbin.statusOk && typeof b.mobbin.ratio === 'number')
  if (live.length) {
    const mean = live.reduce((a, b) => a + b.mobbin.ratio, 0) / live.length
    const keptLive = live.filter((b) => b.kept)
    const meanKept = keptLive.length
      ? keptLive.reduce((a, b) => a + b.mobbin.ratio, 0) / keptLive.length
      : 0
    console.log()
    console.log('MOBBIN COVERAGE (live data only):')
    console.log(`  iters with live mobbin data: ${live.length}`)
    console.log(`  mean element-coverage: ${(mean * 100).toFixed(1)}%  (kept iters: ${(meanKept * 100).toFixed(1)}%)`)

    // Coverage tiers vs kept rate — the soft signal that lets us see whether
    // named anchors actually correlate with passing the gates. If the high
    // tier doesn't outperform the low tier, the Mobbin block isn't earning
    // its latency cost and the rotation strategy needs rework.
    const TIERS = [
      { name: 'high  (>20%)', test: (r) => r > 0.2 },
      { name: 'med (5-20%)', test: (r) => r >= 0.05 && r <= 0.2 },
      { name: 'low (<5%)', test: (r) => r < 0.05 },
    ]
    console.log('  coverage tier vs kept rate:')
    for (const t of TIERS) {
      const tier = live.filter((b) => t.test(b.mobbin.ratio))
      if (!tier.length) {
        console.log(`    ${t.name.padEnd(12)} n=0`)
        continue
      }
      const keptN = tier.filter((b) => b.kept).length
      const visMean = (tier.reduce((a, b) => a + (b.vision?.score || 0), 0) / tier.length).toFixed(1)
      console.log(
        `    ${t.name.padEnd(12)} n=${String(tier.length).padStart(2)}  kept=${keptN}/${tier.length} (${((keptN / tier.length) * 100).toFixed(0)}%)  meanVision=${visMean}`,
      )
    }

    // Per-app analysis — same as before, but only over live iters so the
    // "unknown" featured-app bucket reflects real ambiguity, not failures.
    const byApp = {}
    for (const b of live) {
      const app = b.mobbin.featuredApp || 'unknown'
      if (!byApp[app]) byApp[app] = { iters: 0, kept: 0, ratioSum: 0, visSum: 0 }
      byApp[app].iters += 1
      byApp[app].kept += b.kept ? 1 : 0
      byApp[app].ratioSum += b.mobbin.ratio
      byApp[app].visSum += b.vision?.score || 0
    }
    console.log('  per featured-app (iters / kept / coverage / vision):')
    const rows = Object.entries(byApp)
      .map(([app, s]) => ({
        app,
        iters: s.iters,
        kept: s.kept,
        ratio: s.ratioSum / s.iters,
        vision: s.visSum / s.iters,
      }))
      .sort((a, b) => b.kept - a.kept || b.ratio - a.ratio)
    for (const r of rows) {
      console.log(
        `    ${r.app.padEnd(22)} iters=${String(r.iters).padStart(2)}  kept=${String(r.kept).padStart(2)}  cov=${(r.ratio * 100).toFixed(1)}%  vis=${r.vision.toFixed(1)}`,
      )
    }
  }
}
