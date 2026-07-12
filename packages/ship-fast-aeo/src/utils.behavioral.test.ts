import { describe, expect, it } from 'vitest'

import {
  cleanObject,
  escapeHtml,
  joinUrl,
  normalizePath,
  serializeStructuredData,
  uniqueStrings,
} from './utils.ts'

describe('AEO utility contracts', () => {
  it('trims, removes blanks, and de-duplicates strings in first-seen order', () => {
    expect(
      uniqueStrings([' Alpha ', '', 'Beta', 'Alpha', '  ', 'beta', 'Beta']),
    ).toEqual(['Alpha', 'Beta', 'beta'])
    expect(uniqueStrings()).toEqual([])
  })

  it('recursively removes empty values while retaining meaningful falsey data', () => {
    expect(
      cleanObject({
        active: false,
        count: 0,
        empty: '',
        items: [{}, { label: 'First', note: '' }, '', null],
        nested: { missing: undefined, value: 'kept' },
      }),
    ).toEqual({
      active: false,
      count: 0,
      items: [{ label: 'First' }],
      nested: { value: 'kept' },
    })
  })

  it('collapses completely empty objects and arrays to undefined', () => {
    expect(cleanObject({ empty: '', missing: null })).toBeUndefined()
    expect(cleanObject(['', null, undefined])).toBeUndefined()
    expect(cleanObject('')).toBeUndefined()
    expect(cleanObject(null)).toBeUndefined()
  })

  it('normalizes root, relative, and absolute URLs to an internal path', () => {
    expect(normalizePath()).toBe('/')
    expect(normalizePath('  ')).toBe('/')
    expect(normalizePath('/')).toBe('/')
    expect(normalizePath('docs/getting-started')).toBe('/docs/getting-started')
    expect(normalizePath('/docs?q=ship#install')).toBe('/docs?q=ship#install')
    expect(normalizePath('https://example.test/docs?q=ship#install')).toBe(
      '/docs?q=ship#install',
    )
    expect(normalizePath('https://[')).toBe('/')
  })

  it('joins normalized paths onto a base origin and fails closed for bad bases', () => {
    expect(joinUrl('https://example.test', 'docs')).toBe(
      'https://example.test/docs',
    )
    expect(joinUrl('https://example.test/base', '/pricing?q=annual')).toBe(
      'https://example.test/pricing?q=annual',
    )
    expect(joinUrl('', '/docs')).toBe('')
    expect(joinUrl('not a url', '/docs')).toBe('')
  })

  it('escapes every HTML-significant character without altering plain text', () => {
    expect(escapeHtml(`<&>"'`)).toBe('&lt;&amp;&gt;&quot;&#39;')
    expect(escapeHtml('Launch safely')).toBe('Launch safely')
    expect(escapeHtml()).toBe('')
  })

  it('serializes one schema as an object and neutralizes closing-script input', () => {
    const serialized = serializeStructuredData([
      { '@type': 'Article', headline: '</script><script>alert(1)</script>' },
    ])

    expect(serialized.startsWith('{')).toBe(true)
    expect(serialized).not.toContain('<')
    expect(serialized).toContain('\\u003c/script>')
    expect(JSON.parse(serialized)).toEqual({
      '@type': 'Article',
      headline: '</script><script>alert(1)</script>',
    })
  })

  it('keeps zero or multiple schemas in array form', () => {
    expect(serializeStructuredData([])).toBe('[]')
    const serialized = serializeStructuredData([
      { '@type': 'Organization' },
      { '@type': 'WebSite' },
    ])

    expect(Array.isArray(JSON.parse(serialized))).toBe(true)
    expect(JSON.parse(serialized)).toHaveLength(2)
  })
})
