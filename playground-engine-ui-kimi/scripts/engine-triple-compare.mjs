#!/usr/bin/env bun
/**
 * Run one brief through all three homepage engines and open a 3-column compare page.
 *
 * Usage:
 *   bun playground-engine-ui-kimi/scripts/engine-triple-compare.mjs "Homepage for …"
 *   bun playground-engine-ui-kimi/scripts/engine-triple-compare.mjs --prompt "…" --port 7421 --serve
 *   bun playground-engine-ui-kimi/scripts/engine-triple-compare.mjs --skip-shots --no-open
 *
 * Requires: GROQ_API_KEY, GEMINI_API_KEY (or GOOGLE_API_KEY)
 * Optional: playwright (for PNG screenshots)
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { generateKimiHomepage } from '../src/index.js'
import { scoreKimiReadiness } from '../src/quality/kimi-score.js'
import { generateGptHomepage } from '../../playground-engine-ui-gpt/src/engine.js'
import { generateGeminiNativeHomepage } from '../../playground-engine-ui/scripts/forge-gemini-native.mjs'

const ROOT = process.cwd()
const DESKTOP_WIDTH = 1440
const DESKTOP_HEIGHT = 900

function arg(name, fallback) {
  const prefix = `--${name}=`
  const hit = process.argv.find((a) => a.startsWith(prefix))
  if (hit) return hit.slice(prefix.length)
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : fallback
}

function parseBrief() {
  const promptFlag = arg('prompt', null)
  if (promptFlag) return promptFlag.trim()
  const rest = []
  const argv = process.argv.slice(2)
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      if (['--prompt', '--port', '--seed'].includes(a) && argv[i + 1] && !argv[i + 1].startsWith('--')) i++
      continue
    }
    rest.push(a)
  }
  return rest.join(' ').trim()
}

const brief = parseBrief()
if (!brief || brief.length < 12) {
  console.error(`Usage: bun playground-engine-ui-kimi/scripts/engine-triple-compare.mjs "Your homepage brief…"`)
  console.error('   or: bun …/engine-triple-compare.mjs --prompt "Your brief…"')
  process.exit(2)
}

if (!process.env.GROQ_API_KEY) {
  console.error('[triple] GROQ_API_KEY not set')
  process.exit(2)
}
if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
  console.error('[triple] GEMINI_API_KEY or GOOGLE_API_KEY not set (forge + kimi quality path)')
  process.exit(2)
}

const runId = String(Date.now())
const outDir = join(ROOT, '.forge', 'engine-triple', runId)
mkdirSync(outDir, { recursive: true })

const skipShots = process.argv.includes('--skip-shots')
const shouldServe = process.argv.includes('--serve')
const shouldOpen = !process.argv.includes('--no-open')
const port = Number(arg('port', '7421')) || 7421
const seed = arg('seed', runId)
const runT0 = Date.now()

const ENGINES = [
  {
    id: 'kimi',
    label: 'playground-engine-ui-kimi',
    subtitle: 'Gemini top + Groq tail · router/grammars',
    run: () => generateKimiHomepage(brief, { seed }),
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
    run: () => generateGeminiNativeHomepage(brief),
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
    run: () => generateGptHomepage(brief, { seed }),
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

async function captureShots(jobs) {
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

const results = []

for (const engine of ENGINES) {
  process.stdout.write(`[triple] ${engine.id} … `)
  const t0 = Date.now()
  try {
    const raw = await engine.run()
    const html = raw.html
    const htmlPath = join(outDir, `${engine.id}.html`)
    const pngPath = join(outDir, `${engine.id}.png`)
    writeFileSync(htmlPath, html)
    const metrics = engine.pickMetrics(raw)
    results.push({
      ...engine,
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
      ...engine,
      ok: false,
      error: String(e?.message || e),
      elapsed: Date.now() - t0,
    })
    console.log(`FAILED: ${String(e?.message || e).slice(0, 120)}`)
  }
}

await captureShots(results.filter((r) => r.ok).map((r) => ({ htmlPath: r.htmlPath, pngPath: r.pngPath })))

function formatGenTime(r) {
  const ms = r.ok ? (r.metrics?.wall ?? r.elapsed) : r.elapsed
  if (!ms && ms !== 0) return '—'
  return `${(ms / 1000).toFixed(1)}s`
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const genTotalSec = results
  .filter((r) => r.ok)
  .reduce((sum, r) => sum + (r.metrics?.wall ?? r.elapsed ?? 0), 0) / 1000

const briefPreview = brief.length > 220 ? `${brief.slice(0, 217)}…` : brief
const cards = results.map((r) => {
  const genTime = formatGenTime(r)
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
  return `<article class="card">
  <header>
    <div class="card-title-row">
      <h2>${escapeHtml(r.label)}</h2>
      <span class="gen-time" title="Generation time">${genTime}</span>
    </div>
    <p class="sub">${escapeHtml(r.subtitle)}</p>
    <p class="meta">score ${r.metrics.score} · ${escapeHtml(String(r.metrics.buildMode))} · ${r.metrics.chars}c</p>
    <p class="meta">${escapeHtml(String(r.metrics.palette || ''))}</p>
    <a href="${r.htmlRel}" target="_blank" rel="noopener">Open full page ↗</a>
  </header>
  <div class="shot-wrap">${hasPng
    ? `<img src="${r.pngRel}" alt="${escapeHtml(r.label)} screenshot" loading="lazy" />`
    : `<p class="no-shot">No screenshot (--skip-shots or playwright missing)</p>`}</div>
</article>`
}).join('\n')

const indexHtml = `<!DOCTYPE html>
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
    header.page p { margin: 0; color: #9aa3b2; font-size: .88rem; line-height: 1.45; max-width: 90rem; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; padding: 1rem; align-items: start; }
    @media (max-width: 1100px) { .grid { grid-template-columns: 1fr; } }
    .card { background: #171a21; border: 1px solid #2a2f3a; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; min-height: 24rem; }
    .card.error { border-color: #7f1d1d; }
    .card header { padding: .85rem 1rem; border-bottom: 1px solid #2a2f3a; }
    .card-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: .5rem; margin-bottom: .25rem; }
    .card h2 { margin: 0; font-size: .95rem; flex: 1; min-width: 0; }
    .gen-time { flex-shrink: 0; font-size: .78rem; font-weight: 600; font-variant-numeric: tabular-nums; color: #fbbf24; background: rgba(251,191,36,.12); border: 1px solid rgba(251,191,36,.25); padding: .15rem .5rem; border-radius: 999px; white-space: nowrap; }
    .sub { margin: 0 0 .35rem; font-size: .75rem; color: #7dd3fc; }
    .meta { margin: 0 0 .2rem; font-size: .72rem; color: #9aa3b2; }
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
    <p>Run ${runId} · ${DESKTOP_WIDTH}px full-page screenshots · kimi | forge-gemini-native | gpt · generation total ~${genTotalSec.toFixed(1)}s</p>
  </header>
  <main class="grid">${cards}</main>
</body>
</html>`

writeFileSync(join(outDir, 'index.html'), indexHtml)
writeFileSync(join(outDir, 'meta.json'), JSON.stringify({ runId, brief, seed, results: results.map(({ run, pickMetrics, ...r }) => r) }, null, 2))

writeFileSync(join(outDir, 'serve.mjs'), `import { fileURLToPath } from 'node:url'
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
`)

const indexPath = join(outDir, 'index.html')
const totalSec = ((Date.now() - runT0) / 1000).toFixed(0)
const hasScreenshots = results.some((r) => r.ok && existsSync(r.pngPath))
const shotNote = skipShots ? 'without screenshots' : hasScreenshots ? 'with screenshots' : 'screenshots skipped'

console.log('')
console.log('Latest test run')
console.log(`Run ${runId} completed in ~${totalSec}s ${shotNote}:`)
console.log('')
for (const r of results) {
  if (!r.ok) {
    console.log(`${r.id} — FAILED · ${(r.elapsed / 1000).toFixed(1)}s`)
    continue
  }
  const sec = ((r.metrics.wall ?? r.elapsed) / 1000).toFixed(1)
  console.log(`${r.id} — ${sec}s, score ${r.metrics.score}`)
}
console.log('')
console.log(`Artifacts: ${outDir}`)

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

if (shouldServe) {
  console.log(`Compare: http://localhost:${port}/ (Ctrl+C to stop)`)
  if (shouldOpen) {
    setTimeout(() => {
      openUrl(`http://localhost:${port}/`).then(() => {
        console.log('Opened in browser.')
      })
    }, 400)
  }
  await import(join(outDir, 'serve.mjs'))
} else {
  const fileUrl = `file://${indexPath}`
  console.log(`Compare: ${fileUrl}`)
  if (shouldOpen) {
    await openUrl(fileUrl)
    console.log('Opened in browser.')
  } else {
    console.log(`Serve: bun ${join(outDir, 'serve.mjs')}`)
  }
}
