import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { ViteUserConfig } from 'vitest/config'

describe('quality gate configuration', () => {
  it('wires coverage reporting into package scripts and CI', async () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
    const ciWorkflow = readFileSync('.github/workflows/ci.yml', 'utf8')
    const vitestConfig = (
      (await import(resolve('vitest.config.ts'))) as { default: ViteUserConfig }
    ).default
    const testConfig = vitestConfig.test as {
      coverage?: { provider?: string; reporter?: string[] }
    }

    // Coverage dependency must be declared
    expect(packageJson.devDependencies).toHaveProperty('@vitest/coverage-v8')

    // Coverage script must exist and run vitest with --coverage
    const coverageScript = packageJson.scripts?.['test:coverage'] as
      | string
      | undefined
    expect(coverageScript).toBeDefined()
    expect(coverageScript).toContain('--coverage')

    // CI must run the coverage script
    expect(ciWorkflow).toContain('test:coverage')

    // Vitest coverage provider must be v8 with json-summary reporter
    expect(testConfig.coverage?.provider).toBe('v8')
    expect(testConfig.coverage?.reporter).toContain('json-summary')
  })

  it('wires typecheck to the typecheck tsconfig with the blocks shim', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
    const typecheckConfig = JSON.parse(
      readFileSync('tsconfig.typecheck.json', 'utf8'),
    )

    // Typecheck script must exist and use the typecheck tsconfig
    const typecheckScript = packageJson.scripts?.typecheck as string | undefined
    expect(typecheckScript).toBeDefined()
    expect(typecheckScript).toContain('tsconfig.typecheck.json')

    // ship-fast-blocks must be excluded from typecheck (it has its own tsconfig)
    expect(typecheckConfig.exclude).toContain(
      'packages/ship-fast-blocks/src/**',
    )

    // The blocks type shim must exist and declare the runtime module
    const shimPath =
      typecheckConfig.compilerOptions.paths['@ship-fast/blocks']?.[0]
    expect(shimPath).toBeDefined()
    expect(existsSync(shimPath!)).toBe(true)
    const shim = readFileSync(shimPath!, 'utf8')
    expect(shim).toContain("declare module '@ship-fast/blocks/runtime'")
  })

  it('wires verification scripts that point to real files', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
    const verifyScripts = [
      'verify:generated',
      'verify:change-groups',
      'verify:review-readiness',
      'verify:quality-exit',
    ]
    for (const scriptName of verifyScripts) {
      const script = packageJson.scripts?.[scriptName] as string | undefined
      expect(script).toBeDefined()
      // Extract the target file from the script command and verify it exists
      const match = script?.match(/\b(scripts\/\S+|packages\/\S+)\b/)
      if (match) {
        expect(existsSync(resolve(match[1]))).toBe(true)
      }
    }

    // verify:qa must orchestrate coverage + change groups + review readiness + generated
    const verifyQa = packageJson.scripts?.['verify:qa'] as string | undefined
    expect(verifyQa).toBeDefined()
    expect(verifyQa).toContain('test:coverage')
    expect(verifyQa).toContain('verify:change-groups')
    expect(verifyQa).toContain('verify:review-readiness')
    expect(verifyQa).toContain('verify:generated')
  })
})
