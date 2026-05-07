#!/usr/bin/env bun
/**
 * Promote winning forge HTML into the engine as a candidate exemplar OR copy
 * the lean prompt + reasoning_effort knob into a draft engine patch file.
 *
 * Usage:
 *   bun scripts/forge-promote.mjs <runId|latest> [--copy-html] [--patch]
 *
 * --copy-html : copies vanilla/.forge/loop/<run>/best/index.html →
 *               vanilla/.forge/promoted/best.html (preview path; engine
 *               integration is intentionally manual to avoid regressing prod).
 *
 * --patch     : emits vanilla/.forge/promoted/engine-patch.txt — a snippet
 *               showing how to wire reasoning_effort='low' + max_tokens=10000
 *               + the lean system prompt into groqHomepageCore.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const LOOP_DIR = join(ROOT, '.forge', 'loop')
const OUT_DIR = join(ROOT, '.forge', 'promoted')

let runId = process.argv[2] || 'latest'
if (runId === 'latest') runId = readdirSync(LOOP_DIR).sort().pop()
const RUN_DIR = join(LOOP_DIR, runId)
if (!existsSync(RUN_DIR)) {
  console.error(`run not found: ${RUN_DIR}`)
  process.exit(1)
}

const board = JSON.parse(readFileSync(join(RUN_DIR, 'leaderboard.json'), 'utf8'))
const top = board.filter((b) => b.kept)[0]
if (!top) {
  console.error('no kept iter in leaderboard — cannot promote')
  process.exit(1)
}

mkdirSync(OUT_DIR, { recursive: true })

const wantCopy = process.argv.includes('--copy-html')
const wantPatch = process.argv.includes('--patch')

if (wantCopy || (!wantCopy && !wantPatch)) {
  copyFileSync(join(top.dir, 'index.html'), join(OUT_DIR, 'best.html'))
  copyFileSync(join(top.dir, 'shot.png'), join(OUT_DIR, 'best.shot.png'))
  copyFileSync(join(top.dir, 'meta.json'), join(OUT_DIR, 'best.meta.json'))
  console.log(`promoted html → ${join(OUT_DIR, 'best.html')}`)
}

if (wantPatch || (!wantCopy && !wantPatch)) {
  const patch = `// vanilla/packages/ship-fast-engine/src/llm/groq.js — patch sketch
// Replace hardcoded reasoning_effort='high' for openai/gpt-oss-120b with the
// forge-validated knobs:
//
//   if (mid === 'openai/gpt-oss-120b') {
//     reasoningEffort = 'low'        // <-- was 'high'
//     reasoningFormat = 'hidden'
//     maxTokensOverride = 10000      // <-- new cap; respect callers that pass higher
//   }
//
// Replace the LANDING-PAGE branch of the homepage system prompt with the
// audit-aware lean prompt from scripts/forge-lib.mjs (HOMEPAGE_SYSTEM_LEAN
// constant). Keep the existing classification / image / brand blocks above and
// below.
//
// Best forge run: ${runId}
// Iter: ${top.iter}  ms=${top.ms}  vision=${top.vision?.score}  scoreOk=${top.scoreOk}
`
  writeFileSync(join(OUT_DIR, 'engine-patch.txt'), patch, 'utf8')
  console.log(`patch sketch → ${join(OUT_DIR, 'engine-patch.txt')}`)
}
