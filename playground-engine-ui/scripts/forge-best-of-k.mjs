#!/usr/bin/env bun
/**
 * ⚠ EXPERIMENTAL — KEPT FOR REFERENCE, NOT THE DEFAULT PATH ⚠
 *
 * Best-of-K forge generation with comparative vision-judge selection.
 *
 * What it does:
 *   Runs K parallel split3 generations at different temperatures, renders
 *   each, then asks the comparative vision judge (visionJudgeCompare in
 *   forge-vision.mjs — added alongside this script) to rank them and pick
 *   the winner.
 *
 * Why it's not the default:
 *   Tested on 2026-05-19 with the Sumida coffee brief. Generation works
 *   (K=2 → both variants in 21s, +10s vs single-shot's 16s). The
 *   comparative judge (llama-4-scout-17b) does discriminate — picked
 *   variant 2 (T=0.75) with concrete reasons ("stronger typography
 *   hierarchy / more deliberate art direction / better spacing rhythm").
 *
 *   But the human reviewer (Livio) preferred variant 1 (T=0.55) on
 *   aesthetic grounds — the judge's taste does NOT match the human's
 *   taste. So Best-of-K with this judge would add +10s of wall-clock to
 *   pick a worse output (by the human's lights).
 *
 *   Making Best-of-K useful requires either:
 *     (a) a stronger judge (Claude vision / GPT-5 vision) — but those
 *         break the speed budget (~6-8s + ~$0.01/call) AND would still
 *         need calibration to the human's preferences.
 *     (b) human-labeled training data + a tuned classifier — not in
 *         scope right now.
 *
 *   Conclusion: ship single-shot at 16s as the default. This script
 *   stays for future revisit when (a) or (b) becomes practical.
 *
 * Goal (original):
 *   Compound visual quality without speed cost. Wall-clock = max of K
 *   parallel generations + K parallel renders + 1 comparative judge call.
 *   Typical: ~20-25s vs current single-shot ~16s. Tradeoff: ~K× tokens.
 *
 * Usage:
 *   bun scripts/forge-best-of-k.mjs ["brief"]      run with default brief
 *   bun scripts/forge-best-of-k.mjs --k 5 "brief"  custom K
 *
 * Output: .forge/best-of-k/<runId>/ — variant-N.html + variant-N.png for
 * each, winner.html (copy of winning variant), verdict.json with the
 * judge's ranking + reasons.
 *
 * Related: visionJudgeCompare in scripts/forge-vision.mjs.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync, statSync, copyFileSync } from 'node:fs'
import { join, resolve, sep, normalize } from 'node:path'
import { createServer } from 'node:http'
import { forgeGenerateSplit3, buildVariantPrompt, FORGE_DEFAULT_PROMPT } from './forge-lib.mjs'
import { visionJudgeCompare } from './forge-vision.mjs'
import { prefetchForgeMobbin, mobbinIterBlock } from './forge-mobbin.mjs'

const ROOT = process.cwd()
const RUN_ID = String(Date.now())
const OUT_DIR = join(ROOT, '.forge', 'best-of-k', RUN_ID)
mkdirSync(OUT_DIR, { recursive: true })

function arg(name, def) {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : def
}
const K = parseInt(arg('--k', '3'), 10)
const PORT = parseInt(arg('--port', '9951'), 10)
const positional = process.argv.slice(2).filter((a, i, arr) => !a.startsWith('--') && arr[i - 1] !== '--k' && arr[i - 1] !== '--port')
const BRIEF =
  positional[0] ||
  'Homepage for KubeMeter, an open-source Kubernetes cost-attribution platform that breaks down spend by pod, namespace, and team in real time.'

// K=3 default uses temps spread across the variance band the forge typically
// runs (0.55-0.75). Larger K spreads further; minimum 0.45, max 0.85.
const TEMPS = (() => {
  if (K === 1) return [0.62]
  const lo = 0.55, hi = 0.75
  return Array.from({ length: K }, (_, i) => lo + (hi - lo) * (i / (K - 1)))
})()

console.log(`[bestK] runId=${RUN_ID}  K=${K}  temps=[${TEMPS.map((t) => t.toFixed(2)).join(', ')}]`)
console.log(`[bestK] brief: ${BRIEF.slice(0, 100)}…`)
console.log(`[bestK] out: ${OUT_DIR}`)

// Static server so render audit can resolve our HTML files via http://
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
}
function startStaticServer(port) {
  return new Promise((res, rej) => {
    const srv = createServer((req, response) => {
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
    srv.once('error', rej)
    srv.listen(port, '127.0.0.1', () => res(srv))
  })
}

// 1. Prefetch Mobbin once + build user prompt (shared across all K variants)
let mobbinBlock = ''
try {
  const data = await prefetchForgeMobbin()
  mobbinBlock = mobbinIterBlock(data, 0)
} catch {}
const userPrompt = buildVariantPrompt(BRIEF, 0, { includeReference: true, mobbinBlock })
writeFileSync(join(OUT_DIR, 'prompt.txt'), userPrompt, 'utf8')
writeFileSync(join(OUT_DIR, 'brief.txt'), BRIEF, 'utf8')

// 2. Fire K parallel split3 generations. Wall-clock = slowest of K.
const tGen0 = Date.now()
const variants = await Promise.all(
  TEMPS.map((temp) =>
    forgeGenerateSplit3({ prompt: userPrompt, temperature: temp })
      .then((r) => ({ ok: true, ms: Date.now() - tGen0, ...r, temperature: temp }))
      .catch((e) => ({ ok: false, error: String(e?.message || e), temperature: temp })),
  ),
)
const tGen = Date.now() - tGen0
console.log(`[bestK] gen: ${tGen}ms (K=${K} parallel)`)
for (let i = 0; i < variants.length; i++) {
  const v = variants[i]
  console.log(
    `  variant ${i + 1} (T=${v.temperature.toFixed(2)}): ${v.ok ? `${v.content?.length || 0} chars` : `FAIL: ${v.error}`}`,
  )
}

// 3. Persist each variant + render screenshot. Renders happen in parallel
//    via a shared Playwright browser; renders + judge add ~5-10s on top.
const srv = await startStaticServer(PORT)
const { chromium } = await import('playwright')
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

// Build positionally-indexed arrays (Promise.all + push races; assign by index).
// shotPaths holds the high-res PNG (for human review); thumbPaths holds a
// compressed JPEG (~500-800KB) for the multi-image vision-compare call
// — full PNGs blow past Groq's request size limit when 2+ are base64'd
// into one call.
const shotPaths = new Array(K).fill(null)
const thumbPaths = new Array(K).fill(null)
const variantPaths = new Array(K).fill(null)
try {
  const tShot0 = Date.now()
  await Promise.all(
    variants.map(async (v, i) => {
      const idx = i + 1
      const htmlPath = join(OUT_DIR, `variant-${idx}.html`)
      const pngPath = join(OUT_DIR, `variant-${idx}.png`)
      const thumbPath = join(OUT_DIR, `variant-${idx}-thumb.jpg`)
      if (!v.ok || !v.content) {
        writeFileSync(htmlPath, `<!-- variant ${idx} failed: ${v.error} -->`, 'utf8')
        variantPaths[i] = { idx, htmlPath, pngPath: null, thumbPath: null, ok: false }
        return
      }
      writeFileSync(htmlPath, v.content, 'utf8')
      const page = await ctx.newPage()
      try {
        const rel = htmlPath.slice(ROOT.length + 1)
        const url = `http://127.0.0.1:${PORT}/${rel}`
        await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 })
        await page.waitForTimeout(800)
        // Full-res PNG for human review.
        await page.screenshot({ path: pngPath, fullPage: true })
        // Compressed JPEG thumb for vision-compare (quality 55, fullPage).
        // ~500-800KB per variant — leaves comfortable headroom under Groq's
        // request-size limit for K up to 5.
        await page.screenshot({ path: thumbPath, type: 'jpeg', quality: 55, fullPage: true })
        shotPaths[i] = pngPath
        thumbPaths[i] = thumbPath
        variantPaths[i] = { idx, htmlPath, pngPath, thumbPath, ok: true }
      } catch (e) {
        variantPaths[i] = { idx, htmlPath, pngPath: null, thumbPath: null, ok: false, error: String(e?.message || e) }
      } finally {
        await page.close()
      }
    }),
  )
  console.log(`[bestK] render: ${Date.now() - tShot0}ms (${shotPaths.filter(Boolean).length}/${K} succeeded)`)
} finally {
  await ctx.close().catch(() => {})
  await browser.close().catch(() => {})
  srv.close()
}

// 4. Comparative judge — pick the winner. Skip if <2 variants rendered.
//    The judge sees only the VALID shots and returns valid-relative indices;
//    we map back to the original 0..K-1 index space so meta is consistent.
const validIndices = shotPaths.map((s, i) => (s ? i : -1)).filter((i) => i >= 0)
// Pass thumb JPEGs to the judge (not the full PNGs) so we stay under Groq's
// per-request size limit on the multi-image call.
const validShots = validIndices.map((i) => thumbPaths[i] || shotPaths[i])
let verdict
if (validShots.length < 2) {
  verdict = {
    winner: validIndices.length === 1 ? validIndices[0] : 0,
    ranking: validIndices,
    winnerReasons: ['too few valid variants to compare — fell back to first valid'],
    loserCritiques: [],
    ms: 0,
  }
} else {
  const tJ0 = Date.now()
  verdict = await visionJudgeCompare(validShots, BRIEF.slice(0, 200))
  console.log(`[bestK] judge: ${verdict.ms || Date.now() - tJ0}ms — valid-idx winner: ${verdict.winner}`)
  // Map valid-relative indices back to original 0..K-1 space.
  verdict.winner = validIndices[verdict.winner] ?? validIndices[0]
  verdict.ranking = (verdict.ranking || [])
    .map((r) => validIndices[r])
    .filter((i) => i !== undefined)
}

// 5. Copy winner to winner.html / winner.png for easy opening.
const win = variantPaths[verdict.winner]
if (win?.ok) {
  copyFileSync(win.htmlPath, join(OUT_DIR, 'winner.html'))
  if (win.pngPath) copyFileSync(win.pngPath, join(OUT_DIR, 'winner.png'))
}

const summary = {
  runId: RUN_ID,
  brief: BRIEF,
  k: K,
  temperatures: TEMPS,
  totalMs: Date.now() - tGen0,
  genMs: tGen,
  variants: variants.map((v, i) => ({
    idx: i + 1,
    temperature: v.temperature,
    ok: v.ok,
    htmlLen: v.content?.length || 0,
    ms: v.ms,
    error: v.error,
  })),
  verdict: {
    winner: verdict.winner + 1, // back to 1-indexed for human reading
    ranking: (verdict.ranking || []).map((i) => i + 1),
    winnerReasons: verdict.winnerReasons,
    loserCritiques: verdict.loserCritiques,
    judgeModel: verdict.model,
    judgeMs: verdict.ms,
    error: verdict.error,
  },
}
writeFileSync(join(OUT_DIR, 'verdict.json'), JSON.stringify(summary, null, 2), 'utf8')

console.log(`\n[bestK] === VERDICT ===`)
console.log(`winner: variant ${summary.verdict.winner} (T=${TEMPS[verdict.winner].toFixed(2)})`)
console.log(`ranking: ${summary.verdict.ranking.join(' > ')}`)
console.log(`reasons:`)
for (const r of summary.verdict.winnerReasons || []) console.log(`  + ${r}`)
console.log(`loser critiques:`)
for (const c of summary.verdict.loserCritiques || []) {
  console.log(`  variant ${c.variant + 1}:`)
  for (const i of c.issues || []) console.log(`    - ${i}`)
}
console.log(`\ntotal wall-clock: ${summary.totalMs}ms`)
console.log(`artifacts: ${OUT_DIR}`)
console.log(`winner: ${OUT_DIR}/winner.html`)
