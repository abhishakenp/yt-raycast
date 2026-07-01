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
    URL.createObjectURL = vi.fn(() => 'blob:forbidden-gallery-thumbnail')
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    if (originalCreateObjectURL) URL.createObjectURL = originalCreateObjectURL
    if (originalRevokeObjectURL) URL.revokeObjectURL = originalRevokeObjectURL
    vi.restoreAllMocks()
  })

  it('does not build a PNG thumbnail URL for gallery cards', async () => {
    const { getGalleryThumbnailUrl } = await loadModule()

    expect(
      getGalleryThumbnailUrl({
        sessionId: 'session with/slash?',
        previewVersion: 12,
      }),
    ).toBe('')
  })

  it('does not fetch thumbnail blobs or create object URLs', async () => {
    const { resolveGalleryThumbnail } = await loadModule()
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(new Blob(['thumbnail']), {
        headers: { 'content-type': 'image/png' },
        status: 200,
      }),
    )

    await expect(
      resolveGalleryThumbnail('/api/sessions/one/gallery-thumb?v=1'),
    ).resolves.toBeUndefined()

    expect(globalThis.fetch).not.toHaveBeenCalled()
    expect(URL.createObjectURL).not.toHaveBeenCalled()
  })
})
