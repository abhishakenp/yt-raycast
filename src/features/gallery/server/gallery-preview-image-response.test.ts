import { describe, expect, it } from 'vitest'

import { createGalleryPreviewImageResponse } from './gallery-preview-image-response'

describe('createGalleryPreviewImageResponse', () => {
  it('returns a PNG image response for resolved preview HTML', async () => {
    const png = new Uint8Array([137, 80, 78, 71])
    const response = await createGalleryPreviewImageResponse('session-1', {
      capturePng: async (html) => {
        expect(html).toBe('<!doctype html><html><body>Preview</body></html>')
        return png
      },
      resolveHtml: async (sessionId) => {
        expect(sessionId).toBe('session-1')
        return '<!doctype html><html><body>Preview</body></html>'
      },
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')
    expect(response.headers.get('cache-control')).toContain('max-age=300')
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(png)
  })

  it('returns 404 when the current gallery preview lookup has no HTML', async () => {
    const response = await createGalleryPreviewImageResponse('missing', {
      capturePng: async () => new Uint8Array([1]),
      resolveHtml: async () => null,
    })

    expect(response.status).toBe(404)
    expect(response.headers.get('content-type')).toBe(
      'text/plain; charset=utf-8',
    )
    expect(await response.text()).toBe('Preview not found or not public')
  })

  it('caches versioned PNG responses and skips HTML resolution on cache hits', async () => {
    const png = new Uint8Array([137, 80, 78, 71, 1])
    const cache = new Map<string, Uint8Array>()
    let resolveCalls = 0
    let captureCalls = 0

    const deps = {
      cacheVersion: '12345',
      capturePng: async () => {
        captureCalls += 1
        return png
      },
      readCachedPng: async (cacheKey: string) => cache.get(cacheKey) ?? null,
      resolveHtml: async () => {
        resolveCalls += 1
        return '<!doctype html><html><body>Preview</body></html>'
      },
      writeCachedPng: async (
        cacheKey: string,
        _cacheVersion: string,
        bytes: Uint8Array,
      ) => {
        cache.set(cacheKey, bytes)
      },
    }

    const first = await createGalleryPreviewImageResponse('session-cache', deps)
    const second = await createGalleryPreviewImageResponse(
      'session-cache',
      deps,
    )

    expect(first.status).toBe(200)
    expect(second.status).toBe(200)
    expect(first.headers.get('cache-control')).toBe(
      'public, max-age=31536000, immutable',
    )
    expect(new Uint8Array(await second.arrayBuffer())).toEqual(png)
    expect(resolveCalls).toBe(1)
    expect(captureCalls).toBe(1)
  })

  it('replaces the session-keyed PNG when the cache version changes', async () => {
    const cache = new Map<string, { bytes: Uint8Array; cacheVersion: string }>()
    let captureCalls = 0

    const makeDeps = (cacheVersion: string) => ({
      cacheVersion,
      capturePng: async () => {
        captureCalls += 1
        return new Uint8Array([captureCalls])
      },
      readCachedPng: async (cacheKey: string, requestedVersion: string) => {
        const cached = cache.get(cacheKey)
        return cached?.cacheVersion === requestedVersion ? cached.bytes : null
      },
      resolveHtml: async () =>
        '<!doctype html><html><body>Preview</body></html>',
      writeCachedPng: async (
        cacheKey: string,
        writtenVersion: string,
        bytes: Uint8Array,
      ) => {
        cache.set(cacheKey, { bytes, cacheVersion: writtenVersion })
      },
    })

    const first = await createGalleryPreviewImageResponse(
      'session-replace',
      makeDeps('111'),
    )
    const second = await createGalleryPreviewImageResponse(
      'session-replace',
      makeDeps('222'),
    )

    expect(new Uint8Array(await first.arrayBuffer())).toEqual(
      new Uint8Array([1]),
    )
    expect(new Uint8Array(await second.arrayBuffer())).toEqual(
      new Uint8Array([2]),
    )
    expect(cache.size).toBe(1)
    expect(cache.get('session-replace')?.cacheVersion).toBe('222')
    expect(captureCalls).toBe(2)
  })

  it('does not persistently cache unversioned image responses', async () => {
    let captureCalls = 0
    const deps = {
      cacheVersion: null,
      capturePng: async () => {
        captureCalls += 1
        return new Uint8Array([captureCalls])
      },
      resolveHtml: async () =>
        '<!doctype html><html><body>Preview</body></html>',
    }

    const first = await createGalleryPreviewImageResponse(
      'session-unversioned',
      deps,
    )
    const second = await createGalleryPreviewImageResponse(
      'session-unversioned',
      deps,
    )

    expect(first.headers.get('cache-control')).toContain('max-age=300')
    expect(new Uint8Array(await first.arrayBuffer())).toEqual(
      new Uint8Array([1]),
    )
    expect(new Uint8Array(await second.arrayBuffer())).toEqual(
      new Uint8Array([2]),
    )
    expect(captureCalls).toBe(2)
  })

  it('returns 503 when PNG capture fails', async () => {
    const response = await createGalleryPreviewImageResponse('session-1', {
      capturePng: async () => {
        throw new Error('chromium unavailable')
      },
      resolveHtml: async () =>
        '<!doctype html><html><body>Preview</body></html>',
    })

    expect(response.status).toBe(503)
    expect(await response.text()).toBe('Preview image temporarily unavailable')
  })
})
