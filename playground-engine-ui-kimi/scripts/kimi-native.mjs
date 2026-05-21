#!/usr/bin/env bun
/**
 * Kimi K2-target homepage engine — visual-first compiler, <20s hard max.
 *
 * Usage:
 *   bun playground-engine-ui-kimi/scripts/kimi-native.mjs [slug...]
 *   KIMI_APP_SHELL_MODE=gemini-full  force full Gemini 2D app-shell (~18s)
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { generateKimiHomepage } from '../src/index.js'

const ROOT = process.cwd()
const RUN_ID = String(Date.now())
const OUT_DIR = join(ROOT, '.forge', 'kimi-native', RUN_ID)
mkdirSync(OUT_DIR, { recursive: true })

const BRIEFS = [
  { slug: 'saas', brief: 'Homepage for KubeMeter, an open-source Kubernetes cost-attribution platform that breaks down spend by pod, namespace, and team in real time. Self-hosted, alternative to Datadog Cost Management.' },
  { slug: 'ecommerce', brief: 'Homepage for Aerie Skincare, a plant-based DTC face oil line. Three products: Restore, Glow, Calm. Founded by herbalists. Subscribe and save, recyclable packaging, made in small batches in Vermont.' },
  { slug: 'restaurant', brief: 'Homepage for Sumida, a single-origin coffee roaster in Tokyo. Subscriptions, retail bags, wholesale to cafes. Family-run since 1987.' },
  { slug: 'portfolio', brief: 'Personal portfolio for Maya Chen, a freelance brand designer working with early-stage startups. Based in Brooklyn. Past clients include Linear, Vercel, and Pitch.' },
  { slug: 'agency', brief: 'Homepage for Sutter Creative, a brand identity and digital design agency working with consumer startups. 12-person team in Portland.' },
  { slug: 'fitness', brief: 'Homepage for Vertex Fitness, a HIIT and strength training studio in Brooklyn. Class packs, monthly memberships, drop-in rates.' },
  { slug: 'wellness', brief: 'Homepage for Halo Wellness, a meditation and sound bath studio in Los Angeles. 60-min and 90-min sessions, monthly membership.' },
  { slug: 'hotel', brief: 'Homepage for Stoneholm, a 24-room boutique hotel on the Oregon coast. Cliffside cedar architecture, ocean-view rooms, spa, fire pits.' },
  { slug: 'fleet', brief: 'Helmsman — a fleet operations console for autonomous delivery robots. Operators watch a live city map, per-robot battery and route status, an incident timeline, and can hand off to remote teleoperation.' },
  { slug: 'riso', brief: 'Riso Press — a Brooklyn risograph print studio and zine shop. Bold, playful, ink-on-paper craft. Limited-run art prints and weekend workshops.' },
  { slug: 'music', brief: 'Tessellate — an independent electronic music label and warehouse event series in Berlin. Vinyl + digital releases, 12 artists, upcoming parties, merch shop.' },
  { slug: 'butchery', brief: 'Marrow — a nose-to-tail butchery and supper club in Lisbon. Weekly changing set menus, butchery classes, whole-animal provenance from a single farm.' },
]
const DEFAULT_8 = ['saas', 'ecommerce', 'restaurant', 'portfolio', 'agency', 'fitness', 'wellness', 'hotel']

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const briefs = args.length ? BRIEFS.filter((b) => args.includes(b.slug)) : BRIEFS.filter((b) => DEFAULT_8.includes(b.slug))

console.log(`[kimi] runId=${RUN_ID} briefs=${briefs.length}`)
const results = []

for (const { slug, brief } of briefs) {
  process.stdout.write(`[kimi] ${slug} … `)
  try {
    const r = await generateKimiHomepage(brief, { seed: `${RUN_ID}-${slug}` })
    const file = join(OUT_DIR, `${slug}.html`)
    writeFileSync(file, r.html)
    writeFileSync(join(OUT_DIR, `${slug}.plan.json`), JSON.stringify({ plan: r.plan, route: r.route, metrics: r.metrics, audits: r.audits }, null, 2))
    results.push({ slug, ok: true, file, ...r.metrics, kimiScore: r.audits.kimi.score, kimiIssues: r.audits.kimi.issues })
    console.log(`${r.metrics.wall}ms · ${r.metrics.pageKind} · ${r.metrics.grammarId} · kimi=${r.audits.kimi.score} · ${r.metrics.chars}c`)
  } catch (e) {
    results.push({ slug, ok: false, error: String(e?.message || e) })
    console.log(`FAILED: ${e?.message || e}`)
  }
}

try {
  const { chromium } = await import('playwright')
  const b = await chromium.launch()
  for (const r of results) {
    if (!r.file) continue
    const pg = await b.newPage({ viewport: { width: 1440, height: 900 } })
    await pg.goto(`file://${r.file}`, { waitUntil: 'networkidle', timeout: 25000 }).catch(() => {})
    await pg.waitForTimeout(500)
    await pg.screenshot({ path: r.file.replace(/\.html$/, '.png'), fullPage: true }).catch(() => {})
    await pg.close()
  }
  await b.close()
} catch (e) {
  console.error(`[kimi] shots: ${e?.message || e}`)
}

console.log(`\n[kimi] === RESULTS (${RUN_ID}) ===`)
for (const r of results) {
  if (!r.ok) {
    console.log(`  ${r.slug.padEnd(10)} ❌ ${r.error}`)
    continue
  }
  const flag = r.wall < 20000 ? '✅' : '❌'
  console.log(`  ${r.slug.padEnd(10)} ${flag} ${String(r.wall + 'ms').padStart(7)} ${r.pageKind.padEnd(12)} kimi=${String(r.kimiScore).padStart(3)} ${r.grammarId}`)
  console.log(`            html: ${r.file}`)
}
writeFileSync(join(OUT_DIR, 'results.json'), JSON.stringify(results.map(({ file, ...r }) => r), null, 2))
console.log(`[kimi] artifacts: ${OUT_DIR}`)
console.log(`[kimi] gallery (optional): http://localhost:7420/ — run kimi-gallery-build.mjs + serve.mjs if needed`)
