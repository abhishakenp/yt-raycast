import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const SOURCE = readFileSync(resolve(__dirname, './brandfetch.ts'), 'utf8')

describe('Brandfetch Convex action source invariants', () => {
  it('keeps the Brandfetch API key server-side in Convex env', () => {
    expect(SOURCE).toContain('process.env.BRANDFETCH_API_KEY')
    expect(SOURCE).toContain('Authorization: `Bearer ${key}`')
    expect(SOURCE).toContain("'X-API-Key': key")
  })

  it('supports cursor-based pages for scroll pagination', () => {
    expect(SOURCE).toContain('cursor: v.union(v.string(), v.null())')
    expect(SOURCE).toContain('const start = normalizeCursor(args.cursor)')
    expect(SOURCE).toContain("url.searchParams.set('offset', String(start))")
    expect(SOURCE).toContain('continueCursor:')
  })
})
