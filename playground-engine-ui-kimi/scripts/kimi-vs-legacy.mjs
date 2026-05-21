#!/usr/bin/env bun
/**
 * Compare playground-engine-ui-kimi vs forge-gemini-native on same briefs.
 */
import { mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'
import { generateKimiHomepage } from '../src/index.js'
import { scoreKimiReadiness } from '../src/quality/kimi-score.js'

const BRIEFS = [
  { slug: 'saas', brief: 'Homepage for KubeMeter, Kubernetes cost attribution platform.' },
  { slug: 'riso', brief: 'Riso Press — Brooklyn risograph print studio and zine shop. Bold ink-on-paper craft.' },
  { slug: 'fleet', brief: 'Helmsman — fleet operations console for autonomous delivery robots with live map and incidents.' },
]

const args = process.argv.slice(2)
const briefs = args.length ? BRIEFS.filter((b) => args.includes(b.slug)) : BRIEFS
const runId = String(Date.now())
const outDir = join(process.cwd(), '.forge', 'kimi-vs-legacy', runId)
mkdirSync(outDir, { recursive: true })

async function runLegacy(slug, brief) {
  const script = join(process.cwd(), 'playground-engine-ui/scripts/forge-gemini-native.mjs')
  if (!existsSync(script)) return { ok: false, error: 'forge-gemini-native.mjs not found' }
  const tmpDir = join(outDir, 'legacy-tmp')
  mkdirSync(tmpDir, { recursive: true })
  try {
    execSync(`bun "${script}" ${slug}`, { cwd: process.cwd(), stdio: 'pipe', env: { ...process.env } })
    const forgeDirs = [...readdirSync(join(process.cwd(), '.forge', 'gemini-native'))].sort()
    const latest = forgeDirs[forgeDirs.length - 1]
    const legacyFile = join(process.cwd(), '.forge', 'gemini-native', latest, `${slug}.html`)
    if (!existsSync(legacyFile)) return { ok: false, error: 'legacy output missing' }
    const html = readFileSync(legacyFile, 'utf8')
    const score = scoreKimiReadiness(html, {})
    return { ok: true, file: legacyFile, html, score: score.score }
  } catch (e) {
    return { ok: false, error: String(e.message || e).slice(0, 200) }
  }
}

const rows = []
for (const { slug, brief } of briefs) {
  console.log(`[vs] ${slug} kimi …`)
  const kimi = await generateKimiHomepage(brief, { seed: `${runId}-${slug}` })
  const kimiFile = join(outDir, `${slug}-kimi.html`)
  writeFileSync(kimiFile, kimi.html)

  console.log(`[vs] ${slug} legacy …`)
  const legacy = await runLegacy(slug, brief)

  rows.push({
    slug,
    kimi: { wall: kimi.metrics.wall, score: kimi.audits.kimi.score, grammar: kimi.metrics.grammarId, file: kimiFile },
    legacy: legacy.ok ? { score: legacy.score, file: legacy.file } : { error: legacy.error },
    delta: legacy.ok ? kimi.audits.kimi.score - legacy.score : null,
  })
}

writeFileSync(join(outDir, 'results.json'), JSON.stringify(rows, null, 2))
console.log('\n[vs] === COMPARISON ===')
for (const r of rows) {
  const leg = r.legacy.error ? `legacy err` : `legacy kimi=${r.legacy.score}`
  const delta = r.delta != null ? ` (Δ${r.delta >= 0 ? '+' : ''}${r.delta})` : ''
  console.log(`  ${r.slug}: kimi=${r.kimi.score} ${leg}${delta} · ${r.kimi.wall}ms · ${r.kimi.grammar}`)
}
console.log(`[vs] artifacts: ${outDir}`)
