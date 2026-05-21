#!/usr/bin/env bun
/**
 * Build desktop-screenshot gallery (1440px viewport — not responsive iframes).
 *
 * Usage:
 *   bun playground-engine-ui-kimi/scripts/kimi-gallery-build.mjs
 *   bun playground-engine-ui-kimi/scripts/kimi-gallery-build.mjs --skip-shots
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync, symlinkSync, existsSync, unlinkSync, cpSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const GALLERY_DIR = join(ROOT, '.forge', 'kimi-gallery')
const DESKTOP_WIDTH = 1440
const DESKTOP_HEIGHT = 900

function arg(name, fallback) {
  const prefix = `--${name}=`
  const eq = process.argv.find((a) => a.startsWith(prefix))
  if (eq) return eq.slice(prefix.length)
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : fallback
}

const DEFAULT_8 = ['saas', 'ecommerce', 'restaurant', 'portfolio', 'agency', 'fitness', 'wellness', 'hotel']

function latestRun(base) {
  const dir = join(ROOT, '.forge', base)
  if (!existsSync(dir)) return null
  const runs = readdirSync(dir).filter((d) => /^\d+$/.test(d)).sort()
  return runs[runs.length - 1] || null
}

/** Prefer the newest run that has all eight canonical verticals. */
function bestVerticalRun() {
  const dir = join(ROOT, '.forge', 'kimi-native')
  if (!existsSync(dir)) return null
  const runs = readdirSync(dir).filter((d) => /^\d+$/.test(d)).sort().reverse()
  let fallback = null
  let bestCount = 0
  for (const run of runs) {
    const resultsPath = join(dir, run, 'results.json')
    if (!existsSync(resultsPath)) continue
    const rows = JSON.parse(readFileSync(resultsPath, 'utf8'))
    const ok = rows.filter((r) => r.ok && DEFAULT_8.includes(r.slug))
    if (ok.length === DEFAULT_8.length) return run
    if (ok.length > bestCount) {
      bestCount = ok.length
      fallback = run
    }
  }
  return fallback || runs[0] || null
}

/** Newest successful HTML per slug (e.g. fresh saas after engine fix + older 7 verticals). */
function resolveVerticalSources() {
  const dir = join(ROOT, '.forge', 'kimi-native')
  if (!existsSync(dir)) return { runLabel: null, sources: [] }
  const runs = readdirSync(dir).filter((d) => /^\d+$/.test(d)).sort().reverse()
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

const skipShots = process.argv.includes('--skip-shots')
const forceRun = arg('vertical', null)
const resolved = forceRun ? null : resolveVerticalSources()
const verticalRun = forceRun || (resolved?.sources.length === DEFAULT_8.length ? resolved.sources[0].run : bestVerticalRun())
const includeVariety = process.argv.includes('--with-variety')
const varietyRun = includeVariety ? arg('variety', latestRun('kimi-variety')) : null
const kimiRefRun = arg('kimi-ref', '1779260958429')

if (!verticalRun) {
  console.error('[gallery] no kimi-native run found')
  process.exit(2)
}

const verticalDir = join(ROOT, '.forge', 'kimi-native', verticalRun)
const varietyDir = varietyRun ? join(ROOT, '.forge', 'kimi-variety', varietyRun) : null
const kimiRefDir = existsSync(join(ROOT, '.forge', 'vs-kimi', kimiRefRun))
  ? join(ROOT, '.forge', 'vs-kimi', kimiRefRun)
  : null

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
    ({ chromium } = await import('playwright'))
  } catch (e) {
    console.error('[gallery] playwright required for desktop shots:', e.message)
    return
  }
  const browser = await chromium.launch()
  console.log(`[gallery] capturing ${jobs.length} desktop shots at ${DESKTOP_WIDTH}×${DESKTOP_HEIGHT}…`)
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
  const path = join(ROOT, '.forge', 'kimi-native', runId, 'results.json')
  if (!existsSync(path)) return {}
  const rows = JSON.parse(readFileSync(path, 'utf8'))
  const map = Object.fromEntries(rows.filter((r) => r.ok).map((r) => [r.slug, r]))
  verticalMetaByRun.set(runId, map)
  return map
}

const sourceList = !forceRun && resolved?.sources.length
  ? resolved.sources
  : DEFAULT_8.map((slug) => ({ slug, run: verticalRun, html: join(verticalDir, `${slug}.html`) }))

for (const { slug, run, html } of sourceList) {
  if (!existsSync(html)) continue
  const meta = loadRunMeta(run)[slug] || { slug, ok: true, wall: 0, pageKind: 'vertical-doc', grammarId: '—', kimiScore: '—', anchor: '—' }
  verticalAssets.push({
    ...meta,
    slug,
    sourceRun: run,
    assets: ensureShot('vertical', `${slug}.html`, html, { refreshShot: true }),
  })
}

const verticalRunLabel = !forceRun && resolved?.runLabel ? resolved.runLabel : verticalRun
const verticalResults = existsSync(join(verticalDir, 'results.json'))
  ? JSON.parse(readFileSync(join(verticalDir, 'results.json'), 'utf8'))
  : verticalAssets

if (verticalAssets.length < DEFAULT_8.length) {
  console.warn(`[gallery] only ${verticalAssets.length}/${DEFAULT_8.length} verticals in run ${verticalRun} — run: bun playground-engine-ui-kimi/scripts/kimi-native.mjs`)
}

let varietyRows = []
let varietyMeta = null
const varietyAssets = []

if (includeVariety && varietyDir && existsSync(join(varietyDir, 'results.json'))) {
  varietyMeta = JSON.parse(readFileSync(join(varietyDir, 'results.json'), 'utf8'))
  varietyRows = varietyMeta.rows || []
  for (const row of varietyRows) {
    const name = `variant-${row.index}.html`
    varietyAssets.push({
      ...row,
      assets: ensureShot('variety', name, join(varietyDir, name)),
    })
  }
}

const kimiStress = ['fleet', 'riso', 'butchery', 'music']
const kimiPairs = []

if (kimiRefDir) {
  for (const slug of kimiStress) {
    const kimiHtml = join(kimiRefDir, slug, 'kimi.html')
    if (!existsSync(kimiHtml)) continue
    kimiPairs.push({
      slug,
      kimi: ensureShot('kimi-ref', `${slug}-kimi.html`, kimiHtml),
    })
  }
}

await captureDesktopShots(shotJobs)

function desktopCard({ title, meta, png, html, previewHeight = 360, compact = true }) {
  const imgTag = compact
    ? `<img src="${png}" alt="${title} desktop preview" loading="lazy" />`
    : `<img src="${png}" alt="${title} desktop preview" width="${DESKTOP_WIDTH}" loading="lazy" />`
  return `<div class="card">
  <div class="card-head">
    <h3>${title}</h3>
    ${meta ? `<p class="meta">${meta}</p>` : ''}
    <a href="${html}" target="_blank" rel="noopener">Open full page ↗</a>
  </div>
  <div class="desktop-frame" style="max-height:${previewHeight}px">
    <div class="desktop-scroll">${imgTag}</div>
  </div>
</div>`
}

const verticalCards = verticalAssets
  .map((r) => desktopCard({
    title: r.slug,
    meta: `${(r.wall / 1000).toFixed(1)}s · ${r.pageKind} · ${r.grammarId} · kimi ${r.kimiScore} · ${r.anchor}`,
    png: r.assets.png,
    html: r.assets.html,
    previewHeight: r.pageKind === 'app-shell' ? 420 : 360,
  }))
  .join('\n')

const kimiRefCards = kimiPairs
  .map(({ slug, kimi }) => desktopCard({
    title: slug,
    meta: 'Kimi K2.5 reference (cursor-agent) — quality bar only, not generated by this engine',
    png: kimi.png,
    html: kimi.html,
    previewHeight: 360,
  }))
  .join('\n')

const okVerticals = verticalResults.filter((r) => r.ok)
const meanWall = okVerticals.length
  ? okVerticals.reduce((s, r) => s + r.wall, 0) / okVerticals.length / 1000
  : 0

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Kimi Engine Gallery — desktop ${DESKTOP_WIDTH}px</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; background: #0f1115; color: #e8eaed; }
    header { padding: 1.5rem 2rem; border-bottom: 1px solid #2a2f3a; position: sticky; top: 0; background: rgba(15,17,21,.95); backdrop-filter: blur(8px); z-index: 10; }
    header h1 { margin: 0 0 .35rem; font-size: 1.35rem; font-weight: 600; }
    header p { margin: 0; color: #9aa3b2; font-size: .9rem; max-width: 72rem; line-height: 1.5; }
    main { padding: 1.5rem 1rem 3rem; }
    section { margin-bottom: 2.5rem; }
    section h2 { font-size: 1rem; text-transform: uppercase; letter-spacing: .12em; color: #7dd3fc; margin: 0 0 1rem; padding: 0 1rem; }
    .summary { color: #9aa3b2; font-size: .88rem; margin: 0 0 1rem; padding: 0 1rem; }
    .grid { display: grid; gap: 1rem; padding: 0 1.25rem; }
    .grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    @media (max-width: 1400px) { .grid-4 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
    @media (max-width: 1000px) { .grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    .section-ref { border-top: 1px solid #2a2f3a; padding-top: 2rem; margin-top: 1rem; }
    .section-ref h2 { color: #c4b5fd; }
    .card { background: #171a21; border: 1px solid #2a2f3a; border-radius: 12px; overflow: hidden; }
    .card-head { padding: .75rem 1rem; border-bottom: 1px solid #2a2f3a; }
    .card-head h3 { margin: 0 0 .25rem; font-size: .95rem; text-transform: capitalize; }
    .card-head .meta { margin: 0 0 .35rem; font-size: .72rem; color: #9aa3b2; line-height: 1.4; }
    .card-head a { font-size: .72rem; color: #7dd3fc; text-decoration: none; }
    .desktop-frame { background: #1a1d24; border-top: 1px solid #2a2f3a; overflow: hidden; }
    .desktop-scroll { overflow: auto; background: #fff; -webkit-overflow-scrolling: touch; }
    .desktop-scroll img { display: block; width: 100%; height: auto; }
  </style>
</head>
<body>
  <header>
    <h1>playground-engine-ui-kimi — desktop gallery</h1>
    <p>Engine outputs · run <strong>${verticalRunLabel}</strong>. Full-page captures at ${DESKTOP_WIDTH}px — scroll inside each thumbnail.</p>
  </header>
  <main>
    <section>
      <h2>Kimi engine — 8 website types</h2>
      <p class="summary">SaaS · ecommerce · restaurant · portfolio · agency · fitness · wellness · hotel. ${verticalRunLabel}${okVerticals.length ? ` · mean ~${meanWall.toFixed(1)}s` : ''}. Four per row — scroll each thumbnail or open full page.</p>
      <div class="grid grid-4">${verticalCards || '<p class="summary">No pages in this run.</p>'}</div>
    </section>
    <section class="section-ref">
      <h2>Kimi K2.5 reference (stress briefs)</h2>
      <p class="summary">Quality bar only (cursor-agent). Not generated by this engine.</p>
      <div class="grid grid-4">${kimiRefCards || '<p class="summary">No Kimi reference artifacts in .forge/vs-kimi.</p>'}</div>
    </section>
  </main>
</body>
</html>`

writeFileSync(join(GALLERY_DIR, 'index.html'), html)
writeFileSync(join(GALLERY_DIR, 'meta.json'), JSON.stringify({
  verticalRun,
  varietyRun,
  kimiRefRun,
  desktopWidth: DESKTOP_WIDTH,
  verticalResults,
  variety: varietyMeta?.variety,
  url: 'http://localhost:7420/',
}, null, 2))

console.log(`[gallery] built ${GALLERY_DIR} (desktop ${DESKTOP_WIDTH}px screenshots)`)
console.log(`[gallery] shots captured: ${shotJobs.length} new`)
console.log(`[gallery] preview: http://localhost:7420/ (open manually in Cursor browser if needed)`)
