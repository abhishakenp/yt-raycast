#!/usr/bin/env bun
/**
 * Run the Ship publication severe judge loop (ACPX + Kimi K2.5).
 *
 * Flow: generate → preflight → Kimi K2.5 severe judge → retry (max N).
 *
 * Usage:
 *   bun playground-engine-ui-ship/scripts/run-ship-severe-judge.mjs
 *   bun playground-engine-ui-ship/scripts/run-ship-severe-judge.mjs --max=3 --fast
 *   SHIP_FAST=1 bun playground-engine-ui-ship/scripts/run-ship-severe-judge.mjs
 */
import { spawnSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const FLOW = join(ROOT, 'playground-engine-ui-ship/workflows/ship-publication-severe-judge.flow.ts')
const DEFAULT_BRIEF =
  'A blog about dogs — training tips, breed guides, adoption stories, and product reviews for dog owners.'

function hasFlag(name) {
  return process.argv.includes(`--${name}`)
}

function arg(name, fallback) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : fallback
}

const runId = arg('run-id', String(Date.now()))
const maxLoops = Number(arg('max', '3'))
const brief = arg('brief', DEFAULT_BRIEF)
const slug = arg('slug', 'blog-dogs')
const fast = hasFlag('fast') || process.env.SHIP_FAST === '1'

const input = { brief, slug, max_loops: maxLoops, run_id: runId, fast }
const inputPath = join(ROOT, '.forge/ship-severe-judge', runId, 'flow-input.json')
mkdirSync(join(ROOT, '.forge/ship-severe-judge', runId), { recursive: true })
writeFileSync(inputPath, JSON.stringify(input, null, 2))

console.log(`[severe-judge] runId=${runId} max=${maxLoops} fast=${fast}`)
console.log(`[severe-judge] flow=${FLOW}`)

const proc = spawnSync(
  'acpx',
  [
    '--approve-all',
    '--cwd',
    ROOT,
    'flow',
    'run',
    FLOW,
    '--input-file',
    inputPath,
    '--default-agent',
    'cursor',
  ],
  { encoding: 'utf8', stdio: 'inherit' },
)

if (proc.status !== 0) {
  console.error(`[severe-judge] flow exited ${proc.status ?? 1}`)
  process.exit(proc.status ?? 1)
}

console.log(`[severe-judge] artifacts → .forge/ship-severe-judge/${runId}/`)
