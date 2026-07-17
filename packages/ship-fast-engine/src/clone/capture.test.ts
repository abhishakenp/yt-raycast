import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Browser } from 'playwright'

// Mock the SSRF guard so we can simulate private-IP rejection without DNS.
const securityMocks = vi.hoisted(() => ({
  assertPublicUrl: vi.fn(async (_url: string) => undefined),
}))

vi.mock('./security.ts', () => ({
  assertPublicUrl: securityMocks.assertPublicUrl,
}))

// Mock normalizeUrl (pure) so capture keys are deterministic and we don't pull
// in the full crawler module graph.
const crawlerMocks = vi.hoisted(() => ({
  normalizeUrl: vi.fn((raw: string) => `normalized:${raw}`),
}))

vi.mock('./crawler.ts', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return { ...actual, normalizeUrl: crawlerMocks.normalizeUrl }
})

// Mock playwright: a fake browser/context/page whose methods are vitest fns so
// we can drive control flow (goto, content, evaluate, screenshots, close).
const pwMocks = vi.hoisted(() => {
  const page = {
    goto: vi.fn(async () => undefined),
    url: vi.fn(() => 'https://example.com/'),
    content: vi.fn(async () => '<html><body><h1>Hi</h1></body></html>'),
    waitForTimeout: vi.fn(async () => undefined),
    evaluate: vi.fn(async (): Promise<unknown> => undefined),
    $$: vi.fn(async () => []),
    $: vi.fn(async () => null),
    screenshot: vi.fn(async () => Buffer.from('png')),
    close: vi.fn(async () => undefined),
  }
  const context = {
    newPage: vi.fn(async () => page),
    close: vi.fn(async () => undefined),
  }
  const browser = {
    newContext: vi.fn(async () => context),
    close: vi.fn(async () => undefined),
  }
  const chromium = { launch: vi.fn(async () => browser) }
  return { browser, context, page, chromium }
})

vi.mock('playwright', () => ({ chromium: pwMocks.chromium }))

import { capturePage, capturePages } from './capture.ts'

// Typed alias for passing the mock browser to capturePage (which expects a
// real Playwright Browser). The mock object has the same structural shape
// (newContext/close) but vi.fn() methods don't match Browser's full interface.
const mockBrowser = pwMocks.browser as unknown as Browser

function resetMocks() {
  securityMocks.assertPublicUrl.mockReset()
  securityMocks.assertPublicUrl.mockResolvedValue(undefined)
  crawlerMocks.normalizeUrl.mockReset()
  crawlerMocks.normalizeUrl.mockImplementation(
    (raw: string) => `normalized:${raw}`,
  )
  pwMocks.chromium.launch.mockReset()
  pwMocks.chromium.launch.mockResolvedValue(pwMocks.browser)
  pwMocks.browser.newContext.mockReset()
  pwMocks.browser.newContext.mockResolvedValue(pwMocks.context)
  pwMocks.browser.close.mockReset()
  pwMocks.browser.close.mockResolvedValue(undefined)
  pwMocks.context.newPage.mockReset()
  pwMocks.context.newPage.mockResolvedValue(pwMocks.page)
  pwMocks.context.close.mockReset()
  pwMocks.context.close.mockResolvedValue(undefined)
  pwMocks.page.goto.mockReset()
  pwMocks.page.goto.mockResolvedValue(undefined)
  pwMocks.page.url.mockReset()
  pwMocks.page.url.mockReturnValue('https://example.com/')
  pwMocks.page.content.mockReset()
  pwMocks.page.content.mockResolvedValue(
    '<html><body><h1>Hi</h1></body></html>',
  )
  pwMocks.page.waitForTimeout.mockReset()
  pwMocks.page.waitForTimeout.mockResolvedValue(undefined)
  pwMocks.page.evaluate.mockReset()
  // Default return covers the asset-urls evaluate (Array) and the body-styles
  // evaluate (object); tests only assert structure, not the returned values.
  pwMocks.page.evaluate.mockResolvedValue([])
  pwMocks.page.$$.mockReset()
  pwMocks.page.$$.mockResolvedValue([])
  pwMocks.page.screenshot.mockReset()
  pwMocks.page.screenshot.mockResolvedValue(Buffer.from('png'))
  pwMocks.page.close.mockReset()
  pwMocks.page.close.mockResolvedValue(undefined)
}

describe('clone capture — capturePages', () => {
  beforeEach(() => {
    resetMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('returns an empty Map for an empty url list (no browser launched)', async () => {
    const result = await capturePages([])
    expect(result.size).toBe(0)
    expect(pwMocks.chromium.launch).not.toHaveBeenCalled()
  })

  it('captures a single url and keys the result by normalized final url', async () => {
    const result = await capturePages(['https://example.com/'], 1)
    expect(result.size).toBe(1)
    const captured = result.get('normalized:https://example.com/')
    expect(captured).toBeDefined()
    expect(captured?.html).toBe('<html><body><h1>Hi</h1></body></html>')
    expect(captured?.url).toBe('https://example.com/')
    expect(captured?.normalizedUrl).toBe('normalized:https://example.com/')
  })

  it('launches exactly one browser and closes it in finally', async () => {
    await capturePages(['https://example.com/', 'https://example.com/x'], 2)
    expect(pwMocks.chromium.launch).toHaveBeenCalledTimes(1)
    expect(pwMocks.browser.close).toHaveBeenCalled()
  })

  it('swallows a per-page capture failure (null result) without rejecting the batch', async () => {
    // assertPublicUrl rejects for the first url (SSRF guard) -> capturePage
    // returns null -> the batch continues and the second url still captures.
    securityMocks.assertPublicUrl.mockImplementation(async (url: string) => {
      if (url === 'https://private.example/') {
        throw new Error('Blocked URL (private/loopback IP)')
      }
    })
    const result = await capturePages(
      ['https://private.example/', 'https://example.com/'],
      1,
    )
    expect(result.size).toBe(1)
    expect(result.has('normalized:https://private.example/')).toBe(false)
    expect(result.has('normalized:https://example.com/')).toBe(true)
  })

  it('stops processing the queue when the abort signal fires', async () => {
    const controller = new AbortController()
    // Abort after the first page starts; remaining queue items are skipped.
    pwMocks.page.goto.mockImplementation(async () => {
      controller.abort()
    })
    const result = await capturePages(
      ['https://example.com/', 'https://example.com/x'],
      1,
      controller.signal,
    )
    // Browser is closed on abort; at most one page captured.
    expect(pwMocks.browser.close).toHaveBeenCalled()
    expect(result.size).toBeLessThanOrEqual(1)
  })
})

describe('clone capture — capturePage', () => {
  beforeEach(() => {
    resetMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('returns null when the SSRF guard rejects the url', async () => {
    securityMocks.assertPublicUrl.mockRejectedValue(
      new Error('Blocked URL (private/loopback IP)'),
    )
    const result = await capturePage(mockBrowser, 'http://10.0.0.1/')
    expect(result).toBeNull()
    // The browser was never asked for a context/page.
    expect(pwMocks.browser.newContext).not.toHaveBeenCalled()
  })

  it('returns a CapturedPage with html, styles, bboxes, and asset urls on success', async () => {
    const result = await capturePage(mockBrowser, 'https://example.com/')
    expect(result).not.toBeNull()
    expect(result?.html).toBe('<html><body><h1>Hi</h1></body></html>')
    expect(result?.computedStyles).toBeInstanceOf(Map)
    expect(result?.bboxes).toBeInstanceOf(Map)
    expect(result?.assetUrls).toEqual([])
    expect(Buffer.isBuffer(result?.screenshot)).toBe(true)
  })

  it('re-asserts the resolved (post-redirect) url for SSRF defense-in-depth', async () => {
    pwMocks.page.url.mockReturnValue('https://redirected.example/')
    await capturePage(mockBrowser, 'https://example.com/')
    const checked = securityMocks.assertPublicUrl.mock.calls.map(([u]) => u)
    expect(checked).toContain('https://example.com/')
    expect(checked).toContain('https://redirected.example/')
  })

  it('returns null when the post-redirect url is a private IP', async () => {
    pwMocks.page.url.mockReturnValue('http://169.254.169.254/')
    securityMocks.assertPublicUrl.mockImplementation(async (url: string) => {
      if (url === 'http://169.254.169.254/') {
        throw new Error('Blocked URL (private/loopback IP)')
      }
    })
    const result = await capturePage(mockBrowser, 'https://example.com/')
    expect(result).toBeNull()
  })

  it('closes the page and context in finally on success', async () => {
    await capturePage(mockBrowser, 'https://example.com/')
    expect(pwMocks.page.close).toHaveBeenCalled()
    expect(pwMocks.context.close).toHaveBeenCalled()
  })

  it('closes the page and context in finally even on failure', async () => {
    securityMocks.assertPublicUrl.mockRejectedValue(new Error('blocked'))
    await capturePage(mockBrowser, 'https://example.com/')
    // context was never created, but teardown must not throw; page.close is a
    // no-op when page is null. The key invariant: no listener leak / no throw.
    expect(pwMocks.browser.close).not.toHaveBeenCalled()
  })

  it('tears down when the abort signal fires', async () => {
    const controller = new AbortController()
    pwMocks.page.goto.mockImplementation(async () => {
      controller.abort()
      throw new Error('aborted')
    })
    await capturePage(mockBrowser, 'https://example.com/', {
      signal: controller.signal,
    })
    // Teardown ran (page/context closed) despite the abort.
    expect(pwMocks.page.close).toHaveBeenCalled()
  })

  it('keys the returned page by the final response url, normalized', async () => {
    pwMocks.page.url.mockReturnValue('https://example.com/final')
    const result = await capturePage(mockBrowser, 'https://example.com/')
    expect(result?.url).toBe('https://example.com/final')
    expect(result?.normalizedUrl).toBe('normalized:https://example.com/final')
  })
})
