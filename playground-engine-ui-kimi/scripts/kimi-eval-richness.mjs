#!/usr/bin/env bun
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { scoreKimiReadiness, scoreVisualRichness } from '../src/quality/kimi-score.js'

const dir = process.argv[2]
if (!dir) {
  console.error('Usage: bun playground-engine-ui-kimi/scripts/kimi-eval-richness.mjs <html-dir>')
  process.exit(2)
}

const files = readdirSync(dir).filter((f) => f.endsWith('.html'))
console.log(`[richness] evaluating ${files.length} files in ${dir}\n`)

for (const file of files) {
  const html = readFileSync(join(dir, file), 'utf8')
  const kimi = scoreKimiReadiness(html, {})
  const rich = scoreVisualRichness(html, {})
  console.log(`${file.padEnd(24)} kimi=${kimi.score} richness=${rich.score} sections=${kimi.signals.sections} kinds=${kimi.signals.richVisualKinds.join(',') || '-'}`)
  if (kimi.issues.length) console.log(`  issues: ${kimi.issues.join('; ')}`)
}
