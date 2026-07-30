import { describe, expect, it, vi } from 'vitest'

import { generateGalleryPreviewImage } from './gallery-preview-image-generation'

const sessionId = 'a'.repeat(32)

describe('generateGalleryPreviewImage', () => {
  it('authorizes before rendering, captures once, uploads, and commits the requested revision', async () => {
    const mutation = vi
      .fn()
      .mockResolvedValueOnce('https://storage.example/upload')
      .mockResolvedValueOnce({ status: 'stored' })
    const capturePng = vi
      .fn()
      .mockResolvedValue(new Uint8Array([137, 80, 78, 71]))
    const fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ storageId: 'storage-id' }), {
        status: 200,
      }),
    )

    const result = await generateGalleryPreviewImage(
      {
        anonymousOwnerSecret: 'owner-secret',
        cacheVersion: 'revision-1',
        sessionId,
      },
      {
        capturePng,
        client: { mutation },
        fetch,
        resolveHtml: async () => '<main>saved page</main>',
      },
    )

    expect(result).toEqual({ status: 'stored' })
    expect(capturePng).toHaveBeenCalledWith('<main>saved page</main>')
    expect(mutation).toHaveBeenCalledTimes(2)
    expect(mutation.mock.calls[0]?.[1]).toEqual({
      anonymousOwnerSecret: 'owner-secret',
      cacheVersion: 'revision-1',
      sessionId,
    })
    expect(mutation.mock.calls[1]?.[1]).toMatchObject({
      anonymousOwnerSecret: 'owner-secret',
      cacheVersion: 'revision-1',
      contentType: 'image/png',
      sessionId,
      size: 4,
      storageId: 'storage-id',
    })
    expect(fetch).toHaveBeenCalledWith(
      'https://storage.example/upload',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('does not render when the current revision is rejected as stale', async () => {
    const capturePng = vi.fn()
    const result = await generateGalleryPreviewImage(
      {
        bearerToken: 'token',
        cacheVersion: 'old',
        sessionId: `${sessionId}b`.slice(0, 32),
      },
      {
        capturePng,
        client: {
          mutation: vi
            .fn()
            .mockRejectedValue(new Error('STALE_PREVIEW_VERSION')),
          setAuth: vi.fn(),
        },
      },
    )

    expect(result).toEqual({ status: 'stale' })
    expect(capturePng).not.toHaveBeenCalled()
  })

  it('coalesces simultaneous work for one saved revision', async () => {
    let resolveCapture: ((png: Uint8Array) => void) | undefined
    const capturePng = vi.fn(
      () =>
        new Promise<Uint8Array>((resolve) => {
          resolveCapture = resolve
        }),
    )
    const mutation = vi
      .fn()
      .mockResolvedValueOnce('https://storage.example/upload')
      .mockResolvedValueOnce({ status: 'stored' })
    const deps = {
      capturePng,
      client: { mutation },
      fetch: vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ storageId: 'storage-id' })),
        ),
      resolveHtml: async () => '<main>saved page</main>',
    }
    const input = {
      anonymousOwnerSecret: 'owner-secret',
      cacheVersion: 'revision-coalesced',
      sessionId: `${sessionId}c`.slice(0, 32),
    }
    const first = generateGalleryPreviewImage(input, deps)
    const second = generateGalleryPreviewImage(input, deps)
    await vi.waitFor(() => expect(capturePng).toHaveBeenCalledTimes(1))
    resolveCapture?.(new Uint8Array([1]))

    await expect(Promise.all([first, second])).resolves.toEqual([
      { status: 'stored' },
      { status: 'stored' },
    ])
  })
})
