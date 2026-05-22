import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { generateKimiHomepage } from '../../src/index.js'
import { scoreKimiReadiness } from '../../src/quality/kimi-score.js'
import { generateGptHomepage } from '../../../playground-engine-ui-gpt/src/engine.js'
import { generateGeminiNativeHomepage } from '../../../playground-engine-ui/scripts/forge-gemini-native.mjs'
import { visionJudge, visionJudgeCompare } from '../../../playground-engine-ui/scripts/forge-vision.mjs'

export const DESKTOP_WIDTH = 1440
export const DESKTOP_HEIGHT = 900

export const ENGINES = [
  {
    id: 'kimi',
    label: 'playground-engine-ui-kimi',
    subtitle: 'Gemini top + Groq tail · router/grammars',
    run: (brief, seed) => generateKimiHomepage(brief, { seed }),
    pickMetrics: (r) => ({
      wall: r.metrics.wall,
      buildMode: r.metrics.buildMode,
      grammar: r.metrics.grammarId,
      score: r.audits?.kimi?.score ?? r.metrics.kimiScore,
      chars: r.metrics.chars,
      palette: r.metrics.palette,
    }),
  },
  {
    id: 'forge',
    label: 'forge-gemini-native',
    subtitle: 'Gemini top + Groq tail · creative planner',
    run: (brief) => generateGeminiNativeHomepage(brief),
    pickMetrics: (r) => ({
      wall: r.wall,
      buildMode: r.layoutMode,
      grammar: r.archetype,
      score: scoreKimiReadiness(r.html, { plan: { pageKind: r.layoutMode } }).score,
      chars: r.chars,
      palette: `${r.plan?.art?.bg}/${r.plan?.art?.accent}`,
    }),
  },
  {
    id: 'gpt',
    label: 'playground-engine-ui-gpt',
    subtitle: 'Groq single-pass full page',
    run: (brief, seed) => generateGptHomepage(brief, { seed }),
    pickMetrics: (r) => ({
      wall: r.metrics.wall,
      buildMode: r.metrics.buildMode,
      grammar: r.metrics.pageKind,
      score: r.audits?.kimi?.score,
      chars: r.metrics.chars,
      palette: r.metrics.palette,
    }),
  },
]

export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatGenTime(r) {
  const ms = r.ok ? (r.metrics?.wall ?? r.elapsed) : r.elapsed
  if (!ms && ms !== 0) return '—'
  return `${(ms / 1000).toFixed(1)}s`
}

async function captureShots(jobs, skipShots) {
  if (!jobs.length || skipShots) return
  let chromium
  try {
    ({ chromium } = await import('playwright'))
  } catch (e) {
    console.warn('[triple] playwright not available — skipping screenshots:', e.message)
    return
  }
  const browser = await chromium.launch()
  console.log(`[triple] capturing ${jobs.length} screenshots…`)
  for (const { htmlPath, pngPath } of jobs) {
    const page = await browser.newPage({ viewport: { width: DESKTOP_WIDTH, height: DESKTOP_HEIGHT } })
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {})
    await page.waitForTimeout(800)
    await page.screenshot({ path: pngPath, fullPage: true }).catch(() => {})
    await page.close()
  }
  await browser.close()
}

async function runVisionJudges(results, brief, { visionMin }) {
  const okResults = results.filter((r) => r.ok && existsSync(r.pngPath))
  if (!okResults.length) return

  console.log(`[triple] vision judging ${okResults.length} screenshots…`)
  for (const r of okResults) {
    process.stdout.write(`[triple] vision ${r.id} … `)
    try {
      const vision = await visionJudge(r.pngPath, brief)
      const pass = !vision.error && (vision.score || 0) >= visionMin
      r.vision = {
        ...vision,
        pass,
        min: visionMin,
      }
      console.log(`${vision.score ?? 0}${vision.error ? ` (${vision.error.slice(0, 60)})` : pass ? ' ✓' : ' ✗'}`)
    } catch (e) {
      r.vision = { score: 0, pass: false, min: visionMin, error: String(e?.message || e) }
      console.log(`FAILED: ${String(e?.message || e).slice(0, 80)}`)
    }
  }
}

async function runVisionCompare(results, brief) {
  const shotPaths = results.filter((r) => r.ok && existsSync(r.pngPath)).map((r) => r.pngPath)
  if (shotPaths.length < 2) return null

  console.log('[triple] comparative vision ranking…')
  try {
    const compare = await visionJudgeCompare(shotPaths, brief)
    const winner = results.find((r) => r.ok && r.pngPath === shotPaths[compare.winner])
    return {
      ...compare,
      winnerId: winner?.id ?? ENGINES[compare.winner]?.id,
      winnerLabel: winner?.label,
      shotOrder: results.filter((r) => r.ok).map((r) => r.id),
    }
  } catch (e) {
    return { error: String(e?.message || e) }
  }
}

function pickWinner(results, useVision) {
  const ok = results.filter((r) => r.ok)
  if (!ok.length) return null

  const ranked = [...ok].sort((a, b) => {
    if (useVision) {
      const av = a.vision?.score ?? -1
      const bv = b.vision?.score ?? -1
      if (bv !== av) return bv - av
    }
    const as = a.metrics?.score ?? -1
    const bs = b.metrics?.score ?? -1
    if (bs !== as) return bs - as
    return (a.metrics?.wall ?? a.elapsed) - (b.metrics?.wall ?? b.elapsed)
  })
  return ranked[0]?.id ?? null
}

function buildCompareHtml({ runId, brief, results, visionCompare, genTotalSec }) {
  const briefPreview = brief.length > 220 ? `${brief.slice(0, 217)}…` : brief
  const visionNote = results.some((r) => r.vision)
    ? ` · vision min ${results.find((r) => r.vision)?.vision?.min ?? 75}`
    : ''
  const winnerId = visionCompare?.winnerId ?? pickWinner(results, results.some((r) => r.vision))

  const cards = results.map((r) => {
    const genTime = formatGenTime(r)
    const isWinner = winnerId && r.id === winnerId
    if (!r.ok) {
      return `<article class="card error">
  <header>
    <div class="card-title-row">
      <h2>${escapeHtml(r.label)}</h2>
      <span class="gen-time" title="Generation time">${genTime}</span>
    </div>
    <p class="err">${escapeHtml(r.error)}</p>
  </header>
</article>`
    }
    const hasPng = existsSync(r.pngPath)
    const visionLine = r.vision
      ? `<p class="meta vision ${r.vision.pass ? 'pass' : 'fail'}">vision ${r.vision.score ?? 0}${r.vision.error ? ` · ${escapeHtml(r.vision.error.slice(0, 80))}` : ''}${r.vision.reasons?.length ? ` · ${escapeHtml(r.vision.reasons[0])}` : ''}</p>`
      : ''
    return `<article class="card${isWinner ? ' winner' : ''}">
  <header>
    <div class="card-title-row">
      <h2>${escapeHtml(r.label)}${isWinner ? ' <span class="win-badge">winner</span>' : ''}</h2>
      <span class="gen-time" title="Generation time">${genTime}</span>
    </div>
    <p class="sub">${escapeHtml(r.subtitle)}</p>
    <p class="meta">kimi-score ${r.metrics.score} · ${escapeHtml(String(r.metrics.buildMode))} · ${r.metrics.chars}c</p>
    ${visionLine}
    <p class="meta">${escapeHtml(String(r.metrics.palette || ''))}</p>
    <a href="${r.htmlRel}" target="_blank" rel="noopener">Open full page ↗</a>
  </header>
  <div class="shot-wrap">${hasPng
    ? `<img src="${r.pngRel}" alt="${escapeHtml(r.label)} screenshot" loading="lazy" />`
    : `<p class="no-shot">No screenshot (--skip-shots or playwright missing)</p>`}</div>
</article>`
  }).join('\n')

  const compareBlock = visionCompare?.winnerReasons?.length
    ? `<p class="compare-note"><strong>Vision compare winner:</strong> ${escapeHtml(visionCompare.winnerLabel || visionCompare.winnerId || '—')} — ${escapeHtml(visionCompare.winnerReasons.join(' · '))}</p>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Engine triple compare — ${runId}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; background: #0f1115; color: #e8eaed; }
    header.page { padding: 1.25rem 1.5rem; border-bottom: 1px solid #2a2f3a; position: sticky; top: 0; background: rgba(15,17,21,.96); backdrop-filter: blur(8px); z-index: 5; }
    header.page h1 { margin: 0 0 .35rem; font-size: 1.2rem; }
    header.page p { margin: 0 0 .35rem; color: #9aa3b2; font-size: .88rem; line-height: 1.45; max-width: 90rem; }
    .compare-note { color: #86efac !important; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; padding: 1rem; align-items: start; }
    @media (max-width: 1100px) { .grid { grid-template-columns: 1fr; } }
    .card { background: #171a21; border: 1px solid #2a2f3a; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; min-height: 24rem; }
    .card.winner { border-color: #22c55e; box-shadow: 0 0 0 1px rgba(34,197,94,.25); }
    .card.error { border-color: #7f1d1d; }
    .card header { padding: .85rem 1rem; border-bottom: 1px solid #2a2f3a; }
    .card-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: .5rem; margin-bottom: .25rem; }
    .card h2 { margin: 0; font-size: .95rem; flex: 1; min-width: 0; }
    .win-badge { font-size: .65rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #22c55e; border: 1px solid rgba(34,197,94,.35); padding: .1rem .35rem; border-radius: 999px; vertical-align: middle; }
    .gen-time { flex-shrink: 0; font-size: .78rem; font-weight: 600; font-variant-numeric: tabular-nums; color: #fbbf24; background: rgba(251,191,36,.12); border: 1px solid rgba(251,191,36,.25); padding: .15rem .5rem; border-radius: 999px; white-space: nowrap; }
    .sub { margin: 0 0 .35rem; font-size: .75rem; color: #7dd3fc; }
    .meta { margin: 0 0 .2rem; font-size: .72rem; color: #9aa3b2; }
    .meta.vision.pass { color: #86efac; }
    .meta.vision.fail { color: #fca5a5; }
    .card a { font-size: .72rem; color: #7dd3fc; }
    .shot-wrap { flex: 1; overflow: auto; background: #fff; max-height: 85vh; }
    .shot-wrap img { display: block; width: 100%; height: auto; }
    .no-shot, .err { padding: 1rem; color: #64748b; font-size: .85rem; }
    .err { color: #fca5a5; }
  </style>
</head>
<body>
  <header class="page">
    <h1>Engine triple compare</h1>
    <p><strong>Brief:</strong> ${escapeHtml(briefPreview)}</p>
    <p>Run ${runId} · ${DESKTOP_WIDTH}px full-page screenshots · kimi | forge-gemini-native | gpt · generation total ~${genTotalSec.toFixed(1)}s${visionNote}</p>
    ${compareBlock}
  </header>
  <main class="grid">${cards}</main>
</body>
</html>`
}

function writeServeScript(outDir, port) {
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
console.log('Compare: http://localhost:${port}/')
`,
  )
}

/**
 * Run one brief through kimi, forge, and gpt; optionally vision-judge screenshots.
 */
export async function runTripleCompare({
  brief,
  outDir,
  seed,
  skipShots = false,
  withVision = false,
  visionCompare = false,
  visionMin = 75,
  port = 7421,
  writeServe = false,
  slug = null,
}) {
  mkdirSync(outDir, { recursive: true })
  const runId = outDir.split('/').pop()
  const runT0 = Date.now()
  const results = []

  for (const engine of ENGINES) {
    process.stdout.write(`[triple] ${engine.id} … `)
    const t0 = Date.now()
    try {
      const raw = await engine.run(brief, seed)
      const html = raw.html
      const htmlPath = join(outDir, `${engine.id}.html`)
      const pngPath = join(outDir, `${engine.id}.png`)
      writeFileSync(htmlPath, html)
      const metrics = engine.pickMetrics(raw)
      results.push({
        id: engine.id,
        label: engine.label,
        subtitle: engine.subtitle,
        ok: true,
        htmlPath,
        pngPath,
        htmlRel: `${engine.id}.html`,
        pngRel: `${engine.id}.png`,
        metrics,
        elapsed: Date.now() - t0,
      })
      console.log(`${metrics.wall ?? Date.now() - t0}ms · score ${metrics.score} · ${metrics.chars}c`)
    } catch (e) {
      results.push({
        id: engine.id,
        label: engine.label,
        subtitle: engine.subtitle,
        ok: false,
        error: String(e?.message || e),
        elapsed: Date.now() - t0,
      })
      console.log(`FAILED: ${String(e?.message || e).slice(0, 120)}`)
    }
  }

  await captureShots(
    results.filter((r) => r.ok).map((r) => ({ htmlPath: r.htmlPath, pngPath: r.pngPath })),
    skipShots,
  )

  let visionCompareResult = null
  if (withVision) {
    await runVisionJudges(results, brief, { visionMin })
    if (visionCompare) visionCompareResult = await runVisionCompare(results, brief)
  }

  const genTotalSec =
    results.filter((r) => r.ok).reduce((sum, r) => sum + (r.metrics?.wall ?? r.elapsed ?? 0), 0) / 1000

  const winnerId = visionCompareResult?.winnerId ?? pickWinner(results, withVision)
  const summary = {
    winnerId,
    engines: Object.fromEntries(
      results.map((r) => [
        r.id,
        r.ok
          ? {
              ok: true,
              kimiScore: r.metrics.score,
              wall: r.metrics.wall ?? r.elapsed,
              chars: r.metrics.chars,
              buildMode: r.metrics.buildMode,
              vision: r.vision
                ? {
                    score: r.vision.score,
                    pass: r.vision.pass,
                    hierarchy: r.vision.hierarchy,
                    harmony: r.vision.harmony,
                    spacing: r.vision.spacing,
                    copy: r.vision.copy,
                    artDirection: r.vision.artDirection,
                    reasons: r.vision.reasons,
                    error: r.vision.error,
                  }
                : null,
            }
          : { ok: false, error: r.error, elapsed: r.elapsed },
      ]),
    ),
  }

  writeFileSync(join(outDir, 'index.html'), buildCompareHtml({
    runId,
    brief,
    results,
    visionCompare: visionCompareResult,
    genTotalSec,
  }))

  writeFileSync(
    join(outDir, 'meta.json'),
    JSON.stringify(
      {
        runId,
        slug,
        brief,
        seed,
        withVision,
        visionCompare: !!visionCompare,
        visionMin,
        winnerId,
        visionCompareResult,
        summary,
        results: results.map(({ htmlPath, pngPath, ...r }) => r),
      },
      null,
      2,
    ),
  )

  if (writeServe) writeServeScript(outDir, port)

  return {
    runId,
    outDir,
    brief,
    slug,
    results,
    summary,
    visionCompare: visionCompareResult,
    winnerId,
    totalMs: Date.now() - runT0,
    genTotalSec,
    indexPath: join(outDir, 'index.html'),
  }
}

export function printTripleSummary(run) {
  const hasScreenshots = run.results.some((r) => r.ok && existsSync(r.pngPath))
  console.log('')
  console.log('Latest test run')
  console.log(`Run ${run.runId} completed in ~${(run.totalMs / 1000).toFixed(0)}s${hasScreenshots ? ' with screenshots' : ''}:`)
  console.log('')
  for (const r of run.results) {
    if (!r.ok) {
      console.log(`${r.id} — FAILED · ${(r.elapsed / 1000).toFixed(1)}s`)
      continue
    }
    const sec = ((r.metrics.wall ?? r.elapsed) / 1000).toFixed(1)
    const visionPart = r.vision ? `, vision ${r.vision.score}${r.vision.pass ? '' : ' ✗'}` : ''
    console.log(`${r.id} — ${sec}s, kimi ${r.metrics.score}${visionPart}`)
  }
  if (run.winnerId) console.log(`\nWinner: ${run.winnerId}`)
  console.log('')
  console.log(`Artifacts: ${run.outDir}`)
}
