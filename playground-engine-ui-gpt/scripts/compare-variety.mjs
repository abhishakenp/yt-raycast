#!/usr/bin/env bun
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'
import { compareSignatures } from '../src/audits.js'
import { generateGptHomepage } from '../src/engine.js'
import { collectBrowserVisualAudit } from '../src/visual-audit.js'

const args = process.argv.slice(2)
const countFlag = args.findIndex((arg) => arg === '--count')
const count = countFlag >= 0 ? Math.max(2, Number(args[countFlag + 1] || 2)) : 2
const brief = args.filter((arg, index) => !arg.startsWith('--') && index !== countFlag + 1).join(' ').trim()

if (!brief) {
  console.error('Usage: bun playground-engine-ui-gpt/scripts/compare-variety.mjs <brief> --count 2')
  process.exit(2)
}
if (!process.env.GROQ_API_KEY) {
  console.error('[compare-variety] GROQ_API_KEY not set; real generation blocked. Run mocked tests instead.')
  process.exit(2)
}

const runId = String(Date.now())
const outDir = join(process.cwd(), 'playground-engine-ui-gpt', '.runs', 'compare-variety', runId)
mkdirSync(outDir, { recursive: true })

const rows = []
for (let i = 0; i < count; i++) {
  const result = await generateGptHomepage(brief, { seed: `${runId}-variant-${i}` })
  const file = join(outDir, `variant-${i + 1}.html`)
  writeFileSync(file, result.html)
  writeFileSync(join(outDir, `variant-${i + 1}.json`), JSON.stringify({ plan: result.plan, route: result.route, metrics: result.metrics, audits: result.audits }, null, 2))
  rows.push({
    index: i + 1,
    file,
    ...result.metrics,
    signature: result.audits.signature,
    kimiScore: result.audits.kimi?.score,
    kimiIssues: result.audits.kimi?.issues || [],
  })
  console.log(`[compare-variety] variant ${i + 1}: ${result.metrics.wall}ms ${result.metrics.anchor} ${result.metrics.pageKind} kimi-${result.audits.kimi?.score ?? 'n/a'}`)
}

const comparisons = []
for (let i = 0; i < rows.length; i++) {
  for (let j = i + 1; j < rows.length; j++) {
    comparisons.push({ a: rows[i].index, b: rows[j].index, ...compareSignatures(rows[i].signature, rows[j].signature) })
  }
}
writeFileSync(join(outDir, 'results.json'), JSON.stringify({ brief, rows, comparisons }, null, 2))

try {
  const { chromium } = await import('playwright')
  const browser = await chromium.launch()
  for (const row of rows) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await page.goto(`file://${row.file}`, { waitUntil: 'load', timeout: 25000 }).catch(() => {})
    await page.waitForTimeout(600)
    await page.screenshot({ path: row.file.replace(/\.html$/, '.png'), fullPage: true }).catch(() => {})
    row.visual = await collectBrowserVisualAudit(page).catch((error) => ({ ok: false, issues: [error.message] }))
    writeFileSync(row.file.replace(/\.html$/, '.visual.json'), JSON.stringify(row.visual, null, 2))
    await page.close()
  }
  await browser.close()
} catch (error) {
  console.error(`[compare-variety] screenshot/visual pass failed: ${error.message}`)
}

writeFileSync(join(outDir, 'results.json'), JSON.stringify({ brief, rows, comparisons }, null, 2))

console.log('\n[compare-variety] comparisons')
for (const comparison of comparisons) {
  console.log(`${comparison.a} vs ${comparison.b}: ${comparison.ok ? 'different' : 'too-similar'} diffs=${comparison.diffs.join(',') || 'none'} sharedTokens=${comparison.sharedTokens}`)
}
for (const row of rows) {
  if (row.kimiIssues?.length) console.log(`variant ${row.index} kimi: ${row.kimiIssues.join('; ')}`)
  if (row.visual) console.log(`variant ${row.index} visual: ${row.visual.ok ? 'ok' : `warn ${row.visual.issues.join('; ')}`}`)
}
console.log(`[compare-variety] artifacts: ${outDir}`)

for (const row of rows) {
  try {
    execSync(`open "${row.file}"`)
  } catch {}
}
