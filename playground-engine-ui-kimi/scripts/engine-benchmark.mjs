#!/usr/bin/env bun
/**
 * Phase 1 benchmark — run triple-compare (kimi | forge | gpt) across canonical verticals.
 *
 * Usage:
 *   bun playground-engine-ui-kimi/scripts/engine-benchmark.mjs
 *   bun playground-engine-ui-kimi/scripts/engine-benchmark.mjs --vision
 *   bun playground-engine-ui-kimi/scripts/engine-benchmark.mjs saas restaurant --vision
 *   bun playground-engine-ui-kimi/scripts/engine-benchmark.mjs --vision --vision-compare --no-open
 *
 * Output: .forge/benchmark/<runId>/
 *   index.html          — leaderboard across briefs
 *   summary.json        — aggregate stats + per-brief winners
 *   <slug>/             — triple-compare artifacts per vertical
 *
 * Requires: GROQ_API_KEY, GEMINI_API_KEY (or GOOGLE_API_KEY), playwright for screenshots/vision
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { selectBenchmarkBriefs } from './lib/benchmark-briefs.mjs'
import { runTripleCompare, printTripleSummary, escapeHtml, ENGINES } from './lib/triple-compare-run.mjs'

const ROOT = process.cwd()

function arg(name, fallback) {
  const prefix = `--${name}=`
  const hit = process.argv.find((a) => a.startsWith(prefix))
  if (hit) return hit.slice(prefix.length)
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : fallback
}

const argv = process.argv.slice(2)
const slugs = argv.filter((a) => !a.startsWith('--'))
const briefs = selectBenchmarkBriefs(slugs)

if (!briefs.length) {
  console.error('[benchmark] no briefs matched. Available slugs: saas ecommerce restaurant portfolio agency fitness wellness hotel fleet riso music butchery')
  process.exit(2)
}

if (!process.env.GROQ_API_KEY) {
  console.error('[benchmark] GROQ_API_KEY not set')
  process.exit(2)
}
if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
  console.error('[benchmark] GEMINI_API_KEY or GOOGLE_API_KEY not set')
  process.exit(2)
}

const runId = String(Date.now())
const outDir = join(ROOT, '.forge', 'benchmark', runId)
mkdirSync(outDir, { recursive: true })

const skipShots = argv.includes('--skip-shots')
const withVision = argv.includes('--vision')
const visionCompare = argv.includes('--vision-compare')
const shouldOpen = !argv.includes('--no-open')
const visionMin = Number(arg('vision-min', process.env.FORGE_VISION_MIN || '75')) || 75
const port = Number(arg('port', '7422')) || 7422

console.log(`[benchmark] runId=${runId} briefs=${briefs.length} vision=${withVision}${visionCompare ? '+compare' : ''}`)

const benchT0 = Date.now()
const briefRuns = []

for (const { slug, brief } of briefs) {
  console.log(`\n[benchmark] === ${slug} ===`)
  const subDir = join(outDir, slug)
  const run = await runTripleCompare({
    brief,
    outDir: subDir,
    seed: `${runId}-${slug}`,
    skipShots,
    withVision,
    visionCompare,
    visionMin,
    slug,
  })
  printTripleSummary(run)
  briefRuns.push({ slug, brief, ...run })
}

function mean(nums) {
  const vals = nums.filter((n) => Number.isFinite(n))
  if (!vals.length) return null
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
}

const engineIds = ENGINES.map((e) => e.id)
const winCounts = Object.fromEntries(engineIds.map((id) => [id, 0]))
const stats = Object.fromEntries(
  engineIds.map((id) => [id, { kimiScores: [], visionScores: [], walls: [] }]),
)

for (const run of briefRuns) {
  if (run.winnerId) winCounts[run.winnerId] = (winCounts[run.winnerId] || 0) + 1
  for (const id of engineIds) {
    const e = run.summary?.engines?.[id]
    if (!e?.ok) continue
    stats[id].kimiScores.push(e.kimiScore)
    stats[id].walls.push(e.wall)
    if (e.vision?.score != null) stats[id].visionScores.push(e.vision.score)
  }
}

const engineSummary = Object.fromEntries(
  engineIds.map((id) => [
    id,
    {
      wins: winCounts[id] || 0,
      meanKimiScore: mean(stats[id].kimiScores),
      meanVisionScore: mean(stats[id].visionScores),
      meanWallMs: mean(stats[id].walls),
      samples: stats[id].kimiScores.length,
    },
  ]),
)

const overallWinner = [...engineIds].sort((a, b) => {
  if (withVision) {
    const av = engineSummary[a].meanVisionScore ?? -1
    const bv = engineSummary[b].meanVisionScore ?? -1
    if (bv !== av) return bv - av
  }
  const aw = winCounts[b] - winCounts[a]
  if (aw !== 0) return aw
  return (engineSummary[b].meanKimiScore ?? -1) - (engineSummary[a].meanKimiScore ?? -1)
})[0]

const summary = {
  runId,
  briefCount: briefRuns.length,
  withVision,
  visionCompare,
  visionMin,
  totalMs: Date.now() - benchT0,
  overallWinner,
  engineSummary,
  briefs: briefRuns.map(({ slug, brief, winnerId, summary: s, totalMs }) => ({
    slug,
    briefPreview: brief.length > 120 ? `${brief.slice(0, 117)}…` : brief,
    winnerId,
    totalMs,
    engines: s.engines,
    comparePath: `${slug}/index.html`,
  })),
}

writeFileSync(join(outDir, 'summary.json'), JSON.stringify(summary, null, 2))

function cell(run, engineId) {
  const e = run.summary?.engines?.[engineId]
  if (!e?.ok) return `<td class="fail">fail</td>`
  const sec = ((e.wall || 0) / 1000).toFixed(1)
  const vision = e.vision ? `<br><span class="vision ${e.vision.pass ? 'pass' : 'fail'}">v ${e.vision.score}</span>` : ''
  const win = run.winnerId === engineId ? ' winner-cell' : ''
  return `<td class="num${win}">k ${e.kimiScore}${vision}<br>${sec}s</td>`
}

const rows = briefRuns
  .map(
    (run) => `<tr>
  <td><a href="${run.slug}/index.html">${escapeHtml(run.slug)}</a></td>
  ${engineIds.map((id) => cell(run, id)).join('\n  ')}
  <td><strong>${escapeHtml(run.winnerId || '—')}</strong></td>
</tr>`,
  )
  .join('\n')

const leaderboard = engineIds
  .map((id) => {
    const s = engineSummary[id]
    return `<tr>
  <td>${escapeHtml(id)}</td>
  <td class="num">${s.wins}/${briefRuns.length}</td>
  <td class="num">${s.meanKimiScore ?? '—'}</td>
  <td class="num">${withVision ? (s.meanVisionScore ?? '—') : '—'}</td>
  <td class="num">${s.meanWallMs != null ? `${(s.meanWallMs / 1000).toFixed(1)}s` : '—'}</td>
</tr>`
  })
  .join('\n')

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Engine benchmark — ${runId}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; background: #0f1115; color: #e8eaed; padding: 1.25rem 1.5rem 2rem; }
    h1 { margin: 0 0 .5rem; font-size: 1.35rem; }
    .sub { color: #9aa3b2; font-size: .9rem; margin: 0 0 1.25rem; line-height: 1.5; max-width: 60rem; }
    h2 { font-size: 1rem; margin: 1.5rem 0 .65rem; color: #cbd5e1; }
    table { width: 100%; border-collapse: collapse; font-size: .82rem; margin-bottom: 1rem; }
    th, td { border: 1px solid #2a2f3a; padding: .45rem .55rem; text-align: left; vertical-align: top; }
    th { background: #171a21; color: #94a3b8; font-weight: 600; }
    tr:nth-child(even) td { background: rgba(255,255,255,.02); }
    td.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
    td.fail { color: #fca5a5; }
    .winner-cell { background: rgba(34,197,94,.08) !important; box-shadow: inset 0 0 0 1px rgba(34,197,94,.25); }
    .vision.pass { color: #86efac; }
    .vision.fail { color: #fca5a5; }
    a { color: #7dd3fc; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .pill { display: inline-block; font-size: .75rem; font-weight: 600; color: #22c55e; border: 1px solid rgba(34,197,94,.35); padding: .12rem .45rem; border-radius: 999px; margin-left: .35rem; }
  </style>
</head>
<body>
  <h1>Engine benchmark<span class="pill">${escapeHtml(overallWinner || '—')} leads</span></h1>
  <p class="sub">Run ${runId} · ${briefRuns.length} briefs · kimi | forge | gpt · ${withVision ? `vision gate ≥ ${visionMin}` : 'heuristic kimi-score only'} · total ${(summary.totalMs / 1000 / 60).toFixed(1)} min</p>

  <h2>Leaderboard</h2>
  <table>
    <thead><tr><th>Engine</th><th>Wins</th><th>Mean kimi</th><th>Mean vision</th><th>Mean wall</th></tr></thead>
    <tbody>${leaderboard}</tbody>
  </table>

  <h2>Per brief</h2>
  <table>
    <thead><tr><th>Brief</th>${engineIds.map((id) => `<th>${escapeHtml(id)}</th>`).join('')}<th>Winner</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`

writeFileSync(join(outDir, 'index.html'), indexHtml)

writeFileSync(
  join(outDir, 'serve.mjs'),
  `import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
const dir = dirname(fileURLToPath(import.meta.url))
const types = { html: 'text/html', json: 'application/json', png: 'image/png' }
Bun.serve({
  port: ${port},
  async fetch(req) {
    const url = new URL(req.url)
    const path = url.pathname === '/' ? '/index.html' : url.pathname
    const file = Bun.file(join(dir, '.' + path))
    if (await file.size) {
      const ext = path.split('.').pop()
      const headers = { 'Content-Type': types[ext] || 'application/octet-stream' }
      if (ext === 'html') headers['Cache-Control'] = 'no-store'
      return new Response(file, { headers })
    }
    return new Response('Not found: ' + path, { status: 404 })
  },
})
console.log('Benchmark: http://localhost:${port}/')
`,
)

console.log('\n[benchmark] === SUMMARY ===')
console.log(`Run ${runId} · ${briefRuns.length} briefs · ~${(summary.totalMs / 1000 / 60).toFixed(1)} min`)
console.log(`Overall leader: ${overallWinner}`)
for (const id of engineIds) {
  const s = engineSummary[id]
  const visionPart = withVision && s.meanVisionScore != null ? ` · vision ${s.meanVisionScore}` : ''
  console.log(`  ${id.padEnd(5)} wins ${String(s.wins).padStart(2)}/${briefRuns.length} · kimi ${s.meanKimiScore ?? '—'}${visionPart}`)
}
console.log(`\nArtifacts: ${outDir}`)
console.log(`Leaderboard: file://${join(outDir, 'index.html')}`)

async function openUrl(url) {
  return new Promise((resolve) => {
    const cmd =
      process.platform === 'darwin' ? ['open', url]
      : process.platform === 'win32' ? ['cmd', '/c', 'start', '', url]
      : ['xdg-open', url]
    const child = spawn(cmd[0], cmd.slice(1), { detached: true, stdio: 'ignore' })
    child.on('error', () => resolve(false))
    child.unref()
    setTimeout(() => resolve(true), 200)
  })
}

if (argv.includes('--serve')) {
  console.log(`Serve: http://localhost:${port}/`)
  if (shouldOpen) setTimeout(() => openUrl(`http://localhost:${port}/`), 400)
  await import(join(outDir, 'serve.mjs'))
} else if (shouldOpen) {
  await openUrl(`file://${join(outDir, 'index.html')}`)
  console.log('Opened in browser.')
}
