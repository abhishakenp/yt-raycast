#!/usr/bin/env bun
/**
 * Reference comparison: Kimi K2.5 (via Cursor ACP) vs OUR creative engine.
 *
 * For each diverse brief, sequentially (no parallel — avoid rate limits):
 *   1. OURS  — generateCreativeHomepage (planner + Gemini chunk1 + GPT-OSS 2/3)
 *   2. KIMI  — cursor-agent --model kimi-k2.5, the human-preferred reference
 * Then screenshots both and prints a table with clickable file:// links, and
 * opens both in the browser.
 *
 * Kimi is ~2-3 min per brief; ours is ~12s. 4 briefs ≈ 11 min wall.
 *
 * Usage:
 *   bun scripts/forge-vs-kimi.mjs                 all briefs
 *   bun scripts/forge-vs-kimi.mjs fleet music     subset by slug
 *   OURS_ONLY=1 bun scripts/forge-vs-kimi.mjs     skip Kimi (fast dry-run)
 *
 * Env: GEMINI_API_KEY/GOOGLE_API_KEY, GROQ_API_KEY, cursor-agent installed.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { spawn, execSync } from 'node:child_process'
import { generateCreativeHomepage } from './forge-creative.mjs'

const ROOT = process.cwd()
const RUN_ID = String(Date.now())
const OUT_DIR = join(ROOT, '.forge', 'vs-kimi', RUN_ID)
mkdirSync(OUT_DIR, { recursive: true })
const OURS_ONLY = process.env.OURS_ONLY === '1'

// Deliberately diverse + unusual — stress archetype + design variety.
const BRIEFS = [
  { slug: 'fleet', brief: 'Helmsman — a fleet operations console for autonomous delivery robots. Operators watch a live city map, per-robot battery and route status, an incident timeline, and can hand off to remote teleoperation. B2B, sold to logistics companies.' },
  { slug: 'riso', brief: 'Riso Press — a Brooklyn risograph print studio and zine shop. Bold, playful, ink-on-paper craft. Sells limited-run art prints and zines, runs weekend printing workshops, takes custom client commissions.' },
  { slug: 'music', brief: 'Tessellate — an independent electronic music label and warehouse event series in Berlin. Vinyl + digital releases, a roster of 12 artists, a calendar of upcoming warehouse parties, and a small merch + record shop.' },
  { slug: 'butchery', brief: 'Marrow — a nose-to-tail butchery and supper club in Lisbon. Weekly changing set menus, hands-on butchery classes, whole-animal provenance from a single farm, a small counter selling cuts and charcuterie.' },
]

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const briefs = args.length ? BRIEFS.filter((b) => args.includes(b.slug)) : BRIEFS

// ── Kimi via Cursor ACP (sentinel-file pattern from forge-bench-kimi.mjs) ────
async function generateWithKimi(brief, slug) {
  const t0 = Date.now()
  const sentinelName = `vskimi-${slug}-${RUN_ID}.html`
  const sentinelPath = join(ROOT, sentinelName)
  const prompt = `Design and build the best possible front-door web page for this brand, and write it to "${sentinelName}" in the current directory.

Brief: ${brief}

Think like a world-class product designer. The page does NOT have to be a generic marketing landing — choose whatever front door best fits this brand (it might be the actual product UI / dashboard / console, a gallery, an editorial spread, a catalog, an events calendar, etc.). Make it genuinely beautiful, distinctive, and complete:
- Self-contained single-file HTML starting with <!DOCTYPE html>.
- Tailwind via cdn.tailwindcss.com; load fitting Google Fonts.
- A strong, specific visual identity (palette, type, layout) tailored to THIS brand — not a template.
- Real, specific content (no lorem). Several substantial sections/regions.

After writing the file, respond with ONLY: "WROTE ${sentinelName}" and stop.`

  await new Promise((res, rej) => {
    const proc = spawn(
      'cursor-agent',
      ['--print', '--model', 'kimi-k2.5', '--output-format', 'text', '--trust', prompt],
      { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] },
    )
    const chunks = []
    proc.stdout.on('data', (d) => chunks.push(d))
    proc.stderr.on('data', () => {})
    const timeout = setTimeout(() => { proc.kill('SIGTERM'); rej(new Error('kimi timeout 300s')) }, 300000)
    proc.on('exit', (code) => {
      clearTimeout(timeout)
      code === 0 ? res(Buffer.concat(chunks).toString('utf8')) : rej(new Error(`cursor-agent exited ${code}`))
    })
  })
  if (!existsSync(sentinelPath)) throw new Error('kimi did not write the file')
  const html = readFileSync(sentinelPath, 'utf8')
  unlinkSync(sentinelPath)
  return { html, ms: Date.now() - t0 }
}

console.log(`[vs-kimi] runId=${RUN_ID}  briefs=${briefs.length}  oursOnly=${OURS_ONLY}`)
const results = []

for (const { slug, brief } of briefs) {
  const dir = join(OUT_DIR, slug)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'brief.txt'), brief)
  const row = { slug, brief }
  console.log(`\n[vs-kimi] === ${slug} ===`)

  // OURS (fast)
  try {
    console.log('[vs-kimi] ours generating…')
    const r = await generateCreativeHomepage(brief)
    writeFileSync(join(dir, 'ours.html'), r.html)
    writeFileSync(join(dir, 'ours.plan.json'), JSON.stringify(r.plan, null, 2))
    row.ours = { file: join(dir, 'ours.html'), ms: r.metrics.wall, chars: r.metrics.chars, archetype: r.archetype, palette: r.metrics.palette, fonts: r.metrics.fonts }
    console.log(`[vs-kimi] ours: ${r.metrics.wall}ms, ${r.metrics.chars} chars — ${r.archetype}`)
  } catch (e) {
    row.ours = { error: String(e?.message || e) }
    console.log(`[vs-kimi] ours FAILED: ${e?.message || e}`)
  }

  // KIMI (slow)
  if (!OURS_ONLY) {
    try {
      console.log('[vs-kimi] kimi generating (~2-3 min)…')
      const k = await generateWithKimi(brief, slug)
      writeFileSync(join(dir, 'kimi.html'), k.html)
      row.kimi = { file: join(dir, 'kimi.html'), ms: k.ms, chars: k.html.length }
      console.log(`[vs-kimi] kimi: ${k.ms}ms, ${k.html.length} chars`)
    } catch (e) {
      row.kimi = { error: String(e?.message || e) }
      console.log(`[vs-kimi] kimi FAILED: ${e?.message || e}`)
    }
  }
  results.push(row)
}

// ── Screenshots ──────────────────────────────────────────────────────────────
try {
  const { chromium } = await import('playwright')
  const b = await chromium.launch()
  for (const r of results) {
    for (const side of ['ours', 'kimi']) {
      const f = r[side]?.file
      if (!f || !existsSync(f)) continue
      const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
      await p.goto(`file://${f}`, { waitUntil: 'networkidle', timeout: 25000 }).catch(() => {})
      await p.waitForTimeout(600)
      await p.screenshot({ path: f.replace(/\.html$/, '.png'), fullPage: true }).catch(() => {})
      await p.close()
    }
  }
  await b.close()
} catch (e) {
  console.error(`[vs-kimi] screenshot pass failed: ${e?.message || e}`)
}

// ── Table ──────────────────────────────────────────────────────────────────────
console.log(`\n[vs-kimi] === RESULTS (runId ${RUN_ID}) ===\n`)
for (const r of results) {
  console.log(`■ ${r.slug}`)
  if (r.ours?.file) {
    console.log(`   OURS  ${String(r.ours.ms + 'ms').padStart(7)}  ${String(r.ours.chars).padStart(6)}c  ${r.ours.archetype}`)
    console.log(`         ${r.ours.palette}  ${r.ours.fonts}`)
    console.log(`         open: file://${r.ours.file}`)
  } else console.log(`   OURS  ❌ ${r.ours?.error}`)
  if (!OURS_ONLY) {
    if (r.kimi?.file) {
      console.log(`   KIMI  ${String(r.kimi.ms + 'ms').padStart(7)}  ${String(r.kimi.chars).padStart(6)}c`)
      console.log(`         open: file://${r.kimi.file}`)
    } else console.log(`   KIMI  ❌ ${r.kimi?.error}`)
  }
  console.log('')
}
writeFileSync(join(OUT_DIR, 'results.json'), JSON.stringify(results, null, 2))
console.log(`[vs-kimi] artifacts: ${OUT_DIR}`)

// Open everything in the browser (ours + kimi per brief).
for (const r of results) {
  for (const side of ['ours', 'kimi']) {
    const f = r[side]?.file
    if (f && existsSync(f)) { try { execSync(`open "${f}"`) } catch {} }
  }
}
console.log(`[vs-kimi] opened pages in browser`)
