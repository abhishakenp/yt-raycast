import { spawn } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'

const securityMock = vi.hoisted(function createSecurityMock() {
  async function assertPublicUrl(url: string): Promise<void> {
    const hostname = new URL(url).hostname
    if (
      hostname === '127.0.0.1' ||
      hostname === 'localhost' ||
      hostname === '169.254.169.254'
    ) {
      throw new Error(`blocked private host: ${hostname}`)
    }
  }

  return { assertPublicUrl: vi.fn(assertPublicUrl) }
})

vi.mock('./security.ts', () => ({
  assertPublicUrl: securityMock.assertPublicUrl,
}))

import { crawlSite, normalizeUrl } from './crawler'

function htmlPage(text: string): string {
  return `<!doctype html><html><head><title>${text}</title></head><body><main><h1>${text}</h1><p>${text} content with enough words for a complete clone page.</p></main></body></html>`
}

function responseAt(
  url: string,
  body: string,
  headers: Record<string, string> = { 'content-type': 'text/html' },
): Response {
  const response = new Response(body, { status: 200, headers })
  Object.defineProperty(response, 'url', {
    configurable: true,
    value: url,
  })
  return response
}

describe('clone crawler release hard gates', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('rejects a public seed that redirects to a loopback address', async () => {
    const fetchMock = vi.fn(async () =>
      responseAt(
        'http://127.0.0.1:8080/admin',
        htmlPage('Private administration'),
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await crawlSite('https://example.com/', {
      maxDepth: 0,
      maxPages: 1,
    })

    expect(result.pages.size).toBe(0)
    expect(securityMock.assertPublicUrl).toHaveBeenCalledWith(
      'http://127.0.0.1:8080/admin',
    )
  })

  it('rejects a seed redirect that escapes to an unrelated public origin', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        responseAt(
          'https://attacker.example/captured',
          htmlPage('Unrelated origin'),
        ),
      ),
    )

    const result = await crawlSite('https://example.com/', {
      maxDepth: 0,
      maxPages: 1,
    })

    expect(result.pages.size).toBe(0)
    expect(
      result.graph.nodes.has(normalizeUrl('https://attacker.example/')),
    ).toBe(false)
  })

  it('preserves a valid same-origin redirect as the canonical page', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        responseAt(
          'https://example.com/welcome',
          htmlPage('Canonical welcome page'),
        ),
      ),
    )

    const result = await crawlSite('https://example.com/', {
      maxDepth: 0,
      maxPages: 1,
    })

    expect(Array.from(result.pages.keys())).toEqual([
      'https://example.com/welcome',
    ])
    expect(result.graph.edges).toContainEqual({
      from: 'https://example.com/',
      to: 'https://example.com/welcome',
    })
  })

  it('rejects successful non-HTML responses before treating them as pages', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        responseAt('https://example.com/archive.zip', 'PK release archive', {
          'content-type': 'application/zip',
        }),
      ),
    )

    const result = await crawlSite('https://example.com/archive.zip', {
      maxDepth: 0,
      maxPages: 1,
    })

    expect(result.pages.size).toBe(0)
  })

  it('rejects an oversized declared HTML body before buffering it', async () => {
    const response = responseAt(
      'https://example.com/oversized',
      htmlPage('Oversized page'),
      {
        'content-type': 'text/html',
        'content-length': String(25 * 1024 * 1024),
      },
    )
    const textSpy = vi.spyOn(response, 'text')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => response),
    )

    const result = await crawlSite('https://example.com/oversized', {
      maxDepth: 0,
      maxPages: 1,
    })

    expect(result.pages.size).toBe(0)
    expect(textSpy).not.toHaveBeenCalled()
  })

  it('terminates instead of spinning forever when concurrency is zero', async () => {
    const crawlerUrl = pathToFileURL(
      `${process.cwd()}/packages/ship-fast-engine/src/clone/crawler.ts`,
    ).href
    const script = [
      `const { crawlSite } = await import(${JSON.stringify(crawlerUrl)});`,
      'globalThis.fetch = async () => new Response("<!doctype html><html><head><title>Page</title></head><body><main><h1>Page</h1><p>Complete release content page.</p></main></body></html>", { headers: { "content-type": "text/html" } });',
      'const result = await crawlSite("https://93.184.216.34/", { concurrency: 0, maxDepth: 0, maxPages: 1 });',
      'process.exit(result.pages.size === 1 ? 0 : 2);',
    ].join('\n')
    const child = spawn('bun', ['-e', script], {
      cwd: process.cwd(),
      stdio: ['ignore', 'ignore', 'pipe'],
    })
    let stderr = ''
    child.stderr?.setEncoding('utf8')
    child.stderr?.on('data', (chunk) => {
      stderr += String(chunk)
    })
    const exited = new Promise<number | null>((resolve) => {
      child.once('exit', (code) => resolve(code))
    })
    const deadline = new Promise((resolve) => {
      setTimeout(() => resolve('deadline-expired'), 500)
    })

    const outcome = await Promise.race([exited, deadline])
    if (outcome === 'deadline-expired') child.kill('SIGKILL')

    expect(outcome, stderr).toBe(0)
  })
})
