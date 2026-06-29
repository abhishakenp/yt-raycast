import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { parseHTML } from 'linkedom'

// Crawler imports — assertPublicUrl is mocked so no real DNS resolution runs.
vi.mock('./security.ts', () => ({
  assertPublicUrl: vi.fn().mockResolvedValue(undefined),
  isAllowedScheme: (url: string) => {
    try {
      const p = new URL(url).protocol
      return p === 'http:' || p === 'https:'
    } catch {
      return false
    }
  },
}))

import { crawlSite, normalizeUrl } from './crawler.ts'
import {
  segmentPage,
  extractNavLinks,
  extractSectionText,
  type Section,
} from './segment.ts'
import { extractTokens, looksSerif, tokensToThemeVars } from './tokens.ts'
import { findFallbackBlock, generateFallbackSection } from './fallback.ts'
import {
  hashSection,
  sectionsSimilar,
  dedupSections,
  applyDedup,
} from './dedup.ts'
import { selfContainPage } from './verbatim.ts'
import type { CapturedPage, ExtractedTokens } from './types.ts'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCaptured(
  bodyHtml: string,
  headHtml = '',
  url = 'https://example.com/',
): CapturedPage {
  const html = `<!DOCTYPE html><html><head><title>Example</title>${headHtml}</head><body>${bodyHtml}</body></html>`
  return {
    url,
    normalizedUrl: normalizeUrl(url),
    html,
    computedStyles: new Map(),
    bboxes: new Map(),
    assetUrls: [],
  }
}

function stylesMap(
  entries: Array<[string, Record<string, string>]>,
): Map<string, Record<string, string>> {
  return new Map(entries)
}

// A mock fetch backed by an in-memory URL -> HTML table. Returns real Response
// objects so the crawler's response.ok / response.text() / response.url paths work.
function mockFetchTable(table: Record<string, string>): typeof fetch {
  return (async (input: string | URL | Request): Promise<Response> => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url
    const body = table[url]
    if (body === undefined) return new Response('', { status: 404 })
    return new Response(body, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    })
  }) as unknown as typeof fetch
}

const originalFetch = globalThis.fetch

// ===========================================================================
// 1–4. Crawler
// ===========================================================================

describe('crawler', () => {
  beforeEach(() => {
    // assertPublicUrl is already mocked at module level (no DNS).
  })
  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('respects maxDepth — only pages within depth are visited', async () => {
    // A(0) -> B(1) -> C(2) -> D(3) -> E(4). Pages carry >=40 chars of body
    // text so the crawler's content-signature dedup does not collapse them as
    // stubs (text < 40 chars collapses to a shared stub signature).
    const table: Record<string, string> = {
      'https://example.com/': `<html><body><h1>Home page welcome title</h1><p>This is the home page with enough body text to avoid stub collapse.</p><a href="https://example.com/b">Go to B</a></body></html>`,
      'https://example.com/b': `<html><body><h1>Page B heading title</h1><p>Page B has its own distinct body content that is long enough here.</p><a href="https://example.com/c">Go to C</a></body></html>`,
      'https://example.com/c': `<html><body><h1>Page C heading title</h1><p>Page C has unique body content different from all the other pages.</p><a href="https://example.com/d">Go to D</a></body></html>`,
      'https://example.com/d': `<html><body><h1>Page D heading title</h1><p>Page D body content that should never be reached with maxDepth two.</p><a href="https://example.com/e">Go to E</a></body></html>`,
      'https://example.com/e': `<html><body><h1>Page E heading title</h1><p>Page E body content that should never be reached at all.</p></body></html>`,
    }
    globalThis.fetch = mockFetchTable(table)

    const { pages } = await crawlSite('https://example.com/', {
      maxDepth: 2,
      maxPages: 50,
      concurrency: 1,
    })
    const visited = Array.from(pages.keys()).sort()
    // depth 0 (home), 1 (b), 2 (c) visited; c does not extract links (2 < 2 false).
    expect(visited).toEqual([
      'https://example.com/',
      'https://example.com/b',
      'https://example.com/c',
    ])
    expect(pages.has('https://example.com/d')).toBe(false)
    expect(pages.has('https://example.com/e')).toBe(false)
  })

  it('respects maxPages — crawling stops at the limit', async () => {
    // A chain A -> B -> C -> D -> E, depth allowed but page cap hits first.
    const table: Record<string, string> = {
      'https://example.com/': `<html><body><a href="https://example.com/b">B</a><a href="https://example.com/c">C</a><a href="https://example.com/d">D</a></body></html>`,
      'https://example.com/b': `<html><body><a href="https://example.com/e">E</a></body></html>`,
      'https://example.com/c': `<html><body><h1>C</h1></body></html>`,
      'https://example.com/d': `<html><body><h1>D</h1></body></html>`,
      'https://example.com/e': `<html><body><h1>E</h1></body></html>`,
    }
    globalThis.fetch = mockFetchTable(table)

    const { pages } = await crawlSite('https://example.com/', {
      maxPages: 2,
      maxDepth: 5,
      concurrency: 1,
    })
    expect(pages.size).toBeLessThanOrEqual(2)
    // Home is always the first page.
    expect(pages.has('https://example.com/')).toBe(true)
  })

  it('normalizes URLs (fragments dropped, query params sorted, www stripped, index.html collapsed)', () => {
    // Fragment dropped
    expect(normalizeUrl('https://example.com/page#section')).toBe(
      'https://example.com/page',
    )
    // Query params sorted alphabetically
    expect(normalizeUrl('https://example.com/?b=2&a=1')).toBe(
      'https://example.com/?a=1&b=2',
    )
    // www. stripped -> apex host
    expect(normalizeUrl('https://www.example.com/path')).toBe(
      'https://example.com/path',
    )
    // index.html collapsed to directory slash
    expect(normalizeUrl('https://example.com/docs/index.html')).toBe(
      'https://example.com/docs/',
    )
    // Trailing slash is intentionally NOT stripped (distinct resource)
    expect(normalizeUrl('https://example.com/a/')).toBe(
      'https://example.com/a/',
    )
    // Default port stripped
    expect(normalizeUrl('https://example.com:443/path')).toBe(
      'https://example.com/path',
    )
  })

  it('rejects non-http(s) schemes — javascript/mailto/tel links are never fetched', async () => {
    const fetched: string[] = []
    const table: Record<string, string> = {
      'https://example.com/': `<html><body>
        <a href="javascript:alert(1)">JS</a>
        <a href="mailto:hi@example.com">Mail</a>
        <a href="tel:+15551234">Tel</a>
        <a href="https://example.com/real">Real</a>
      </body></html>`,
      'https://example.com/real': `<html><body><h1>Real page</h1></body></html>`,
    }
    globalThis.fetch = (async (input: string | URL | Request) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url
      fetched.push(url)
      const body = table[url]
      if (body === undefined) return new Response('', { status: 404 })
      return new Response(body, { status: 200 })
    }) as unknown as typeof fetch

    await crawlSite('https://example.com/', {
      maxDepth: 1,
      maxPages: 10,
      concurrency: 1,
    })
    // Only http(s) URLs were fetched — no javascript/mailto/tel.
    expect(fetched.every((u) => u.startsWith('http'))).toBe(true)
    expect(fetched.some((u) => u.startsWith('javascript'))).toBe(false)
    expect(fetched.some((u) => u.startsWith('mailto'))).toBe(false)
    expect(fetched.some((u) => u.startsWith('tel'))).toBe(false)
  })
})

// ===========================================================================
// 5–7. Segment
// ===========================================================================

describe('segment', () => {
  it('categorizes sections correctly (hero, features, pricing, testimonials, faq, contact, footer, navbar)', () => {
    const heroHtml = `<section class="hero"><h1>Welcome</h1><p>Build faster.</p></section>`
    const featuresHtml = `<section class="features"><h2>Features</h2><div class="grid"><div>Fast</div><div>Easy</div></div></section>`
    const pricingHtml = `<section class="pricing"><h2>Pricing</h2><div>$10/mo</div><div>$20/mo</div></section>`
    const testimonialsHtml = `<section class="testimonials"><h2>Reviews</h2><blockquote>Great!</blockquote></section>`
    const faqHtml = `<section class="faq"><h2>FAQ</h2><p>Common questions answered here.</p></section>`
    const contactHtml = `<section class="contact"><h2>Contact</h2><form><input/></form></section>`
    const footerHtml = `<footer><p>&copy; 2024</p></footer>`
    const navHtml = `<nav class="navbar"><a href="/">Home</a><a href="/about">About</a></nav>`

    const page = makeCaptured(
      [
        navHtml,
        heroHtml,
        featuresHtml,
        pricingHtml,
        testimonialsHtml,
        faqHtml,
        contactHtml,
        footerHtml,
      ].join('\n'),
    )
    const sections = segmentPage(page)
    const kinds = sections.map((s) => s.kind)

    expect(kinds).toContain('nav')
    expect(kinds).toContain('hero')
    expect(kinds).toContain('features')
    expect(kinds).toContain('pricing')
    expect(kinds).toContain('testimonials')
    expect(kinds).toContain('contact')
    expect(kinds).toContain('footer')
    // FAQ has no dedicated kind; falls to generic 'content'.
    expect(kinds).toContain('content')
  })

  it('extracts nav links from navbar sections', () => {
    const { document } = parseHTML(
      `<nav class="navbar"><ul><li><a href="/">Home</a></li><li><a href="/pricing">Pricing</a></li><li><a href="/contact">Contact</a></li></ul></nav>`,
    )
    const nav = document.querySelector('nav')!
    const links = extractNavLinks(nav)
    expect(links).toEqual(['/', '/pricing', '/contact'])
  })

  it('extracts section text content', () => {
    // extractSectionText reads doc.body.textContent via linkedom; wrap in a
    // full document so the body is reliably populated.
    const html = `<html><body><section><h2>Title</h2><p>Body paragraph text.</p></section></body></html>`
    const text = extractSectionText(html)
    expect(text).toContain('Title')
    expect(text).toContain('Body paragraph text.')
  })
})

// ===========================================================================
// 8–9. Tokens
// ===========================================================================

describe('tokens', () => {
  it('extracts theme vars from HTML computed styles (background, foreground, primary, secondary, accent, border, radius, fontFamily)', () => {
    const tokens = extractTokens({
      url: 'https://example.com/',
      normalizedUrl: 'https://example.com/',
      html: '<html><body></body></html>',
      bboxes: new Map(),
      assetUrls: [],
      computedStyles: stylesMap([
        ['html', { 'background-color': '#ffffff', color: '#0f172a' }],
        [
          'body',
          {
            'background-color': '#ffffff',
            color: '#0f172a',
            'font-family': '"Inter", sans-serif',
            'border-color': '#e2e8f0',
            'border-radius': '8px',
            gap: '1rem',
          },
        ],
        [
          'button.primary',
          {
            'background-color': '#3b82f6',
            color: '#ffffff',
            'border-radius': '8px',
          },
        ],
        ['a.accent', { color: '#8b5cf6' }],
      ]),
    })

    expect(tokens.background).toBe('#ffffff')
    expect(tokens.foreground).toBe('#0f172a')
    expect(tokens.primary).toMatch(/^#[0-9a-f]{6}$/i)
    expect(tokens.secondary).toMatch(/^#[0-9a-f]{6}$/i)
    expect(tokens.accent).toMatch(/^#[0-9a-f]{6}$/i)
    expect(tokens.border).toMatch(/^#[0-9a-f]{6}$/i)
    expect(tokens.radius).toBe('8px')
    expect(tokens.fontFamily.toLowerCase()).toContain('inter')

    // Map to theme vars and verify keys.
    const vars = tokensToThemeVars(tokens)
    expect(vars['--background']).toBe('#ffffff')
    expect(vars['--foreground']).toBe('#0f172a')
    expect(vars['--primary']).toMatch(/^#[0-9a-f]{6}$/i)
    expect(vars['--radius']).toBe('8px')
    expect((vars['--font-sans'] || '').toLowerCase()).toContain('inter')
  })

  it('detects serif vs sans-serif fonts', () => {
    expect(looksSerif('"Playfair Display", serif')).toBe(true)
    expect(looksSerif('Georgia, "Times New Roman", serif')).toBe(true)
    expect(looksSerif('"Inter", sans-serif')).toBe(false)
    expect(looksSerif('system-ui, sans-serif')).toBe(false)
    expect(looksSerif('"Merriweather", serif')).toBe(true)
    expect(looksSerif('"Roboto", sans-serif')).toBe(false)
  })
})

// ===========================================================================
// 10. Convert — section kind -> OpenUI component role mapping
// ===========================================================================

describe('convert', () => {
  it('maps section kinds to correct OpenUI component roles', () => {
    // findFallbackBlock is the mapping convert.ts uses to record the nearest
    // native block role for each section kind.
    expect(findFallbackBlock('nav')).toBe('Navbar')
    expect(findFallbackBlock('hero')).toBe('Hero')
    expect(findFallbackBlock('features')).toBe('Features')
    expect(findFallbackBlock('pricing')).toBe('Pricing')
    expect(findFallbackBlock('testimonials')).toBe('Testimonials')
    expect(findFallbackBlock('cta')).toBe('Cta')
    expect(findFallbackBlock('footer')).toBe('Footer')
    expect(findFallbackBlock('contact')).toBe('Contact')
    expect(findFallbackBlock('about')).toBe('About')
    expect(findFallbackBlock('gallery')).toBe('Gallery')
    expect(findFallbackBlock('blog')).toBe('StoryGrid')
    expect(findFallbackBlock('content')).toBe('StoryGrid')
    expect(findFallbackBlock('unknown')).toBe('Hero')
  })
})

// ===========================================================================
// 11–12. Dedup
// ===========================================================================

describe('dedup', () => {
  function makeSection(
    kind: Section['kind'],
    html: string,
    index = 0,
  ): Section {
    return { kind, html, startIndex: index, endIndex: index }
  }

  it('detects similar sections (same content) — duplicates are deduped', () => {
    const navHtml = `<nav class="navbar"><a href="/">Home</a><a href="/about">About</a></nav>`
    const a = makeSection('nav', navHtml, 0)
    const b = makeSection('nav', navHtml, 1)
    // Same kind + same structural skeleton -> similar.
    expect(sectionsSimilar(a, b)).toBe(true)
    expect(hashSection(a)).toBe(hashSection(b))

    // Across pages: dedupSections collapses identical nav into one unique section.
    const pageSections = new Map<string, Section[]>([
      ['https://example.com/', [a]],
      ['https://example.com/about', [b]],
    ])
    const result = dedupSections(pageSections)
    // One unique nav section shared by both pages.
    expect(result.uniqueSections.size).toBe(1)
    const unique = Array.from(result.uniqueSections.values())[0]
    expect(unique.pages).toEqual([
      'https://example.com/',
      'https://example.com/about',
    ])

    // applyDedup keeps one nav per page (no intra-page dup).
    const deduped = applyDedup(pageSections, result)
    expect(deduped.get('https://example.com/')?.length).toBe(1)
    expect(deduped.get('https://example.com/about')?.length).toBe(1)
  })

  it('preserves unique sections', () => {
    const navA = makeSection(
      'nav',
      `<nav class="navbar"><a href="/">Home</a></nav>`,
      0,
    )
    const navB = makeSection(
      'nav',
      `<nav class="footer-nav"><a href="/legal">Legal</a></nav>`,
      0,
    )
    const hero = makeSection(
      'hero',
      `<section class="hero"><h1>Welcome</h1></section>`,
      1,
    )
    const pricing = makeSection(
      'pricing',
      `<section class="pricing"><h2>Pricing</h2></section>`,
      2,
    )

    // Different structural skeletons -> not similar.
    expect(sectionsSimilar(navA, navB)).toBe(false)
    // Different kinds -> never similar.
    expect(sectionsSimilar(hero, pricing)).toBe(false)

    const pageSections = new Map<string, Section[]>([
      ['https://example.com/', [navA, hero, pricing]],
      ['https://example.com/other', [navB]],
    ])
    const result = dedupSections(pageSections)
    // All four are structurally distinct -> four unique sections.
    expect(result.uniqueSections.size).toBe(4)
  })
})

// ===========================================================================
// 13. Fallback
// ===========================================================================

describe('fallback', () => {
  it('generates a fallback section for unknown content', () => {
    const dummyTokens = {} as ExtractedTokens
    const section = generateFallbackSection(
      'unknown',
      'https://example.com/',
      0,
      dummyTokens,
      '<section><h2>Some heading</h2><p>Some body text here.</p></section>',
    )
    expect(section.kind).toBe('unknown')
    expect(section.source).toBe('native-fallback')
    expect(section.program).toContain('section_unknown_0')
    // The fallback reconstructs real content from the DOM.
    expect(section.program).toContain('Some heading')
    expect(section.program).toContain('Some body text here.')
    // No root variable (contract: section fragment, not a page).
    expect(section.program).not.toMatch(/^\s*root\s*=/m)
  })

  it('generates canned copy when no recoverable content is supplied', () => {
    const dummyTokens = {} as ExtractedTokens
    const section = generateFallbackSection(
      'hero',
      'https://example.com/',
      0,
      dummyTokens,
      '',
    )
    expect(section.program).toContain('section_hero_0')
    // Canned hero heading from KIND_COPY.
    expect(section.program).toContain('Welcome')
    expect(section.program).not.toMatch(/^\s*root\s*=/m)
  })
})

// ===========================================================================
// 14. Verbatim
// ===========================================================================

describe('verbatim', () => {
  it('preserves original HTML structure (headings, paragraphs, lists, images)', async () => {
    const bodyHtml = `
      <h1>Main Title</h1>
      <p>Intro paragraph.</p>
      <ul><li>Item one</li><li>Item two</li></ul>
      <img src="/img/logo.png" alt="logo">
      <a href="/about">About</a>
    `
    const captured = makeCaptured(bodyHtml)
    // No external resources — fetchImpl only needed for stylesheets/fonts.
    const fetchImpl = (async () =>
      new Response('', { status: 404 })) as unknown as typeof fetch
    const out = await selfContainPage(captured, {
      finalUrl: 'https://example.com/',
      fetchImpl,
    })

    // Structure preserved.
    expect(out.html).toContain('Main Title')
    expect(out.html).toContain('Intro paragraph.')
    expect(out.html).toContain('Item one')
    expect(out.html).toContain('Item two')
    // Image src absolutized against finalUrl.
    expect(out.html).toContain('https://example.com/img/logo.png')
    // Internal anchor rewritten to clone-nav (href="#", data-clone-path set).
    expect(out.html).toContain('data-clone-path')
    // Scripts stripped, nav shim appended.
    expect(out.html).toContain('ship-clone-nav')
    expect(out.byteLength).toBeGreaterThan(0)
  })

  it('absolutizes relative URLs and strips site scripts', async () => {
    const bodyHtml = `<a href="/docs">Docs</a><script>alert(1)</script>`
    const captured = makeCaptured(bodyHtml)
    const fetchImpl = (async () =>
      new Response('', { status: 404 })) as unknown as typeof fetch
    const out = await selfContainPage(captured, {
      finalUrl: 'https://example.com/',
      fetchImpl,
    })

    // Site script removed.
    expect(out.html).not.toContain('alert(1)')
    // Relative anchor absolutized + rewritten to clone-nav.
    expect(out.html).toContain('https://example.com/docs')
    expect(out.html).toContain('data-clone-abs')
  })
})
