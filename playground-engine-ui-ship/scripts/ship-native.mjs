#!/usr/bin/env bun
/**
 * Unified Ship-Fast homepage engine — visual-first compiler, <20s hard max.
 *
 * Usage:
 *   bun playground-engine-ui-ship/scripts/ship-native.mjs [slug...]
 *   SHIP_FAST=1 bun playground-engine-ui-ship/scripts/ship-native.mjs blog-dogs
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { generateShipHomepage } from '../src/index.js'

const ROOT = process.cwd()
const RUN_ID = String(Date.now())
const OUT_DIR = join(ROOT, '.forge', 'ship-native', RUN_ID)
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
  { slug: 'blog-dogs', brief: 'A blog about dogs — training tips, breed guides, adoption stories, and product reviews for dog owners.' },
  { slug: 'blog-generic', brief: 'Newsletter and blog home for independent journalists covering technology policy and civic infrastructure.' },
  { slug: 'fleet', brief: 'Helmsman — a fleet operations console for autonomous delivery robots. Operators watch a live city map, per-robot battery and route status, an incident timeline, and can hand off to remote teleoperation.' },
  { slug: 'riso', brief: 'Riso Press — a Brooklyn risograph print studio and zine shop. Bold, playful, ink-on-paper craft. Limited-run art prints and weekend workshops.' },
]
const DEFAULT_8 = ['saas', 'ecommerce', 'blog-dogs', 'restaurant', 'portfolio', 'fitness', 'fleet', 'hotel']

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const briefs = args.length ? BRIEFS.filter((b) => args.includes(b.slug)) : BRIEFS.filter((b) => DEFAULT_8.includes(b.slug))

console.log(`[ship] runId=${RUN_ID} briefs=${briefs.length} mode=${process.env.SHIP_FAST === '1' ? 'fast' : 'quality'}`)
const results = []

for (const { slug, brief } of briefs) {
  process.stdout.write(`[ship] ${slug} … `)
  try {
    const r = await generateShipHomepage(brief, { seed: `${RUN_ID}-${slug}` })
    const file = join(OUT_DIR, `${slug}.html`)
    writeFileSync(file, r.html)
    writeFileSync(
      join(OUT_DIR, `${slug}.plan.json`),
      JSON.stringify({ plan: r.plan, route: r.route, metrics: r.metrics, audits: r.audits }, null, 2),
    )
    results.push({
      slug,
      ok: true,
      file,
      ...r.metrics,
      readinessScore: r.audits.kimi.score,
      kimiIssues: r.audits.kimi.issues,
    })
    console.log(
      `${r.metrics.wall}ms · ${r.metrics.pageKind} · ${r.metrics.grammarId} · readiness=${r.audits.kimi.score} · ${r.metrics.chars}c`,
    )
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
    await pg.goto(`file://${r.file}`, { waitUntil: 'load' })
    await pg.screenshot({ path: r.file.replace(/\.html$/, '.png'), fullPage: true })
    await pg.close()
  }
  await b.close()
} catch {
  console.log('[ship] playwright not available — skipping screenshots')
}

writeFileSync(join(OUT_DIR, 'summary.json'), JSON.stringify(results, null, 2))
writeFileSync(join(OUT_DIR, 'results.json'), JSON.stringify(results, null, 2))
console.log(`[ship] done → ${OUT_DIR}`)
const galleryCmd =
  briefs.length < DEFAULT_8.length
    ? `bun playground-engine-ui-ship/scripts/ship-gallery-build.mjs --run=${RUN_ID} --skip-shots && bun .forge/ship-gallery/serve.mjs`
    : `bun playground-engine-ui-ship/scripts/ship-gallery-build.mjs --skip-shots && bun .forge/ship-gallery/serve.mjs`
console.log(`[ship] gallery: ${galleryCmd} → http://localhost:7420/`)
