import { mkdtemp, readFile, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CapturedPage } from './types.ts'

const securityMocks = vi.hoisted(() => ({
  assertPublicUrl: vi.fn(async (_url: string) => undefined),
}))

vi.mock('./security.ts', () => ({
  assertPublicUrl: securityMocks.assertPublicUrl,
}))

import {
  downloadAsset,
  downloadPageAssets,
  rewriteAssetUrls,
} from './assets.ts'

const originalFetch = globalThis.fetch

function imageResponse(bytes = 'image-bytes', type = 'image/png'): Response {
  return new Response(new Uint8Array(Buffer.from(bytes)), {
    status: 200,
    headers: { 'content-type': type },
  })
}

describe('clone asset downloading', () => {
  let workspace: string

  beforeEach(async () => {
    workspace = await mkdtemp(join(tmpdir(), 'clone-assets-behavior-'))
    securityMocks.assertPublicUrl.mockClear()
  })

  afterEach(async () => {
    globalThis.fetch = originalFetch
    await rm(workspace, { recursive: true, force: true })
  })

  it('validates every redirect hop before writing a redirected asset', async () => {
    const fetched: string[] = []
    globalThis.fetch = (async (input: string | URL | Request) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url
      fetched.push(url)
      if (url === 'https://cdn.example.com/logo.png') {
        return new Response('', {
          status: 302,
          headers: { location: 'https://assets.example.com/final.png' },
        })
      }
      return imageResponse('redirected-logo')
    }) as typeof fetch

    const localPath = await downloadAsset(
      'https://cdn.example.com/logo.png',
      workspace,
    )

    expect(localPath).toMatch(/^\/assets\/asset_.*\.png$/)
    expect(fetched).toEqual([
      'https://cdn.example.com/logo.png',
      'https://assets.example.com/final.png',
    ])
    expect(
      securityMocks.assertPublicUrl.mock.calls.map(([url]) => url),
    ).toEqual([
      'https://cdn.example.com/logo.png',
      'https://assets.example.com/final.png',
      'https://cdn.example.com/logo.png',
    ])
    const written = await readFile(join(workspace, localPath!))
    expect(written.toString()).toBe('redirected-logo')
  })

  it('rejects a png URL when the served content type is not an image', async () => {
    globalThis.fetch = (async () =>
      new Response('<script>alert(1)</script>', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      })) as typeof fetch

    await expect(
      downloadAsset('https://cdn.example.com/logo.png', workspace),
    ).resolves.toBeNull()
  })

  it('bounds page asset downloads to the requested concurrency', async () => {
    let active = 0
    let maxActive = 0
    const fetchOrder: string[] = []

    globalThis.fetch = (async (input: string | URL | Request) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url
      fetchOrder.push(url)
      active += 1
      maxActive = Math.max(maxActive, active)
      await new Promise((resolve) => setTimeout(resolve, 5))
      active -= 1
      return imageResponse(`bytes:${url}`)
    }) as typeof fetch

    const captured: CapturedPage = {
      url: 'https://example.com/',
      normalizedUrl: 'https://example.com/',
      html: '<html><body></body></html>',
      computedStyles: new Map(),
      bboxes: new Map(),
      assetUrls: [
        'https://cdn.example.com/a.png',
        'https://cdn.example.com/b.png',
        'https://cdn.example.com/c.png',
        'https://cdn.example.com/d.png',
        'https://cdn.example.com/e.png',
      ],
    }

    const assetMap = await downloadPageAssets(captured, workspace, 2)

    expect(assetMap.size).toBe(5)
    expect(fetchOrder).toHaveLength(5)
    expect(maxActive).toBeLessThanOrEqual(2)
  })
})

describe('clone asset URL rewriting', () => {
  it('rewrites every occurrence of escaped remote asset URLs without changing sibling URLs', () => {
    const html = [
      '<img src="https://cdn.example.com/logo.v1.png?size=2x">',
      '<meta property="og:image" content="https://cdn.example.com/logo.v1.png?size=2x">',
      '<img src="https://cdn.example.com/logo-v1-png?size=2x">',
    ].join('')
    const rewritten = rewriteAssetUrls(
      html,
      new Map([
        [
          'https://cdn.example.com/logo.v1.png?size=2x',
          '/assets/logo-local.png',
        ],
      ]),
    )

    expect(rewritten.match(/\/assets\/logo-local\.png/g)).toHaveLength(2)
    expect(rewritten).toContain('https://cdn.example.com/logo-v1-png?size=2x')
    expect(rewritten).not.toContain(
      'https://cdn.example.com/logo.v1.png?size=2x',
    )
  })
})
