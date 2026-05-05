#!/usr/bin/env bun
/**
 * Forge once: single-shot homepage generation w/ GPT-OSS-120b, time + score.
 *
 * Usage:
 *   bun vanilla/scripts/forge-once.mjs ["prompt"] [--effort low|medium|high] [--max 12000] [--temp 0.62]
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { passesHomepagePublicDesignVerification, scoreRalphHomepage } from '@ship-fast/engine/pipeline/ralph-homepage-score.js'
import { forgeGenerate, FORGE_DEFAULT_PROMPT } from './forge-lib.mjs'

function arg(name, def) {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : def
}
const positional = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const prompt = positional[0] || FORGE_DEFAULT_PROMPT
const effort = arg('--effort', 'low')
const maxTokens = parseInt(arg('--max', '12000'), 10)
const temperature = parseFloat(arg('--temp', '0.62'))
const outDir = arg('--out', join(process.cwd(), 'vanilla', '.forge', 'once', String(Date.now())))

mkdirSync(outDir, { recursive: true })

const result = await forgeGenerate({
  prompt,
  reasoningEffort: effort,
  maxTokens,
  temperature,
})
const html = String(result?.content || '')
writeFileSync(join(outDir, 'index.html'), html, 'utf8')
writeFileSync(join(outDir, 'prompt.txt'), prompt, 'utf8')

const sc = scoreRalphHomepage(html, { prompt, refPath: '', minScore: 85, refTight: false, siteType: 'saas' })
const ver = passesHomepagePublicDesignVerification(html, prompt, '', 'saas')

const meta = {
  model: result.model,
  ms: result.ms,
  underBudget: result.ms <= 15000,
  effort,
  maxTokens,
  temperature,
  inputTokens: result.inputTokens,
  outputTokens: result.outputTokens,
  htmlLen: html.length,
  score: sc.score,
  scoreOk: sc.ok,
  reasons: sc.reasons,
  verifyOk: ver.ok,
  verifyFeedback: ver.feedback,
  error: result.error,
}
writeFileSync(join(outDir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8')
console.log(JSON.stringify(meta, null, 2))
console.log(`out: ${outDir}`)
process.exit(meta.underBudget && sc.score >= 70 ? 0 : 1)
