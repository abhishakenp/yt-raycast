#!/usr/bin/env bun
/**
 * Multi-vertical forge benchmark.
 *
 * Runs the forge (split3 — 3 parallel Groq calls) on briefs spanning 8
 * site types (saas / ecommerce / restaurant / portfolio / agency /
 * fitness / wellness / hotel). Each brief flows through detectSiteType
 * + buildSiteTypeBlock so the model sees a type-specific section
 * prescription, brand anchors, aesthetic, and copy voice.
 *
 * Output: .forge/bench-diverse/<runId>/<slug>/{index.html, shot.png, meta.json}
 *
 * Usage:
 *   bun scripts/forge-bench-diverse.mjs              run all 8 briefs
 *   bun scripts/forge-bench-diverse.mjs saas restaurant   run just listed slugs
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync, statSync } from 'node:fs'
import { join, resolve, sep, normalize } from 'node:path'
import { createServer } from 'node:http'
import { forgeGenerateSplit3, buildVariantPrompt, detectSiteType, buildSiteTypeBlock } from './forge-lib.mjs'
import { renderAudit } from './forge-render-audit.mjs'
import { prefetchForgeMobbin, mobbinIterBlock } from './forge-mobbin.mjs'

const ROOT = process.cwd()
const RUN_ID = String(Date.now())
const BENCH_DIR = join(ROOT, '.forge', 'bench-diverse', RUN_ID)
mkdirSync(BENCH_DIR, { recursive: true })
const PORT = parseInt(process.env.BENCH_PORT || '9941', 10)

const DIVERSE_BRIEFS = [
  {
    slug: 'saas',
    brief:
      'Homepage for KubeMeter, an open-source Kubernetes cost-attribution platform that breaks down spend by pod, namespace, and team in real time. Self-hosted, alternative to Datadog Cost Management.',
  },
  {
    slug: 'restaurant-coffee',
    brief:
      'Homepage for Sumida, a single-origin coffee roaster in Tokyo. Subscriptions, retail bags, wholesale to cafes. Family-run since 1987. Curated Ethiopian and Colombian beans, slow-roasted in small batches.',
  },
  {
    slug: 'ecommerce-dtc',
    brief:
      'Homepage for Aerie Skincare, a plant-based DTC face oil line. Three products: Restore, Glow, Calm. Founded by herbalists. Subscribe and save, recyclable packaging, made in small batches in Vermont.',
  },
  {
    slug: 'portfolio',
    brief:
      'Personal portfolio for Maya Chen, a freelance brand designer working with early-stage startups and indie creators. Based in Brooklyn. Past clients include Linear, Vercel, and Pitch.',
  },
  {
    slug: 'agency',
    brief:
      'Homepage for Sutter Creative, a brand identity and digital design agency working with consumer startups. 12-person team in Portland. Clients include Olipop, Necessaire, Allbirds.',
  },
  {
    slug: 'fitness',
    brief:
      'Homepage for Vertex Fitness, a HIIT and strength training studio in Brooklyn. Class packs, monthly memberships, drop-in rates. Six trainers, three classes per day, signature workout: VTX45.',
  },
  {
    slug: 'wellness',
    brief:
      'Homepage for Halo Wellness, a meditation and sound bath studio in Los Angeles. 60-min and 90-min sessions, private and group, monthly membership available. Founded by certified meditation teachers.',
  },
  {
    slug: 'hotel',
    brief:
      'Homepage for Stoneholm, a 24-room boutique hotel on the Oregon coast. Cliffside cedar architecture, ocean-view rooms, on-site restaurant focused on Pacific Northwest cuisine. Spa, fire pits, hiking trails.',
  },
]

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const briefs = args.length
  ? DIVERSE_BRIEFS.filter((b) => args.includes(b.slug))
  : DIVERSE_BRIEFS

console.log(`[diverse] runId=${RUN_ID}  briefs=${briefs.length}  out=${BENCH_DIR}`)

// Static server for render audit
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
}
function startStaticServer(port) {
  return new Promise((resolveSrv, reject) => {
    const srv = createServer((req, res) => {
      try {
        const u = new URL(req.url || '/', 'http://127.0.0.1')
        let p = decodeURIComponent(u.pathname)
        if (p.endsWith('/')) p += 'index.html'
        const abs = resolve(join(ROOT, normalize(p).replace(/^\/+/, '')))
        if (!abs.startsWith(ROOT + sep) || !existsSync(abs) || !statSync(abs).isFile()) {
          res.writeHead(404)
          return res.end('404')
        }
        const ext = '.' + abs.split('.').pop().toLowerCase()
        res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
        res.end(readFileSync(abs))
      } catch (e) {
        res.writeHead(500)
        res.end(String(e?.message || e))
      }
    })
    srv.once('error', reject)
    srv.listen(port, '127.0.0.1', () => resolveSrv(srv))
  })
}

const srv = await startStaticServer(PORT)
const { chromium } = await import('playwright')
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

const results = []
try {
  for (const { slug, brief } of briefs) {
    const briefDir = join(BENCH_DIR, slug)
    mkdirSync(briefDir, { recursive: true })
    writeFileSync(join(briefDir, 'brief.txt'), brief, 'utf8')

    const detectedType = detectSiteType(brief)
    console.log(`\n[diverse] === ${slug} (detected: ${detectedType}) ===`)

    let mobbinBlock = ''
    try {
      const data = await prefetchForgeMobbin()
      mobbinBlock = mobbinIterBlock(data, 0)
    } catch {}
    const userPrompt = buildVariantPrompt(brief, 0, { includeReference: true, mobbinBlock })
    writeFileSync(join(briefDir, 'prompt.txt'), userPrompt, 'utf8')

    const t0 = Date.now()
    const result = await forgeGenerateSplit3({ prompt: userPrompt, temperature: 0.62 })
    const ms = Date.now() - t0
    const html = String(result?.content || '')
    writeFileSync(join(briefDir, 'index.html'), html, 'utf8')

    // Quick render + screenshot for visual review
    const page = await ctx.newPage()
    let render = { ok: false }
    try {
      const rel = briefDir.slice(ROOT.length + 1) + '/index.html'
      const url = `http://127.0.0.1:${PORT}/${rel}`
      render = await renderAudit({ url, shotPath: join(briefDir, 'shot.png'), page, siteType: detectedType })
    } catch (e) {
      render = { ok: false, issues: [`render failed: ${e?.message || e}`] }
    } finally {
      await page.close()
    }

    const meta = {
      slug,
      brief,
      detectedSiteType: detectedType,
      ms,
      htmlLen: html.length,
      msA: result.msA,
      msB: result.msB,
      msC: result.msC,
      partAChars: result.partAChars,
      partBChars: result.partBChars,
      partCChars: result.partCChars,
      render: {
        ok: render.ok,
        issues: render.issues,
        sectionCount: render.sectionHeights?.length,
      },
    }
    writeFileSync(join(briefDir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8')
    results.push(meta)
    console.log(`[diverse] ${slug}: ${ms}ms, ${html.length} chars (A:${result.partAChars} B:${result.partBChars} C:${result.partCChars}), render=${render.ok ? 'OK' : 'X'}`)
  }
} finally {
  await ctx.close().catch(() => {})
  await browser.close().catch(() => {})
  srv.close()
}

const summary = {
  runId: RUN_ID,
  n: results.length,
  byType: results.reduce((acc, r) => {
    acc[r.detectedSiteType] = (acc[r.detectedSiteType] || 0) + 1
    return acc
  }, {}),
  meanChars: Math.round(results.reduce((a, b) => a + b.htmlLen, 0) / Math.max(1, results.length)),
  meanMs: Math.round(results.reduce((a, b) => a + b.ms, 0) / Math.max(1, results.length)),
  results: results.map((r) => ({ slug: r.slug, type: r.detectedSiteType, chars: r.htmlLen, ms: r.ms, renderOk: r.render.ok })),
}
writeFileSync(join(BENCH_DIR, 'summary.json'), JSON.stringify(summary, null, 2), 'utf8')

console.log(`\n[diverse] === SUMMARY ===`)
console.log(`run: ${RUN_ID}`)
console.log(`mean chars: ${summary.meanChars}  mean ms: ${summary.meanMs}`)
for (const r of summary.results) {
  console.log(`  ${r.slug.padEnd(20)} type=${r.type.padEnd(12)} chars=${String(r.chars).padStart(6)} ms=${String(r.ms).padStart(5)} render=${r.renderOk ? 'OK' : 'X'}`)
}
console.log(`\nartifacts: ${BENCH_DIR}`)
