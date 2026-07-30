import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { afterEach, describe, expect, it } from 'vitest'

const temporaryDirectories: string[] = []

const findBunExecutable = () => {
  const result = spawnSync('/usr/bin/env', ['which', 'bun'], {
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    throw new Error(`Unable to locate bun: ${result.stderr}`)
  }
  return result.stdout.trim()
}

describe('build preflight', () => {
  afterEach(() => {
    for (const directory of temporaryDirectories.splice(0)) {
      rmSync(directory, { force: true, recursive: true })
    }
  })

  it('generates required export artifacts without deploying Convex', () => {
    const directory = mkdtempSync(join(tmpdir(), 'ship-fast-prebuild-'))
    temporaryDirectories.push(directory)
    const invocationLog = join(directory, 'invocations.log')
    const fakeBun = join(directory, 'bun')
    writeFileSync(
      fakeBun,
      '#!/bin/sh\nprintf "%s\\n" "$*" >> "$BUILD_PREFLIGHT_LOG"\n',
    )
    chmodSync(fakeBun, 0o755)

    const result = spawnSync(findBunExecutable(), ['run', 'prebuild'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        BUILD_PREFLIGHT_LOG: invocationLog,
        PATH: `${directory}:${process.env.PATH ?? ''}`,
      },
    })

    expect(result.status, result.stderr || result.stdout).toBe(0)
    expect(readFileSync(invocationLog, 'utf8').trim().split('\n')).toEqual([
      'run generate:react-export-sources',
      'run generate:lakebed-export-deps',
    ])
  })
})
