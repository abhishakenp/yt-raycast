#!/usr/bin/env bun
/**
 * Planner A/B: same briefs, different planner models, compare plans + pages.
 *
 * Holds the build pipeline constant (Gemini/GPT-OSS legs) and varies ONLY the
 * creative-director planner across: gpt-oss-120b, gemini-3.5-flash, qwen3-32b.
 * For each (brief × planner): generate, screenshot, record the plan's
 * archetype/layoutMode/palette/fonts/decor + wall time. Sequential (no rate
 * limit). Opens every page; prints a grouped table with file:// links.
 *
 * Usage: bun playground-engine-ui/scripts/forge-planner-ab.mjs [brief-slug...]
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'
import { generateCreativeHomepage } from './forge-creative.mjs'

const ROOT = process.cwd()
const RUN_ID = String(Date.now())
const OUT_DIR = join(ROOT, '.forge', 'planner-ab', RUN_ID)
mkdirSync(OUT_DIR, { recursive: true })

const PLANNERS = [
  { id: 'oss', model: 'openai/gpt-oss-120b' },
  { id: 'gemini', model: 'gemini-3.5-flash' },
  { id: 'qwen', model: 'qwen/qwen3-32b' },
]

// Briefs chosen to stress planner JUDGMENT: an obvious app-shell, a vertical
// product/brand, and a creative/cultural brand (archetype + palette taste).
const BRIEFS = [
  { slug: 'fleet', brief: 'Helmsman — a fleet operations console for autonomous delivery robots. Operators watch a live city map, per-robot battery and route status, an incident timeline, and can hand off to remote teleoperation. B2B, sold to logistics companies.' },
  { slug: 'butchery', brief: 'Marrow — a nose-to-tail butchery and supper club in Lisbon. Weekly changing set menus, hands-on butchery classes, whole-animal provenance from a single farm, a small counter selling cuts and charcuterie.' },
  { slug: 'music', brief: 'Tessellate — an independent electronic music label and warehouse event series in Berlin. Vinyl + digital releases, a roster of 12 artists, a calendar of upcoming warehouse parties, and a small merch + record shop.' },
]

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const briefs = args.length ? BRIEFS.filter((b) => args.includes(b.slug)) : BRIEFS

console.log(`[planner-ab] runId=${RUN_ID}  briefs=${briefs.length}  planners=${PLANNERS.map((p) => p.id).join(',')}`)
const results = []

for (const { slug, brief } of briefs) {
  for (const planner of PLANNERS) {
    const label = `${slug}__${planner.id}`
    process.stdout.write(`[planner-ab] ${label} … `)
    const row = { slug, planner: planner.id, model: planner.model }
    try {
      const r = await generateCreativeHomepage(brief, { plannerModel: planner.model })
      const file = join(OUT_DIR, `${label}.html`)
      writeFileSync(file, r.html)
      writeFileSync(join(OUT_DIR, `${label}.plan.json`), JSON.stringify(r.plan, null, 2))
      Object.assign(row, {
        file, ok: true, wall: r.metrics.wall, chars: r.metrics.chars,
        archetype: r.archetype, layoutMode: r.layoutMode,
        palette: r.metrics.palette, fonts: r.metrics.fonts, decor: r.metrics.decor,
        plannerMs: r.metrics.plannerMs,
      })
      console.log(`${r.metrics.wall}ms · ${r.layoutMode} · ${r.archetype}`)
    } catch (e) {
      row.ok = false
      row.error = String(e?.message || e)
      console.log(`FAILED: ${row.error}`)
    }
    results.push(row)
  }
}

// Screenshots
try {
  const { chromium } = await import('playwright')
  const b = await chromium.launch()
  for (const r of results) {
    if (!r.file || !existsSync(r.file)) continue
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
    await p.goto(`file://${r.file}`, { waitUntil: 'networkidle', timeout: 25000 }).catch(() => {})
    await p.waitForTimeout(500)
    await p.screenshot({ path: r.file.replace(/\.html$/, '.png'), fullPage: true }).catch(() => {})
    await p.close()
  }
  await b.close()
} catch (e) {
  console.error(`[planner-ab] screenshot pass failed: ${e?.message || e}`)
}

// Grouped table
console.log(`\n[planner-ab] === RESULTS (runId ${RUN_ID}) ===\n`)
for (const { slug } of briefs) {
  console.log(`■ ${slug}`)
  for (const planner of PLANNERS) {
    const r = results.find((x) => x.slug === slug && x.planner === planner.id)
    if (!r) continue
    if (!r.ok) { console.log(`   ${planner.id.padEnd(7)} ❌ ${r.error?.slice(0, 60)}`); continue }
    console.log(`   ${planner.id.padEnd(7)} ${String(r.wall + 'ms').padStart(7)} ${r.layoutMode.padEnd(12)} ${String(r.archetype).slice(0, 26).padEnd(27)} ${r.palette}`)
    console.log(`           fonts ${r.fonts} | decor: ${String(r.decor || '').slice(0, 70)}`)
    console.log(`           open: file://${r.file}`)
  }
  console.log('')
}
writeFileSync(join(OUT_DIR, 'results.json'), JSON.stringify(results, null, 2))
console.log(`[planner-ab] artifacts: ${OUT_DIR}`)

for (const r of results) {
  if (r.file && existsSync(r.file)) { try { execSync(`open "${r.file}"`) } catch {} }
}
console.log(`[planner-ab] opened ${results.filter((r) => r.ok).length} pages in browser`)
