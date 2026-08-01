import { globSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import vitestConfig from '../vitest.config'

const TEST_ARTIFACT_GLOBS = [
  'convex/**/*.{test,spec}.{ts,tsx,js,jsx,mjs,cjs}',
  'packages/*/src/**/*.{test,spec}.{ts,tsx,js,jsx,mjs,cjs}',
  'public/scripts/**/*.{test,spec}.{ts,tsx,js,jsx,mjs,cjs}',
  // Script-side tests are configured as TypeScript Vitest suites. Some legacy
  // `.test.mjs` maintenance scripts use a different runner and must not be
  // asserted as Vitest-discoverable.
  'scripts/**/*.{test,spec}.{ts,tsx}',
  'src/**/*.{test,spec}.{ts,tsx,js,jsx,mjs,cjs}',
]

function normalizePath(path: string) {
  return path.replaceAll('\\', '/')
}

function expandGlobs(patterns: Array<string>) {
  return patterns.flatMap((pattern) =>
    globSync(pattern, { withFileTypes: false }),
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function configuredIncludes(config: unknown) {
  if (!isRecord(config) || !isRecord(config.test)) return []
  if (!Array.isArray(config.test.projects)) return []

  return config.test.projects.flatMap((project) => {
    if (!isRecord(project) || !isRecord(project.test)) return []
    if (!Array.isArray(project.test.include)) return []
    return project.test.include.filter(isString)
  })
}

describe('Vitest discovery contract', () => {
  it('discovers every test artifact in a configured project', () => {
    const root = resolve(import.meta.dirname, '..')
    const cwd = process.cwd()
    process.chdir(root)

    try {
      const testArtifacts = new Set(
        expandGlobs(TEST_ARTIFACT_GLOBS).map(normalizePath),
      )
      const discoveredTests = new Set(
        expandGlobs(configuredIncludes(vitestConfig)).map(normalizePath),
      )
      const undiscovered = [...testArtifacts]
        .filter((file) => !discoveredTests.has(file))
        .map((file) => normalizePath(relative(root, resolve(root, file))))
        .sort()

      expect(undiscovered).toEqual([])
    } finally {
      process.chdir(cwd)
    }
  })
})
