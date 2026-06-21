import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

describe('@ship-fast/engine package binary', () => {
  it('exposes the standalone runner as an installed binary', () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(packageDir, 'package.json'), 'utf8'),
    )
    const binPath = packageJson.bin?.['ship-fast-engine']

    expect(binPath).toBe('./scripts/run-engine-standalone.ts')
    expect(existsSync(resolve(packageDir, binPath))).toBe(true)
  })

  it('keeps the standalone runner directly executable by bun', () => {
    const source = readFileSync(
      resolve(packageDir, 'scripts/run-engine-standalone.ts'),
      'utf8',
    )

    expect(source.startsWith('#!/usr/bin/env bun\n')).toBe(true)
  })
})
