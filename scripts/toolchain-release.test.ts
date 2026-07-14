import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function declaredBunVersion(manifest: unknown) {
  if (!isRecord(manifest)) throw new Error('package.json must be an object')
  const packageManager = manifest.packageManager
  const engines = manifest.engines
  if (
    typeof packageManager !== 'string' ||
    !packageManager.startsWith('bun@')
  ) {
    throw new Error('package.json must pin packageManager to bun@<version>')
  }
  if (!isRecord(engines) || typeof engines.bun !== 'string') {
    throw new Error('package.json must pin engines.bun')
  }
  const packageManagerVersion = packageManager.slice('bun@'.length)
  if (packageManagerVersion !== engines.bun) {
    throw new Error('packageManager and engines.bun must pin the same version')
  }
  return packageManagerVersion
}

describe('release toolchain contract', () => {
  it('loads the ESLint flat config with the installed dependency graph', () => {
    const projectRoot = resolve(import.meta.dirname, '..')
    const result = spawnSync(
      'bunx',
      ['eslint', '--print-config', 'src/main.tsx'],
      {
        cwd: projectRoot,
        encoding: 'utf8',
      },
    )

    expect(result.error).toBeUndefined()
    expect(result.status, result.stderr || result.stdout).toBe(0)
  })

  it('runs tests with the exact Bun version pinned by the repository', () => {
    const manifest = JSON.parse(
      readFileSync(resolve(import.meta.dirname, '..', 'package.json'), 'utf8'),
    )
    const expectedVersion = declaredBunVersion(manifest)
    const runningVersion = execFileSync('bun', ['--version'], {
      encoding: 'utf8',
    }).trim()

    expect(runningVersion).toBe(expectedVersion)
  })
})
