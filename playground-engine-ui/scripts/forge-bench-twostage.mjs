#!/usr/bin/env bun
/**
 * Multi-vertical forge benchmark — TWO-STAGE variant.
 *
 * Runs the forge (Qwen3-32B planner → split3 builder + genome merge +
 * critic + repair) on briefs spanning 8 site types (saas / ecommerce /
 * restaurant / portfolio / agency / fitness / wellness / hotel). The
 * two-stage pipeline manages its own prompt: it injects an APPROVED
 * SKELETON above the standard SITE TYPE PACK / reference / mobbin /
 * rigor blocks via buildVariantPrompt internally.
 *
 * Gates (opt-in env vars):
 *   FORGE_USE_GENOME_MERGE=1  enable deterministic token rewrite
 *   FORGE_USE_CRITIC=1        enable heuristic critic + targeted repair
 *
 * Output: .forge/bench-twostage/<runId>/<slug>/{index.html, shot.png, meta.json}
 *
 * Usage:
 *   FORGE_USE_GENOME_MERGE=1 FORGE_USE_CRITIC=1 \
 *     bun scripts/forge-bench-twostage.mjs              run all 8 briefs
 *   bun scripts/forge-bench-twostage.mjs saas hotel     run just listed slugs
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync, statSync } from 'node:fs'
import { join, resolve, sep, normalize } from 'node:path'
import { createServer } from 'node:http'
import { forgeGenerateTwoStage, detectSiteType } from './forge-lib.mjs'
import { renderAudit } from './forge-render-audit.mjs'

const ROOT = process.cwd()
const RUN_ID = String(Date.now())
const BENCH_DIR = join(ROOT, '.forge', 'bench-twostage', RUN_ID)
mkdirSync(BENCH_DIR, { recursive: true })
const PORT = parseInt(process.env.BENCH_PORT || '9942', 10)

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

console.log(`[twostage] runId=${RUN_ID}  briefs=${briefs.length}  out=${BENCH_DIR}`)
console.log(`[twostage] gates: GENOME_MERGE=${process.env.FORGE_USE_GENOME_MERGE || '0'}  CRITIC=${process.env.FORGE_USE_CRITIC || '0'}`)

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
    console.log(`\n[twostage] === ${slug} (detected: ${detectedType}) ===`)

    const t0 = Date.now()
    let result
    let failed = false
    let failReason = null
    try {
      // Two-stage manages its own prompt internally — pass raw brief.
      // T=0.55 — human-preferred floor (see forge-once.mjs comment).
      result = await forgeGenerateTwoStage({ prompt: brief, temperature: 0.55 })
    } catch (e) {
      failed = true
      failReason = e?.message || String(e)
      result = { content: '' }
    }
    const ms = Date.now() - t0
    const html = String(result?.content || '')
    if (!html) {
      failed = true
      failReason = failReason || result?.error || 'empty html'
    }
    if (html) writeFileSync(join(briefDir, 'index.html'), html, 'utf8')

    // Quick render + screenshot for visual review
    const page = await ctx.newPage()
    let render = { ok: false }
    if (html) {
      try {
        const rel = briefDir.slice(ROOT.length + 1) + '/index.html'
        const url = `http://127.0.0.1:${PORT}/${rel}`
        render = await renderAudit({ url, shotPath: join(briefDir, 'shot.png'), page, siteType: detectedType })
      } catch (e) {
        render = { ok: false, issues: [`render failed: ${e?.message || e}`] }
      } finally {
        await page.close()
      }
    } else {
      await page.close()
      render = { ok: false, issues: ['no html generated'] }
    }

    const meta = {
      slug,
      brief,
      detectedSiteType: detectedType,
      ms,
      htmlLen: html.length,
      failed,
      failReason,
      // Two-stage pipeline timings + state
      stageAMs: result?.stageAMs,
      stageBMs: result?.stageBMs,
      mergeMs: result?.mergeMs,
      mergeApplied: result?.mergeApplied,
      critiqueMs: result?.critiqueMs,
      critiqueIssues: result?.critiqueIssues,
      repairMs: result?.repairMs,
      repairBackend: result?.repairBackend,
      // Skeleton (planner output) — high-signal for debugging genome picks
      skeleton: result?.skeleton,
      // Split3 sub-timings
      stageBMsA: result?.stageBMsA,
      stageBMsB: result?.stageBMsB,
      stageBMsC: result?.stageBMsC,
      partAChars: result?.partAChars,
      partBChars: result?.partBChars,
      partCChars: result?.partCChars,
      render: {
        ok: render.ok,
        issues: render.issues,
        sectionCount: render.sectionHeights?.length,
      },
    }
    writeFileSync(join(briefDir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8')
    results.push(meta)
    const genome = result?.mergeApplied || result?.skeleton?.genome || '-'
    const crit = Array.isArray(result?.critiqueIssues) ? result.critiqueIssues.length : 0
    console.log(
      `[twostage] ${slug}: ${ms}ms, ${html.length} chars  genome=${genome}  ` +
        `A=${result?.stageAMs}ms B=${result?.stageBMs}ms merge=${result?.mergeMs}ms ` +
        `crit=${result?.critiqueMs}ms(${crit}) repair=${result?.repairMs}ms` +
        `${result?.repairBackend ? `[${result.repairBackend}]` : ''}  ` +
        `render=${render.ok ? 'OK' : 'X'}${failed ? `  FAILED:${failReason}` : ''}`,
    )
  }
} finally {
  await ctx.close().catch(() => {})
  await browser.close().catch(() => {})
  srv.close()
}

const ok = results.filter((r) => !r.failed)
const summary = {
  runId: RUN_ID,
  n: results.length,
  okN: ok.length,
  byType: results.reduce((acc, r) => {
    acc[r.detectedSiteType] = (acc[r.detectedSiteType] || 0) + 1
    return acc
  }, {}),
  byGenome: results.reduce((acc, r) => {
    const g = r.mergeApplied || r.skeleton?.genome || '-'
    acc[g] = (acc[g] || 0) + 1
    return acc
  }, {}),
  meanChars: Math.round(ok.reduce((a, b) => a + b.htmlLen, 0) / Math.max(1, ok.length)),
  meanMs: Math.round(ok.reduce((a, b) => a + b.ms, 0) / Math.max(1, ok.length)),
  meanStageAMs: Math.round(ok.reduce((a, b) => a + (b.stageAMs || 0), 0) / Math.max(1, ok.length)),
  meanStageBMs: Math.round(ok.reduce((a, b) => a + (b.stageBMs || 0), 0) / Math.max(1, ok.length)),
  repairFiredN: results.filter((r) => (r.repairMs || 0) > 0).length,
  results: results.map((r) => ({
    slug: r.slug,
    type: r.detectedSiteType,
    chars: r.htmlLen,
    ms: r.ms,
    genome: r.mergeApplied || r.skeleton?.genome || '-',
    mergeMs: r.mergeMs,
    critN: Array.isArray(r.critiqueIssues) ? r.critiqueIssues.length : 0,
    repairMs: r.repairMs,
    renderOk: r.render.ok,
    failed: r.failed || false,
  })),
}
writeFileSync(join(BENCH_DIR, 'summary.json'), JSON.stringify(summary, null, 2), 'utf8')

console.log(`\n[twostage] === SUMMARY ===`)
console.log(`run: ${RUN_ID}  ok: ${summary.okN}/${summary.n}`)
console.log(`mean chars: ${summary.meanChars}  mean ms: ${summary.meanMs}  (A=${summary.meanStageAMs}ms B=${summary.meanStageBMs}ms)`)
console.log(`repair fired on ${summary.repairFiredN} / ${summary.n} slugs`)
console.log(`genome distribution: ${JSON.stringify(summary.byGenome)}`)
for (const r of summary.results) {
  console.log(
    `  ${r.slug.padEnd(20)} type=${String(r.type).padEnd(12)} genome=${String(r.genome).padEnd(18)} ` +
      `chars=${String(r.chars).padStart(6)} ms=${String(r.ms).padStart(5)} ` +
      `merge=${String(r.mergeMs).padStart(3)} crit=${String(r.critN).padStart(2)} repair=${String(r.repairMs).padStart(5)} ` +
      `render=${r.renderOk ? 'OK' : 'X'}${r.failed ? ' FAIL' : ''}`,
  )
}
console.log(`\nartifacts: ${BENCH_DIR}`)
