#!/usr/bin/env bun
/**
 * Severe publication judge via Kimi K2.5 (cursor-agent).
 *
 * Usage:
 *   bun playground-engine-ui-ship/scripts/ship-severe-judge-kimi.mjs <artifactDir>
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { judgeHomepage } from '../src/quality/kimi-k2-judge.js'

const dir = process.argv[2]
if (!dir) {
  console.error('usage: ship-severe-judge-kimi.mjs <artifactDir>')
  process.exit(2)
}

const meta = JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf8'))
const preflight = existsSync(join(dir, 'preflight.json'))
  ? JSON.parse(readFileSync(join(dir, 'preflight.json'), 'utf8'))
  : meta.preflight || {}
const slug = meta.slug || 'blog-dogs'
const htmlPath = join(dir, `${slug}.html`)
const pngPath = join(dir, `${slug}.png`)
const html = readFileSync(htmlPath, 'utf8')

const verdict = await judgeHomepage({
  brief: meta.brief,
  html,
  engineId: 'ship',
  screenshotPath: existsSync(pngPath) ? pngPath : null,
  mode: 'publication',
  preflight,
  previousFeedback: meta.feedback || '',
  heuristicScore: preflight.score ?? preflight.heuristicScore,
})

if (verdict.prompt) writeFileSync(join(dir, 'judge-prompt.txt'), verdict.prompt)
if (verdict.raw) writeFileSync(join(dir, 'judge-raw.txt'), verdict.raw)
writeFileSync(join(dir, 'verdict.json'), JSON.stringify(verdict, null, 2))
console.log(JSON.stringify(verdict))
