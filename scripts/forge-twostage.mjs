#!/usr/bin/env bun
/**
 * ⚠ EXPERIMENTAL — KEPT FOR REFERENCE, NOT THE DEFAULT PATH ⚠
 *
 * Two-stage forge demo.
 *
 * Stage A: Llama 3.1 8B produces a strict JSON skeleton plan (~1-2s).
 * Stage B: GPT-OSS-120B via split3 expands the plan into dense HTML (~18s).
 *
 * Original idea: give the heavy model a tighter, pre-decided plan so it
 * spends its reasoning budget on HTML quality, not on "what sections do
 * I need / what brands / what theme". Llama 8B is fast on Groq (~700
 * tok/s) so the planning overhead is cheap (~1-2s); GPT-OSS gets a
 * concrete, vertical-correct plan up front.
 *
 * Why it's not the default:
 *   Tested on 2026-05-19 with the Sumida coffee brief. Two-stage worked
 *   (19.5s total: 1.3s stage A + 18.3s stage B, 54K char HTML, cleanly
 *   restaurant-shaped sections, real coffee brand logos planned by
 *   Llama). But:
 *
 *   1. Llama 3.1 8B is too weak to fully reject the SaaS-default mock
 *      pattern — it picked mockType="terminal" for a coffee shop. The
 *      enum is supposed to include menu-card / product-card / etc. but
 *      Llama 8B defaulted to terminal anyway. GPT-OSS then rendered a
 *      terminal in the coffee hero (SaaS bleed).
 *
 *   2. Human reviewer (Livio) preferred single-shot variant-1 (T=0.55,
 *      16s) over this two-stage output. Side-by-side: single-shot had
 *      lower variance per-gen but landed cleaner aesthetics on this run;
 *      two-stage was more *predictable* (Llama plan locks the structure)
 *      but inherited Llama's blind spots without a clear quality win.
 *
 *   Single-shot at 16s stays as the production default. This script
 *   stays for future revisit when (a) the planner can use a stronger
 *   small model (Llama 4 Scout 17B? Groq compound?), or (b) we want
 *   predictability over peak quality (e.g. CI smoke tests).
 *
 * Usage:
 *   bun scripts/forge-twostage.mjs ["brief"]      run with provided brief
 *   bun scripts/forge-twostage.mjs                use canon Sumida brief
 *
 * Output: .forge/twostage/<runId>/{skeleton.json, index.html, shot.png}
 *
 * Related: forgeGenerateTwoStage in scripts/forge-lib.mjs.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync, statSync } from 'node:fs'
import { join, resolve, sep, normalize } from 'node:path'
import { createServer } from 'node:http'
import { forgeGenerateTwoStage } from './forge-lib.mjs'

const ROOT = process.cwd()
const RUN_ID = String(Date.now())
const OUT_DIR = join(ROOT, '.forge', 'twostage', RUN_ID)
mkdirSync(OUT_DIR, { recursive: true })

const positional = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const BRIEF =
  positional[0] ||
  'Homepage for Sumida, a single-origin coffee roaster in Tokyo. Subscriptions, retail bags, wholesale to cafes. Family-run since 1987.'

const PORT = 9961

console.log(`[twostage] runId=${RUN_ID}`)
console.log(`[twostage] brief: ${BRIEF.slice(0, 100)}…`)
console.log(`[twostage] out: ${OUT_DIR}`)

writeFileSync(join(OUT_DIR, 'brief.txt'), BRIEF, 'utf8')

const t0 = Date.now()
const result = await forgeGenerateTwoStage({ prompt: BRIEF, temperature: 0.55 })
const wall = Date.now() - t0

if (result.error) {
  console.error(`[twostage] FAILED: ${result.error}`)
  if (result.skeletonRaw) {
    writeFileSync(join(OUT_DIR, 'skeleton.raw.txt'), result.skeletonRaw, 'utf8')
  }
  process.exit(1)
}

writeFileSync(join(OUT_DIR, 'skeleton.json'), JSON.stringify(result.skeleton, null, 2), 'utf8')
writeFileSync(join(OUT_DIR, 'index.html'), result.content, 'utf8')

console.log(`\n[twostage] STAGE A (Llama 3.1 8B skeleton): ${result.stageAMs}ms`)
console.log(`  siteType: ${result.skeleton.siteType}`)
console.log(`  hero headline: ${result.skeleton.hero?.headline}`)
console.log(`  hero accent: ${result.skeleton.hero?.accentPhrase}`)
console.log(`  mockType: ${result.skeleton.hero?.mockType}`)
console.log(`  sections: ${(result.skeleton.sections || []).map((s) => s.kind).join(' → ')}`)
console.log(`  logoGrid: ${(result.skeleton.logoGrid || []).slice(0, 5).join(', ')}…`)
console.log(`  theme: ${result.skeleton.theme?.palette}`)
console.log(`  fonts: ${result.skeleton.theme?.fontDisplay} / ${result.skeleton.theme?.fontBody}`)

console.log(`\n[twostage] STAGE B (GPT-OSS-120B split3 HTML): ${result.stageBMs}ms`)
console.log(`  part chars: A=${result.partAChars}  B=${result.partBChars}  C=${result.partCChars}`)
console.log(`  html chars: ${result.content.length}`)

console.log(`\n[twostage] TOTAL wall: ${wall}ms`)
console.log(`[twostage] artifacts: ${OUT_DIR}`)
console.log(`[twostage] open: ${OUT_DIR}/index.html`)

// Render screenshot for visual review
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
}
const srv = await new Promise((res, rej) => {
  const s = createServer((req, response) => {
    try {
      const u = new URL(req.url || '/', 'http://127.0.0.1')
      let p = decodeURIComponent(u.pathname)
      if (p.endsWith('/')) p += 'index.html'
      const abs = resolve(join(ROOT, normalize(p).replace(/^\/+/, '')))
      if (!abs.startsWith(ROOT + sep) || !existsSync(abs) || !statSync(abs).isFile()) {
        response.writeHead(404)
        return response.end('404')
      }
      const ext = '.' + abs.split('.').pop().toLowerCase()
      response.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
      response.end(readFileSync(abs))
    } catch (e) {
      response.writeHead(500)
      response.end(String(e?.message || e))
    }
  })
  s.once('error', rej)
  s.listen(PORT, '127.0.0.1', () => res(s))
})

try {
  const { chromium } = await import('playwright')
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const rel = OUT_DIR.slice(ROOT.length + 1) + '/index.html'
  const url = `http://127.0.0.1:${PORT}/${rel}`
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 })
    await page.waitForTimeout(800)
    await page.screenshot({ path: join(OUT_DIR, 'shot.png'), fullPage: true })
    console.log(`[twostage] screenshot: ${OUT_DIR}/shot.png`)
  } finally {
    await page.close()
    await ctx.close()
    await browser.close()
  }
} catch (e) {
  console.error(`[twostage] screenshot failed: ${e?.message || e}`)
} finally {
  srv.close()
}
