import { readdirSync } from 'node:fs'
import { basename, dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const convexRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

const listTypeScriptFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)

    if (entry.isDirectory()) {
      return entry.name === '_generated' ? [] : listTypeScriptFiles(path)
    }

    return entry.isFile() && entry.name.endsWith('.ts') ? [path] : []
  })

describe('Convex module naming', () => {
  it('keeps TypeScript module filenames compatible with Convex', () => {
    const hyphenatedFiles = listTypeScriptFiles(convexRoot)
      .filter((path) => basename(path).includes('-'))
      .map((path) => relative(convexRoot, path))

    expect(hyphenatedFiles).toEqual([])
  })
})
