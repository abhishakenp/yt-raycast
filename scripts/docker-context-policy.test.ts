import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { afterEach, describe, expect, it } from 'vitest'

const temporaryDirectories: string[] = []

describe('Docker build context policy', () => {
  afterEach(() => {
    for (const directory of temporaryDirectories.splice(0)) {
      rmSync(directory, { force: true, recursive: true })
    }
  })

  it('excludes repository metadata and local runtime artifacts', () => {
    const directory = mkdtempSync(join(tmpdir(), 'ship-fast-docker-context-'))
    temporaryDirectories.push(directory)

    copyFileSync(
      join(process.cwd(), '.dockerignore'),
      join(directory, '.dockerignore'),
    )
    for (const ignoredDirectory of [
      '.git',
      'dogfood-output',
      'node_modules',
      'sessions',
      'wasm-particles/target',
    ]) {
      const path = join(directory, ignoredDirectory)
      mkdirSync(path, { recursive: true })
      writeFileSync(join(path, 'ignored.txt'), 'ignored')
    }
    mkdirSync(join(directory, 'src'))
    writeFileSync(join(directory, 'src', 'app.ts'), 'export const app = true')

    const archivePath = join(directory, 'context.tar')
    const archive = spawnSync(
      'tar',
      ['-cf', archivePath, '--exclude-from=.dockerignore', '.'],
      {
        cwd: directory,
        encoding: 'utf8',
      },
    )
    expect(archive.status, archive.stderr).toBe(0)

    const listing = spawnSync('tar', ['-tf', archivePath], {
      encoding: 'utf8',
    })
    expect(listing.status, listing.stderr).toBe(0)
    expect(listing.stdout).toContain('./src/app.ts')
    expect(listing.stdout).not.toContain('./.git/ignored.txt')
    expect(listing.stdout).not.toContain('./dogfood-output/ignored.txt')
    expect(listing.stdout).not.toContain('./node_modules/ignored.txt')
    expect(listing.stdout).not.toContain('./sessions/ignored.txt')
    expect(listing.stdout).not.toContain('./wasm-particles/target/ignored.txt')
  })
})
