import { describe, expect, it } from 'vitest'

import {
  createGalleryPreviewImageResponse,
  type GalleryPreviewImageResponseDeps,
} from './gallery-preview-image-response'

describe('createGalleryPreviewImageResponse', () => {
  it('returns a cached PNG when readCachedPng provides bytes', async () => {
    const png = new Uint8Array([137, 80, 78, 71])
    const deps: GalleryPreviewImageResponseDeps = {
      cacheVersion: 'v1',
      readCachedPng: async () => png,
    }

    const response = await createGalleryPreviewImageResponse('session-1', deps)

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(png)
  })

  it('returns 400 when cacheVersion is missing', async () => {
    const response = await createGalleryPreviewImageResponse('session-1', {
      cacheVersion: null,
    })

    expect(response.status).toBe(400)
    expect(await response.text()).toBe('Preview image version is required')
  })

  it('returns 400 when cacheVersion is an invalid string', async () => {
    const response = await createGalleryPreviewImageResponse('session-1', {
      cacheVersion: 'has spaces!',
    })

    expect(response.status).toBe(400)
  })

  it('returns 503 when generation succeeds but no PNG is available', async () => {
    const deps: GalleryPreviewImageResponseDeps = {
      cacheVersion: 'v1',
      generateImage: async () => ({ status: 'stored' }),
      readCachedPng: async () => null,
    }

    const response = await createGalleryPreviewImageResponse(
      'session-no-png',
      deps,
    )

    expect(response.status).toBe(503)
  })

  it('returns 503 when generation reports not_found', async () => {
    const deps: GalleryPreviewImageResponseDeps = {
      cacheVersion: 'v1',
      generateImage: async () => ({ status: 'not_found' }),
      readCachedPng: async () => null,
    }

    const response = await createGalleryPreviewImageResponse(
      'session-not-found',
      deps,
    )

    expect(response.status).toBe(503)
  })

  it('returns a PNG after generation stores it', async () => {
    const png = new Uint8Array([1, 2, 3])
    let callCount = 0
    const deps: GalleryPreviewImageResponseDeps = {
      cacheVersion: 'v1',
      generateImage: async () => {
        callCount += 1
        return { status: 'stored' }
      },
      readCachedPng: async () => {
        // Return null on first read (before generation), png on second (after)
        return callCount === 0 ? null : png
      },
    }

    const response = await createGalleryPreviewImageResponse(
      'session-gen-store',
      deps,
    )

    expect(response.status).toBe(200)
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(png)
  })
})
