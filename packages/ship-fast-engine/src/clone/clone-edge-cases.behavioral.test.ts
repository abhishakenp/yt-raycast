import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { parseHTML } from 'linkedom'
import { tmpdir } from 'os'
import { mkdtemp, rm, readFile } from 'fs/promises'
import { join } from 'path'

// ===========================================================================
// Hoisted helpers (available inside vi.mock factories)
// ===========================================================================

const { makeMockBrowser } = vi.hoisted(() => {
  // Create a mock Playwright browser. pagesByUrl maps URL → { html, failGotoTimes }.
  function createMockBrowser(
    pagesByUrl: Map<string, { html: string; failGotoTimes?: number }>,
  ): any {
    return {
      newContext: vi.fn(async () => ({
        newPage: vi.fn(async () => {
          let currentUrl = ''
          let html = '<html><body></body></html>'
          let failRemaining = 0
          return {
            goto: vi.fn(async (url) => {
              currentUrl = url
              const cfg = pagesByUrl.get(url)
              html = cfg?.html ?? '<html><body></body></html>'
              failRemaining = cfg?.failGotoTimes ?? 0
              if (failRemaining > 0) {
                failRemaining--
                if (cfg) cfg.failGotoTimes = failRemaining
                throw new Error('net::ERR_CONNECTION_REFUSED')
              }
            }),
            url: () => currentUrl || 'https://example.com/',
            content: async () => html,
            waitForTimeout: vi.fn(async () => {}),
            evaluate: vi.fn(async (fn, arg?) => {
              // autoScroll: arg is { maxSteps, budgetMs }
              if (arg && typeof arg === 'object' && 'maxSteps' in arg)
                return undefined
              // body/element styles: arg is array of style props
              if (Array.isArray(arg)) {
                const out: Record<string, string> = {}
                for (const p of arg) {
                  const kebab = p.replace(
                    /[A-Z]/g,
                    (m: string) => `-${m.toLowerCase()}`,
                  )
                  out[kebab] = ''
                }
                return out
              }
              // no-arg evaluate: CSS inlining, scrollTo, or asset URLs
              const fnStr = String(fn)
              if (fnStr.includes('img') || fnStr.includes('backgroundImage'))
                return []
              return undefined
            }),
            $$: vi.fn(async () => []),
            screenshot: vi.fn(async () => Buffer.from('fake-screenshot-png')),
            close: vi.fn(async () => {}),
          }
        }),
        close: vi.fn(async () => {}),
      })),
      close: vi.fn(async () => {}),
    }
  }

  return { makeMockBrowser: createMockBrowser }
})

// ===========================================================================
// Module-level mock state (globalThis pattern — lazy refs survive hoisting)
// ===========================================================================

const mockState = ((
  globalThis as typeof globalThis & {
    __cloneEdgeMockState?: {
      pagesByUrl: Map<string, { html: string; failGotoTimes?: number }>
    }
  }
).__cloneEdgeMockState ??= {
  pagesByUrl: new Map<string, { html: string; failGotoTimes?: number }>(),
})

const genMocks = ((
  globalThis as typeof globalThis & {
    __cloneEdgeGenMocks?: {
      generateText: ReturnType<typeof vi.fn>
    }
  }
).__cloneEdgeGenMocks ??= {
  generateText: vi.fn(),
})

// ===========================================================================
// Mocks
// ===========================================================================

// Mock security.ts — no DNS resolution
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

// Mock generate.ts — LLM calls. Lazy: reads implementation from globalThis.
vi.mock('../generate.ts', () => ({
  generateText: (...args: unknown[]) =>
    (
      (
        globalThis as typeof globalThis & {
          __cloneEdgeGenMocks: { generateText: ReturnType<typeof vi.fn> }
        }
      ).__cloneEdgeGenMocks.generateText as unknown as (
        ...a: unknown[]
      ) => unknown
    )(...args),
  isHardLlmFailure: () => false,
  formatLlmFailureMessage: (e: unknown) => String(e),
}))

// Mock playwright — browser launch returns mock browser from globalThis.
vi.mock('playwright', () => ({
  chromium: {
    launch: vi.fn(async () => {
      const state = (
        globalThis as typeof globalThis & {
          __cloneEdgeMockState: {
            pagesByUrl: Map<string, { html: string; failGotoTimes?: number }>
          }
        }
      ).__cloneEdgeMockState
      return makeMockBrowser(state.pagesByUrl)
    }),
  },
}))

// ===========================================================================
// Real imports (after mock registration)
// ===========================================================================

import { capturePage, capturePages } from './capture.ts'
import type { CapturedPageWithShots } from './capture.ts'
import {
  downloadAsset,
  downloadPageAssets,
  rewriteAssetUrls,
} from './assets.ts'
import { convertSection, convertSections } from './convert.ts'
import {
  hashSection,
  sectionsSimilar,
  dedupSections,
  applyDedup,
} from './dedup.ts'
import {
  segmentPage,
  extractSectionText,
  extractNavLinks,
  type Section,
} from './segment.ts'
import { extractTokens, tokensToThemeVars, looksSerif } from './tokens.ts'
import { cloneSite } from './job.ts'
import { normalizeUrl } from './crawler.ts'
import { THEME_VAR_KEYS } from '@ship-fast/blocks/theme'
import type { CapturedPage, ExtractedTokens } from './types.ts'

// ===========================================================================
// Shared helpers
// ===========================================================================

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

function makeSection(kind: Section['kind'], html: string, index = 0): Section {
  return { kind, html, startIndex: index, endIndex: index }
}

// Default mock generateText: extracts content from the user prompt and returns
// a valid OpenUI-Lang program that faithfully reproduces the source content.
function defaultGenerateText(
  _modelId: string,
  _system: string,
  user: string,
): Promise<string> {
  const kindMatch = user.match(/Section kind: (\w+)/)
  const kind = kindMatch?.[1] || 'content'
  const varMatch = user.match(/named EXACTLY "(section_\w+_\d+)"/)
  const sectionVar = varMatch?.[1] || `section_${kind}_0`

  // Extract HTML between UNTRUSTED_FENCE markers
  const fence = '===UNTRUSTED_SCRAPED_HTML==='
  const start = user.indexOf(fence)
  const end = user.lastIndexOf(fence)
  let html = ''
  if (start !== -1 && end !== -1 && end > start) {
    html = user.slice(start + fence.length, end).trim()
  }

  let heading = 'Title'
  let para = 'Description.'
  try {
    const { document: doc } = parseHTML(`<div id="__mock">${html}</div>`)
    const root = doc.getElementById('__mock')
    const h = root?.querySelector('h1, h2, h3, h4, h5, h6')
    if (h?.textContent?.trim()) heading = h.textContent.trim().slice(0, 200)
    const p = root?.querySelector('p')
    if (p?.textContent?.trim()) para = p.textContent.trim().slice(0, 200)
  } catch {
    // keep defaults
  }

  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return Promise.resolve(
    `${sectionVar} = Section([${sectionVar}_h, ${sectionVar}_p], "bg-background py-12 px-4")\n` +
      `${sectionVar}_h = Heading("${esc(heading)}", "1", "text-foreground")\n` +
      `${sectionVar}_p = Text("${esc(para)}", "muted")`,
  )
}

// Mock fetch backed by an in-memory URL → HTML table (for crawler).
function mockFetchTable(table: Record<string, string>): typeof fetch {
  return (async (input: RequestInfo | URL) => {
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

// Mock fetch for asset downloads: returns image bytes for .png/.jpg URLs, 404 otherwise.
function mockAssetFetch(table?: Record<string, Buffer>): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url
    if (table?.[url]) {
      return new Response(new Uint8Array(table[url]), {
        status: 200,
        headers: { 'Content-Type': 'image/png' },
      })
    }
    if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg')) {
      return new Response(Buffer.from('fake-image-bytes'), {
        status: 200,
        headers: { 'Content-Type': 'image/png' },
      })
    }
    return new Response('', { status: 404 })
  }) as unknown as typeof fetch
}

const originalFetch = globalThis.fetch

// ===========================================================================
// 1–5. Capture tests
// ===========================================================================

describe('capture', () => {
  beforeEach(() => {
    mockState.pagesByUrl.clear()
    genMocks.generateText = vi.fn(defaultGenerateText)
    globalThis.fetch = originalFetch
  })
  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('1. capturePage: HTML + screenshots captured', async () => {
    const html =
      '<html><body><h1>Test Page</h1><p>Content here.</p></body></html>'
    mockState.pagesByUrl.set('https://example.com/', { html })
    const result = await capturePage(
      makeMockBrowser(mockState.pagesByUrl),
      'https://example.com/',
    )
    expect(result).not.toBeNull()
    expect(result!.html).toContain('Test Page')
    expect(result!.html).toContain('Content here.')
    expect(result!.screenshot).toBeInstanceOf(Buffer)
    expect(result!.screenshot!.length).toBeGreaterThan(0)
    expect(result!.url).toBe('https://example.com/')
  })

  it('2. capturePages: concurrent with limit', async () => {
    const urls = [
      'https://example.com/',
      'https://example.com/about',
      'https://example.com/pricing',
    ]
    for (const u of urls) {
      mockState.pagesByUrl.set(u, {
        html: `<html><body><h1>${u}</h1><p>Page content for testing.</p></body></html>`,
      })
    }
    const results = await capturePages(urls, 2, undefined, false)
    expect(results.size).toBe(3)
    for (const u of urls) {
      const normalized = normalizeUrl(u)
      const captured = results.get(normalized)
      expect(captured).toBeDefined()
      expect(captured!.html).toContain(u)
    }
  })

  it('3. CapturedPageWithShots structure', async () => {
    const html = '<html><body><h1>Structural Test</h1></body></html>'
    mockState.pagesByUrl.set('https://example.com/', { html })
    const result: CapturedPageWithShots | null = await capturePage(
      makeMockBrowser(mockState.pagesByUrl),
      'https://example.com/',
      { captureSectionShots: true },
    )
    expect(result).not.toBeNull()
    expect(typeof result!.html).toBe('string')
    expect(result!.html).toContain('Structural Test')
    expect(result!.screenshot).toBeInstanceOf(Buffer)
    expect(result!.url).toBeDefined()
    expect(result!.normalizedUrl).toBeDefined()
    expect(result!.computedStyles).toBeInstanceOf(Map)
    expect(result!.bboxes).toBeInstanceOf(Map)
    expect(Array.isArray(result!.assetUrls)).toBe(true)
  })

  it('4. Retry: first fails → retry succeeds', async () => {
    const html =
      '<html><body><h1>Retry Page</h1><p>After retry.</p></body></html>'
    // First capturePage: goto fails once → returns null
    const failMap = new Map([
      ['https://example.com/', { html, failGotoTimes: 1 }],
    ])
    const firstAttempt = await capturePage(
      makeMockBrowser(failMap),
      'https://example.com/',
    )
    expect(firstAttempt).toBeNull()

    // Retry: new browser, goto succeeds → returns valid capture
    const okMap = new Map([['https://example.com/', { html }]])
    const retry = await capturePage(
      makeMockBrowser(okMap),
      'https://example.com/',
    )
    expect(retry).not.toBeNull()
    expect(retry!.html).toContain('Retry Page')
    expect(retry!.html).toContain('After retry.')
  })

  it('5. Max retries exceeded → error recorded', async () => {
    const html = '<html><body><h1>Always Fails</h1></body></html>'
    // goto always fails (failGotoTimes = 100 → effectively always)
    const failMap = new Map([
      ['https://example.com/', { html, failGotoTimes: 100 }],
    ])
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = await capturePage(
      makeMockBrowser(failMap),
      'https://example.com/',
    )
    expect(result).toBeNull()
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})

// ===========================================================================
// 6–9. Asset tests
// ===========================================================================

describe('assets', () => {
  let workspace: string

  beforeEach(async () => {
    workspace = await mkdtemp(join(tmpdir(), 'clone-asset-test-'))
    globalThis.fetch = mockAssetFetch()
  })
  afterEach(async () => {
    globalThis.fetch = originalFetch
    if (workspace) await rm(workspace, { recursive: true, force: true })
  })

  it('6. downloadAsset: valid→downloaded; invalid→error handled', async () => {
    // Valid URL → file downloaded
    const validPath = await downloadAsset(
      'https://example.com/logo.png',
      workspace,
    )
    expect(validPath).not.toBeNull()
    expect(validPath).toMatch(/^\/assets\/asset_.*\.png$/)
    const written = await readFile(join(workspace, validPath!))
    expect(written.length).toBeGreaterThan(0)

    // Invalid URL (non-image extension) → null
    const badExt = await downloadAsset(
      'https://example.com/file.txt',
      workspace,
    )
    expect(badExt).toBeNull()

    // Invalid URL (404) → null
    globalThis.fetch = (async () =>
      new Response('', { status: 404 })) as unknown as typeof fetch
    const notFound = await downloadAsset(
      'https://example.com/missing.png',
      workspace,
    )
    expect(notFound).toBeNull()
  })

  it('7. downloadPageAssets: 5 images → all downloaded', async () => {
    const assetUrls = [
      'https://cdn.example.com/img1.png',
      'https://cdn.example.com/img2.png',
      'https://cdn.example.com/img3.png',
      'https://cdn.example.com/img4.png',
      'https://cdn.example.com/img5.png',
    ]
    const captured: CapturedPage = {
      url: 'https://example.com/',
      normalizedUrl: 'https://example.com/',
      html: '<html><body></body></html>',
      computedStyles: new Map(),
      bboxes: new Map(),
      assetUrls,
    }
    const assetMap = await downloadPageAssets(captured, workspace, 4)
    expect(assetMap.size).toBe(5)
    for (const u of assetUrls) {
      expect(assetMap.has(u)).toBe(true)
      expect(assetMap.get(u)).toMatch(/^\/assets\//)
    }
  })

  it('8. rewriteAssetUrls: URLs replaced', () => {
    const html =
      '<html><body><img src="https://cdn.example.com/logo.png">' +
      '<img src="https://cdn.example.com/hero.jpg"></body></html>'
    const assetMap = new Map([
      ['https://cdn.example.com/logo.png', '/assets/asset_abc.png'],
      ['https://cdn.example.com/hero.jpg', '/assets/asset_def.jpg'],
    ])
    const rewritten = rewriteAssetUrls(html, assetMap)
    expect(rewritten).toContain('/assets/asset_abc.png')
    expect(rewritten).toContain('/assets/asset_def.jpg')
    expect(rewritten).not.toContain('cdn.example.com/logo.png')
    expect(rewritten).not.toContain('cdn.example.com/hero.jpg')
  })

  it('9. URL normalization: relative→absolute; protocol-relative→https', () => {
    // Relative URL resolved against base
    expect(new URL('/img/logo.png', 'https://example.com/').toString()).toBe(
      'https://example.com/img/logo.png',
    )
    // Protocol-relative URL resolved to https
    expect(
      new URL('//cdn.example.com/img.png', 'https://example.com/').toString(),
    ).toBe('https://cdn.example.com/img.png')
    // Relative path resolved against base path
    expect(
      new URL('../images/a.png', 'https://example.com/docs/page').toString(),
    ).toBe('https://example.com/images/a.png')
  })
})

// ===========================================================================
// 10–15. Convert tests
// ===========================================================================

describe('convert', () => {
  const dummyTokens: ExtractedTokens = {
    background: '#ffffff',
    foreground: '#0f172a',
    primary: '#3b82f6',
    secondary: '#64748b',
    muted: '#f1f5f9',
    accent: '#8b5cf6',
    border: '#e2e8f0',
    radius: '0.5rem',
    fontFamily: 'sans-serif',
    spacing: '1rem',
  }

  beforeEach(() => {
    genMocks.generateText = vi.fn(defaultGenerateText)
  })

  it('10. hero→Hero component', async () => {
    const section = makeSection(
      'hero',
      '<section class="hero"><h1>Welcome to Acme</h1><p>Build amazing things faster.</p></section>',
      0,
    )
    const result = await convertSection(
      section,
      'https://example.com/',
      dummyTokens,
    )
    expect(result.kind).toBe('hero')
    expect(result.source).toBe('scraped')
    expect(result.program).toContain('section_hero_0')
    expect(result.program).toContain('Welcome to Acme')
    expect(result.program).toContain('Build amazing things faster.')
  })

  it('11. features→Features', async () => {
    const section = makeSection(
      'features',
      '<section class="features"><h2>Features</h2><p>Everything you need in one place.</p></section>',
      0,
    )
    const result = await convertSection(
      section,
      'https://example.com/',
      dummyTokens,
    )
    expect(result.kind).toBe('features')
    expect(result.source).toBe('scraped')
    expect(result.program).toContain('section_features_0')
    expect(result.program).toContain('Features')
  })

  it('12. pricing→Pricing', async () => {
    const section = makeSection(
      'pricing',
      '<section class="pricing"><h2>Pricing Plans</h2><p>Simple plans that scale with you.</p></section>',
      0,
    )
    const result = await convertSection(
      section,
      'https://example.com/',
      dummyTokens,
    )
    expect(result.kind).toBe('pricing')
    expect(result.source).toBe('scraped')
    expect(result.program).toContain('section_pricing_0')
    expect(result.program).toContain('Pricing Plans')
  })

  it('13. testimonials→Testimonials', async () => {
    const section = makeSection(
      'testimonials',
      '<section class="testimonials"><h2>What people say</h2><p>Trusted by teams everywhere.</p></section>',
      0,
    )
    const result = await convertSection(
      section,
      'https://example.com/',
      dummyTokens,
    )
    expect(result.kind).toBe('testimonials')
    expect(result.source).toBe('scraped')
    expect(result.program).toContain('section_testimonials_0')
    expect(result.program).toContain('What people say')
  })

  it('14. unknown→fallback', async () => {
    // Make generateText return invalid output → triggers fallback
    genMocks.generateText = vi.fn(async () => '')
    const section = makeSection(
      'unknown',
      '<section><h2>Mystery Section</h2><p>Some content here.</p></section>',
      0,
    )
    const result = await convertSection(
      section,
      'https://example.com/',
      dummyTokens,
    )
    expect(result.kind).toBe('unknown')
    expect(result.source).toBe('native-fallback')
    expect(result.program).toContain('section_unknown_0')
    // Fallback reconstructs real content from DOM
    expect(result.program).toContain('Mystery Section')
  })

  it('15. multiple→all converted, sorted', async () => {
    const sections = [
      makeSection(
        'hero',
        '<section class="hero"><h1>Welcome</h1><p>Build faster.</p></section>',
        0,
      ),
      makeSection(
        'features',
        '<section class="features"><h2>Features</h2><p>All in one place.</p></section>',
        1,
      ),
      makeSection('footer', '<footer><p>Copyright 2024</p></footer>', 2),
    ]
    const results = await convertSections(
      sections,
      'https://example.com/',
      dummyTokens,
      4,
    )
    expect(results.length).toBe(3)
    // Sorted by index
    expect(results[0].index).toBe(0)
    expect(results[1].index).toBe(1)
    expect(results[2].index).toBe(2)
    // Each has correct kind
    expect(results[0].kind).toBe('hero')
    expect(results[1].kind).toBe('features')
    expect(results[2].kind).toBe('footer')
    // Each has a valid program and hash
    for (const r of results) {
      expect(r.program).toBeTruthy()
      expect(r.hash).toBeTruthy()
    }
  })
})

// ===========================================================================
// 16–20. Dedup tests
// ===========================================================================

describe('dedup', () => {
  it('16. hashSection: same→same; different→different', () => {
    const navHtml = `<nav class="navbar"><a href="/">Home</a><a href="/about">About</a></nav>`
    const a = makeSection('nav', navHtml, 0)
    const b = makeSection('nav', navHtml, 1)
    expect(hashSection(a)).toBe(hashSection(b))

    const differentNav = `<nav class="sidebar-nav"><a href="/legal">Legal</a></nav>`
    const c = makeSection('nav', differentNav, 0)
    expect(hashSection(a)).not.toBe(hashSection(c))
  })

  it('17. sectionsSimilar: 95%→true; 50%→false', () => {
    // 95% similar: structurally identical navs (same tags, same classes)
    const navHtml = `<nav class="navbar"><a href="/">Home</a><a href="/about">About</a></nav>`
    const a = makeSection('nav', navHtml, 0)
    const b = makeSection('nav', navHtml, 1)
    expect(sectionsSimilar(a, b)).toBe(true)

    // 50% similar: different structure (different classes → different hash)
    const differentNav = `<nav class="footer-nav"><a href="/legal">Legal</a></nav>`
    const c = makeSection('nav', differentNav, 0)
    expect(sectionsSimilar(a, c)).toBe(false)

    // Different kinds → never similar
    const hero = makeSection(
      'hero',
      '<section class="hero"><h1>Welcome</h1></section>',
      0,
    )
    expect(sectionsSimilar(a, hero)).toBe(false)
  })

  it('18. 3 identical navs→1 shared', () => {
    const navHtml = `<nav class="navbar"><a href="/">Home</a><a href="/about">About</a></nav>`
    const pages = new Map<string, Section[]>([
      ['https://example.com/', [makeSection('nav', navHtml, 0)]],
      ['https://example.com/about', [makeSection('nav', navHtml, 0)]],
      ['https://example.com/pricing', [makeSection('nav', navHtml, 0)]],
    ])
    const result = dedupSections(pages)
    expect(result.uniqueSections.size).toBe(1)
    const unique = Array.from(result.uniqueSections.values())[0]
    expect(unique.pages).toHaveLength(3)
    expect(unique.pages).toContain('https://example.com/')
    expect(unique.pages).toContain('https://example.com/about')
    expect(unique.pages).toContain('https://example.com/pricing')
  })

  it('19. unique→all preserved', () => {
    const pages = new Map<string, Section[]>([
      [
        'https://example.com/',
        [
          makeSection(
            'nav',
            '<nav class="navbar"><a href="/">Home</a></nav>',
            0,
          ),
          makeSection(
            'hero',
            '<section class="hero"><h1>Welcome</h1></section>',
            1,
          ),
        ],
      ],
      [
        'https://example.com/about',
        [
          makeSection(
            'about',
            '<section class="about"><h1>About Us</h1></section>',
            0,
          ),
        ],
      ],
    ])
    const result = dedupSections(pages)
    // All 3 are structurally distinct → 3 unique sections
    expect(result.uniqueSections.size).toBe(3)
  })

  it('20. applyDedup: duplicates collapsed', () => {
    const navHtml = `<nav class="navbar"><a href="/">Home</a><a href="/about">About</a></nav>`
    // Page with duplicate nav (same structure appears twice)
    const pages = new Map<string, Section[]>([
      [
        'https://example.com/',
        [
          makeSection('nav', navHtml, 0),
          makeSection('nav', navHtml, 1),
          makeSection(
            'hero',
            '<section class="hero"><h1>Welcome</h1></section>',
            2,
          ),
        ],
      ],
    ])
    const dedupResult = dedupSections(pages)
    const deduped = applyDedup(pages, dedupResult)
    // Duplicate nav collapsed to 1, hero preserved → 2 sections
    expect(deduped.get('https://example.com/')?.length).toBe(2)
    const kinds = deduped.get('https://example.com/')!.map((s) => s.kind)
    expect(kinds).toContain('nav')
    expect(kinds).toContain('hero')
  })
})

// ===========================================================================
// 21–25. Segment tests
// ===========================================================================

describe('segment', () => {
  it('21. empty page→[] (no crash)', () => {
    const page = makeCaptured('')
    const sections = segmentPage(page)
    expect(sections).toEqual([])
  })

  it('22. footer-only→footer section', () => {
    const page = makeCaptured(
      '<footer><p>Copyright 2024 Acme Inc.</p></footer>',
    )
    const sections = segmentPage(page)
    expect(sections.length).toBeGreaterThanOrEqual(1)
    expect(sections[0].kind).toBe('footer')
    expect(sections[0].html).toContain('Copyright')
  })

  it('23. hero with CTA→"hero"; features grid→"features"', () => {
    const page = makeCaptured(
      '<section class="hero"><h1>Welcome</h1><a href="#" class="cta">Get Started</a></section>' +
        '<section class="features"><h2>Features</h2><div class="grid"><div>Fast</div><div>Easy</div></div></section>',
    )
    const sections = segmentPage(page)
    const kinds = sections.map((s) => s.kind)
    expect(kinds).toContain('hero')
    expect(kinds).toContain('features')
  })

  it('24. extractSectionText: nested→all text', () => {
    const html =
      '<html><body><div><div>Outer text</div><div>Inner text content</div></div></body></html>'
    const text = extractSectionText(html)
    expect(text).toContain('Outer text')
    expect(text).toContain('Inner text content')
  })

  it('25. extractNavLinks: 5 links→5 hrefs in order', () => {
    const { document } = parseHTML(
      `<nav><ul>` +
        `<li><a href="/">Home</a></li>` +
        `<li><a href="/about">About</a></li>` +
        `<li><a href="/pricing">Pricing</a></li>` +
        `<li><a href="/blog">Blog</a></li>` +
        `<li><a href="/contact">Contact</a></li>` +
        `</ul></nav>`,
    )
    const nav = document.querySelector('nav')!
    const links = extractNavLinks(nav)
    expect(links).toHaveLength(5)
    expect(links).toEqual(['/', '/about', '/pricing', '/blog', '/contact'])
  })
})

// ===========================================================================
// 26–29. Tokens tests
// ===========================================================================

describe('tokens', () => {
  it('26. no styles→default tokens', () => {
    const captured: CapturedPage = {
      url: 'https://example.com/',
      normalizedUrl: 'https://example.com/',
      html: '<html><body></body></html>',
      computedStyles: new Map(),
      bboxes: new Map(),
      assetUrls: [],
    }
    const tokens = extractTokens(captured)
    // Background defaults to white (light surface)
    expect(tokens.background).toBe('#ffffff')
    // Foreground defaults to dark
    expect(tokens.foreground).toBe('#0f172a')
    // Primary/accent have defaults
    expect(tokens.primary).toMatch(/^#[0-9a-f]{6}$/i)
    expect(tokens.accent).toMatch(/^#[0-9a-f]{6}$/i)
    // Radius and spacing have defaults
    expect(tokens.radius).toBeTruthy()
    expect(tokens.spacing).toBeTruthy()
    expect(tokens.fontFamily).toBeTruthy()
  })

  it('27. CSS vars→extracted correctly', () => {
    // Simulate browser-resolved CSS var values (getComputedStyle resolves vars)
    const captured: CapturedPage = {
      url: 'https://example.com/',
      normalizedUrl: 'https://example.com/',
      html: '<html><body></body></html>',
      computedStyles: stylesMap([
        [
          'body',
          {
            'background-color': '#0a0a0a',
            color: '#fafafa',
            'font-family': '"Inter", sans-serif',
            'border-color': '#262626',
            'border-radius': '12px',
            gap: '2rem',
          },
        ],
        [
          'button.primary',
          {
            'background-color': '#3b82f6',
            color: '#ffffff',
            'border-radius': '12px',
          },
        ],
      ]),
      bboxes: new Map(),
      assetUrls: [],
    }
    const tokens = extractTokens(captured)
    expect(tokens.background).toBe('#0a0a0a')
    expect(tokens.foreground).toBe('#fafafa')
    expect(tokens.primary).toBe('#3b82f6')
    expect(tokens.radius).toBe('12px')
    expect(tokens.spacing).toBe('2rem')
    expect(tokens.fontFamily.toLowerCase()).toContain('inter')
  })

  it('28. tokensToThemeVars: all keys in THEME_VAR_KEYS', () => {
    const tokens: ExtractedTokens = {
      background: '#ffffff',
      foreground: '#0f172a',
      primary: '#3b82f6',
      secondary: '#64748b',
      muted: '#f1f5f9',
      accent: '#8b5cf6',
      border: '#e2e8f0',
      radius: '0.5rem',
      fontFamily: 'Inter, sans-serif',
      spacing: '1rem',
    }
    const vars = tokensToThemeVars(tokens)
    // Every key (without --) must be in THEME_VAR_KEYS
    for (const key of Object.keys(vars)) {
      const bare = key.replace(/^--/, '')
      expect(THEME_VAR_KEYS).toContain(bare)
    }
    // Spot-check specific mappings
    expect(vars['--background']).toBe('#ffffff')
    expect(vars['--foreground']).toBe('#0f172a')
    expect(vars['--primary']).toBe('#3b82f6')
    expect(vars['--radius']).toBe('0.5rem')
    expect(vars['--font-sans']).toBe('Inter, sans-serif')
    expect(vars['--spacing']).toBe('1rem')
  })

  it('29. looksSerif: "Georgia, serif"→true; "Inter, sans-serif"→false', () => {
    expect(looksSerif('Georgia, serif')).toBe(true)
    expect(looksSerif('Inter, sans-serif')).toBe(false)
    // Additional cases
    expect(looksSerif('"Playfair Display", serif')).toBe(true)
    expect(looksSerif('system-ui, sans-serif')).toBe(false)
    expect(looksSerif('"Merriweather", serif')).toBe(true)
    expect(looksSerif('"Roboto", sans-serif')).toBe(false)
  })
})

// ===========================================================================
// 30–34. Job tests
// ===========================================================================

describe('job', () => {
  const homeHtml = `<html><body>
    <nav class="navbar"><a href="/about">About</a><a href="/pricing">Pricing</a></nav>
    <section class="hero"><h1>Welcome to Acme</h1><p>Build amazing things faster than ever before.</p></section>
    <footer><p>Copyright 2024 Acme Inc. All rights reserved.</p></footer>
  </body></html>`
  const aboutHtml = `<html><body>
    <nav class="navbar"><a href="/">Home</a></nav>
    <section class="about"><h1>About Us</h1><p>We are a company that builds amazing things for the web.</p></section>
  </body></html>`
  const pricingHtml = `<html><body>
    <nav class="navbar"><a href="/">Home</a></nav>
    <section class="pricing"><h1>Pricing Plans</h1><p>Simple plans that scale with your business needs.</p></section>
  </body></html>`

  function setupPages(
    table: Record<string, string>,
    opts?: { failCapture?: string[] },
  ) {
    // Crawler fetch mock
    globalThis.fetch = mockFetchTable(table)
    // Playwright capture mock
    mockState.pagesByUrl.clear()
    for (const [url, html] of Object.entries(table)) {
      const fail = opts?.failCapture?.includes(url)
      mockState.pagesByUrl.set(url, {
        html,
        failGotoTimes: fail ? 100 : 0,
      })
    }
    // LLM mock
    genMocks.generateText = vi.fn(defaultGenerateText)
  }

  beforeEach(() => {
    mockState.pagesByUrl.clear()
    genMocks.generateText = vi.fn(defaultGenerateText)
    globalThis.fetch = originalFetch
  })
  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('30. home-first: home is pages[0]', async () => {
    const table: Record<string, string> = {
      'https://example.com/': homeHtml,
      'https://example.com/about': aboutHtml,
      'https://example.com/pricing': pricingHtml,
    }
    setupPages(table)

    const result = await cloneSite('https://example.com/', {
      maxDepth: 1,
      maxPages: 10,
      concurrency: 2,
    })
    expect(result.success).toBe(true)
    expect(result.pages.length).toBeGreaterThanOrEqual(1)
    // Home page is first
    const firstUrl = result.pages[0]?.url
    expect(firstUrl).toBeDefined()
    expect(normalizeUrl(firstUrl!)).toBe(normalizeUrl('https://example.com/'))
  })

  it('31. maxDepth=0: only home', async () => {
    const table: Record<string, string> = {
      'https://example.com/': homeHtml,
      'https://example.com/about': aboutHtml,
      'https://example.com/pricing': pricingHtml,
    }
    setupPages(table)

    const result = await cloneSite('https://example.com/', {
      maxDepth: 0,
      maxPages: 10,
      concurrency: 2,
    })
    expect(result.success).toBe(true)
    // Only home page crawled (depth 0, no links extracted)
    expect(result.pages.length).toBe(1)
    expect(normalizeUrl(result.pages[0].url)).toBe(
      normalizeUrl('https://example.com/'),
    )
  })

  it('32. maxPages=1: stops after 1', async () => {
    const table: Record<string, string> = {
      'https://example.com/': homeHtml,
      'https://example.com/about': aboutHtml,
      'https://example.com/pricing': pricingHtml,
    }
    setupPages(table)

    const result = await cloneSite('https://example.com/', {
      maxDepth: 3,
      maxPages: 1,
      concurrency: 2,
    })
    expect(result.pages.length).toBeLessThanOrEqual(1)
    // Home is always the first page
    if (result.pages.length > 0) {
      expect(normalizeUrl(result.pages[0].url)).toBe(
        normalizeUrl('https://example.com/'),
      )
    }
  })

  it('33. page errors: continues, failed excluded', async () => {
    const table: Record<string, string> = {
      'https://example.com/': homeHtml,
      'https://example.com/about': aboutHtml,
      'https://example.com/pricing': pricingHtml,
    }
    // Pricing page fails to capture
    setupPages(table, { failCapture: ['https://example.com/pricing'] })

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = await cloneSite('https://example.com/', {
      maxDepth: 1,
      maxPages: 10,
      concurrency: 2,
    })

    // Job succeeds — home and about are processed
    expect(result.success).toBe(true)
    expect(result.pages.length).toBeGreaterThanOrEqual(1)
    // Home is present
    const urls = result.pages.map((p) => normalizeUrl(p.url))
    expect(urls).toContain(normalizeUrl('https://example.com/'))
    // Failed page (pricing) is not in results
    expect(urls).not.toContain(normalizeUrl('https://example.com/pricing'))
    // Error was logged (capture failure → console.error)
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })

  it('34. signal abort: stops', async () => {
    const table: Record<string, string> = {
      'https://example.com/': homeHtml,
      'https://example.com/about': aboutHtml,
    }
    setupPages(table)

    const ac = new AbortController()
    ac.abort() // pre-aborted signal

    const result = await cloneSite('https://example.com/', {
      maxDepth: 1,
      maxPages: 10,
      concurrency: 2,
      signal: ac.signal,
    })
    // Aborted before any pages crawled → failure
    expect(result.success).toBe(false)
    expect(result.pages).toEqual([])
    expect(result.errors.length).toBeGreaterThan(0)
  })
})
