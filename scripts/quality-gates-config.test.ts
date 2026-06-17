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
    expect(packageJson.scripts['verify:capsule-sources']).toBe(
      'bun scripts/verify-capsule-source-classification.ts',
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
    expect(packageJson.scripts['verify:qa']).toContain(
      'bun run verify:capsule-sources',
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
    expect(vitestConfig).toContain(
      "'packages/ship-fast-lakebed/src/**/*.test.ts'",
    )
    expect(vitestConfig).toContain(
      "'packages/ship-fast-lakebed/src/**/*.test.tsx'",
    )
    expect(vitestConfig).toContain('thresholds:')
    expect(vitestConfig).toContain('statements: 23.38')
    expect(vitestConfig).toContain('branches: 15.67')
    expect(vitestConfig).toContain('functions: 11.26')
    expect(vitestConfig).toContain('lines: 22.95')
    expect(ciWorkflow).toContain('bun run test:coverage')
  })
})
