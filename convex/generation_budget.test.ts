import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))

const TOTAL_GENERATION_BUDGET_CEILING_MS = 90_000

const readSource = (path: string) => readFileSync(path, 'utf8')

const numericLiteralValue = (literal: string): number =>
  Number(literal.replaceAll('_', ''))

const extractConstNumber = (source: string, name: string): number => {
  const match = source.match(
    new RegExp(`const\\s+${name}\\s*=\\s*([0-9][0-9_]*)`),
  )

  expect(match, `${name} must be defined as a numeric const`).not.toBeNull()

  return numericLiteralValue(match![1])
}

describe('homepage generation latency budgets', () => {
  it('keeps structural timeout budgets defined, positive, and capped', () => {
    const generationSource = readSource(join(here, 'generation.ts'))

    const totalTimeoutMs = extractConstNumber(
      generationSource,
      'DEFAULT_GENERATION_TIMEOUT_MS',
    )

    expect(totalTimeoutMs).toBeGreaterThan(0)

    // Structural budget ceiling: live homepage generation must not silently grow
    // beyond the current 90s total timeout without an explicit test update.
    expect(totalTimeoutMs).toBeLessThanOrEqual(
      TOTAL_GENERATION_BUDGET_CEILING_MS,
    )
  })
})
