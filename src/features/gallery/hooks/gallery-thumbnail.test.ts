import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const loadModule = async () => {
  vi.resetModules()
  return import('./gallery-thumbnail')
}

describe('gallery thumbnail helpers', () => {
  let originalFetch: typeof globalThis.fetch
  let originalCreateObjectURL: typeof URL.createObjectURL | undefined
  let originalRevokeObjectURL: typeof URL.revokeObjectURL | undefined

  beforeEach(() => {
    originalFetch = globalThis.fetch
    originalCreateObjectURL = URL.createObjectURL
    originalRevokeObjectURL = URL.revokeObjectURL
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000)
    URL.createObjectURL = vi.fn((blob: Blob) => `blob:${blob.size}`)
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    if (originalCreateObjectURL) URL.createObjectURL = originalCreateObjectURL
    if (originalRevokeObjectURL) URL.revokeObjectURL = originalRevokeObjectURL
    vi.restoreAllMocks()
  })

  it('builds encoded gallery thumbnail URLs from session id and preview version', async () => {
    const { getGalleryThumbnailUrl } = await loadModule()

    expect(
      getGalleryThumbnailUrl({
        sessionId: 'session with/slash?',
        previewVersion: 12,
      }),
    ).toBe('/api/sessions/session%20with%2Fslash%3F/gallery-thumb?v=12')
    expect(
      getGalleryThumbnailUrl({
        sessionId: 'session-no-version',
      }),
    ).toBe('/api/sessions/session-no-version/gallery-thumb?v=0')
  })

  it('coalesces concurrent thumbnail fetches and reuses the cached object URL', async () => {
    const { resolveGalleryThumbnail } = await loadModule()
    const response = new Response(new Blob(['thumbnail']), { status: 200 })
    globalThis.fetch = vi.fn().mockResolvedValue(response)

    const [first, second] = await Promise.all([
      resolveGalleryThumbnail('/api/sessions/one/gallery-thumb?v=1'),
      resolveGalleryThumbnail('/api/sessions/one/gallery-thumb?v=1'),
    ])
    const cached = await resolveGalleryThumbnail(
      '/api/sessions/one/gallery-thumb?v=1',
    )

    expect(first).toBe('blob:9')
    expect(second).toBe('blob:9')
    expect(cached).toBe('blob:9')
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
  })

  it('expires cached object URLs, revokes the stale URL, and fetches a fresh blob', async () => {
    const { resolveGalleryThumbnail } = await loadModule()
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(new Blob(['old']), { status: 200 }))
      .mockResolvedValueOnce(new Response(new Blob(['newer']), { status: 200 }))

    const first = await resolveGalleryThumbnail(
      '/api/sessions/expiring/gallery-thumb?v=1',
    )
    vi.mocked(Date.now).mockReturnValue(1_000_000 + 5 * 60_000 + 1)
    const second = await resolveGalleryThumbnail(
      '/api/sessions/expiring/gallery-thumb?v=1',
    )

    expect(first).toBe('blob:3')
    expect(second).toBe('blob:5')
    expect(globalThis.fetch).toHaveBeenCalledTimes(2)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:3')
  })

  it('returns undefined for failed thumbnail responses and retries later calls', async () => {
    const { resolveGalleryThumbnail } = await loadModule()
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('missing', { status: 404 }))
      .mockResolvedValueOnce(new Response(new Blob(['ok']), { status: 200 }))

    await expect(
      resolveGalleryThumbnail('/api/sessions/retry/gallery-thumb?v=1'),
    ).resolves.toBeUndefined()
    await expect(
      resolveGalleryThumbnail('/api/sessions/retry/gallery-thumb?v=1'),
    ).resolves.toBe('blob:2')
    expect(globalThis.fetch).toHaveBeenCalledTimes(2)
  })
})
