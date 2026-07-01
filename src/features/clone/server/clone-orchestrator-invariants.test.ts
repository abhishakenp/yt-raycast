import { JSDOM } from 'jsdom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { CapturedPage } from '@ship-fast/engine/clone/types.ts'
import {
  NAV_SHIM_SCRIPT,
  rewriteResidualAnchorNavigation,
  selfContainPage,
} from '@ship-fast/engine/clone/verbatim.ts'

import { runCloneJob } from './clone-orchestrator-response'
import { runTargetedEdits } from './targeted-edit-pass'

const cloneMocks = vi.hoisted(() => {
  const browser = {
    close: vi.fn().mockResolvedValue(undefined),
  }
  return {
    assertPublicUrl: vi.fn().mockResolvedValue(undefined),
    browser,
    capturePage: vi.fn(),
    client: {
      mutation: vi.fn(),
      setAuth: vi.fn(),
    },
    crawlSite: vi.fn(),
    generateText: vi.fn(),
    launch: vi.fn().mockResolvedValue(browser),
    normalizeUrl: vi.fn((url: string) => new URL(url).toString()),
  }
})

vi.mock('@/shared/convex/http-client', () => ({
  createRuntimeConvexHttpClient: () => cloneMocks.client,
}))

vi.mock('@ship-fast/engine/clone/security.ts', () => ({
  assertPublicUrl: cloneMocks.assertPublicUrl,
}))

vi.mock('@ship-fast/engine/clone/crawler.ts', () => ({
  crawlSite: cloneMocks.crawlSite,
  normalizeUrl: cloneMocks.normalizeUrl,
}))

vi.mock('@ship-fast/engine/clone/capture.ts', () => ({
  capturePage: cloneMocks.capturePage,
}))

vi.mock('@ship-fast/engine', () => ({
  generateText: cloneMocks.generateText,
}))

vi.mock('@ship-fast/engine/model-list.js', () => ({
  DEFAULT_MODEL: 'mock-model',
}))

vi.mock('playwright', () => ({
  chromium: {
    launch: cloneMocks.launch,
  },
}))

const capturedPage = (url: string, title: string): CapturedPage => ({
  url,
  normalizedUrl: url,
  html: `<!doctype html><html><head><title>${title}</title></head><body><h1>${title}</h1><a href="/contact">Contact</a></body></html>`,
  computedStyles: new Map(),
  bboxes: new Map(),
  assetUrls: [],
})

const mutationArgs = () =>
  cloneMocks.client.mutation.mock.calls.map(([, args]) => args)

describe('clone orchestrator behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cloneMocks.browser.close.mockResolvedValue(undefined)
    cloneMocks.client.mutation.mockResolvedValue(null)
    cloneMocks.crawlSite.mockResolvedValue({
      pages: new Map([
        ['https://example.com/', { html: '<html></html>', depth: 0 }],
        ['https://example.com/about', { html: '<html></html>', depth: 1 }],
      ]),
    })
    cloneMocks.capturePage.mockImplementation(
      async (_browser: unknown, url: string) =>
        capturedPage(
          url,
          url.endsWith('/about') ? 'About Title' : 'Home Title',
        ),
    )
    cloneMocks.generateText.mockResolvedValue(
      JSON.stringify([{ before: 'Home Title', after: 'Edited Home Title' }]),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('guards the seed URL, writes home first, finalizes before rest pages, applies targeted edits, and closes the browser', async () => {
    await runCloneJob({
      sessionId: 'clone-session',
      anonymousOwnerSecret: 'owner-secret',
      bearer: 'bearer-token',
      seedUrl: 'https://example.com/',
      brief: 'Rename the home title',
    })

    expect(cloneMocks.assertPublicUrl).toHaveBeenCalledWith(
      'https://example.com/',
    )
    expect(cloneMocks.client.setAuth).toHaveBeenCalledWith('bearer-token')
    expect(cloneMocks.launch).toHaveBeenCalledTimes(1)
    expect(cloneMocks.browser.close).toHaveBeenCalledTimes(1)

    const args = mutationArgs()
    const homeWriteIndex = args.findIndex(
      (arg) => arg?.isHome === true && arg?.order === 0,
    )
    const finalizeIndex = args.findIndex(
      (arg) =>
        arg?.sessionId === 'clone-session' &&
        arg?.anonymousOwnerSecret === 'owner-secret' &&
        !('isHome' in arg) &&
        !('editType' in arg),
    )
    const restWriteIndex = args.findIndex(
      (arg) => arg?.isHome === false && arg?.order === 1,
    )
    const editIndex = args.findIndex((arg) => arg?.editType === 'text')

    expect(homeWriteIndex).toBeGreaterThanOrEqual(0)
    expect(finalizeIndex).toBeGreaterThan(homeWriteIndex)
    expect(restWriteIndex).toBeGreaterThan(finalizeIndex)
    expect(editIndex).toBeGreaterThan(finalizeIndex)
    expect(args[homeWriteIndex]).toMatchObject({
      sessionId: 'clone-session',
      anonymousOwnerSecret: 'owner-secret',
      pathname: '/',
      title: 'Home Title',
      isHome: true,
      failed: false,
      order: 0,
      truncated: false,
    })
    expect(args[editIndex]).toMatchObject({
      sessionId: 'clone-session',
      anonymousOwnerSecret: 'owner-secret',
      editType: 'text',
      beforeText: 'Home Title',
      afterText: 'Edited Home Title',
    })
  })

  it('persists failed rest pages and keeps the clone job alive when one capture fails', async () => {
    cloneMocks.capturePage.mockImplementation(
      async (_browser: unknown, url: string) => {
        if (url.endsWith('/about')) throw new Error('capture failed')
        return capturedPage(url, 'Home Title')
      },
    )

    await runCloneJob({
      sessionId: 'clone-session',
      seedUrl: 'https://example.com/',
      brief: '',
    })

    expect(cloneMocks.browser.close).toHaveBeenCalledTimes(1)
    expect(mutationArgs()).toContainEqual(
      expect.objectContaining({
        pathname: 'https://example.com/about',
        isHome: false,
        failed: true,
        order: 1,
        byteLength: 0,
      }),
    )
  })
})

describe('targeted edit pass behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cloneMocks.generateText.mockResolvedValue(
      [
        '```json',
        '[',
        '{"before":"Original Brand","after":"New Brand"},',
        '{"before":"Buy now","after":"Start today"},',
        '{"before":"Missing copy","after":"Ignored"},',
        '{"before":"Original Brand","after":"Duplicate ignored"},',
        '{"before":"Same","after":"Same"}',
        ']',
        '```',
      ].join('\n'),
    )
  })

  it('extracts visible candidates, parses fenced JSON, skips unsafe ops, and streams valid text edits', async () => {
    const mutation = vi.fn().mockResolvedValue(null)

    await runTargetedEdits({
      client: { mutation },
      sessionId: 'clone-session',
      anonymousOwnerSecret: 'owner-secret',
      brief: 'Rename brand and CTA',
      homeHtml:
        '<html><head><title>Original Brand</title></head><body><h1>Original Brand</h1><button>Buy now</button><p>Same</p></body></html>',
    })

    expect(cloneMocks.generateText).toHaveBeenCalledWith(
      'mock-model',
      expect.stringContaining('brand names'),
      expect.stringContaining('Original Brand'),
      expect.any(AbortSignal),
    )
    expect(mutation).toHaveBeenCalledTimes(2)
    expect(mutation.mock.calls.map(([, args]) => args)).toEqual([
      expect.objectContaining({
        sessionId: 'clone-session',
        anonymousOwnerSecret: 'owner-secret',
        editType: 'text',
        beforeText: 'Original Brand',
        afterText: 'New Brand',
      }),
      expect.objectContaining({
        sessionId: 'clone-session',
        anonymousOwnerSecret: 'owner-secret',
        editType: 'text',
        beforeText: 'Buy now',
        afterText: 'Start today',
      }),
    ])
  })

  it('does not call the model or mutate when the brief is blank', async () => {
    const mutation = vi.fn()

    await runTargetedEdits({
      client: { mutation },
      sessionId: 'clone-session',
      brief: '   ',
      homeHtml: '<h1>Original Brand</h1>',
    })

    expect(cloneMocks.generateText).not.toHaveBeenCalled()
    expect(mutation).not.toHaveBeenCalled()
  })

  it('treats model failures as a no-op instead of failing the clone job', async () => {
    const mutation = vi.fn()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    cloneMocks.generateText.mockRejectedValueOnce(new Error('model down'))

    await expect(
      runTargetedEdits({
        client: { mutation },
        sessionId: 'clone-session',
        brief: 'Rename the cloned brand',
        homeHtml: '<html><body><h1>Original Brand</h1></body></html>',
      }),
    ).resolves.toBeUndefined()

    expect(mutation).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalledWith(
      '[clone] targeted-edit generation failed for clone-session:',
      'model down',
    )
  })

  it('continues applying later text edits when one edit mutation fails', async () => {
    const mutation = vi
      .fn()
      .mockRejectedValueOnce(new Error('first edit failed'))
      .mockResolvedValueOnce(null)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    cloneMocks.generateText.mockResolvedValueOnce(
      JSON.stringify([
        { before: 'Original Brand', after: 'New Brand' },
        { before: 'Buy now', after: 'Start today' },
      ]),
    )

    await runTargetedEdits({
      client: { mutation },
      sessionId: 'clone-session',
      anonymousOwnerSecret: 'owner-secret',
      brief: 'Rename brand and CTA',
      homeHtml:
        '<html><body><h1>Original Brand</h1><button>Buy now</button></body></html>',
    })

    expect(mutation).toHaveBeenCalledTimes(2)
    expect(mutation.mock.calls.map(([, args]) => args)).toEqual([
      expect.objectContaining({
        beforeText: 'Original Brand',
        afterText: 'New Brand',
      }),
      expect.objectContaining({
        beforeText: 'Buy now',
        afterText: 'Start today',
      }),
    ])
    expect(warn).toHaveBeenCalledWith(
      '[clone] targeted-edit apply failed for clone-session:',
      'first edit failed',
    )
  })
})

describe('self-containment behavior', () => {
  const finalUrl = 'https://example.com/about'
  const finalHost = 'example.com'

  it('self-contains a captured page by stripping scripts and event handlers, absolutizing assets, and rewriting navigable anchors', async () => {
    const result = await selfContainPage(
      {
        url: finalUrl,
        normalizedUrl: finalUrl,
        html: [
          '<!doctype html><html><head><title>About</title>',
          '<style>.hero{background:url("/hero.png")}</style>',
          '<script>window.sourceSiteRan = true</script>',
          '</head><body onload="sourceSiteRan()">',
          '<img src="/logo.png" srcset="/small.png 1x, /large.png 2x">',
          '<a href="https://example.com/contact" target="_blank" rel="noopener">Contact</a>',
          '<a href="https://external.test/page">External</a>',
          '<a href="mailto:hello@example.com">Mail</a>',
          '</body></html>',
        ].join(''),
        computedStyles: new Map(),
        bboxes: new Map(),
        assetUrls: [],
      },
      { finalUrl, fetchImpl: vi.fn() as unknown as typeof fetch },
    )

    expect(result).toMatchObject({
      pathname: '/about',
      title: 'About',
      truncated: false,
    })
    expect(result.byteLength).toBeGreaterThan(0)
    expect(result.html).not.toContain('window.sourceSiteRan')
    expect(result.html).not.toContain('onload=')
    expect(result.html).toContain('src="https://example.com/logo.png"')
    expect(result.html).toContain('https://example.com/small.png 1x')
    expect(result.html).toContain('url("https://example.com/hero.png")')
    expect(result.html).toContain('href="#"')
    expect(result.html).toContain('data-clone-path="/contact"')
    expect(result.html).toContain('data-clone-abs="https://external.test/page"')
    expect(result.html).toContain('href="mailto:hello@example.com"')
    expect(result.html).not.toMatch(/href="https?:\/\//i)
  })

  it('rewrites residual same-origin and external anchors without leaving http href escape hatches', () => {
    const out = rewriteResidualAnchorNavigation(
      '<a href="/pricing">Pricing</a><a href="https://other.site/x">External</a>',
      finalUrl,
      finalHost,
    )

    expect(out).toContain('data-clone-path="/pricing"')
    expect(out).toContain('data-clone-abs="https://other.site/x"')
    expect(out.match(/href="https?:\/\/[^"]*"/gi) ?? []).toHaveLength(0)
  })

  it('nav shim posts clone navigation messages instead of navigating', () => {
    const dom = new JSDOM(
      '<a href="#" data-clone-path="/pricing" data-clone-abs="https://example.com/pricing">Pricing</a>',
      { runScripts: 'outside-only', url: finalUrl },
    )
    const postMessage = vi.fn()
    Object.defineProperty(dom.window, 'parent', {
      configurable: true,
      value: { postMessage },
    })

    dom.window.eval(NAV_SHIM_SCRIPT)
    const event = new dom.window.MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    })
    dom.window.document.querySelector('a')?.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(postMessage).toHaveBeenCalledWith(
      {
        type: 'ship-clone-nav',
        path: '/pricing',
        abs: 'https://example.com/pricing',
      },
      '*',
    )
  })
})
