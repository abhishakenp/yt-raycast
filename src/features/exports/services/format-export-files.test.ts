import { describe, expect, it } from 'vitest'
import {
  EXPORT_PRETTIER_OPTIONS,
  formatExportFiles,
  type FormatFileCache,
} from './format-export-files'

function inMemoryFormatFileCache(): FormatFileCache & {
  store: Map<string, string>
} {
  const store = new Map<string, string>()
  return {
    store,
    get: async (hashes) => {
      const hits: Record<string, string> = {}
      for (const hash of hashes) {
        const value = store.get(hash)
        if (value !== undefined) hits[hash] = value
      }
      return hits
    },
    set: async (entries) => {
      for (const entry of entries) store.set(entry.hash, entry.content)
    },
  }
}

describe('formatExportFiles', () => {
  it('formats TypeScript with the shared Ship Fast config (no statement semis, single quotes, trailing commas)', async () => {
    const result = await formatExportFiles({
      'src/App.tsx':
        'import React from "react";\nexport const App = ({name,age}: {name: string; age: number}) => { return <div>{name}{age}</div> }\n',
    })

    const formatted = result['src/App.tsx']
    // single quotes for string literals
    expect(formatted).toContain("from 'react'")
    // no statement-terminating semicolons at end of lines
    expect(formatted).not.toMatch(/;\s*$/m)
    // trailing comma in destructured props
    expect(formatted).toMatch(/\{ name, age \}/)
  })

  it('formats JSON with proper indentation', async () => {
    const result = await formatExportFiles({
      'package.json': '{"name":"demo","version":"1.0.0","deps":{"a":"1"}}',
    })
    const formatted = result['package.json']
    expect(JSON.parse(formatted)).toEqual({
      name: 'demo',
      version: '1.0.0',
      deps: { a: '1' },
    })
    // prettier adds spaces after colons and a trailing newline
    expect(formatted).toContain('"name": "demo"')
    expect(formatted.endsWith('\n')).toBe(true)
  })

  it('formats CSS', async () => {
    const result = await formatExportFiles({
      'src/styles.css': 'body{color:red;background:blue;}',
    })
    expect(result['src/styles.css']).toContain('color: red;')
  })

  it('leaves unsupported extensions untouched', async () => {
    const html = '<!doctype html><html></html>'
    const result = await formatExportFiles({ 'index.html': html })
    expect(result['index.html']).toBe(html)
  })

  it('falls back to original content when a file cannot be parsed', async () => {
    const broken = 'export const X = { : }'
    const result = await formatExportFiles({ 'src/broken.ts': broken })
    expect(result['src/broken.ts']).toBe(broken)
  })

  it('formats markdown', async () => {
    const result = await formatExportFiles({
      'README.md': '# Demo\n\nthis is   a readme',
    })
    expect(result['README.md']).toContain('# Demo')
  })

  it('exposes the shared prettier options matching the repo config', () => {
    expect(EXPORT_PRETTIER_OPTIONS.semi).toBe(false)
    expect(EXPORT_PRETTIER_OPTIONS.singleQuote).toBe(true)
    expect(EXPORT_PRETTIER_OPTIONS.trailingComma).toBe('all')
  })
})

describe('formatExportFiles with a cache', () => {
  it('stores newly formatted output under a content hash', async () => {
    const cache = inMemoryFormatFileCache()
    const result = await formatExportFiles(
      { 'src/App.tsx': 'export const X = 1' },
      cache,
    )
    expect(cache.store.size).toBe(1)
    const [cachedContent] = [...cache.store.values()]
    expect(cachedContent).toBe(result['src/App.tsx'])
  })

  it('reuses a cache hit verbatim instead of reformatting', async () => {
    const cache = inMemoryFormatFileCache()
    const content = 'export const X = 1'
    await formatExportFiles({ 'src/App.tsx': content }, cache)
    const [hash] = [...cache.store.keys()]
    // A sentinel real Prettier would never produce — getting it back proves
    // the cache path was taken instead of a fresh format() call.
    cache.store.set(hash, '// SENTINEL_FROM_CACHE\n')

    const result = await formatExportFiles({ 'src/App.tsx': content }, cache)
    expect(result['src/App.tsx']).toBe('// SENTINEL_FROM_CACHE\n')
  })

  it('misses the cache and reformats when raw content changes', async () => {
    const cache = inMemoryFormatFileCache()
    await formatExportFiles({ 'src/App.tsx': 'export const X = 1' }, cache)
    expect(cache.store.size).toBe(1)

    const result = await formatExportFiles(
      { 'src/App.tsx': 'export const Y = 2' },
      cache,
    )
    expect(cache.store.size).toBe(2)
    expect(result['src/App.tsx']).toContain('Y = 2')
  })

  it('produces identical output with or without a cache', async () => {
    const files = { 'src/App.tsx': 'export const X = 1' }
    const withoutCache = await formatExportFiles(files)
    const withCache = await formatExportFiles(files, inMemoryFormatFileCache())
    expect(withCache).toEqual(withoutCache)
  })

  it('never looks up or stores unsupported extensions', async () => {
    const cache = inMemoryFormatFileCache()
    await formatExportFiles({ 'index.html': '<html></html>' }, cache)
    expect(cache.store.size).toBe(0)
  })

  it('does not cache content that fails to format', async () => {
    const cache = inMemoryFormatFileCache()
    await formatExportFiles(
      { 'src/broken.ts': 'export const X = { : }' },
      cache,
    )
    expect(cache.store.size).toBe(0)
  })
})

describe('formatExportFiles skips vendored dependency bundles', () => {
  // Regression: a real Lakebed export vendors npm packages verbatim under
  // client/vendor/**. One of those files — a 105KB pre-minified
  // tailwind-merge bundle — pathologically stalled Prettier's Babel parser
  // for ~28 seconds, and with ~170 vendor files queued behind it on Node's
  // single thread, the whole export build blew past the platform's action
  // time limit and failed. Vendored code is never human-edited, so it must
  // never be run through Prettier at all — this is a correctness contract,
  // not just a performance nicety.
  it('leaves a client/vendor/** file byte-for-byte untouched, even a badly-formatted one', async () => {
    const messyMinified =
      'const   x=1;const y = {a:1,b:2,c:[1,2,3,4,5,6,7,8,9,10]};export{x,y};'
    const result = await formatExportFiles({
      'client/vendor/tailwind-merge/dist/bundle-mjs.mjs': messyMinified,
    })
    expect(result['client/vendor/tailwind-merge/dist/bundle-mjs.mjs']).toBe(
      messyMinified,
    )
  })

  it('also excludes the react/next builder vendor convention (src/vendor/**)', async () => {
    const raw = 'export   const z=1'
    const result = await formatExportFiles({
      'src/vendor/blocks/src/registry/sections/x.tsx': raw,
    })
    expect(result['src/vendor/blocks/src/registry/sections/x.tsx']).toBe(raw)
  })

  it('never looks up or stores a cache entry for a vendor file', async () => {
    const cache = inMemoryFormatFileCache()
    await formatExportFiles(
      { 'client/vendor/clsx/dist/clsx.mjs': 'export const x=1' },
      cache,
    )
    expect(cache.store.size).toBe(0)
  })

  it('does NOT exclude a file merely named "vendor" outside a /vendor/ directory', async () => {
    const result = await formatExportFiles({
      'src/vendor.ts': 'export const x=1',
    })
    // still formatted normally — no statement semicolon, single quotes
    expect(result['src/vendor.ts']).not.toBe('export const x=1')
  })

  it('still formats an ordinary (non-vendor) generated component at the same path depth', async () => {
    const result = await formatExportFiles({
      'client/components/Hero.tsx': 'export const Hero=()=>null',
    })
    expect(result['client/components/Hero.tsx']).not.toBe(
      'export const Hero=()=>null',
    )
  })
})
