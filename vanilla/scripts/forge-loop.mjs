#!/usr/bin/env bun
/**
 * Forge Ralph loop: 50 iterations, GPT-OSS-120b, target <15s + max design quality.
 *
 * - Each iteration mutates temperature + a small "art-direction nudge" appended
 *   to the user prompt.
 * - Iterations that miss the time budget OR fail audit are recorded but flagged
 *   `kept:false`.
 * - Top-K candidates (lowest ms among score=100 + verify=ok) get an agent-browser
 *   screenshot at the end so you can pick the visual winner.
 *
 * Output:
 *   vanilla/.forge/loop/<runId>/iter-<NN>/{index.html, prompt.txt, meta.json, shot.png?}
 *   vanilla/.forge/loop/<runId>/leaderboard.json
 *   vanilla/.forge/loop/<runId>/best/index.html  (symlink-ish copy)
 *
 * Usage:
 *   bun vanilla/scripts/forge-loop.mjs
 *   FORGE_ITERS=50 FORGE_TIME_MS=15000 FORGE_TOPK=5 bun vanilla/scripts/forge-loop.mjs
 */
import { mkdirSync, writeFileSync, readFileSync, copyFileSync, existsSync, statSync } from 'node:fs'
import { join, resolve, sep, normalize } from 'node:path'
import { createServer } from 'node:http'
import {
  passesHomepagePublicDesignVerification,
  scoreRalphHomepage,
} from '@ship-fast/engine/pipeline/ralph-homepage-score.js'
import { forgeGenerate, FORGE_DEFAULT_PROMPT } from './forge-lib.mjs'

const ITERS = parseInt(process.env.FORGE_ITERS || '50', 10)
const TIME_BUDGET_MS = parseInt(process.env.FORGE_TIME_MS || '15000', 10)
const TOPK = parseInt(process.env.FORGE_TOPK || '5', 10)
const SHOT_PORT = parseInt(process.env.FORGE_PORT || '9889', 10)
const RUN_ID = String(Date.now())
const ROOT = process.cwd()
const RUN_DIR = join(ROOT, 'vanilla', '.forge', 'loop', RUN_ID)
mkdirSync(RUN_DIR, { recursive: true })

const BASE_PROMPT = process.env.FORGE_PROMPT || FORGE_DEFAULT_PROMPT

// Each nudge tilts art-direction without changing the structural contract.
// Mix ensures diversity across 50 iterations.
const NUDGES = [
  'Aesthetic: editorial luxury — Fraunces display, deep aubergine + champagne accents, oversize numerals as watermark.',
  'Aesthetic: brutalist tech — Cabinet Grotesk, electric lime accent on near-black, monospaced labels, hairline borders.',
  'Aesthetic: aurora midnight — DM Serif Display, violet/teal/amber blobs, pointer-reactive constellation canvas.',
  'Aesthetic: quiet museum minimal — Outfit display, parchment elev, single citrus accent, gallery-grid bento.',
  'Aesthetic: neon nightlife — Syne display, magenta + cyan glow, scanline-overlay canvas, glitch hover on CTAs.',
  'Aesthetic: organic wellness — Fraunces display, sage + clay palette, soft mesh blobs, generous whitespace.',
  'Aesthetic: festival maximalism — Syne display, layered confetti gradients, oversize emoji-free typographic poster hero.',
  'Aesthetic: tactile craft — DM Serif Display, paper-grain noise overlay, terracotta + ink accents, letterpress pricing card.',
  'Aesthetic: nordic SaaS — Outfit display, glacier blue + frost white on charcoal, sharp grid bento.',
  'Aesthetic: cyberpunk dossier — JetBrains Mono everywhere except hero (Cabinet Grotesk), CRT scan canvas, amber on inkblack.',
]

const TEMPS = [0.55, 0.6, 0.65, 0.7, 0.75]

function pick(arr, i) {
  return arr[i % arr.length]
}

function buildIterPrompt(i) {
  const nudge = pick(NUDGES, i)
  // Rotate keyword emphasis slightly so the model doesn't lock into one composition.
  const composition = i % 3 === 0
    ? 'Composition emphasis: split hero (text column + visual column), bento feature grid with unequal cells.'
    : i % 3 === 1
      ? 'Composition emphasis: centered oversized hero headline, asymmetric feature row, diagonal CTA band.'
      : 'Composition emphasis: editorial left-aligned hero with pull-quote, three-column feature divider with rule lines.'
  return `${BASE_PROMPT}\n\n${nudge}\n${composition}`
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
}

function startStaticServer(port) {
  return new Promise((resolveSrv) => {
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
    srv.listen(port, '127.0.0.1', () => resolveSrv(srv))
  })
}

function pad(n, w = 2) {
  return String(n).padStart(w, '0')
}

const leaderboard = []
const t0 = Date.now()

console.log(`[forge-loop] run ${RUN_ID} — ${ITERS} iters, budget ${TIME_BUDGET_MS}ms`)
console.log(`[forge-loop] out: ${RUN_DIR}`)

for (let i = 0; i < ITERS; i++) {
  const idx = pad(i + 1)
  const iterDir = join(RUN_DIR, `iter-${idx}`)
  mkdirSync(iterDir, { recursive: true })
  const prompt = buildIterPrompt(i)
  const temperature = pick(TEMPS, i)
  let result
  try {
    result = await forgeGenerate({
      prompt,
      temperature,
      reasoningEffort: 'low',
      maxTokens: 12000,
    })
  } catch (e) {
    result = { content: '', ms: 0, error: String(e?.message || e) }
  }
  const html = String(result?.content || '')
  writeFileSync(join(iterDir, 'index.html'), html, 'utf8')
  writeFileSync(join(iterDir, 'prompt.txt'), prompt, 'utf8')

  const sc = scoreRalphHomepage(html, {
    prompt,
    refPath: '',
    minScore: 85,
    refTight: false,
    siteType: 'saas',
  })
  const ver = passesHomepagePublicDesignVerification(html, prompt, '', 'saas')
  const underBudget = result.ms > 0 && result.ms <= TIME_BUDGET_MS
  const kept = underBudget && sc.ok && ver.ok
  const meta = {
    iter: i + 1,
    ms: result.ms,
    underBudget,
    temperature,
    score: sc.score,
    scoreOk: sc.ok,
    reasons: sc.reasons,
    verifyOk: ver.ok,
    verifyFeedback: ver.feedback,
    htmlLen: html.length,
    inputTokens: result.inputTokens || 0,
    outputTokens: result.outputTokens || 0,
    error: result.error || null,
    kept,
    nudge: NUDGES[i % NUDGES.length].slice(0, 60),
  }
  writeFileSync(join(iterDir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8')
  leaderboard.push({ ...meta, dir: iterDir })

  console.log(
    `iter ${idx}/${ITERS}  ms=${meta.ms.toString().padStart(5)}  score=${meta.score}  verify=${meta.verifyOk}  kept=${kept}  ${meta.error || ''}`,
  )
}

leaderboard.sort((a, b) => {
  // Kept-first, then highest score, then fastest.
  if (a.kept !== b.kept) return a.kept ? -1 : 1
  if (b.score !== a.score) return b.score - a.score
  return a.ms - b.ms
})

writeFileSync(join(RUN_DIR, 'leaderboard.json'), JSON.stringify(leaderboard, null, 2), 'utf8')

const top = leaderboard.filter((l) => l.kept).slice(0, TOPK)
console.log(`\n[forge-loop] kept=${leaderboard.filter((l) => l.kept).length}/${ITERS}  top=${top.length}`)

if (top.length > 0) {
  const bestDir = join(RUN_DIR, 'best')
  mkdirSync(bestDir, { recursive: true })
  copyFileSync(join(top[0].dir, 'index.html'), join(bestDir, 'index.html'))
  copyFileSync(join(top[0].dir, 'meta.json'), join(bestDir, 'meta.json'))
  console.log(`[forge-loop] best iter ${top[0].iter}  ms=${top[0].ms}  → ${bestDir}/index.html`)

  // Screenshot top-K via Playwright headless chromium
  if (process.env.FORGE_SKIP_SHOT !== '1') {
    const { chromium } = await import('playwright')
    const srv = await startStaticServer(SHOT_PORT)
    const browser = await chromium.launch()
    try {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
      for (const t of top) {
        const rel = t.dir.slice(ROOT.length).replace(/^\/+/, '')
        const url = `http://127.0.0.1:${SHOT_PORT}/${rel}/index.html`
        const shot = join(t.dir, 'shot.png')
        const page = await ctx.newPage()
        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 })
          await page.waitForTimeout(1500)
          await page.screenshot({ path: shot, fullPage: true })
          console.log(`  shot iter ${pad(t.iter)} → ${shot}`)
        } catch (e) {
          console.log(`  shot iter ${pad(t.iter)} FAIL: ${e?.message || e}`)
        } finally {
          await page.close()
        }
      }
      await ctx.close()
    } finally {
      await browser.close()
      srv.close()
    }
  }
}

const wall = ((Date.now() - t0) / 1000).toFixed(1)
console.log(`\n[forge-loop] done in ${wall}s — leaderboard: ${join(RUN_DIR, 'leaderboard.json')}`)
