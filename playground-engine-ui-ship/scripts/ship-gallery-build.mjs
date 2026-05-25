#!/usr/bin/env bun
/**
 * Build desktop-screenshot gallery for ship-native runs (8 verticals grid).
 *
 * Usage:
 *   bun playground-engine-ui-ship/scripts/ship-gallery-build.mjs
 *   bun playground-engine-ui-ship/scripts/ship-gallery-build.mjs --skip-shots
 *   bun playground-engine-ui-ship/scripts/ship-gallery-build.mjs --vertical=1779411971125
 *   bun playground-engine-ui-ship/scripts/ship-gallery-build.mjs --run=1779412806652
 *
 * Then:
 *   bun .forge/ship-gallery/serve.mjs
 *   → http://localhost:7420/
 */
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
  symlinkSync,
  existsSync,
  unlinkSync,
  cpSync,
} from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const GALLERY_DIR = join(ROOT, '.forge', 'ship-gallery')
const DESKTOP_WIDTH = 1440
const DESKTOP_HEIGHT = 900
const PORT = Number(process.env.SHIP_GALLERY_PORT || '7420')

function arg(name, fallback) {
  const prefix = `--${name}=`
  const eq = process.argv.find((a) => a.startsWith(prefix))
  if (eq) return eq.slice(prefix.length)
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : fallback
}

const DEFAULT_8 = ['saas', 'ecommerce', 'restaurant', 'portfolio', 'agency', 'fitness', 'wellness', 'hotel']
const EXTRA_SLUGS = ['blog-dogs', 'blog-generic', 'fleet', 'riso']

function readRunResults(runDir) {
  for (const name of ['results.json', 'summary.json']) {
    const path = join(runDir, name)
    if (!existsSync(path)) continue
    try {
      return JSON.parse(readFileSync(path, 'utf8'))
    } catch {}
  }
  return null
}

function bestVerticalRun() {
  const dir = join(ROOT, '.forge', 'ship-native')
  if (!existsSync(dir)) return null
  const runs = readdirSync(dir)
    .filter((d) => /^\d+$/.test(d))
    .sort()
    .reverse()
  let fallback = null
  let bestCount = 0
  for (const run of runs) {
    const rows = readRunResults(join(dir, run))
    if (!Array.isArray(rows)) continue
    const ok = rows.filter((r) => r.ok !== false && DEFAULT_8.includes(r.slug))
    if (ok.length === DEFAULT_8.length) return run
    if (ok.length > bestCount) {
      bestCount = ok.length
      fallback = run
    }
  }
  return fallback || runs[0] || null
}

function resolveVerticalSources() {
  const dir = join(ROOT, '.forge', 'ship-native')
  if (!existsSync(dir)) return { runLabel: null, sources: [] }
  const runs = readdirSync(dir)
    .filter((d) => /^\d+$/.test(d))
    .sort()
    .reverse()
  const picked = new Map()
  for (const run of runs) {
    for (const slug of DEFAULT_8) {
      if (picked.has(slug)) continue
      const html = join(dir, run, `${slug}.html`)
      if (!existsSync(html)) continue
      picked.set(slug, { slug, run, html })
    }
    if (picked.size === DEFAULT_8.length) break
  }
  const sources = DEFAULT_8.map((slug) => picked.get(slug)).filter(Boolean)
  const runsUsed = [...new Set(sources.map((s) => s.run))]
  const runLabel = runsUsed.length === 1 ? runsUsed[0] : `mixed (${runsUsed.join(', ')})`
  return { runLabel, sources }
}

function resolveExtraSources() {
  const dir = join(ROOT, '.forge', 'ship-native')
  if (!existsSync(dir)) return []
  const runs = readdirSync(dir)
    .filter((d) => /^\d+$/.test(d))
    .sort()
    .reverse()
  const picked = new Map()
  for (const run of runs) {
    for (const slug of EXTRA_SLUGS) {
      if (picked.has(slug)) continue
      const html = join(dir, run, `${slug}.html`)
      if (!existsSync(html)) continue
      picked.set(slug, { slug, run, html })
    }
  }
  return EXTRA_SLUGS.map((slug) => picked.get(slug)).filter(Boolean)
}

function resolveRunSources(runId) {
  const runDir = join(ROOT, '.forge', 'ship-native', runId)
  if (!existsSync(runDir)) return []
  const rows = readRunResults(runDir)
  if (Array.isArray(rows) && rows.length) {
    return rows
      .filter((r) => r.ok !== false && r.file && existsSync(r.file))
      .map((r) => ({ slug: r.slug, run: runId, html: r.file }))
  }
  return readdirSync(runDir)
    .filter((f) => f.endsWith('.html'))
    .map((f) => ({ slug: f.replace(/\.html$/, ''), run: runId, html: join(runDir, f) }))
}

const skipShots = process.argv.includes('--skip-shots')
const forceRun = arg('vertical', null)
const featuredRun = arg('run', null)
const resolved = forceRun ? null : resolveVerticalSources()
const verticalRun =
  forceRun ||
  (resolved?.sources.length === DEFAULT_8.length ? resolved.sources[0].run : bestVerticalRun())

if (!verticalRun) {
  console.error('[ship-gallery] no ship-native run found — run: bun playground-engine-ui-ship/scripts/ship-native.mjs')
  process.exit(2)
}

const verticalDir = join(ROOT, '.forge', 'ship-native', verticalRun)
const pagesDir = join(GALLERY_DIR, 'pages')
mkdirSync(pagesDir, { recursive: true })

function linkPage(subdir, name, src) {
  const dir = join(pagesDir, subdir)
  mkdirSync(dir, { recursive: true })
  const dest = join(dir, name)
  if (existsSync(dest)) unlinkSync(dest)
  if (existsSync(src)) {
    try {
      symlinkSync(src, dest)
    } catch {
      cpSync(src, dest)
    }
    return true
  }
  return false
}

async function captureDesktopShots(jobs) {
  if (!jobs.length || skipShots) return
  let chromium
  try {
    ;({ chromium } = await import('playwright'))
  } catch (e) {
    console.error('[ship-gallery] playwright required for desktop shots:', e.message)
    return
  }
  const browser = await chromium.launch()
  console.log(`[ship-gallery] capturing ${jobs.length} desktop shots at ${DESKTOP_WIDTH}×${DESKTOP_HEIGHT}…`)
  for (const { htmlPath, pngPath } of jobs) {
    const page = await browser.newPage({ viewport: { width: DESKTOP_WIDTH, height: DESKTOP_HEIGHT } })
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {})
    await page.waitForTimeout(600)
    await page.screenshot({ path: pngPath, fullPage: true }).catch(() => {})
    await page.close()
  }
  await browser.close()
}

const shotJobs = []

function ensureShot(subdir, baseName, htmlSrc, { refreshShot = false } = {}) {
  const htmlName = baseName.endsWith('.html') ? baseName : `${baseName}.html`
  const pngName = htmlName.replace(/\.html$/, '.png')
  linkPage(subdir, htmlName, htmlSrc)
  const htmlPath = join(pagesDir, subdir, htmlName)
  const pngPath = join(pagesDir, subdir, pngName)
  const srcPng = htmlSrc.replace(/\.html$/, '.png')

  if (existsSync(pngPath)) unlinkSync(pngPath)

  const mustCapture = refreshShot || !skipShots
  if (mustCapture) {
    shotJobs.push({ htmlPath, pngPath })
  } else if (existsSync(srcPng)) {
    try {
      symlinkSync(srcPng, pngPath)
    } catch {
      cpSync(srcPng, pngPath)
    }
  } else {
    shotJobs.push({ htmlPath, pngPath })
  }
  return { html: `/pages/${subdir}/${htmlName}`, png: `/pages/${subdir}/${pngName}`, htmlPath }
}

const verticalAssets = []
const verticalMetaByRun = new Map()

function loadRunMeta(runId) {
  if (!runId || verticalMetaByRun.has(runId)) return verticalMetaByRun.get(runId)
  const rows = readRunResults(join(ROOT, '.forge', 'ship-native', runId))
  if (!Array.isArray(rows)) return {}
  const map = Object.fromEntries(rows.filter((r) => r.ok !== false).map((r) => [r.slug, r]))
  verticalMetaByRun.set(runId, map)
  return map
}

const sourceList =
  !forceRun && resolved?.sources.length
    ? resolved.sources
    : DEFAULT_8.map((slug) => ({ slug, run: verticalRun, html: join(verticalDir, `${slug}.html`) }))

for (const { slug, run, html } of sourceList) {
  if (!existsSync(html)) continue
  const meta = loadRunMeta(run)[slug] || {
    slug,
    ok: true,
    wall: 0,
    pageKind: 'vertical-doc',
    grammarId: '—',
    readinessScore: '—',
    anchor: '—',
  }
  verticalAssets.push({
    ...meta,
    slug,
    sourceRun: run,
    assets: ensureShot('vertical', `${slug}.html`, html, { refreshShot: !skipShots }),
  })
}

const extraAssets = []
for (const { slug, run, html } of resolveExtraSources()) {
  if (!existsSync(html)) continue
  const meta = loadRunMeta(run)[slug] || { slug, ok: true, wall: 0, pageKind: 'vertical-doc', grammarId: '—', readinessScore: '—' }
  extraAssets.push({
    ...meta,
    slug,
    sourceRun: run,
    assets: ensureShot('extra', `${slug}.html`, html, { refreshShot: !skipShots }),
  })
}

const featuredAssets = []
if (featuredRun) {
  for (const { slug, run, html } of resolveRunSources(featuredRun)) {
    if (!existsSync(html)) continue
    const meta = loadRunMeta(run)[slug] || { slug, ok: true, wall: 0, pageKind: 'vertical-doc', grammarId: '—', readinessScore: '—' }
    featuredAssets.push({
      ...meta,
      slug,
      sourceRun: run,
      assets: ensureShot('featured', `${slug}.html`, html, { refreshShot: !skipShots }),
    })
  }
}

const verticalRunLabel = !forceRun && resolved?.runLabel ? resolved.runLabel : verticalRun
const verticalResults = readRunResults(verticalDir) || verticalAssets

if (verticalAssets.length < DEFAULT_8.length) {
  console.warn(
    `[ship-gallery] only ${verticalAssets.length}/${DEFAULT_8.length} verticals — run: bun playground-engine-ui-ship/scripts/ship-native.mjs`,
  )
}

await captureDesktopShots(shotJobs)

function desktopCard({ title, meta, png, html, previewHeight = 360 }) {
  return `<div class="card">
  <div class="card-head">
    <h3>${title}</h3>
    ${meta ? `<p class="meta">${meta}</p>` : ''}
    <a href="${html}" target="_blank" rel="noopener">Open full page ↗</a>
  </div>
  <div class="desktop-frame" style="max-height:${previewHeight}px">
    <div class="desktop-scroll"><img src="${png}" alt="${title} desktop preview" loading="lazy" /></div>
  </div>
</div>`
}

const verticalCards = verticalAssets
  .map((r) =>
    desktopCard({
      title: r.slug,
      meta: `${(r.wall / 1000).toFixed(1)}s · ${r.pageKind} · ${r.grammarId} · readiness ${r.readinessScore ?? r.kimiScore ?? '—'}${r.anchor && r.anchor !== '—' ? ` · ${r.anchor}` : ''}`,
      png: r.assets.png,
      html: r.assets.html,
      previewHeight: r.pageKind === 'app-shell' ? 420 : 360,
    }),
  )
  .join('\n')

const featuredSlugSet = new Set(featuredAssets.map((a) => a.slug))
const extraForDisplay = featuredRun ? extraAssets.filter((a) => !featuredSlugSet.has(a.slug)) : extraAssets

const extraCards = extraForDisplay
  .map((r) =>
    desktopCard({
      title: r.slug,
      meta: `${(r.wall / 1000).toFixed(1)}s · ${r.pageKind} · ${r.grammarId} · readiness ${r.readinessScore ?? r.kimiScore ?? '—'} · run ${r.sourceRun}`,
      png: r.assets.png,
      html: r.assets.html,
    }),
  )
  .join('\n')

const featuredCards = featuredAssets
  .map((r) =>
    desktopCard({
      title: r.slug,
      meta: `${(r.wall / 1000).toFixed(1)}s · ${r.pageKind} · ${r.grammarId} · readiness ${r.readinessScore ?? r.kimiScore ?? '—'} · run ${r.sourceRun}`,
      png: r.assets.png,
      html: r.assets.html,
      previewHeight: r.pageKind === 'editorial-blog-index' ? 480 : 360,
    }),
  )
  .join('\n')

const okVerticals = (Array.isArray(verticalResults) ? verticalResults : verticalAssets).filter((r) => r.ok !== false)
const meanWall = okVerticals.length
  ? okVerticals.reduce((s, r) => s + (r.wall || 0), 0) / okVerticals.length / 1000
  : 0

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Ship Engine Gallery — desktop ${DESKTOP_WIDTH}px</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; background: #0f1115; color: #e8eaed; }
    header { padding: 1.5rem 2rem; border-bottom: 1px solid #2a2f3a; position: sticky; top: 0; background: rgba(15,17,21,.95); backdrop-filter: blur(8px); z-index: 10; }
    header h1 { margin: 0 0 .35rem; font-size: 1.35rem; font-weight: 600; }
    header p { margin: 0; color: #9aa3b2; font-size: .9rem; max-width: 72rem; line-height: 1.5; }
    main { padding: 1.5rem 1rem 3rem; }
    section { margin-bottom: 2.5rem; }
    section h2 { font-size: 1rem; text-transform: uppercase; letter-spacing: .12em; color: #86efac; margin: 0 0 1rem; padding: 0 1rem; }
    .summary { color: #9aa3b2; font-size: .88rem; margin: 0 0 1rem; padding: 0 1rem; }
    .grid { display: grid; gap: 1rem; padding: 0 1.25rem; }
    .grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    @media (max-width: 1400px) { .grid-4 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
    @media (max-width: 1000px) { .grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    .section-extra { border-top: 1px solid #2a2f3a; padding-top: 2rem; margin-top: 1rem; }
    .section-extra h2 { color: #fcd34d; }
    .section-featured { border-bottom: 1px solid #2a2f3a; padding-bottom: 2rem; margin-bottom: 1rem; }
    .section-featured h2 { color: #93c5fd; }
    .card { background: #171a21; border: 1px solid #2a2f3a; border-radius: 12px; overflow: hidden; }
    .card-head { padding: .75rem 1rem; border-bottom: 1px solid #2a2f3a; }
    .card-head h3 { margin: 0 0 .25rem; font-size: .95rem; text-transform: capitalize; }
    .card-head .meta { margin: 0 0 .35rem; font-size: .72rem; color: #9aa3b2; line-height: 1.4; }
    .card-head a { font-size: .72rem; color: #86efac; text-decoration: none; }
    .desktop-frame { background: #1a1d24; border-top: 1px solid #2a2f3a; overflow: hidden; }
    .desktop-scroll { overflow: auto; background: #fff; -webkit-overflow-scrolling: touch; }
    .desktop-scroll img { display: block; width: 100%; height: auto; }
  </style>
</head>
<body>
  <header>
    <h1>playground-engine-ui-ship — desktop gallery</h1>
    <p>Unified ship engine · run <strong>${verticalRunLabel}</strong>. Full-page captures at ${DESKTOP_WIDTH}px — scroll inside each thumbnail.</p>
  </header>
  <main>
    ${featuredCards ? `<section class="section-featured">
      <h2>Latest run — ${featuredRun}</h2>
      <p class="summary">Pages from the run you just generated (or passed via --run=).</p>
      <div class="grid grid-4">${featuredCards}</div>
    </section>` : ''}
    <section>
      <h2>Ship engine — 8 website types</h2>
      <p class="summary">SaaS · ecommerce · restaurant · portfolio · agency · fitness · wellness · hotel. ${verticalRunLabel}${okVerticals.length ? ` · mean ~${meanWall.toFixed(1)}s` : ''}. Four per row — scroll each thumbnail or open full page.</p>
      <div class="grid grid-4">${verticalCards || '<p class="summary">No pages in this run.</p>'}</div>
    </section>
    ${extraCards ? `<section class="section-extra">
      <h2>Extra briefs (latest per slug)</h2>
      <p class="summary">Blog stress tests and ops/editorial briefs — newest run wins for each slug.</p>
      <div class="grid grid-4">${extraCards}</div>
    </section>` : ''}
  </main>
</body>
</html>`

writeFileSync(join(GALLERY_DIR, 'index.html'), indexHtml)
writeFileSync(
  join(GALLERY_DIR, 'meta.json'),
  JSON.stringify(
    {
      verticalRun: verticalRunLabel,
      featuredRun: featuredRun || null,
      desktopWidth: DESKTOP_WIDTH,
      verticalResults,
      url: `http://localhost:${PORT}/`,
    },
    null,
    2,
  ),
)

writeFileSync(
  join(GALLERY_DIR, 'serve.mjs'),
  `import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
const dir = dirname(fileURLToPath(import.meta.url))
const types = { html: 'text/html', json: 'application/json', png: 'image/png' }
Bun.serve({
  port: ${PORT},
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
console.log('[ship-gallery] http://localhost:${PORT}/')
`,
)

console.log(`[ship-gallery] built ${GALLERY_DIR} (desktop ${DESKTOP_WIDTH}px screenshots)`)
console.log(`[ship-gallery] shots captured: ${shotJobs.length} new`)
console.log(`[ship-gallery] preview: bun .forge/ship-gallery/serve.mjs → http://localhost:${PORT}/`)
