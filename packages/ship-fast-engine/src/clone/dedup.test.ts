import { describe, expect, it } from 'vitest'

import {
  applyDedup,
  dedupSections,
  hashSection,
  sectionsSimilar,
} from './dedup.ts'
import type { Section } from './segment.ts'

function section(kind: Section['kind'], html: string, startIndex = 0): Section {
  return { kind, html, startIndex, endIndex: startIndex }
}

describe('clone dedup — hashSection', () => {
  it('produces the same hash for structurally identical sections', () => {
    const a = section(
      'nav',
      '<nav><a href="/">Home</a><a href="/p">P</a></nav>',
    )
    const b = section(
      'nav',
      '<nav><a href="/">Home</a><a href="/p">P</a></nav>',
    )
    expect(hashSection(a)).toBe(hashSection(b))
  })

  it('namespaces by kind so same structure but different kind hashes differently', () => {
    const html = '<div class="wrap"><a href="/">x</a><a href="/y">y</a></div>'
    const nav = section('nav', html)
    const footer = section('footer', html)
    expect(hashSection(nav)).not.toBe(hashSection(footer))
  })

  it('hashes differently for different structure', () => {
    const a = section('nav', '<nav><a href="/">Home</a></nav>')
    const b = section(
      'nav',
      '<nav><a href="/">Home</a><a href="/p">P</a></nav>',
    )
    expect(hashSection(a)).not.toBe(hashSection(b))
  })

  it('ignores volatile class tokens (active/is-active/current/aria-current)', () => {
    const base = '<nav><a href="/">Home</a><a href="/p">P</a></nav>'
    const plain = section('nav', `<nav class="site-nav">${base}</nav>`)
    const active = section(
      'nav',
      `<nav class="site-nav active is-active current is-current selected is-selected">${base}</nav>`,
    )
    expect(hashSection(plain)).toBe(hashSection(active))
  })

  it('ignores aria-current attribute state on links', () => {
    const a = section(
      'nav',
      '<nav><a href="/" aria-current="page">Home</a><a href="/p">P</a></nav>',
    )
    const b = section(
      'nav',
      '<nav><a href="/">Home</a><a href="/p">P</a></nav>',
    )
    expect(hashSection(a)).toBe(hashSection(b))
  })

  it('neutralizes 4-digit years (current-year footers) so they do not affect the hash', () => {
    const y2024 = section(
      'footer',
      '<footer class="site-foot"><span>© 2024</span><a href="/">Home</a></footer>',
    )
    const y2026 = section(
      'footer',
      '<footer class="site-foot"><span>© 2026</span><a href="/">Home</a></footer>',
    )
    expect(hashSection(y2024)).toBe(hashSection(y2026))
  })

  it('is text-insensitive: different link labels with same structure hash equally', () => {
    const a = section(
      'nav',
      '<nav><a href="/">Home</a><a href="/p">P</a></nav>',
    )
    const b = section(
      'nav',
      '<nav><a href="/x">Other</a><a href="/y">Yyy</a></nav>',
    )
    expect(hashSection(a)).toBe(hashSection(b))
  })

  it('is stable (repeated calls return the same hash)', () => {
    const s = section('header', '<header><a href="/">H</a></header>')
    expect(hashSection(s)).toBe(hashSection(s))
  })

  it('returns a 16-char hex digest', () => {
    const s = section('content', '<div><p>hi</p></div>')
    expect(hashSection(s)).toMatch(/^[0-9a-f]{16}$/)
  })

  it('degrades gracefully on unparseable html (still namespaced by kind)', () => {
    const broken = section('nav', '<<<not html>>>')
    const other = section('footer', '<<<not html>>>')
    expect(hashSection(broken)).toMatch(/^[0-9a-f]{16}$/)
    // Different kinds still do not collide even on broken input.
    expect(hashSection(broken)).not.toBe(hashSection(other))
  })
})

describe('clone dedup — sectionsSimilar', () => {
  it('returns true for same kind + same structure', () => {
    const a = section('nav', '<nav><a href="/">Home</a></nav>')
    const b = section('nav', '<nav><a href="/">Home</a></nav>')
    expect(sectionsSimilar(a, b)).toBe(true)
  })

  it('returns false for different kind even with identical structure', () => {
    const html = '<div class="x"><a href="/">Home</a></div>'
    expect(sectionsSimilar(section('nav', html), section('footer', html))).toBe(
      false,
    )
  })

  it('returns false for same kind but different structure', () => {
    const a = section('nav', '<nav><a href="/">Home</a></nav>')
    const b = section(
      'nav',
      '<nav><a href="/">Home</a><a href="/p">P</a></nav>',
    )
    expect(sectionsSimilar(a, b)).toBe(false)
  })

  it('treats volatile-class variants of the same structure as similar', () => {
    const a = section('nav', '<nav class="menu"><a href="/">Home</a></nav>')
    const b = section(
      'nav',
      '<nav class="menu active"><a href="/">Home</a></nav>',
    )
    expect(sectionsSimilar(a, b)).toBe(true)
  })
})

describe('clone dedup — dedupSections', () => {
  it('groups sections by structural hash across pages', () => {
    const navHtml = '<nav><a href="/">Home</a><a href="/a">A</a></nav>'
    const footerHtml =
      '<footer><a href="/">Home</a><span>© 2024</span></footer>'
    const pageSections = new Map<string, Section[]>([
      [
        'https://site.com/',
        [section('nav', navHtml, 0), section('footer', footerHtml, 1)],
      ],
      [
        'https://site.com/about',
        [section('nav', navHtml, 0), section('footer', footerHtml, 1)],
      ],
    ])

    const result = dedupSections(pageSections)
    // Shared nav + footer collapse into 2 unique sections total.
    expect(result.uniqueSections.size).toBe(2)
    // Each unique section lists both pages.
    for (const data of result.uniqueSections.values()) {
      expect(data.pages).toEqual(
        expect.arrayContaining(['https://site.com/', 'https://site.com/about']),
      )
      expect(data.pages.length).toBe(2)
    }
    // Identity mapping: canonical hash === structural hash.
    for (const [hash, canonical] of result.sectionMapping.entries()) {
      expect(canonical).toBe(hash)
    }
  })

  it('keeps different content sections separate across pages', () => {
    const aboutBody =
      '<section><h2>About</h2><p>Our story and mission.</p></section>'
    const pricingBody = '<section><h2>Pricing</h2><p>$10/mo plan</p></section>'
    const navHtml = '<nav><a href="/">Home</a></nav>'
    const pageSections = new Map<string, Section[]>([
      ['https://site.com/', [section('nav', navHtml, 0)]],
      [
        'https://site.com/about',
        [section('nav', navHtml, 0), section('about', aboutBody, 1)],
      ],
      [
        'https://site.com/pricing',
        [section('nav', navHtml, 0), section('pricing', pricingBody, 1)],
      ],
    ])

    const result = dedupSections(pageSections)
    // nav (shared across 3) + about + pricing = 3 unique.
    expect(result.uniqueSections.size).toBe(3)
  })

  it('collapses shared nav/footer across many pages into one canonical entry', () => {
    const navHtml = '<nav><a href="/">Home</a><a href="/x">X</a></nav>'
    const footerHtml = '<footer><span>© 2024</span></footer>'
    const pages = new Map<string, Section[]>()
    for (let i = 0; i < 5; i++) {
      pages.set(`https://site.com/p${i}`, [
        section('nav', navHtml, 0),
        section('footer', footerHtml, 1),
      ])
    }
    const result = dedupSections(pages)
    expect(result.uniqueSections.size).toBe(2)
    for (const data of result.uniqueSections.values()) {
      expect(data.pages.length).toBe(5)
    }
  })

  it('handles an empty input map', () => {
    const result = dedupSections(new Map())
    expect(result.uniqueSections.size).toBe(0)
    expect(result.sectionMapping.size).toBe(0)
  })

  it('never merges sections of different kinds even with identical structure', () => {
    const html =
      '<div class="band"><a href="/">Home</a><a href="/x">X</a></div>'
    const pageSections = new Map<string, Section[]>([
      ['https://site.com/', [section('nav', html, 0)]],
      ['https://site.com/2', [section('footer', html, 0)]],
    ])
    const result = dedupSections(pageSections)
    expect(result.uniqueSections.size).toBe(2)
  })
})

describe('clone dedup — applyDedup', () => {
  it('removes duplicate sections within a page', () => {
    const navHtml = '<nav><a href="/">Home</a><a href="/x">X</a></nav>'
    const pageSections = new Map<string, Section[]>([
      [
        'https://site.com/',
        [
          section('nav', navHtml, 0),
          section('nav', navHtml, 1), // duplicate within the same page
        ],
      ],
    ])
    const dedup = dedupSections(pageSections)
    const result = applyDedup(pageSections, dedup)
    expect(result.get('https://site.com/')?.length).toBe(1)
  })

  it('uses the canonical section object from the dedup result', () => {
    const navHtml = '<nav><a href="/">Home</a></nav>'
    const canonicalNav = section('nav', navHtml, 0)
    const pageSections = new Map<string, Section[]>([
      ['https://site.com/', [canonicalNav]],
    ])
    const dedup = dedupSections(pageSections)
    const result = applyDedup(pageSections, dedup)
    const out = result.get('https://site.com/')
    expect(out?.[0]).toBe(canonicalNav)
  })

  it('preserves unique sections in order', () => {
    const navHtml = '<nav><a href="/">Home</a></nav>'
    const heroHtml = '<section class="hero"><h1>Welcome</h1></section>'
    const ctaHtml = '<section class="cta"><a href="/go">Go</a></section>'
    const pageSections = new Map<string, Section[]>([
      [
        'https://site.com/',
        [
          section('nav', navHtml, 0),
          section('hero', heroHtml, 1),
          section('cta', ctaHtml, 2),
        ],
      ],
    ])
    const dedup = dedupSections(pageSections)
    const result = applyDedup(pageSections, dedup)
    const out = result.get('https://site.com/')
    expect(out?.map((s) => s.kind)).toEqual(['nav', 'hero', 'cta'])
  })

  it('shares the canonical nav across pages (same object reference)', () => {
    const navHtml = '<nav><a href="/">Home</a><a href="/x">X</a></nav>'
    const pageSections = new Map<string, Section[]>([
      ['https://site.com/', [section('nav', navHtml, 0)]],
      ['https://site.com/about', [section('nav', navHtml, 0)]],
    ])
    const dedup = dedupSections(pageSections)
    const result = applyDedup(pageSections, dedup)
    const homeNav = result.get('https://site.com/')?.[0]
    const aboutNav = result.get('https://site.com/about')?.[0]
    expect(homeNav).toBeDefined()
    expect(aboutNav).toBeDefined()
    expect(homeNav).toBe(aboutNav)
  })

  it('handles an empty input map', () => {
    const dedup = dedupSections(new Map())
    const result = applyDedup(new Map(), dedup)
    expect(result.size).toBe(0)
  })
})
