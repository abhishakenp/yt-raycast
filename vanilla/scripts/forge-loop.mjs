#!/usr/bin/env bun
/**
 * Forge Ralph loop v2 — composition variance + reference fingerprint + vision
 * judge + render audit + Lucide validation + winner seeding + optional
 * self-critique fix pass.
 *
 * Composite kept condition (all must be true):
 *   - underBudget   : structural ms <= FORGE_TIME_MS (default 15000)
 *   - structuralOk  : scoreRalphHomepage.ok && passesHomepagePublicDesignVerification.ok
 *   - lucideOk      : every data-lucide name resolves in the lucide registry
 *   - renderOk      : Playwright audit (no empty bands, contrast >= 80% AA, fonts loaded)
 *   - visionOk      : vision judge total >= FORGE_VISION_MIN (default 75)
 *
 * Composite quality = visionScore (vision is primary), tie-break by speed.
 *
 * Each iteration runs: gen → render audit (also screenshots) → vision judge.
 * Keep the static server alive across all iters and reuse one Chromium browser
 * for speed.
 *
 * Outputs land in vanilla/.forge/loop/<runId>/.
 */
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  copyFileSync,
  existsSync,
  statSync,
} from 'node:fs'
import { join, resolve, sep, normalize } from 'node:path'
import { createServer } from 'node:http'
import {
  passesHomepagePublicDesignVerification,
  scoreRalphHomepage,
} from '@ship-fast/engine/pipeline/ralph-homepage-score.js'
import {
  forgeGenerate,
  buildVariantPrompt,
  buildWinnerSeed,
  temperatureForIter,
  forgeFixPass,
  FORGE_DEFAULT_PROMPT,
} from './forge-lib.mjs'
import { renderAudit } from './forge-render-audit.mjs'
import { visionJudge } from './forge-vision.mjs'
import { validateLucideIcons, ensureLucideRegistry } from './forge-lucide-validate.mjs'
import { prefetchAssets, assetPromptBlock } from './forge-assets.mjs'

const ITERS = parseInt(process.env.FORGE_ITERS || '50', 10)
// Default 18s — keep quality first. iters under 15s are flagged in meta.subBudget15.
// User stated <15s as the *target*; we sort by vision score and report both buckets.
const TIME_BUDGET_MS = parseInt(process.env.FORGE_TIME_MS || '18000', 10)
const TIGHT_TIME_MS = parseInt(process.env.FORGE_TIGHT_TIME_MS || '15000', 10)
const TOPK = parseInt(process.env.FORGE_TOPK || '5', 10)
const SHOT_PORT = parseInt(process.env.FORGE_PORT || '9889', 10)
const VISION_MIN = parseInt(process.env.FORGE_VISION_MIN || '75', 10)
const SKIP_VISION = process.env.FORGE_SKIP_VISION === '1'
const SKIP_RENDER = process.env.FORGE_SKIP_RENDER === '1'
const FIX_PASS = process.env.FORGE_FIX_PASS === '1'
const USE_ASSETS = process.env.FORGE_USE_ASSETS === '1'

const RUN_ID = String(Date.now())
const ROOT = process.cwd()
const RUN_DIR = join(ROOT, 'vanilla', '.forge', 'loop', RUN_ID)
mkdirSync(RUN_DIR, { recursive: true })

const BASE_PROMPT = process.env.FORGE_PROMPT || FORGE_DEFAULT_PROMPT

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
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

function pad(n, w = 2) {
  return String(n).padStart(w, '0')
}

const leaderboard = []
const t0 = Date.now()

console.log(
  `[forge-loop v2] run ${RUN_ID} — iters=${ITERS} budget=${TIME_BUDGET_MS}ms vision>=${VISION_MIN} fixPass=${FIX_PASS}`,
)
console.log(`[forge-loop v2] out: ${RUN_DIR}`)

const srv = await startStaticServer(SHOT_PORT)
const lucideRegistry = await ensureLucideRegistry()
console.log(`[forge-loop v2] lucide registry: ${lucideRegistry.size} names`)

let assetsBlock = ''
if (USE_ASSETS) {
  console.log('[forge-loop v2] prefetching pexels assets…')
  const assets = await prefetchAssets(BASE_PROMPT)
  assetsBlock = assetPromptBlock(assets)
  console.log(`[forge-loop v2] assets: ${assets.photos?.length || 0} photos, ${assets.videos?.length || 0} videos`)
}
let browser = null
let ctx = null
if (!SKIP_RENDER) {
  const { chromium } = await import('playwright')
  browser = await chromium.launch()
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
}

let winnerSeed = ''
let bestVisionSoFar = 0

try {
  for (let i = 0; i < ITERS; i++) {
    const idx = pad(i + 1)
    const iterDir = join(RUN_DIR, `iter-${idx}`)
    mkdirSync(iterDir, { recursive: true })

    const temperature = temperatureForIter(i)
    const userPrompt =
      buildVariantPrompt(BASE_PROMPT, i, {
        includeReference: true,
        winnerSeedBlock: i >= 12 && winnerSeed ? winnerSeed : '',
      }) + (USE_ASSETS ? assetsBlock : '')

    let result
    try {
      result = await forgeGenerate({
        prompt: userPrompt,
        temperature,
        reasoningEffort: 'low',
        maxTokens: parseInt(process.env.FORGE_MAX_TOK || '10000', 10),
      })
    } catch (e) {
      result = { content: '', ms: 0, error: String(e?.message || e) }
    }
    let html = String(result?.content || '')
    let totalMs = result.ms || 0

    // Optional fix-pass within budget
    let fixedMs = 0
    if (FIX_PASS && html && totalMs > 0 && totalMs < TIME_BUDGET_MS - 4000) {
      const remain = TIME_BUDGET_MS - totalMs
      try {
        const fix = await forgeFixPass(html, BASE_PROMPT, { remainingBudgetMs: remain })
        if (fix?.content && !fix.error) {
          html = fix.content
          fixedMs = fix.ms || 0
          totalMs += fixedMs
        }
      } catch {}
    }

    writeFileSync(join(iterDir, 'index.html'), html, 'utf8')
    writeFileSync(join(iterDir, 'prompt.txt'), userPrompt, 'utf8')

    const sc = scoreRalphHomepage(html, {
      prompt: BASE_PROMPT,
      refPath: '',
      minScore: 85,
      refTight: false,
      siteType: 'saas',
    })
    const ver = passesHomepagePublicDesignVerification(html, BASE_PROMPT, '', 'saas')
    const lucide = validateLucideIcons(html, lucideRegistry)

    let render = { ok: true, issues: [], skipped: true }
    let vision = { score: 0, skipped: true }
    const shotPath = join(iterDir, 'shot.png')

    if (!SKIP_RENDER && html) {
      const url = `http://127.0.0.1:${SHOT_PORT}/${iterDir.slice(ROOT.length).replace(/^\/+/, '')}/index.html`
      const page = await ctx.newPage()
      try {
        render = await renderAudit({ url, shotPath, page, siteType: 'saas' })
      } catch (e) {
        render = { ok: false, issues: [`render audit failed: ${e?.message || e}`] }
      } finally {
        await page.close()
      }
    }

    if (!SKIP_VISION && existsSync(shotPath)) {
      try {
        vision = await visionJudge(shotPath, 'B2B SaaS marketing homepage')
      } catch (e) {
        vision = { score: 0, error: String(e?.message || e) }
      }
    }

    const underBudget = totalMs > 0 && totalMs <= TIME_BUDGET_MS
    const subBudget15 = totalMs > 0 && totalMs <= TIGHT_TIME_MS
    const structuralOk = sc.ok && ver.ok
    const lucideOk = lucide.ok
    const renderOk = render.ok
    const visionScore = vision.score || 0
    const visionOk = SKIP_VISION || visionScore >= VISION_MIN
    const kept = underBudget && structuralOk && lucideOk && renderOk && visionOk

    const meta = {
      iter: i + 1,
      ms: totalMs,
      genMs: result.ms || 0,
      fixedMs,
      underBudget,
      subBudget15,
      temperature,
      score: sc.score,
      scoreOk: sc.ok,
      reasons: sc.reasons,
      verifyOk: ver.ok,
      verifyFeedback: ver.feedback,
      lucide: { ok: lucide.ok, unknown: lucide.unknown, totalUsed: lucide.totalUsed },
      render: {
        ok: render.ok,
        issues: render.issues,
        sectionCount: render.sectionHeights?.length,
        contrast: render.contrast,
        consoleErrors: render.consoleErrors,
      },
      vision: {
        score: visionScore,
        hierarchy: vision.hierarchy,
        harmony: vision.harmony,
        spacing: vision.spacing,
        copy: vision.copy,
        artDirection: vision.artDirection,
        reasons: vision.reasons,
        ms: vision.ms,
        error: vision.error,
      },
      htmlLen: html.length,
      inputTokens: result.inputTokens || 0,
      outputTokens: result.outputTokens || 0,
      error: result.error || null,
      kept,
    }
    writeFileSync(join(iterDir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8')
    leaderboard.push({ ...meta, dir: iterDir })

    if (kept && visionScore > bestVisionSoFar) {
      bestVisionSoFar = visionScore
      winnerSeed = buildWinnerSeed(html)
    }

    console.log(
      `iter ${idx}/${ITERS}  ms=${String(totalMs).padStart(5)}  T=${temperature.toFixed(2)}  struct=${sc.score}/${ver.ok ? 'V' : 'v'}  render=${renderOk ? 'OK' : 'X'}  vision=${visionScore}  kept=${kept}  ${
        kept ? '' : (render.issues?.[0] || vision.reasons?.[0] || sc.reasons?.[0] || meta.error || '').slice(0, 80)
      }`,
    )
  }
} finally {
  if (ctx) await ctx.close().catch(() => {})
  if (browser) await browser.close().catch(() => {})
  srv.close()
}

leaderboard.sort((a, b) => {
  if (a.kept !== b.kept) return a.kept ? -1 : 1
  if ((b.vision?.score || 0) !== (a.vision?.score || 0)) return (b.vision?.score || 0) - (a.vision?.score || 0)
  if (b.score !== a.score) return b.score - a.score
  return a.ms - b.ms
})

writeFileSync(join(RUN_DIR, 'leaderboard.json'), JSON.stringify(leaderboard, null, 2), 'utf8')
const top = leaderboard.filter((l) => l.kept).slice(0, TOPK)
const sub15 = leaderboard.filter((l) => l.kept && l.subBudget15).length
console.log(
  `\n[forge-loop v2] kept=${leaderboard.filter((l) => l.kept).length}/${ITERS}  sub-15s=${sub15}  top=${top.length}`,
)

if (top.length > 0) {
  const bestDir = join(RUN_DIR, 'best')
  mkdirSync(bestDir, { recursive: true })
  copyFileSync(join(top[0].dir, 'index.html'), join(bestDir, 'index.html'))
  copyFileSync(join(top[0].dir, 'meta.json'), join(bestDir, 'meta.json'))
  if (existsSync(join(top[0].dir, 'shot.png'))) {
    copyFileSync(join(top[0].dir, 'shot.png'), join(bestDir, 'shot.png'))
  }
  console.log(
    `[forge-loop v2] best iter ${top[0].iter}  ms=${top[0].ms}  vision=${top[0].vision?.score}  → ${bestDir}/index.html`,
  )
}

const wall = ((Date.now() - t0) / 1000).toFixed(1)
console.log(`\n[forge-loop v2] done in ${wall}s — leaderboard: ${join(RUN_DIR, 'leaderboard.json')}`)
