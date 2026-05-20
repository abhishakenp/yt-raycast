#!/usr/bin/env bun
/**
 * Forge once: single homepage gen + render audit + vision judge + lucide validate.
 *
 * Usage:
 *   bun scripts/forge-once.mjs ["prompt"] [--effort low|medium|high] [--max 10000] [--temp 0.62]
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join, resolve, sep, normalize } from 'node:path'
import { createServer } from 'node:http'
import { readFileSync, statSync } from 'node:fs'
import {
  passesHomepagePublicDesignVerification,
  scoreRalphHomepage,
} from '@ship-fast/engine/pipeline/ralph-homepage-score.js'
import { forgeGenerate, FORGE_DEFAULT_PROMPT, buildVariantPrompt } from './forge-lib.mjs'
import { renderAudit } from './forge-render-audit.mjs'
import { visionJudge, composite11 } from './forge-vision.mjs'
import { validateLucideIcons, ensureLucideRegistry } from './forge-lucide-validate.mjs'
import {
  prefetchForgeMobbin,
  mobbinIterBlock,
  scoreMobbinCoverage,
  extractMobbinPalettes,
  fetchMobbinScreenImageB64,
  resolveDna,
  relaxAuroraAuditForAnchor,
  anchorAvoidsAurora,
  detectVerbatimAnchorCopy,
} from './forge-mobbin.mjs'
import { isAuroraAesthetic } from './forge-lib.mjs'

function arg(name, def) {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : def
}
const positional = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const prompt = positional[0] || FORGE_DEFAULT_PROMPT
const effort = arg('--effort', 'low')
const maxTokens = parseInt(arg('--max', '16000'), 10)
// Default T=0.55 — picked by the human reviewer (Livio) twice over higher-T
// variants (0.65, 0.75) on 2026-05-19. Lower T produces cleaner, less
// SaaS-templated output for non-SaaS verticals.
const temperature = parseFloat(arg('--temp', '0.55'))
const PORT = parseInt(arg('--port', '9907'), 10)
const outDir = arg('--out', join(process.cwd(), '.forge', 'once', String(Date.now())))

mkdirSync(outDir, { recursive: true })
const ROOT = process.cwd()

const USE_MOBBIN = process.env.FORGE_USE_MOBBIN === '1'
let mobbinBlock = ''
let mobbinData = null
if (USE_MOBBIN) {
  try {
    mobbinData = await prefetchForgeMobbin()
    // v4: sample palettes off the Mobbin Pro screenshots so the iter block
    // carries literal hex values. Disk-cached for 7 days, so this only pays
    // the Playwright launch cost on the first cold run per (category, pattern).
    // v8: skip the Chromium launch entirely when every ref already carries
    // a palette (e.g. fixture-loaded data via FORGE_MOBBIN_DATA_FILE) — saves
    // the launch cost AND lets the fixture path work on machines where the
    // Chromium system libs aren't installed.
    const allRefs = Object.values(mobbinData?.byCategory || {}).flat()
    const needsSampling = allRefs.some(
      (r) => r?.screenUrl && (!Array.isArray(r.palette) || !r.palette.length),
    )
    if (needsSampling) {
      try {
        const { chromium } = await import('playwright')
        const browser = await chromium.launch()
        try {
          await extractMobbinPalettes(mobbinData, browser)
        } finally {
          await browser.close()
        }
      } catch (e) {
        console.error(`[forge-once] mobbin palette extraction failed: ${e?.message || e}`)
      }
    }
    mobbinBlock = mobbinIterBlock(mobbinData, 0)
    const total = Object.values(mobbinData?.byCategory || {}).reduce((n, arr) => n + (arr?.length || 0), 0)
    const sampled = Object.values(mobbinData?.byCategory || {})
      .flat()
      .filter((r) => Array.isArray(r?.palette) && r.palette.length).length
    console.error(
      `[forge-once] mobbin: ${total} screens across {${(mobbinData?.categories || []).join(', ')}} — palettes sampled: ${sampled}${mobbinBlock ? '' : ' — empty, falling back to static reference only'}`,
    )
  } catch (e) {
    console.error(`[forge-once] mobbin prefetch failed: ${e?.message || e} — falling back`)
  }
}

const result = await forgeGenerate({
  prompt: buildVariantPrompt(prompt, 0, { includeReference: true, mobbinBlock }),
  reasoningEffort: effort,
  maxTokens,
  temperature,
})
const html = String(result?.content || '')
writeFileSync(join(outDir, 'index.html'), html, 'utf8')
writeFileSync(join(outDir, 'prompt.txt'), prompt, 'utf8')
if (mobbinBlock) writeFileSync(join(outDir, 'mobbin.txt'), mobbinBlock, 'utf8')
const mobbinCoverage = USE_MOBBIN && mobbinData ? scoreMobbinCoverage(html, mobbinData) : null
const verbatimDetection = USE_MOBBIN ? detectVerbatimAnchorCopy(html) : { count: 0, matches: [] }

const sc = scoreRalphHomepage(html, { prompt, refPath: '', minScore: 85, refTight: false, siteType: 'saas' })
let ver = passesHomepagePublicDesignVerification(html, prompt, '', 'saas')
// v6: relax aurora-tier audit rules when the design intent calls for
// non-aurora visuals. Either the featured anchor's avoid list flags aurora,
// or the iter-0 aesthetic isn't aurora-friendly (5 of 10 entries in
// AESTHETIC_NUDGES). Either way the aurora-tier rules are a quality
// regression for that iter.
let dnaForce = null
if (USE_MOBBIN && mobbinData) {
  const nonEmpty = (mobbinData.categories || []).filter((c) => mobbinData.byCategory[c]?.length)
  const cat = nonEmpty[0]
  const fr = cat ? mobbinData.byCategory[cat]?.[0] : null
  if (fr?.app) dnaForce = resolveDna(fr.app)
}
const nonAuroraIntent = !isAuroraAesthetic(0) || anchorAvoidsAurora(dnaForce)
ver = relaxAuroraAuditForAnchor(ver, nonAuroraIntent)

const registry = await ensureLucideRegistry()
const lucide = validateLucideIcons(html, registry)

// Static server for render audit
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png' }
const srv = await new Promise((res) => {
  const s = createServer((req, resp) => {
    try {
      const u = new URL(req.url, 'http://127.0.0.1')
      let p = decodeURIComponent(u.pathname)
      if (p.endsWith('/')) p += 'index.html'
      const abs = resolve(join(ROOT, normalize(p).replace(/^\/+/, '')))
      if (!abs.startsWith(ROOT + sep) || !existsSync(abs) || !statSync(abs).isFile()) {
        resp.writeHead(404); return resp.end('404')
      }
      const ext = '.' + abs.split('.').pop()
      resp.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
      resp.end(readFileSync(abs))
    } catch (e) { resp.writeHead(500); resp.end(String(e)) }
  })
  s.listen(PORT, '127.0.0.1', () => res(s))
})

let render = { ok: false, issues: ['render skipped'] }
let vision = { score: 0 }
const shotPath = join(outDir, 'shot.png')
try {
  const { chromium } = await import('playwright')
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  try {
    const url = `http://127.0.0.1:${PORT}/${outDir.slice(ROOT.length).replace(/^\/+/, '')}/index.html`
    render = await renderAudit({ url, shotPath, page, siteType: 'saas' })
  } finally {
    await page.close()
    await ctx.close()
    await browser.close()
  }
} catch (e) {
  render = { ok: false, issues: [String(e?.message || e)] }
} finally {
  srv.close()
}

if (existsSync(shotPath)) {
  try {
    // v5: pass the featured (iter-0) anchor's Mobbin Pro screen as a reference
    // image so the judge emits a mobbinFidelity score alongside the rubric.
    let reference = null
    if (mobbinData) {
      const nonEmpty = (mobbinData.categories || []).filter((c) => mobbinData.byCategory[c]?.length)
      const cat = nonEmpty[0]
      const fr = cat ? mobbinData.byCategory[cat]?.[0] : null
      if (fr?.screenUrl) {
        const img = await fetchMobbinScreenImageB64(fr.screenUrl, 512)
        if (img?.b64) {
          reference = {
            b64: img.b64,
            mimeType: img.mimeType,
            app: fr.app,
            palette: Array.isArray(fr.palette) ? fr.palette : [],
          }
        }
      }
    }
    vision = await visionJudge(shotPath, 'B2B SaaS marketing homepage', { reference })
  } catch (e) {
    vision = { score: 0, error: String(e?.message || e) }
  }
}

const meta = {
  model: result.model,
  ms: result.ms,
  underBudget: result.ms <= 15000,
  effort,
  maxTokens,
  temperature,
  inputTokens: result.inputTokens,
  outputTokens: result.outputTokens,
  htmlLen: html.length,
  score: sc.score,
  scoreOk: sc.ok,
  reasons: sc.reasons,
  verifyOk: ver.ok,
  verifyFeedback: ver.feedback,
  lucide: { ok: lucide.ok, unknown: lucide.unknown, totalUsed: lucide.totalUsed },
  render: { ok: render.ok, issues: render.issues, sectionCount: render.sectionHeights?.length, contrast: render.contrast },
  vision: {
    score: vision.score,
    hierarchy: vision.hierarchy,
    harmony: vision.harmony,
    spacing: vision.spacing,
    copy: vision.copy,
    artDirection: vision.artDirection,
    mobbinFidelity: Number.isFinite(vision.mobbinFidelity) ? vision.mobbinFidelity : null,
    composite11: composite11(vision.score, vision.mobbinFidelity),
    reasons: vision.reasons,
  },
  mobbin: mobbinCoverage
    ? {
        hits: mobbinCoverage.hits,
        total: mobbinCoverage.total,
        ratio: Number(mobbinCoverage.ratio.toFixed(3)),
        hitNames: mobbinCoverage.hitNames,
        palette: mobbinCoverage.palette
          ? {
              hits: mobbinCoverage.palette.hits,
              total: mobbinCoverage.palette.total,
              ratio: Number((mobbinCoverage.palette.ratio || 0).toFixed(3)),
              hexHits: mobbinCoverage.palette.hexHits,
            }
          : null,
        doctrine: mobbinCoverage.doctrine
          ? {
              hits: mobbinCoverage.doctrine.hits,
              total: mobbinCoverage.doctrine.total,
              ratio: Number((mobbinCoverage.doctrine.ratio || 0).toFixed(3)),
            }
          : null,
        verbatim: {
          count: verbatimDetection.count,
          matches: verbatimDetection.matches,
        },
      }
    : null,
  error: result.error,
}
writeFileSync(join(outDir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8')
console.log(JSON.stringify(meta, null, 2))
console.log(`out: ${outDir}`)
process.exit(meta.underBudget && sc.ok && ver.ok && lucide.ok && render.ok && (vision.score >= 75) ? 0 : 1)
