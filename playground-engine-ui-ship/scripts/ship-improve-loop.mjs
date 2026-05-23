#!/usr/bin/env bun
/**
 * Improve ship engine until Kimi K2.5 judge score ≥ target (default 90).
 * Regenerates with judge feedback injected into the brief each attempt.
 *
 * Usage:
 *   bun playground-engine-ui-ship/scripts/ship-improve-loop.mjs
 *   bun playground-engine-ui-ship/scripts/ship-improve-loop.mjs --target=92 --max=0
 *   SHIP_FAST=1 bun playground-engine-ui-ship/scripts/ship-improve-loop.mjs --target=90
 *
 * --max=0  → unlimited attempts until target (Ctrl+C to stop)
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { generateShipHomepage } from '../src/index.js'
import { judgeHomepage, SEVERE_JUDGE_PASS_SCORE } from '../src/quality/kimi-k2-judge.js'
import {
  parseBriefFromArgv,
  arg,
  hasFlag,
  ensureDir,
  screenshotHtmlPlaywright,
  buildPreflight,
  judgeModeForBrief,
  judgeMeetsTarget,
} from './lib/judge-artifacts.mjs'

const ROOT = process.cwd()
const DEFAULT_BRIEF =
  'A blog about dogs — training tips, breed guides, adoption stories, and product reviews for dog owners.'

const brief = parseBriefFromArgv(DEFAULT_BRIEF)
const runId = arg('run-id', String(Date.now()))
const target = Number(arg('target', '90'))
const maxArg = arg('max', '20')
const maxAttempts = maxArg === '0' ? Infinity : Number(maxArg)
const slug = arg('slug', 'page')
const fast = hasFlag('fast') || process.env.SHIP_FAST === '1'
const skipShots = hasFlag('skip-shots')
const judgeMode = judgeModeForBrief(brief)
const outRoot = ensureDir(join(ROOT, '.forge', 'ship-improve', runId))

if (!process.env.GROQ_API_KEY) {
  console.error('[improve] GROQ_API_KEY not set (needed for generation)')
  process.exit(2)
}

if (!process.env.OPENROUTER_API_KEY && process.env.SHIP_JUDGE_BACKEND !== 'cursor') {
  console.error('[improve] OPENROUTER_API_KEY required for Kimi judge (or SHIP_JUDGE_BACKEND=cursor)')
  process.exit(2)
}

console.log(`[improve] runId=${runId} target≥${target} max=${maxAttempts === Infinity ? '∞' : maxAttempts} fast=${fast}`)
console.log(`[improve] brief: ${brief.slice(0, 100)}…`)

let feedback = ''
let best = null
let attempt = 0

while (attempt < maxAttempts) {
  attempt++
  const dir = ensureDir(join(outRoot, `a${attempt}`))
  const effectiveBrief = feedback
    ? `${brief}\n\nQA feedback from Kimi K2.5 judge (must address):\n${feedback}`
    : brief

  console.log(`\n[improve] attempt ${attempt}${maxAttempts === Infinity ? '' : `/${maxAttempts}`}`)
  const t0 = Date.now()
  const result = await generateShipHomepage(effectiveBrief, {
    seed: `${runId}-a${attempt}`,
  })
  const wall = Date.now() - t0

  const htmlPath = join(dir, `${slug}.html`)
  const pngPath = join(dir, `${slug}.png`)
  writeFileSync(htmlPath, result.html)

  const preflight = buildPreflight(result.html, {
    brief: effectiveBrief,
    route: result.route,
    plan: result.plan,
  })

  if (!skipShots) await screenshotHtmlPlaywright(htmlPath, pngPath)

  writeFileSync(
    join(dir, 'meta.json'),
    JSON.stringify({ attempt, brief, effectiveBrief, feedback, metrics: result.metrics, preflight }, null, 2),
  )

  process.stdout.write(`[improve] kimi judge … `)
  const judge = await judgeHomepage({
    brief,
    html: result.html,
    engineId: 'ship',
    screenshotPath: existsSync(pngPath) ? pngPath : null,
    mode: judgeMode,
    preflight: {
      ok: preflight.publicationOk && preflight.heuristicScore >= 72,
      score: preflight.heuristicScore,
      publicationOk: preflight.publicationOk,
      photoCount: preflight.photoCount,
      issues: [...preflight.publicationIssues, ...preflight.heuristicIssues],
    },
    previousFeedback: feedback,
    heuristicScore: preflight.heuristicScore,
    passThreshold: target,
    cwd: ROOT,
  })

  writeFileSync(join(dir, 'verdict.json'), JSON.stringify(judge, null, 2))
  console.log(`score ${judge.score}/100 (${((Date.now() - t0) / 1000).toFixed(0)}s wall)`)

  const row = {
    attempt,
    score: judge.score,
    pass: judgeMeetsTarget(judge, target),
    wall,
    dir,
    htmlPath,
    judge,
    preflight,
  }

  if (!best || judge.score > best.score) best = row

  writeFileSync(
    join(outRoot, 'leaderboard.json'),
    JSON.stringify(
      {
        runId,
        target,
        attempts: attempt,
        best: { attempt: best.attempt, score: best.score, dir: best.dir },
        latest: { attempt, score: judge.score, pass: row.pass },
      },
      null,
      2,
    ),
  )

  if (row.pass) {
    console.log(`\n[improve] TARGET MET — score ${judge.score} ≥ ${target}`)
    console.log(`  html: ${htmlPath}`)
    console.log(`  dir:  ${dir}`)
    process.exit(0)
  }

  feedback = [
    judge.feedback || '',
    ...(judge.critical_defects || []).map((d) => `CRITICAL: ${d}`),
    ...(judge.issues || []).slice(0, 6).map((d) => `- ${d}`),
  ]
    .filter(Boolean)
    .join('\n')
    .slice(0, 3500)

  writeFileSync(join(dir, 'feedback-next.txt'), feedback)
  console.log(`  retry feedback: ${feedback.slice(0, 120)}…`)
}

console.log(`\n[improve] stopped after ${attempt} attempts without reaching ${target}`)
if (best) {
  console.log(`  best: attempt ${best.attempt} score=${best.score} → ${best.dir}`)
}
process.exit(1)
