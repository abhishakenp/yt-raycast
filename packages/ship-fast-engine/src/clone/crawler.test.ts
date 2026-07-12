import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the SSRF guard so crawlSite never does real DNS work.
const securityMocks = vi.hoisted(() => ({
  assertPublicUrl: vi.fn(async (_url: string) => undefined),
}))

vi.mock('./security.ts', () => ({
  assertPublicUrl: securityMocks.assertPublicUrl,
}))

import { crawlSite, normalizeUrl } from './crawler.ts'

describe('clone crawler — normalizeUrl', () => {
  it('lowercases the host', () => {
    expect(normalizeUrl('https://EXAMPLE.com/Path')).toBe(
      'https://example.com/Path',
    )
  })

  it('treats www.host and host as the same site (strips www.)', () => {
    expect(normalizeUrl('https://www.example.com/')).toBe(
      normalizeUrl('https://example.com/'),
    )
  })

  it('strips the default https port (:443)', () => {
    expect(normalizeUrl('https://example.com:443/')).toBe(
      'https://example.com/',
    )
  })

  it('strips the default http port (:80)', () => {
    expect(normalizeUrl('http://example.com:80/')).toBe('http://example.com/')
  })

  it('keeps a non-default port', () => {
    expect(normalizeUrl('https://example.com:8443/')).toBe(
      'https://example.com:8443/',
    )
  })

  it('drops the #fragment', () => {
    expect(normalizeUrl('https://example.com/p#section')).toBe(
      'https://example.com/p',
    )
  })

  it('sorts query parameters', () => {
    expect(normalizeUrl('https://example.com/?b=2&a=1')).toBe(
      'https://example.com/?a=1&b=2',
    )
  })

  it('does NOT strip a trailing slash (distinct resources)', () => {
    expect(normalizeUrl('https://example.com/a')).not.toBe(
      normalizeUrl('https://example.com/a/'),
    )
  })

  it('collapses index.html / index.htm / index.php directory aliases to /', () => {
    expect(normalizeUrl('https://example.com/index.html')).toBe(
      'https://example.com/',
    )
    expect(normalizeUrl('https://example.com/index.htm')).toBe(
      'https://example.com/',
    )
    expect(normalizeUrl('https://example.com/docs/index.php')).toBe(
      'https://example.com/docs/',
    )
  })

  it('leaves non-index filenames untouched', () => {
    expect(normalizeUrl('https://example.com/about.html')).toBe(
      'https://example.com/about.html',
    )
  })

  it('returns the raw input unchanged for an unparseable URL', () => {
    expect(normalizeUrl('not a url')).toBe('not a url')
  })

  it('is idempotent (normalizing twice yields the same value)', () => {
    const url = 'https://www.Example.com:443/p?z=9&a=1#frag'
    expect(normalizeUrl(normalizeUrl(url))).toBe(normalizeUrl(url))
  })
})

describe('clone crawler — crawlSite', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    securityMocks.assertPublicUrl.mockReset()
    securityMocks.assertPublicUrl.mockResolvedValue(undefined)
    globalThis.fetch = originalFetch
  })

  function htmlResponse(html: string, finalUrl?: string): Response {
    return new Response(html, {
      status: 200,
      headers: { 'content-type': 'text/html' },
      url: finalUrl,
    })
  }

  it('returns an empty page map when the seed fetch fails', async () => {
    globalThis.fetch = vi.fn(async () => {
      return new Response('nope', { status: 500 })
    }) as unknown as typeof fetch

    const { pages, graph } = await crawlSite('https://example.com/', {
      maxPages: 5,
    })
    expect(pages.size).toBe(0)
    expect(graph.nodes.size).toBe(0)
  })

  it('crawls the seed page and records it by its normalized final url', async () => {
    globalThis.fetch = vi.fn(async (input: string | URL | Request) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url
      return htmlResponse(
        '<html><body><h1>Home</h1><a href="/about">About</a></body></html>',
        url,
      )
    }) as unknown as typeof fetch

    const { pages, graph } = await crawlSite('https://example.com/', {
      maxPages: 1,
      maxDepth: 0,
    })
    expect(pages.size).toBe(1)
    const key = normalizeUrl('https://example.com/')
    expect(pages.has(key)).toBe(true)
    expect(pages.get(key)?.html).toContain('Home')
    expect(graph.nodes.has(key)).toBe(true)
  })

  it('follows same-domain links up to maxDepth and respects maxPages', async () => {
    const fetched: string[] = []
    globalThis.fetch = vi.fn(async (input: string | URL | Request) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url
      fetched.push(url)
      const body =
        url === 'https://example.com/'
          ? '<html><body><a href="/a">A</a><a href="/b">B</a></body></html>'
          : '<html><body><h1>Page</h1></body></html>'
      return htmlResponse(body, url)
    }) as unknown as typeof fetch

    const { pages } = await crawlSite('https://example.com/', {
      maxPages: 3,
      maxDepth: 1,
    })
    // Home + up to 2 discovered same-domain pages (cap = 3).
    expect(pages.size).toBeLessThanOrEqual(3)
    expect(pages.size).toBeGreaterThanOrEqual(1)
    expect(fetched.length).toBeLessThanOrEqual(3)
  })

  it('does not follow cross-domain links', async () => {
    const fetched: string[] = []
    globalThis.fetch = vi.fn(async (input: string | URL | Request) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url
      fetched.push(url)
      return htmlResponse(
        '<html><body><a href="https://other.com/x">Other</a></body></html>',
        url,
      )
    }) as unknown as typeof fetch

    const { pages } = await crawlSite('https://example.com/', {
      maxPages: 5,
      maxDepth: 2,
    })
    expect(pages.size).toBe(1)
    expect(fetched).toEqual(['https://example.com/'])
  })

  it('collapses duplicate-body descendant pages into the canonical home page', async () => {
    // Home and /dup serve the SAME body; /dup (depth 1) collapses into home.
    const sameBody =
      '<html><body><h1>Same</h1><a href="/dup">Dup</a></body></html>'
    globalThis.fetch = vi.fn(async (input: string | URL | Request) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url
      return htmlResponse(sameBody, url)
    }) as unknown as typeof fetch

    const { pages } = await crawlSite('https://example.com/', {
      maxPages: 5,
      maxDepth: 2,
    })
    // Only the home page survives; the duplicate-body descendant is dropped.
    expect(pages.size).toBe(1)
    expect(pages.has(normalizeUrl('https://example.com/'))).toBe(true)
  })

  it('aborts cleanly when the signal is already aborted', async () => {
    const controller = new AbortController()
    controller.abort()
    globalThis.fetch = vi.fn(async () =>
      htmlResponse('<html><body><h1>Home</h1></body></html>'),
    ) as unknown as typeof fetch

    const { pages } = await crawlSite('https://example.com/', {
      maxPages: 5,
      signal: controller.signal,
    })
    expect(pages.size).toBe(0)
  })

  it('emits crawl_progress events as it works', async () => {
    const events: { crawled?: number; total?: number }[] = []
    globalThis.fetch = vi.fn(async (input: string | URL | Request) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url
      return htmlResponse('<html><body><h1>Home</h1></body></html>', url)
    }) as unknown as typeof fetch

    await crawlSite('https://example.com/', {
      maxPages: 5,
      onEvent: (e) => {
        if (e.type === 'crawl_progress') {
          events.push({ crawled: e.crawled, total: e.total })
        }
      },
    })
    expect(events.length).toBeGreaterThan(0)
    expect(events[0].total).toBe(5)
  })
})
