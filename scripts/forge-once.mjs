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
import { visionJudge } from './forge-vision.mjs'
import { validateLucideIcons, ensureLucideRegistry } from './forge-lucide-validate.mjs'
import { prefetchForgeMobbin, mobbinIterBlock, scoreMobbinCoverage } from './forge-mobbin.mjs'

function arg(name, def) {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : def
}
const positional = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const prompt = positional[0] || FORGE_DEFAULT_PROMPT
const effort = arg('--effort', 'low')
const maxTokens = parseInt(arg('--max', '10000'), 10)
const temperature = parseFloat(arg('--temp', '0.65'))
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
    mobbinBlock = mobbinIterBlock(mobbinData, 0)
    const total = Object.values(mobbinData?.byCategory || {}).reduce((n, arr) => n + (arr?.length || 0), 0)
    console.error(
      `[forge-once] mobbin: ${total} screens across {${(mobbinData?.categories || []).join(', ')}}${mobbinBlock ? '' : ' — empty, falling back to static reference only'}`,
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

const sc = scoreRalphHomepage(html, { prompt, refPath: '', minScore: 85, refTight: false, siteType: 'saas' })
const ver = passesHomepagePublicDesignVerification(html, prompt, '', 'saas')

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
    vision = await visionJudge(shotPath, 'B2B SaaS marketing homepage')
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
    reasons: vision.reasons,
  },
  mobbin: mobbinCoverage
    ? {
        hits: mobbinCoverage.hits,
        total: mobbinCoverage.total,
        ratio: Number(mobbinCoverage.ratio.toFixed(3)),
        hitNames: mobbinCoverage.hitNames,
      }
    : null,
  error: result.error,
}
writeFileSync(join(outDir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8')
console.log(JSON.stringify(meta, null, 2))
console.log(`out: ${outDir}`)
process.exit(meta.underBudget && sc.ok && ver.ok && lucide.ok && render.ok && (vision.score >= 75) ? 0 : 1)
