import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const securityMocks = vi.hoisted(() => ({
  assertPublicUrl: vi.fn(),
}))

vi.mock('./security.ts', () => ({
  assertPublicUrl: securityMocks.assertPublicUrl,
}))

import { crawlSite, normalizeUrl } from './crawler.ts'

const html = (body: string) =>
  `<!doctype html><html><body>${body}</body></html>`

const response = (url: string, body: string, ok = true) =>
  ({
    ok,
    url,
    text: async () => body,
  }) as Response

describe('clone crawler', () => {
  beforeEach(() => {
    securityMocks.assertPublicUrl.mockReset()
    securityMocks.assertPublicUrl.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('normalizes URLs for stable graph keys without over-merging trailing slashes', () => {
    expect(
      normalizeUrl('HTTPS://WWW.Example.COM:443/docs/index.html?b=2&a=1#intro'),
    ).toBe('https://example.com/docs/?a=1&b=2')
    expect(normalizeUrl('http://www.example.com:80/path?z=9&z=1&a=2')).toBe(
      'http://example.com/path?a=2&z=9&z=1',
    )
    expect(normalizeUrl('https://example.com/a')).toBe('https://example.com/a')
    expect(normalizeUrl('https://example.com/a/')).toBe(
      'https://example.com/a/',
    )
    expect(normalizeUrl('not a url')).toBe('not a url')
  })

  it('crawls same-domain pages, skips external links, and records redirect graph edges', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url === 'https://www.example.com/start?b=2&a=1') {
        return response(
          'https://example.com/home?b=2&a=1',
          html(`
            <main>
              <h1>Home</h1>
              <p>This home page has enough visible text to avoid stub deduplication during crawling.</p>
              <a href="/about#team">About</a>
              <a href="https://external.test/ignored">External</a>
            </main>
          `),
        )
      }
      if (url === 'https://example.com/about#team') {
        return response(
          'https://example.com/about',
          html(`
            <main>
              <h1>About</h1>
              <p>This about page has distinct visible text so it remains a separate crawled page.</p>
            </main>
          `),
        )
      }
      throw new Error(`unexpected fetch ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)
    const events: Array<{ type: string; crawled?: number; total?: number }> = []

    const { graph, pages } = await crawlSite(
      'https://www.example.com/start?b=2&a=1',
      {
        maxDepth: 1,
        maxPages: 5,
        concurrency: 1,
        onEvent: (event) => events.push(event),
      },
    )

    expect(securityMocks.assertPublicUrl).toHaveBeenCalledWith(
      'https://www.example.com/start?b=2&a=1',
    )
    expect(securityMocks.assertPublicUrl).toHaveBeenCalledWith(
      'https://example.com/about#team',
    )
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(pages.keys()).toContain('https://example.com/home?a=1&b=2')
    expect(pages.keys()).toContain('https://example.com/about')
    expect(graph.nodes.has('https://external.test/ignored')).toBe(false)
    expect(graph.edges).toContainEqual({
      from: 'https://example.com/start?a=1&b=2',
      to: 'https://example.com/home?a=1&b=2',
    })
    expect(graph.edges).toContainEqual({
      from: 'https://example.com/home?a=1&b=2',
      to: 'https://example.com/about',
    })
    expect(events.at(-1)).toEqual({
      type: 'crawl_progress',
      crawled: 2,
      total: 5,
    })
  })

  it('collapses duplicate descendant bodies into the canonical home page', async () => {
    const body = html(`
      <main>
        <h1>Launch Notes</h1>
        <p>This page repeats the same launch notes body under two aliases so only one page should be stored.</p>
        <a href="/alias">Alias</a>
      </main>
    `)
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url === 'https://example.com/') return response(url, body)
        if (url === 'https://example.com/alias') return response(url, body)
        throw new Error(`unexpected fetch ${url}`)
      }),
    )

    const { graph, pages } = await crawlSite('https://example.com/', {
      maxDepth: 1,
      maxPages: 5,
      concurrency: 1,
    })

    expect(Array.from(pages.keys())).toEqual(['https://example.com/'])
    expect(graph.nodes.has('https://example.com/alias')).toBe(true)
    expect(graph.edges).toContainEqual({
      from: 'https://example.com/',
      to: 'https://example.com/alias',
    })
  })

  it('does not let failed fetches consume successful page capacity', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url === 'https://example.com/') {
          return response(
            url,
            html(`
              <main>
                <h1>Home</h1>
                <p>This home page links to one failed page and one successful page.</p>
                <a href="/missing">Missing</a>
                <a href="/ok">OK</a>
              </main>
            `),
          )
        }
        if (url === 'https://example.com/missing')
          return response(url, '', false)
        if (url === 'https://example.com/ok') {
          return response(
            url,
            html(`
              <main>
                <h1>OK</h1>
                <p>This successful page still fits after the failed fetch releases its reserved slot.</p>
              </main>
            `),
          )
        }
        throw new Error(`unexpected fetch ${url}`)
      }),
    )

    const { pages } = await crawlSite('https://example.com/', {
      maxDepth: 1,
      maxPages: 2,
      concurrency: 1,
    })

    expect(Array.from(pages.keys())).toEqual([
      'https://example.com/',
      'https://example.com/ok',
    ])
  })

  it('stops cleanly when the abort signal is already cancelled', async () => {
    const controller = new AbortController()
    controller.abort()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const result = await crawlSite('https://example.com/', {
      signal: controller.signal,
    })

    expect(result.pages.size).toBe(0)
    expect(result.graph.nodes.size).toBe(0)
    expect(result.graph.edges).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
