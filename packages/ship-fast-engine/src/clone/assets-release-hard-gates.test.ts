import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { downloadAsset, downloadPageAssets } from './assets'
import type { CapturedPage } from './types'

const PUBLIC_IMAGE_URL = 'https://93.184.216.34/release-image.png'

function workspace(): string {
  return mkdtempSync(join(tmpdir(), 'ship-fast-assets-release-'))
}

function imageResponse(
  body: BodyInit,
  headers: Record<string, string> = { 'content-type': 'image/png' },
): Response {
  const response = new Response(body, { status: 200, headers })
  Object.defineProperty(response, 'url', {
    configurable: true,
    value: PUBLIC_IMAGE_URL,
  })
  return response
}

function capturedPage(assetUrls: string[]): CapturedPage {
  return {
    url: 'https://93.184.216.34/',
    normalizedUrl: 'https://93.184.216.34/',
    html: '<!doctype html><html><body><main>Release page</main></body></html>',
    computedStyles: new Map(),
    bboxes: new Map(),
    assetUrls,
  }
}

describe('clone asset release hard gates', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('rejects a declared oversized asset before buffering its body', async () => {
    const response = imageResponse(new Uint8Array([1, 2, 3]), {
      'content-type': 'image/png',
      'content-length': String(10 * 1024 * 1024 + 1),
    })
    const body = response.body
    if (body === null) throw new Error('asset fixture requires a response body')
    const bodyReader = vi.spyOn(body, 'getReader')
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => response),
    )
    const target = workspace()

    const result = await downloadAsset(PUBLIC_IMAGE_URL, target)

    expect(result).toBeNull()
    expect(bodyReader).not.toHaveBeenCalled()
    expect(existsSync(join(target, 'assets'))).toBe(false)
  })

  it('rejects a streamed asset that crosses the byte cap without a length header', async () => {
    const chunk = new Uint8Array(6 * 1024 * 1024)
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(chunk)
        controller.enqueue(chunk)
      },
    })
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => imageResponse(stream)),
    )
    const target = workspace()

    const result = await downloadAsset(PUBLIC_IMAGE_URL, target)

    expect(result).toBeNull()
    expect(existsSync(join(target, 'assets'))).toBe(false)
  })

  it('downloads a duplicated page asset only once', async () => {
    const fetchMock = vi.fn(async () =>
      imageResponse(new Uint8Array([137, 80, 78, 71])),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await downloadPageAssets(
      capturedPage([PUBLIC_IMAGE_URL, PUBLIC_IMAGE_URL, PUBLIC_IMAGE_URL]),
      workspace(),
      4,
    )

    expect(result.size).toBe(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('uses a deterministic content-addressed path for identical asset bytes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        imageResponse(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])),
      ),
    )

    const first = await downloadAsset(PUBLIC_IMAGE_URL, workspace())
    const second = await downloadAsset(PUBLIC_IMAGE_URL, workspace())

    expect(first).not.toBeNull()
    expect(second).toBe(first)
  })

  it('does not begin asset requests after cancellation', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const controller = new AbortController()
    controller.abort(new Error('clone cancelled'))

    const result = await downloadPageAssets(
      capturedPage([PUBLIC_IMAGE_URL]),
      workspace(),
      2,
      controller.signal,
    )

    expect(result.size).toBe(0)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
