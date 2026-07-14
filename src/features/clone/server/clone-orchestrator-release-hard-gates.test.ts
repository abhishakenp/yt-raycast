import { beforeEach, describe, expect, it, vi } from 'vitest'

const orchestratorMocks = vi.hoisted(function createOrchestratorMocks() {
  const browser = {
    close: vi.fn(),
  }

  function normalizeUrl(url: string): string {
    return new URL(url).toString()
  }

  return {
    assertPublicUrl: vi.fn(),
    browser,
    capturePage: vi.fn(),
    client: {
      mutation: vi.fn(),
      setAuth: vi.fn(),
    },
    crawlSite: vi.fn(),
    launch: vi.fn(),
    normalizeUrl: vi.fn(normalizeUrl),
    selfContainPage: vi.fn(),
    targetedEdits: vi.fn(),
  }
})

vi.mock('@/shared/convex/http-client', () => ({
  createRuntimeConvexHttpClient: () => orchestratorMocks.client,
}))

vi.mock('@ship-fast/engine/clone/security.ts', () => ({
  assertPublicUrl: orchestratorMocks.assertPublicUrl,
}))

vi.mock('@ship-fast/engine/clone/crawler.ts', () => ({
  crawlSite: orchestratorMocks.crawlSite,
  normalizeUrl: orchestratorMocks.normalizeUrl,
}))

vi.mock('@ship-fast/engine/clone/capture.ts', () => ({
  capturePage: orchestratorMocks.capturePage,
}))

vi.mock('@ship-fast/engine/clone/verbatim.ts', () => ({
  selfContainPage: orchestratorMocks.selfContainPage,
}))

vi.mock('./targeted-edit-pass', () => ({
  runTargetedEdits: orchestratorMocks.targetedEdits,
}))

vi.mock('playwright', () => ({
  chromium: { launch: orchestratorMocks.launch },
}))

import { runCloneJob } from './clone-orchestrator-response'

function successfulPages() {
  return {
    pages: new Map([
      ['https://example.com/', { html: '<html></html>', depth: 0 }],
    ]),
  }
}

function mutationInputs(): unknown[] {
  return orchestratorMocks.client.mutation.mock.calls.map((call) => call[1])
}

function isSuccessfulHomeWrite(input: unknown): boolean {
  return Boolean(
    input &&
    typeof input === 'object' &&
    Reflect.get(input, 'isHome') === true &&
    Reflect.get(input, 'failed') === false,
  )
}

describe('clone orchestrator release hard gates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    orchestratorMocks.assertPublicUrl.mockResolvedValue(undefined)
    orchestratorMocks.browser.close.mockResolvedValue(undefined)
    orchestratorMocks.client.mutation.mockResolvedValue(null)
    orchestratorMocks.crawlSite.mockResolvedValue(successfulPages())
    orchestratorMocks.launch.mockResolvedValue(orchestratorMocks.browser)
    orchestratorMocks.capturePage.mockResolvedValue({
      url: 'https://example.com/',
      normalizedUrl: 'https://example.com/',
      html: '<!doctype html><html><body><h1>Release</h1></body></html>',
      computedStyles: new Map(),
      bboxes: new Map(),
      assetUrls: [],
    })
    orchestratorMocks.selfContainPage.mockResolvedValue({
      pathname: '/',
      title: 'Release',
      html: '<!doctype html><html><body><h1>Release</h1></body></html>',
      byteLength: 64,
      truncated: false,
    })
  })

  it('clears the job timeout when browser launch fails', async () => {
    vi.useFakeTimers()
    orchestratorMocks.launch.mockRejectedValueOnce(
      new Error('browser launch failed'),
    )

    try {
      await expect(
        runCloneJob({
          sessionId: 'clone-launch-failure',
          seedUrl: 'https://example.com/',
          brief: '',
        }),
      ).rejects.toThrow('browser launch failed')

      expect(vi.getTimerCount()).toBe(0)
    } finally {
      vi.clearAllTimers()
      vi.useRealTimers()
    }
  })

  it('redacts provider secrets and internal paths from clone failure logs', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    orchestratorMocks.capturePage.mockRejectedValueOnce(
      new Error(
        'PLAYWRIGHT_TOKEN=pw_release_secret at /Users/livio/private/capture.ts',
      ),
    )

    await runCloneJob({
      sessionId: 'clone-secret-redaction',
      anonymousOwnerSecret: 'anonymous-release-secret',
      seedUrl: 'https://example.com/',
      brief: '',
    })

    const publicLogs = JSON.stringify(warn.mock.calls)
    expect(publicLogs).not.toContain('pw_release_secret')
    expect(publicLogs).not.toContain('/Users/livio')
    expect(publicLogs).not.toContain('PLAYWRIGHT_TOKEN')
  })

  it('closes the browser when crawling crashes before any page is captured', async () => {
    orchestratorMocks.crawlSite.mockRejectedValueOnce(
      new Error('crawl worker crashed'),
    )

    await expect(
      runCloneJob({
        sessionId: 'clone-crawl-crash',
        seedUrl: 'https://example.com/',
        brief: '',
      }),
    ).rejects.toThrow('crawl worker crashed')

    expect(orchestratorMocks.capturePage).not.toHaveBeenCalled()
    expect(orchestratorMocks.browser.close).toHaveBeenCalledTimes(1)
  })

  it('can retry cleanly after an interrupted worker and persist home once', async () => {
    orchestratorMocks.crawlSite
      .mockRejectedValueOnce(new Error('worker interrupted'))
      .mockResolvedValueOnce(successfulPages())

    await expect(
      runCloneJob({
        sessionId: 'clone-interruption-recovery',
        seedUrl: 'https://example.com/',
        brief: '',
      }),
    ).rejects.toThrow('worker interrupted')

    await expect(
      runCloneJob({
        sessionId: 'clone-interruption-recovery',
        seedUrl: 'https://example.com/',
        brief: '',
      }),
    ).resolves.toBeUndefined()

    expect(mutationInputs().filter(isSuccessfulHomeWrite)).toHaveLength(1)
    expect(orchestratorMocks.browser.close).toHaveBeenCalledTimes(2)
  })
})
