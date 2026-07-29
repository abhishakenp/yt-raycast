import { describe, expect, it, vi } from 'vitest'

import { createGalleryPreviewImageResponse } from './gallery-preview-image-response'

describe('createGalleryPreviewImageResponse', () => {
  it('returns a PNG image response from a ready, version-matched stored image', async () => {
    const png = new Uint8Array([137, 80, 78, 71])
    const response = await createGalleryPreviewImageResponse('session-1', {
      cacheVersion: '12345',
      readCachedPng: async (sessionId, cacheVersion) => {
        expect(sessionId).toBe('session-1')
        expect(cacheVersion).toBe('12345')
        return png
      },
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')
    expect(response.headers.get('cache-control')).toBe(
      'public, max-age=31536000, immutable',
    )
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(png)
  })

  it('triggers generation on cache miss, waits for it, and returns the PNG after it is stored', async () => {
    const png = new Uint8Array([137, 80, 78, 71, 99])
    let generateCalls = 0
    let readCalls = 0
    const response = await createGalleryPreviewImageResponse('session-gen', {
      cacheVersion: '67890',
      generateImage: async (sessionId, cacheVersion) => {
        generateCalls += 1
        expect(sessionId).toBe('session-gen')
        expect(cacheVersion).toBe('67890')
        return { status: 'stored' }
      },
      readCachedPng: async () => {
        readCalls += 1
        // First read (before generation) misses; second read (after) hits.
        return readCalls === 1 ? null : png
      },
    })

    expect(generateCalls).toBe(1)
    expect(readCalls).toBe(2)
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(png)
  })

  it('returns 503 when generation fails and no cached image is available', async () => {
    const response = await createGalleryPreviewImageResponse('missing', {
      cacheVersion: '12345',
      generateImage: async () => ({ status: 'failed' }),
      readCachedPng: async () => null,
    })

    expect(response.status).toBe(503)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(response.headers.get('retry-after')).toBe('5')
    expect(await response.text()).toBe('Preview image is not ready')
  })

  it('returns 503 when the session is not found', async () => {
    const response = await createGalleryPreviewImageResponse('missing', {
      cacheVersion: '12345',
      generateImage: async () => ({ status: 'not_found' }),
      readCachedPng: async () => null,
    })

    expect(response.status).toBe(503)
    expect(await response.text()).toBe('Preview image is not ready')
  })

  it('requires a cache version so every served image has versioned access control', async () => {
    const response = await createGalleryPreviewImageResponse('missing', {
      readCachedPng: async () => {
        throw new Error('must not look up unversioned images')
      },
    })

    expect(response.status).toBe(400)
    expect(response.headers.get('content-type')).toBe(
      'text/plain; charset=utf-8',
    )
    expect(await response.text()).toBe('Preview image version is required')
  })

  it('keeps versioned stored images isolated when a session gets a new cache version', async () => {
    const png = new Uint8Array([137, 80, 78, 71, 1])
    const storedVersion = 'old-version'
    const response = await createGalleryPreviewImageResponse('session-1', {
      cacheVersion: 'new-version',
      generateImage: async () => ({ status: 'stale' }),
      readCachedPng: async (_sessionId, cacheVersion) =>
        cacheVersion === storedVersion ? png : null,
    })

    expect(response.status).toBe(503)
    expect(await response.text()).toBe('Preview image is not ready')
  })
})
