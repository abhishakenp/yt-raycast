#!/usr/bin/env bun
/**
 * Two-stage forge: Qwen3-32B planner → GPT-OSS-120B builder.
 *
 * Stage A: Qwen3-32B produces a strict JSON skeleton plan (~3-4s).
 * Stage B: GPT-OSS-120B via split3 expands the plan into dense HTML (~18s).
 *
 * Idea: give the heavy model a tighter, pre-decided plan so it spends its
 * reasoning budget on HTML quality, not on "what sections do I need / what
 * brands / what theme". A smaller model that's smart about verticals can
 * decide that structure cheaply; GPT-OSS gets a concrete, vertical-correct
 * plan up front and expands it.
 *
 * Status: viable quality mode. Default planner is Qwen 3-32B
 * (FORGE_SKELETON_MODEL=qwen/qwen3-32b).
 *
 * History (2026-05-19):
 *   - v1 tested Llama 3.1 8B as the planner (1.3s plan + 18s build = 19.5s
 *     total). Llama 8B was too weak — picked mockType="terminal" for a
 *     coffee shop (SaaS-default bleed). Human reviewer preferred
 *     single-shot variant-1 over this output.
 *   - v2 swapped to Qwen 3-32B (3.8s plan + 18s build = ~22s total).
 *     Qwen produced dramatically better plans: real Tokyo coffee houses
 *     (Tsukiji Coffee House, Shibuya Roasters, etc.), correct math
 *     (36 years from 1987), specific entities (third-gen roaster Akira
 *     Sumida, 217°C roast temp, bamboo cooling trays, Yamaguchi
 *     prefecture), evocative voice, no SaaS leaks. Human reviewer
 *     preferred this over the parallel Option 2 (few-shot exemplar
 *     approach, which regressed density 60% and copied entities
 *     verbatim).
 *
 * Known remaining gap:
 *   Stage B (GPT-OSS split3) sometimes drifts from the planner's palette
 *   spec — e.g. Qwen specified "warm terracotta + ochre + burnt umber",
 *   GPT-OSS rendered blue/purple. Future fix: inject the palette as an
 *   explicit HARD REQ in the stage B system prompt rather than relying on
 *   user-prompt scaffolding.
 *
 * When to use:
 *   - Quality mode for one-off marketing pages where +5s is acceptable.
 *   - When the brief is on a vertical the SITE_TYPE_PACK doesn't handle
 *     well (Qwen's plan covers the gap).
 *   - When you want predictability — Qwen's plan locks the structure, so
 *     repeated runs of the same brief produce similar shapes.
 *
 * When NOT to use:
 *   - Tight wall-clock budget (single-shot at 16s remains the speed king).
 *   - CI smoke tests where each second matters.
 *
 * Usage:
 *   bun scripts/forge-twostage.mjs ["brief"]      run with provided brief
 *   bun scripts/forge-twostage.mjs                use canon Sumida brief
 *
 *   # Revert to legacy Llama planner:
 *   FORGE_SKELETON_MODEL=llama-3.1-8b-instant bun scripts/forge-twostage.mjs
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

console.log(`\n[twostage] STAGE C (genome merge): ${result.mergeMs}ms  applied=${result.mergeApplied || 'none'}`)
console.log(`[twostage] STAGE D (critic):       ${result.critiqueMs}ms  issues=${(result.critiqueIssues || []).length}`)
console.log(`[twostage] STAGE E (repair):       ${result.repairMs}ms  backend=${result.repairBackend || 'n/a'}`)

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
