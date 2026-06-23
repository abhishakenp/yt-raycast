#!/usr/bin/env bun

// Run with real secrets via: doppler run -- bun scripts/bench-generation.mjs

import { performance } from 'node:perf_hooks'

const DEFAULT_TARGET_MS = 20_000
const DEFAULT_TIMEOUT_MS = 90_000
const DEFAULT_PROMPT =
  'Build a polished homepage for a developer observability startup named TracePilot. Include a clear hero, product benefits, pricing signal, and contact path.'

const numberFromEnv = (name, fallback) => {
  const raw = process.env[name]
  if (raw === undefined || raw.trim() === '') return fallback
  const value = Number(raw)
  return Number.isFinite(value) && value > 0 ? value : fallback
}

const targetMs = numberFromEnv('GENERATION_BENCH_TARGET_MS', DEFAULT_TARGET_MS)
const timeoutMs = numberFromEnv(
  'GENERATION_BENCH_TIMEOUT_MS',
  DEFAULT_TIMEOUT_MS,
)
const prompt = process.argv.slice(2).join(' ').trim() || DEFAULT_PROMPT

if (!process.env.GROQ_API_KEY?.trim()) {
  console.log(
    'SKIP generation benchmark: GROQ_API_KEY is missing. Run with `doppler run -- bun scripts/bench-generation.mjs`.',
  )
  process.exit(0)
}

const seconds = (ms) => (ms / 1000).toFixed(2)

const main = async () => {
  const { runHomepageOrchestrator } =
    await import('../packages/ship-fast-engine/src/genui/run.ts')

  const startedAt = performance.now()
  const result = await runHomepageOrchestrator({
    prompt,
    signal: AbortSignal.timeout(timeoutMs),
  })
  const elapsedMs = performance.now() - startedAt
  const passed = elapsedMs <= targetMs

  console.log(
    `${passed ? 'PASS' : 'FAIL'} generation benchmark: ${seconds(
      elapsedMs,
    )}s elapsed vs ${seconds(targetMs)}s target`,
  )
  console.log(
    `Generated ${result.source.length} chars for brand "${result.brand || 'unknown'}" with locale ${result.locale}.`,
  )

  if (!passed) process.exitCode = 1
}

main().catch((error) => {
  console.error(
    `FAIL generation benchmark: ${error instanceof Error ? error.message : String(error)}`,
  )
  process.exitCode = 1
})
