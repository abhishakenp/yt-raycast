import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const convexRoot = join(process.cwd(), 'convex')
const sessionLibRoot = join(convexRoot, 'lib')

const readSource = (path: string) => readFileSync(path, 'utf8')

describe('session decomposition boundary', () => {
  it('keeps convex/sessions.ts as a registration surface under the coordination ceiling', () => {
    const source = readSource(join(convexRoot, 'sessions.ts'))
    const helperImports = [...source.matchAll(/from '\.\/lib\/session_[^']+'/g)]
      .length

    expect(helperImports).toBeGreaterThanOrEqual(26)
    expect(source).toContain("from './lib/session_validators'")
    expect(source).toContain('export const create = mutation')
    expect(source).toContain('export const getGenerationView = query')
    expect(source).toContain('export const listChatMessages = query')
    expect(source).not.toContain("from 'convex/values'")
    expect(source).not.toContain('v.object(')
    expect(source).not.toContain('v.union(')
  })

  it('requires each extracted session helper module to have a focused sibling test', () => {
    const files = readdirSync(sessionLibRoot)
    const helperFiles = files
      .filter((file) => /^session_.+_helpers\.ts$/.test(file))
      .sort()
    const testFiles = new Set(
      files.filter((file) => /^session_.+_helpers\.test\.ts$/.test(file)),
    )
    const helpersWithoutTests = helperFiles.filter(
      (file) => !testFiles.has(file.replace(/\.ts$/, '.test.ts')),
    )

    expect(helperFiles.length).toBeGreaterThanOrEqual(27)
    expect(helpersWithoutTests).toEqual([])
  })
})
