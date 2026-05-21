#!/usr/bin/env bun
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { generateKimiHomepage } from '../src/index.js'
import { detectVisualSignature, varietyDistance } from '../src/quality/variety-metrics.js'

const brief = process.argv.slice(2).filter((a) => !a.startsWith('--')).join(' ').trim()
const count = Math.max(2, Number(process.env.KIMI_VARIETY_COUNT || '3'))

if (!brief) {
  console.error('Usage: bun playground-engine-ui-kimi/scripts/kimi-bench-variety.mjs "<brief>"')
  process.exit(2)
}
if (!process.env.GROQ_API_KEY) {
  console.error('GROQ_API_KEY required')
  process.exit(2)
}

const runId = String(Date.now())
const outDir = join(process.cwd(), '.forge', 'kimi-variety', runId)
mkdirSync(outDir, { recursive: true })

const rows = []
const signatures = []

for (let i = 0; i < count; i++) {
  const seed = `${runId}-v${i}`
  const result = await generateKimiHomepage(brief, { seed })
  const file = join(outDir, `variant-${i + 1}.html`)
  writeFileSync(file, result.html)
  const sig = detectVisualSignature(result.html, { plan: result.plan, route: result.route, seed })
  signatures.push(sig)
  rows.push({
    index: i + 1,
    seed,
    wall: result.metrics.wall,
    grammarId: result.metrics.grammarId,
    anchor: result.metrics.anchor,
    kimiScore: result.audits.kimi.score,
    signature: sig,
    file,
  })
  console.log(`[variety] v${i + 1}: ${result.metrics.wall}ms anchor=${result.metrics.anchor} grammar=${result.metrics.grammarId} kimi=${result.audits.kimi.score}`)
}

const variety = varietyDistance(signatures)
writeFileSync(join(outDir, 'results.json'), JSON.stringify({ brief, rows, variety }, null, 2))
console.log(`\n[variety] distinct pairs: ${variety.distinctPairs}/${variety.pairs} ok=${variety.varietyOk}`)
for (const c of variety.comparisons) {
  console.log(`  diffs=[${c.diffs.join(',') || 'none'}] similarity=${(c.similarity * 100).toFixed(0)}% distinct=${c.ok}`)
}
console.log(`[variety] artifacts: ${outDir}`)
