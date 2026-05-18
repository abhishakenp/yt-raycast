#!/usr/bin/env bun
/**
 * Forge-vs-Kimi-K2.5 benchmark harness.
 *
 * Runs N briefs through BOTH the local forge (Groq + GPT-OSS-120b via
 * forgeGenerate) AND Kimi K2.5 (via Cursor's ACP CLI), screenshots both
 * outputs, vision-judges both, emits a comparison table.
 *
 * Why this exists: every later optimization is shooting in the dark
 * without a numerical gap measurement. This harness produces the gap
 * so subsequent iterations can verify they close it.
 *
 * Usage:
 *   bun scripts/forge-bench-kimi.mjs              run the canon brief set
 *   bun scripts/forge-bench-kimi.mjs "your brief" run a single ad-hoc brief
 *
 * Output: .forge/bench/<runId>/ — contains, per brief:
 *   forge.html, forge.png, forge.meta.json
 *   kimi.html,  kimi.png,  kimi.meta.json
 *   comparison.json — vision scores side-by-side + diff
 *
 * Notes:
 *   - Kimi via cursor-agent is agentic and ~2min per brief. Forge is ~25s.
 *     A 3-brief bench takes ~7 min wall-clock total.
 *   - cursor-agent writes HTML to the workspace by default; we redirect via
 *     a sentinel prompt + grep/move to bench dir.
 *   - Both outputs run through the SAME render audit + vision judge for
 *     apples-to-apples scoring.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync, unlinkSync, renameSync } from 'node:fs'
import { join, basename } from 'node:path'
import { execFile, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import { createServer } from 'node:http'
import { resolve, sep, normalize } from 'node:path'
import { statSync } from 'node:fs'
import { forgeGenerate, buildVariantPrompt, FORGE_DEFAULT_PROMPT } from './forge-lib.mjs'
import { renderAudit } from './forge-render-audit.mjs'
import { visionJudge } from './forge-vision.mjs'
import { prefetchForgeMobbin, mobbinIterBlock } from './forge-mobbin.mjs'

const execFileAsync = promisify(execFile)
const ROOT = process.cwd()
const RUN_ID = String(Date.now())
const BENCH_DIR = join(ROOT, '.forge', 'bench', RUN_ID)
mkdirSync(BENCH_DIR, { recursive: true })

const PORT = parseInt(process.env.BENCH_PORT || '9931', 10)

const CANON_BRIEFS = [
  {
    slug: 'nimbus',
    brief:
      'Homepage for Nimbus, a serverless Postgres-as-a-service with database branching, 1-second cold starts, and pay-per-query pricing. Built for developers who outgrew Supabase. Open-source core, hosted enterprise tier.',
  },
  {
    slug: 'cipherwave',
    brief:
      'Homepage for Cipherwave, a B2B fintech compliance platform that auto-collects SOC 2 and HIPAA evidence from cloud infrastructure (AWS, GCP, Azure). Built for fast-moving startups who need audit-ready in 30 days, not 6 months.',
  },
  {
    slug: 'orbital',
    brief:
      'Homepage for Orbital, an AI agent platform for customer support that resolves L1 tickets autonomously with human handoff for escalations. Connects to Zendesk, Intercom, Salesforce. Used by Shopify merchants and B2B SaaS teams.',
  },
]

const REUSE_KIMI_FROM = (() => {
  const i = process.argv.indexOf('--reuse-kimi-from')
  return i > 0 ? process.argv[i + 1] : null
})()
const SKIP_KIMI = process.argv.includes('--skip-kimi')

const briefs = (() => {
  const positional = process.argv.slice(2).filter((a) => !a.startsWith('--') && a !== REUSE_KIMI_FROM)
  return positional.length ? [{ slug: 'adhoc', brief: positional.join(' ') }] : CANON_BRIEFS
})()

console.log(`[bench] runId=${RUN_ID}  briefs=${briefs.length}  out=${BENCH_DIR}`)

// Shared static server so render audit can navigate file:// → http://
// (Playwright handles file:// but the static server matches forge-once
// semantics exactly — what we measure must equal what we ship.)
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

/**
 * Forge path: same as forge-once but inlined. Uses snapshot Mobbin
 * (auto-detected, no auth) so the comparison reflects the current
 * recommended config.
 */
async function generateWithForge(brief, briefDir) {
  const t0 = Date.now()
  let mobbinBlock = ''
  try {
    const data = await prefetchForgeMobbin()
    mobbinBlock = mobbinIterBlock(data, 0)
  } catch {}
  const userPrompt = buildVariantPrompt(brief, 0, { includeReference: true, mobbinBlock })
  const result = await forgeGenerate({
    prompt: userPrompt,
    reasoningEffort: 'low',
    maxTokens: 20000,
    temperature: 0.62,
  })
  const html = String(result?.content || '')
  writeFileSync(join(briefDir, 'forge.html'), html, 'utf8')
  writeFileSync(join(briefDir, 'forge.prompt.txt'), userPrompt, 'utf8')
  return { html, ms: Date.now() - t0, model: result.model, outputTokens: result.outputTokens }
}

/**
 * Kimi path: invoke cursor-agent --print --model kimi-k2.5 with a brief
 * that instructs it to write the HTML to a specific path. We then move
 * the file into the bench dir. Cursor's agent is autonomous and creates
 * files in the workspace; the sentinel filename pattern lets us claim
 * the output deterministically.
 */
async function generateWithKimi(brief, briefDir, slug) {
  const t0 = Date.now()
  // The cursor-agent operates from the project root. We pass a prompt
  // telling it the exact filename to write so we can claim it after.
  const sentinelName = `bench-kimi-${slug}-${RUN_ID}.html`
  const sentinelPath = join(ROOT, sentinelName)
  const prompt = `Generate a complete self-contained HTML marketing homepage and write it to "${sentinelName}" in the current directory.

Brief: ${brief}

HARD requirements:
- Start with <!DOCTYPE html>
- Use Tailwind via cdn.tailwindcss.com
- Use Lucide icons via unpkg.com/lucide@latest
- Include hero with at least 3 radial-gradient absolutely-positioned blur orbs
- 7+ sections: hero, features, social proof with named real companies, pricing with concrete numbers, FAQ, CTA, footer
- Verb-led hero headline ≤8 words
- Concrete pricing tiers (numbers, not "Contact Sales" placeholders)
- Name 3+ recognizable companies in social proof
- ≥12,000 characters of HTML content total

After writing the file, respond with ONLY: "WROTE ${sentinelName}" and stop.`

  // cursor-agent runs as an interactive process even with --print. We use
  // spawn so we can timeout cleanly. ~2-3 min typical.
  await new Promise((resolveProc, rejectProc) => {
    const proc = spawn(
      'cursor-agent',
      ['--print', '--model', 'kimi-k2.5', '--output-format', 'text', '--trust', prompt],
      { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] },
    )
    const chunks = []
    proc.stdout.on('data', (d) => chunks.push(d))
    proc.stderr.on('data', () => {})
    const timeout = setTimeout(() => {
      proc.kill('SIGTERM')
      rejectProc(new Error('kimi timeout after 300s'))
    }, 300000)
    proc.on('exit', (code) => {
      clearTimeout(timeout)
      if (code !== 0) rejectProc(new Error(`cursor-agent exited ${code}`))
      else resolveProc(Buffer.concat(chunks).toString('utf8'))
    })
  })

  if (!existsSync(sentinelPath)) {
    throw new Error(`Kimi did not write expected file: ${sentinelPath}`)
  }
  const html = readFileSync(sentinelPath, 'utf8')
  writeFileSync(join(briefDir, 'kimi.html'), html, 'utf8')
  writeFileSync(join(briefDir, 'kimi.prompt.txt'), prompt, 'utf8')
  // Clean the sentinel file from the repo root so it doesn't pollute git status.
  unlinkSync(sentinelPath)
  return { html, ms: Date.now() - t0, model: 'kimi-k2.5' }
}

async function shootAndJudge(htmlPath, shotPath, page, label, vertical) {
  // htmlPath is relative to ROOT for the static server.
  const url = `http://127.0.0.1:${PORT}/${htmlPath}`
  let render = { ok: false, issues: [] }
  let vision = { score: 0 }
  try {
    render = await renderAudit({ url, shotPath, page, siteType: 'saas' })
  } catch (e) {
    render = { ok: false, issues: [`render: ${String(e?.message || e)}`] }
  }
  if (existsSync(shotPath)) {
    try {
      vision = await visionJudge(shotPath, `${vertical} marketing homepage`)
    } catch (e) {
      vision = { score: 0, error: String(e?.message || e) }
    }
  }
  return { label, render, vision }
}

// Main bench loop
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

    console.log(`\n[bench] === ${slug} ===`)
    console.log(`[bench] brief: ${brief.slice(0, 90)}…`)

    // Forge first (fast) so user sees progress
    console.log(`[bench] forge generating…`)
    let forgeRes
    try {
      forgeRes = await generateWithForge(brief, briefDir)
      console.log(`[bench] forge: ${forgeRes.ms}ms, ${forgeRes.html.length} chars`)
    } catch (e) {
      console.log(`[bench] forge FAILED: ${e?.message || e}`)
      forgeRes = { html: '', ms: 0, error: String(e?.message || e) }
    }

    // Kimi (slow). May skip entirely or reuse from a prior bench run to
    // avoid re-paying the 2-min/brief cost when iterating on the forge side.
    let kimiRes
    if (SKIP_KIMI) {
      console.log(`[bench] kimi skipped (--skip-kimi)`)
      kimiRes = { html: '', ms: 0, error: 'skipped' }
    } else if (REUSE_KIMI_FROM) {
      const priorPath = join(ROOT, '.forge', 'bench', REUSE_KIMI_FROM, slug, 'kimi.html')
      const priorShot = join(ROOT, '.forge', 'bench', REUSE_KIMI_FROM, slug, 'kimi.png')
      if (existsSync(priorPath)) {
        const html = readFileSync(priorPath, 'utf8')
        writeFileSync(join(briefDir, 'kimi.html'), html, 'utf8')
        if (existsSync(priorShot)) {
          renameSync(priorShot, join(briefDir, 'kimi.png'))
          // Copy back so the original run is preserved.
          writeFileSync(priorShot, readFileSync(join(briefDir, 'kimi.png')))
        }
        kimiRes = { html, ms: 0, model: 'kimi-k2.5 (reused)' }
        console.log(`[bench] kimi reused from ${REUSE_KIMI_FROM}: ${html.length} chars`)
      } else {
        console.log(`[bench] kimi reuse FAILED (missing ${priorPath}) — generating fresh`)
        try {
          kimiRes = await generateWithKimi(brief, briefDir, slug)
          console.log(`[bench] kimi: ${kimiRes.ms}ms, ${kimiRes.html.length} chars`)
        } catch (e) {
          console.log(`[bench] kimi FAILED: ${e?.message || e}`)
          kimiRes = { html: '', ms: 0, error: String(e?.message || e) }
        }
      }
    } else {
      console.log(`[bench] kimi generating (this takes ~2min)…`)
      try {
        kimiRes = await generateWithKimi(brief, briefDir, slug)
        console.log(`[bench] kimi: ${kimiRes.ms}ms, ${kimiRes.html.length} chars`)
      } catch (e) {
        console.log(`[bench] kimi FAILED: ${e?.message || e}`)
        kimiRes = { html: '', ms: 0, error: String(e?.message || e) }
      }
    }

    // Screenshot + judge both
    const forgePath = join(briefDir, 'forge.html')
    const kimiPath = join(briefDir, 'kimi.html')
    const forgeRel = forgePath.slice(ROOT.length + 1)
    const kimiRel = kimiPath.slice(ROOT.length + 1)

    const page = await ctx.newPage()
    let forgeJudge, kimiJudge
    try {
      if (forgeRes.html) {
        forgeJudge = await shootAndJudge(forgeRel, join(briefDir, 'forge.png'), page, 'forge', slug)
        console.log(`[bench] forge vision=${forgeJudge.vision.score} render=${forgeJudge.render.ok ? 'OK' : 'X'}`)
      }
      if (kimiRes.html) {
        kimiJudge = await shootAndJudge(kimiRel, join(briefDir, 'kimi.png'), page, 'kimi', slug)
        console.log(`[bench] kimi  vision=${kimiJudge.vision.score} render=${kimiJudge.render.ok ? 'OK' : 'X'}`)
      }
    } finally {
      await page.close()
    }

    const cmp = {
      slug,
      brief,
      forge: {
        ms: forgeRes.ms,
        htmlLen: forgeRes.html?.length || 0,
        model: forgeRes.model,
        outputTokens: forgeRes.outputTokens,
        error: forgeRes.error,
        vision: forgeJudge?.vision,
        render: forgeJudge?.render
          ? {
              ok: forgeJudge.render.ok,
              sectionCount: forgeJudge.render.sectionHeights?.length,
              contrast: forgeJudge.render.contrast,
            }
          : null,
      },
      kimi: {
        ms: kimiRes.ms,
        htmlLen: kimiRes.html?.length || 0,
        model: kimiRes.model,
        error: kimiRes.error,
        vision: kimiJudge?.vision,
        render: kimiJudge?.render
          ? {
              ok: kimiJudge.render.ok,
              sectionCount: kimiJudge.render.sectionHeights?.length,
              contrast: kimiJudge.render.contrast,
            }
          : null,
      },
      delta: {
        vision: (kimiJudge?.vision?.score || 0) - (forgeJudge?.vision?.score || 0),
        msKimiMinusForge: (kimiRes.ms || 0) - (forgeRes.ms || 0),
      },
    }
    writeFileSync(join(briefDir, 'comparison.json'), JSON.stringify(cmp, null, 2), 'utf8')
    results.push(cmp)
  }
} finally {
  await ctx.close().catch(() => {})
  await browser.close().catch(() => {})
  srv.close()
}

const summary = {
  runId: RUN_ID,
  n: results.length,
  meanForgeVision:
    results.reduce((s, r) => s + (r.forge?.vision?.score || 0), 0) / Math.max(1, results.length),
  meanKimiVision:
    results.reduce((s, r) => s + (r.kimi?.vision?.score || 0), 0) / Math.max(1, results.length),
  meanForgeMs:
    results.reduce((s, r) => s + (r.forge?.ms || 0), 0) / Math.max(1, results.length),
  meanKimiMs: results.reduce((s, r) => s + (r.kimi?.ms || 0), 0) / Math.max(1, results.length),
  perBrief: results.map((r) => ({
    slug: r.slug,
    forge: r.forge?.vision?.score,
    kimi: r.kimi?.vision?.score,
    delta: r.delta?.vision,
  })),
}
writeFileSync(join(BENCH_DIR, 'summary.json'), JSON.stringify(summary, null, 2), 'utf8')

console.log(`\n[bench] === SUMMARY ===`)
console.log(`run: ${RUN_ID}`)
console.log(`mean vision  forge=${summary.meanForgeVision.toFixed(1)}  kimi=${summary.meanKimiVision.toFixed(1)}  gap=${(summary.meanKimiVision - summary.meanForgeVision).toFixed(1)}`)
console.log(`mean gen ms  forge=${Math.round(summary.meanForgeMs)}     kimi=${Math.round(summary.meanKimiMs)}    kimi is ${((summary.meanKimiMs || 1) / Math.max(1, summary.meanForgeMs)).toFixed(1)}× slower`)
console.log(`per brief:`)
for (const p of summary.perBrief) {
  const sign = p.delta > 0 ? '+' : ''
  console.log(`  ${p.slug.padEnd(12)} forge=${p.forge}  kimi=${p.kimi}  delta=${sign}${p.delta}`)
}
console.log(`\nartifacts: ${BENCH_DIR}`)
