import { describe, expect, it } from 'vitest'

import {
  findHrefOccurrences,
  replaceHrefInSource,
  updateLinkInSource,
} from './link-source'

describe('replaceHrefInSource', () => {
  it('replaces href in string argument', () => {
    const source = `home_footer = FoodDeliveryFooter("name", "/old", "desc")`
    const result = replaceHrefInSource(source, '/old', '/new')
    expect(result.replaced).toBe(true)
    expect(result.source).toContain('/new')
    expect(result.source).not.toContain('"/old"')
  })

  it('replaces href in JSON object', () => {
    const source = `{"label":"Home","href":"/old"}`
    const result = replaceHrefInSource(source, '/old', '/new')
    expect(result.replaced).toBe(true)
    expect(result.source).toBe('{"label":"Home","href":"/new"}')
  })

  it('replaces second occurrence with occurrenceIndex=1', () => {
    const source = `FoodDeliveryNavbar("name", [{"label":"Home","href":"/old"}, {"label":"About","href":"/old"}])`
    const result = replaceHrefInSource(source, '/old', '/new', 1)
    expect(result.replaced).toBe(true)
    // First occurrence should be unchanged
    expect(result.source.indexOf('"/old"')).toBeLessThan(
      result.source.indexOf('"/new"'),
    )
  })

  it('occurrenceIndex out of range returns replaced=false', () => {
    const source = `FoodDeliveryFooter("name", "/old")`
    const result = replaceHrefInSource(source, '/old', '/new', 5)
    expect(result.replaced).toBe(false)
  })

  it('oldHref not found returns replaced=false', () => {
    const source = `FoodDeliveryFooter("name", "/other")`
    const result = replaceHrefInSource(source, '/old', '/new')
    expect(result.replaced).toBe(false)
  })

  it('handles single-quoted strings', () => {
    const source = `FoodDeliveryFooter('name', '/old', 'desc')`
    const result = replaceHrefInSource(source, '/old', '/new')
    expect(result.replaced).toBe(true)
    expect(result.source).toContain("'/new'")
  })

  it('empty newHref (link to #)', () => {
    const source = `{"label":"Home","href":"/old"}`
    const result = replaceHrefInSource(source, '/old', '#')
    expect(result.replaced).toBe(true)
    expect(result.source).toBe('{"label":"Home","href":"#"}')
  })

  it('special characters in href (anchor links)', () => {
    const source = `{"label":"CTA","href":"#home_cta"}`
    const result = replaceHrefInSource(source, '#home_cta', '#new_section')
    expect(result.replaced).toBe(true)
    expect(result.source).toContain('#new_section')
  })
})

describe('findHrefOccurrences', () => {
  it('counts single occurrence', () => {
    const source = `FoodDeliveryFooter("name", "/old")`
    expect(findHrefOccurrences(source, '/old')).toBe(1)
  })

  it('counts multiple occurrences', () => {
    const source = `FoodDeliveryNavbar("name", [{"href":"/old"}, {"href":"/old"}])`
    expect(findHrefOccurrences(source, '/old')).toBe(2)
  })

  it('returns 0 when not found', () => {
    const source = `FoodDeliveryFooter("name", "/other")`
    expect(findHrefOccurrences(source, '/old')).toBe(0)
  })

  it('counts both single and double quoted', () => {
    const source = `FoodDeliveryFooter("name", "/old", '/old')`
    expect(findHrefOccurrences(source, '/old')).toBe(2)
  })
})

describe('updateLinkInSource', () => {
  it('updates href, label text, target, and rel tokens in an object link', () => {
    const source = `links: [{ label: "Docs", href: "/docs" }]`
    const result = updateLinkInSource(source, {
      oldHref: '/docs',
      newHref: '/learn',
      oldText: 'Docs',
      newText: 'Learn',
      target: '_blank',
      rel: 'noopener noreferrer nofollow',
      occurrenceIndex: 0,
    })

    expect(result.replaced).toBe(true)
    expect(result.source).toContain('label: "Learn"')
    expect(result.source).toContain('href: "/learn"')
    expect(result.source).toContain('target: "_blank"')
    expect(result.source).toContain('rel: "noopener noreferrer nofollow"')
  })

  it('updates the linked text nearest the selected href occurrence', () => {
    const source = `FooterLink("Docs", "/docs")\nFooterLink("Docs", "/docs")`
    const result = updateLinkInSource(source, {
      oldHref: '/docs',
      newHref: '/pricing',
      oldText: 'Docs',
      newText: 'Pricing',
      occurrenceIndex: 1,
    })

    expect(result.replaced).toBe(true)
    expect(result.source).toBe(
      `FooterLink("Docs", "/docs")\nFooterLink("Pricing", "/pricing")`,
    )
  })

  it('persists removing new-tab and noindex attributes from an object link', () => {
    const source = `links: [{ label: "Docs", href: "/docs", target: "_blank", rel: "noopener noreferrer nofollow" }]`
    const result = updateLinkInSource(source, {
      oldHref: '/docs',
      newHref: '/docs',
      oldText: 'Docs',
      newText: 'Docs',
      target: null,
      rel: '',
      occurrenceIndex: 0,
    })

    expect(result.replaced).toBe(true)
    expect(result.source).toContain('href: "/docs"')
    expect(result.source).not.toContain('target:')
    expect(result.source).not.toContain('rel:')
  })

  it('updates target and rel attributes on HTML anchor tags', () => {
    const source = `<nav><a href="/docs">Docs</a></nav>`
    const result = updateLinkInSource(source, {
      oldHref: '/docs',
      newHref: '/docs',
      oldText: 'Docs',
      newText: 'Docs',
      target: '_blank',
      rel: 'noopener noreferrer nofollow',
      occurrenceIndex: 0,
    })

    expect(result.replaced).toBe(true)
    expect(result.source).toContain('<a href="/docs"')
    expect(result.source).toContain('target="_blank"')
    expect(result.source).toContain('rel="noopener noreferrer nofollow"')
  })

  it('removes only target and rel attributes from HTML anchor tags when requested', () => {
    const source = `<nav><a href="/docs" target="_blank" rel="noopener noreferrer nofollow">Docs</a></nav>`
    const result = updateLinkInSource(source, {
      oldHref: '/docs',
      newHref: '/docs',
      oldText: 'Docs',
      newText: 'Docs',
      target: null,
      rel: '',
      occurrenceIndex: 0,
    })

    expect(result.replaced).toBe(true)
    expect(result.source).toContain('<a href="/docs"')
    expect(result.source).not.toContain('target=')
    expect(result.source).not.toContain('rel=')
    expect(result.source).toContain('>Docs</a>')
  })
})
