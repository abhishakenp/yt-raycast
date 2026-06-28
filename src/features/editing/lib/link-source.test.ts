import { describe, expect, it } from 'vitest'

import { findHrefOccurrences, replaceHrefInSource } from './link-source'

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
