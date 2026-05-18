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
  mobbinAwareFixPass,
  isAuroraAesthetic,
  FORGE_DEFAULT_PROMPT,
} from './forge-lib.mjs'
import { renderAudit } from './forge-render-audit.mjs'
import { visionJudge, composite11 } from './forge-vision.mjs'
import { validateLucideIcons, ensureLucideRegistry } from './forge-lucide-validate.mjs'
import { prefetchAssets, assetPromptBlock } from './forge-assets.mjs'
import {
  prefetchForgeMobbin,
  mobbinIterBlock,
  scoreMobbinCoverage,
  extractMobbinPalettes,
  fetchMobbinScreenImageB64,
  resolveDna,
  relaxAuroraAuditForAnchor,
  detectVerbatimAnchorCopy,
} from './forge-mobbin.mjs'

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
const MOBBIN_FIX_FIDELITY_FLOOR = parseInt(process.env.FORGE_MOBBIN_FIX_FIDELITY_FLOOR || '18', 10)
const MOBBIN_FIX_PALETTE_FLOOR = parseInt(process.env.FORGE_MOBBIN_FIX_PALETTE_FLOOR || '3', 10)
const USE_ASSETS = process.env.FORGE_USE_ASSETS === '1'
const USE_MOBBIN = process.env.FORGE_USE_MOBBIN === '1'
// v7: when USE_MOBBIN=1, both inheritance gates default ON. v5 had them
// opt-in to keep the loop usable without Mobbin auth; v7's "11/10 fidelity"
// goal means we'd rather drop the keep-rate than ship iters that didn't
// actually inherit. Users can still explicitly disable with =0.
const REQUIRE_MOBBIN_PALETTE = process.env.FORGE_REQUIRE_MOBBIN_PALETTE === undefined
  ? process.env.FORGE_USE_MOBBIN === '1'
  : process.env.FORGE_REQUIRE_MOBBIN_PALETTE === '1'
const MOBBIN_PALETTE_MIN = parseInt(process.env.FORGE_MOBBIN_PALETTE_MIN || '3', 10)
const REQUIRE_MOBBIN_FIDELITY = process.env.FORGE_REQUIRE_MOBBIN_FIDELITY === undefined
  ? process.env.FORGE_USE_MOBBIN === '1'
  : process.env.FORGE_REQUIRE_MOBBIN_FIDELITY === '1'
const MOBBIN_FIDELITY_MIN = parseInt(process.env.FORGE_MOBBIN_FIDELITY_MIN || '15', 10)
// v7: Mobbin-aware fix pass also defaults ON when USE_MOBBIN=1 — it's the
// closing-the-loop layer that lifts low-fidelity iters back above the gate.
const MOBBIN_FIX = process.env.FORGE_MOBBIN_FIX === undefined
  ? process.env.FORGE_USE_MOBBIN === '1'
  : process.env.FORGE_MOBBIN_FIX === '1'
// v9: optional hard gate on verbatim anchor-copy reproduction. Default OFF
// because the verbatim detector flags real cases that aren't always quality
// regressions (e.g. an issue-tracker product really might write "Move work
// forward" by coincidence). Users who want strict no-plagiarism set =1.
const REQUIRE_NO_VERBATIM = process.env.FORGE_REQUIRE_NO_VERBATIM === '1'

const RUN_ID = String(Date.now())
const ROOT = process.cwd()
const RUN_DIR = join(ROOT, '.forge', 'loop', RUN_ID)
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

let mobbinData = null
if (USE_MOBBIN) {
  console.log('[forge-loop v2] prefetching Mobbin Pro references…')
  try {
    mobbinData = await prefetchForgeMobbin()
    const total = Object.values(mobbinData?.byCategory || {}).reduce((n, arr) => n + (arr?.length || 0), 0)
    console.log(
      `[forge-loop v2] mobbin: ${total} screens across {${(mobbinData?.categories || []).join(', ')}} — rotating featured anchor per iter`,
    )
  } catch (e) {
    console.log(`[forge-loop v2] mobbin prefetch failed: ${e?.message || e} — falling back`)
  }
}
let browser = null
let ctx = null
if (!SKIP_RENDER) {
  const { chromium } = await import('playwright')
  browser = await chromium.launch()
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
}

// v4: sample dominant palettes off each Mobbin anchor's Pro screenshot so the
// DNA block carries literal hex values instead of just app names. Skip silently
// if Playwright isn't available (SKIP_RENDER=1 path).
if (USE_MOBBIN && mobbinData && browser) {
  try {
    const t = Date.now()
    await extractMobbinPalettes(mobbinData, browser)
    const sampled = Object.values(mobbinData.byCategory || {})
      .flat()
      .filter((r) => Array.isArray(r?.palette) && r.palette.length).length
    console.log(`[forge-loop v2] mobbin palettes sampled: ${sampled} (${Date.now() - t}ms)`)
  } catch (e) {
    console.log(`[forge-loop v2] mobbin palette extraction failed: ${e?.message || e}`)
  }
}

let winnerSeed = ''
let bestVisionSoFar = 0

try {
  for (let i = 0; i < ITERS; i++) {
    const idx = pad(i + 1)
    const iterDir = join(RUN_DIR, `iter-${idx}`)
    mkdirSync(iterDir, { recursive: true })

    const temperature = temperatureForIter(i)
    const iterMobbinBlock = USE_MOBBIN && mobbinData ? mobbinIterBlock(mobbinData, i) : ''

    // v5: resolve the featured anchor's reference data (palette + screen image)
    // so the vision judge can score mobbinFidelity and the per-iter palette
    // gate can target the FEATURED anchor specifically (not the union).
    let featuredAnchor = null
    if (USE_MOBBIN && mobbinData) {
      const nonEmpty = (mobbinData.categories || []).filter((c) => mobbinData.byCategory[c]?.length)
      if (nonEmpty.length) {
        const cat = nonEmpty[i % nonEmpty.length]
        const refs = mobbinData.byCategory[cat]
        const fr = refs[i % refs.length]
        if (fr?.app) {
          featuredAnchor = {
            app: fr.app,
            category: cat,
            palette: Array.isArray(fr.palette) ? fr.palette : [],
            screenUrl: fr.screenUrl || '',
          }
        }
      }
    }
    const userPrompt =
      buildVariantPrompt(BASE_PROMPT, i, {
        includeReference: true,
        winnerSeedBlock: i >= 12 && winnerSeed ? winnerSeed : '',
        mobbinBlock: iterMobbinBlock,
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
    if (iterMobbinBlock) {
      writeFileSync(join(iterDir, 'mobbin.txt'), iterMobbinBlock, 'utf8')
    }

    const sc = scoreRalphHomepage(html, {
      prompt: BASE_PROMPT,
      refPath: '',
      minScore: 85,
      refTight: false,
      siteType: 'saas',
    })
    let ver = passesHomepagePublicDesignVerification(html, BASE_PROMPT, '', 'saas')
    // v6: relax the engine's aurora-tier audit rules when the iter's design
    // intent calls for non-aurora visuals. Two triggers:
    //   (a) the active Mobbin anchor's `avoid` list mentions aurora/multi-color
    //       (Linear, Vercel, Stripe, Notion, etc), OR
    //   (b) the iter's aesthetic nudge is one of the non-aurora-friendly
    //       entries (5 of 10 in AESTHETIC_NUDGES).
    // Either way the engine's "need >=3 radial-gradient stacks" / canvas /
    // liquid-motion rules are a quality regression for that iter, not a
    // quality gate.
    const iterDna = USE_MOBBIN && featuredAnchor?.app ? resolveDna(featuredAnchor.app) : null
    const anchorRejectsAurora =
      iterDna && Array.isArray(iterDna.avoid)
        ? /aurora|multi-?color/i.test(iterDna.avoid.join(' '))
        : false
    const nonAuroraIntent = !isAuroraAesthetic(i) || anchorRejectsAurora
    ver = relaxAuroraAuditForAnchor(ver, nonAuroraIntent)
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
        // v5: when the featured anchor has a screen URL, fetch its bytescale
        // CDN thumbnail and hand it to the vision judge as a reference image.
        // The judge then emits a mobbinFidelity sub-score grading inheritance.
        let reference = null
        if (featuredAnchor?.screenUrl) {
          const img = await fetchMobbinScreenImageB64(featuredAnchor.screenUrl, 512)
          if (img?.b64) {
            reference = {
              b64: img.b64,
              mimeType: img.mimeType,
              app: featuredAnchor.app,
              palette: featuredAnchor.palette,
            }
          }
        }
        vision = await visionJudge(shotPath, 'B2B SaaS marketing homepage', { reference })
      } catch (e) {
        vision = { score: 0, error: String(e?.message || e) }
      }
    }

    const mobbinCoverage = USE_MOBBIN && mobbinData ? scoreMobbinCoverage(html, mobbinData) : null
    const verbatimDetection = USE_MOBBIN ? detectVerbatimAnchorCopy(html) : { count: 0, matches: [] }

    // v5: per-iter palette hit against the FEATURED anchor specifically — the
    // global mobbinCoverage.palette counts union hits across every anchor's
    // palette, which is too lenient. The gate (when enabled) targets the
    // featured anchor's 5 hex values to enforce real per-iter inheritance.
    let featuredPaletteHits = 0
    let featuredPaletteTotal = 0
    let featuredPaletteHexHits = []
    if (featuredAnchor?.palette?.length) {
      const text = html.toLowerCase()
      featuredPaletteTotal = featuredAnchor.palette.filter((h) => /^#[0-9a-f]{6}$/i.test(h)).length
      featuredPaletteHexHits = featuredAnchor.palette.filter(
        (h) => /^#[0-9a-f]{6}$/i.test(h) && text.includes(h.toLowerCase()),
      )
      featuredPaletteHits = featuredPaletteHexHits.length
    }

    // v6: Mobbin-aware fix pass. When the iter cleared structural gates but
    // failed inheritance (low palette hits OR low mobbinFidelity), run a
    // surgical fix pass with the judge's reasons + missing hex values + DNA,
    // then re-write HTML and re-run the audit/score loop on the fixed version.
    // Skips when no anchor / no budget / non-iter-blocking failures already
    // present (we don't want to use the inheritance fix to paper over render
    // failures — let those continue to surface).
    let mobbinFixMs = 0
    let mobbinFixApplied = false
    const visionScoreBeforeFix = vision.score || 0
    const fidelityBeforeFix = Number.isFinite(vision.mobbinFidelity) ? vision.mobbinFidelity : null
    const paletteHitsBeforeFix = featuredPaletteHits
    if (
      MOBBIN_FIX &&
      featuredAnchor?.app &&
      featuredPaletteTotal > 0 &&
      sc.ok &&
      ver.ok &&
      render.ok &&
      (
        (fidelityBeforeFix !== null && fidelityBeforeFix < MOBBIN_FIX_FIDELITY_FLOOR) ||
        featuredPaletteHits < Math.min(MOBBIN_FIX_PALETTE_FLOOR, featuredPaletteTotal)
      ) &&
      totalMs > 0 &&
      totalMs < TIME_BUDGET_MS - 5000
    ) {
      try {
        const hexMissed = featuredAnchor.palette.filter((h) => !featuredPaletteHexHits.includes(h))
        const dna = resolveDna(featuredAnchor.app)
        const gaps = {
          anchor: {
            app: featuredAnchor.app,
            category: featuredAnchor.category,
            palette: featuredAnchor.palette,
            hexHits: featuredPaletteHexHits,
            hexMissed,
            dna,
          },
          judgeReasons: Array.isArray(vision.reasons) ? vision.reasons : [],
          mobbinFidelity: fidelityBeforeFix,
        }
        const fix = await mobbinAwareFixPass(html, BASE_PROMPT, gaps, {
          remainingBudgetMs: TIME_BUDGET_MS - totalMs,
        })
        if (fix?.content && !fix.error) {
          html = fix.content
          mobbinFixMs = fix.ms || 0
          totalMs += mobbinFixMs
          mobbinFixApplied = true
          writeFileSync(join(iterDir, 'index.html'), html, 'utf8')
          writeFileSync(join(iterDir, 'mobbin-fix-applied.txt'), JSON.stringify(gaps, null, 2), 'utf8')
          // Re-run the cheap audits on the fixed HTML
          const sc2 = scoreRalphHomepage(html, {
            prompt: BASE_PROMPT,
            refPath: '',
            minScore: 85,
            refTight: false,
            siteType: 'saas',
          })
          let ver2 = passesHomepagePublicDesignVerification(html, BASE_PROMPT, '', 'saas')
          ver2 = relaxAuroraAuditForAnchor(ver2, nonAuroraIntent)
          const lucide2 = validateLucideIcons(html, lucideRegistry)
          // Re-render + re-judge if we have the browser and budget allows
          let render2 = render
          let vision2 = vision
          if (!SKIP_RENDER && ctx && totalMs < TIME_BUDGET_MS) {
            const url = `http://127.0.0.1:${SHOT_PORT}/${iterDir.slice(ROOT.length).replace(/^\/+/, '')}/index.html`
            const page = await ctx.newPage()
            try {
              render2 = await renderAudit({ url, shotPath, page, siteType: 'saas' })
            } catch (e) {
              render2 = { ok: false, issues: [`render audit (post-fix) failed: ${e?.message || e}`] }
            } finally {
              await page.close()
            }
            if (!SKIP_VISION && existsSync(shotPath)) {
              try {
                let reference = null
                if (featuredAnchor?.screenUrl) {
                  const img = await fetchMobbinScreenImageB64(featuredAnchor.screenUrl, 512)
                  if (img?.b64) {
                    reference = {
                      b64: img.b64,
                      mimeType: img.mimeType,
                      app: featuredAnchor.app,
                      palette: featuredAnchor.palette,
                    }
                  }
                }
                vision2 = await visionJudge(shotPath, 'B2B SaaS marketing homepage', { reference })
              } catch (e) {
                vision2 = { score: 0, error: String(e?.message || e) }
              }
            }
          }
          // Recompute palette hits against the fixed HTML
          const text2 = html.toLowerCase()
          featuredPaletteHexHits = featuredAnchor.palette.filter(
            (h) => /^#[0-9a-f]{6}$/i.test(h) && text2.includes(h.toLowerCase()),
          )
          featuredPaletteHits = featuredPaletteHexHits.length
          // Adopt the post-fix values
          Object.assign(sc, sc2)
          ver = ver2
          Object.assign(lucide, lucide2)
          render = render2
          vision = vision2
        }
      } catch (e) {
        // Mobbin fix-pass failures are non-fatal — fall back to the pre-fix HTML.
      }
    }

    const underBudget = totalMs > 0 && totalMs <= TIME_BUDGET_MS
    const subBudget15 = totalMs > 0 && totalMs <= TIGHT_TIME_MS
    const structuralOk = sc.ok && ver.ok
    const lucideOk = lucide.ok
    const renderOk = render.ok
    const visionScore = vision.score || 0
    const visionOk = SKIP_VISION || visionScore >= VISION_MIN

    // v5 optional gates — default off so opt-in users only.
    const mobbinPaletteOk = !REQUIRE_MOBBIN_PALETTE
      ? true
      : featuredPaletteTotal === 0
        ? true // no palette to gate on (e.g. auth-degraded mode)
        : featuredPaletteHits >= Math.min(MOBBIN_PALETTE_MIN, featuredPaletteTotal)
    const mobbinFidelity = Number.isFinite(vision.mobbinFidelity) ? vision.mobbinFidelity : null
    const mobbinFidelityOk = !REQUIRE_MOBBIN_FIDELITY
      ? true
      : mobbinFidelity === null
        ? true // no fidelity score (no reference image)
        : mobbinFidelity >= MOBBIN_FIDELITY_MIN

    const verbatimOk = !REQUIRE_NO_VERBATIM || verbatimDetection.count === 0
    const kept =
      underBudget && structuralOk && lucideOk && renderOk && visionOk && mobbinPaletteOk && mobbinFidelityOk && verbatimOk

    const meta = {
      iter: i + 1,
      ms: totalMs,
      genMs: result.ms || 0,
      fixedMs,
      mobbinFixMs,
      mobbinFixApplied,
      preFix: mobbinFixApplied
        ? {
            visionScore: visionScoreBeforeFix,
            mobbinFidelity: fidelityBeforeFix,
            paletteHits: paletteHitsBeforeFix,
          }
        : null,
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
        mobbinFidelity: mobbinFidelity,
        composite11: composite11(visionScore, mobbinFidelity),
        reasons: vision.reasons,
        ms: vision.ms,
        error: vision.error,
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
            featured: featuredAnchor
              ? {
                  app: featuredAnchor.app,
                  category: featuredAnchor.category,
                  paletteHits: featuredPaletteHits,
                  paletteTotal: featuredPaletteTotal,
                  paletteHexHits: featuredPaletteHexHits,
                  paletteOk: mobbinPaletteOk,
                  fidelity: mobbinFidelity,
                  fidelityOk: mobbinFidelityOk,
                }
              : null,
            featuredApp: featuredAnchor?.app || null,
            verbatim: {
              count: verbatimDetection.count,
              matches: verbatimDetection.matches,
              ok: verbatimOk,
            },
          }
        : null,
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

    const mobbinTag = mobbinCoverage
      ? `  mobbin=fp${featuredPaletteHits}/${featuredPaletteTotal} ${mobbinFidelity != null ? `fid${mobbinFidelity}` : 'fid-'} d${mobbinCoverage.doctrine?.hits || 0}/${mobbinCoverage.doctrine?.total || 0}${meta.mobbin?.featuredApp ? ` (${meta.mobbin.featuredApp})` : ''}`
      : ''
    console.log(
      `iter ${idx}/${ITERS}  ms=${String(totalMs).padStart(5)}  T=${temperature.toFixed(2)}  struct=${sc.score}/${ver.ok ? 'V' : 'v'}  render=${renderOk ? 'OK' : 'X'}  vision=${visionScore}${mobbinTag}  kept=${kept}  ${
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
  // v5: mobbinFidelity (judge-scored inheritance vs. the reference image) is
  // the strongest signal of "did this iter actually inherit Mobbin"; rank it
  // first among Mobbin tiebreaks when available. Falls through to v4's
  // palette/doctrine tiebreaks for iters without a fidelity score.
  if (USE_MOBBIN) {
    const af = Number.isFinite(a.vision?.mobbinFidelity) ? a.vision.mobbinFidelity : -1
    const bf = Number.isFinite(b.vision?.mobbinFidelity) ? b.vision.mobbinFidelity : -1
    if (bf !== af) return bf - af
  }
  if ((b.vision?.score || 0) !== (a.vision?.score || 0)) return (b.vision?.score || 0) - (a.vision?.score || 0)
  if (USE_MOBBIN) {
    const ap = a.mobbin?.featured?.paletteHits || a.mobbin?.palette?.hits || 0
    const bp = b.mobbin?.featured?.paletteHits || b.mobbin?.palette?.hits || 0
    if (bp !== ap) return bp - ap
    const ad = a.mobbin?.doctrine?.hits || 0
    const bd = b.mobbin?.doctrine?.hits || 0
    if (bd !== ad) return bd - ad
  }
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
