import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

describe('quality gate configuration', () => {
  it('keeps coverage reporting wired into package scripts and CI', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
    const vitestConfig = readFileSync('vitest.config.ts', 'utf8')
    const ciWorkflow = readFileSync('.github/workflows/ci.yml', 'utf8')

    expect(packageJson.devDependencies['@vitest/coverage-v8']).toBe('4.1.8')
    expect(packageJson.scripts['test:coverage']).toBe(
      'vitest run --config vitest.config.ts --coverage',
    )
    expect(packageJson.scripts['verify:generated']).toBe(
      'node packages/ship-fast-blocks/scripts/generate-react-export-sources.mjs --check',
    )
    expect(packageJson.scripts['verify:change-groups']).toBe(
      'bun scripts/verify-change-groups.ts',
    )
    expect(packageJson.scripts['verify:change-report']).toBe(
      'bun scripts/verify-change-groups.ts --check-report',
    )
    expect(packageJson.scripts['verify:review-readiness']).toBe(
      'bun scripts/verify-review-readiness.ts',
    )
    expect(packageJson.scripts['verify:quality-exit']).toBe(
      'bun scripts/verify-quality-exit.ts',
    )
    expect(packageJson.scripts['review:groups']).toBe(
      'bun scripts/export-review-groups.ts',
    )
    expect(packageJson.scripts['verify:qa']).toContain('bun run test:coverage')
    expect(packageJson.scripts['verify:qa']).toContain(
      'bun run verify:change-groups',
    )
    expect(packageJson.scripts['verify:qa']).toContain(
      'bun run verify:review-readiness',
    )
    expect(packageJson.scripts['verify:qa']).toContain(
      'bun run verify:generated',
    )
    expect(vitestConfig).toContain("provider: 'v8'")
    expect(vitestConfig).toContain("'json-summary'")
    expect(vitestConfig).toContain(
      "'packages/ship-fast-engine/src/clone/**/*.test.ts'",
    )
    expect(vitestConfig).toContain(
      "'packages/ship-fast-engine/src/llm/**/*.test.js'",
    )
    expect(vitestConfig).toContain(
      "'packages/ship-fast-engine/src/renderers/**/*.test.ts'",
    )
    expect(vitestConfig).toContain(
      "'packages/ship-fast-engine/src/renderers/**/*.test.js'",
    )
    expect(vitestConfig).toContain(
      "'packages/ship-fast-engine/src/spec/**/*.test.js'",
    )
    expect(vitestConfig).toContain('thresholds:')
    expect(vitestConfig).toContain('statements: 22.13')
    expect(vitestConfig).toContain('branches: 14.8')
    expect(vitestConfig).toContain('functions: 10.68')
    expect(vitestConfig).toContain('lines: 21.74')
    expect(ciWorkflow).toContain('bun run test:coverage')
  })
})
