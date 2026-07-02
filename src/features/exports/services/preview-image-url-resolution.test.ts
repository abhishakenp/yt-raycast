import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { rewritePreviewImageUrls } from './preview-image-url-resolution'

const originalPexelsKey = process.env.PEXELS_API_KEY
const originalVitePexelsKey = process.env.VITE_PEXELS_API_KEY
const originalUnsplashKey = process.env.UNSPLASH_ACCESS_KEY
const originalViteUnsplashKey = process.env.VITE_UNSPLASH_ACCESS_KEY
const originalFetch = globalThis.fetch

const restoreEnv = () => {
  if (originalPexelsKey === undefined) {
    delete process.env.PEXELS_API_KEY
  } else {
    process.env.PEXELS_API_KEY = originalPexelsKey
  }
  if (originalVitePexelsKey === undefined) {
    delete process.env.VITE_PEXELS_API_KEY
  } else {
    process.env.VITE_PEXELS_API_KEY = originalVitePexelsKey
  }
  if (originalUnsplashKey === undefined) {
    delete process.env.UNSPLASH_ACCESS_KEY
  } else {
    process.env.UNSPLASH_ACCESS_KEY = originalUnsplashKey
  }
  if (originalViteUnsplashKey === undefined) {
    delete process.env.VITE_UNSPLASH_ACCESS_KEY
  } else {
    process.env.VITE_UNSPLASH_ACCESS_KEY = originalViteUnsplashKey
  }
}

describe('preview image URL resolution', () => {
  beforeEach(() => {
    restoreEnv()
    delete process.env.UNSPLASH_ACCESS_KEY
    delete process.env.VITE_UNSPLASH_ACCESS_KEY
    globalThis.fetch = originalFetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    restoreEnv()
  })

  it('uses the same seed-specific Pexels selection as the dashboard direct preview route', async () => {
    process.env.PEXELS_API_KEY = 'pexels-key'
    const fetchMock = vi.fn(async () =>
      Response.json({
        photos: [
          {
            src: {
              medium: 'https://images.pexels.test/photo-0-medium.jpg',
              large: 'https://images.pexels.test/photo-0-large.jpg',
              large2x: 'https://images.pexels.test/photo-0-large2x.jpg',
              original: 'https://images.pexels.test/photo-0-original.jpg',
            },
          },
          {
            src: {
              medium: 'https://images.pexels.test/photo-1-medium.jpg',
              large: 'https://images.pexels.test/photo-1-large.jpg',
              large2x: 'https://images.pexels.test/photo-1-large2x.jpg',
              original: 'https://images.pexels.test/photo-1-original.jpg',
            },
          },
          {
            src: {
              medium: 'https://images.pexels.test/photo-2-medium.jpg',
              large: 'https://images.pexels.test/photo-2-large.jpg',
              large2x: 'https://images.pexels.test/photo-2-large2x.jpg',
              original: 'https://images.pexels.test/photo-2-original.jpg',
            },
          },
        ],
      }),
    )
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const html = [
      '<main>',
      '<img alt="Hero" src="/api/pexels?query=glass+installations&w=800&h=600&seed=alpha">',
      '<img alt="Detail" src="/api/pexels?query=glass+installations&w=800&h=600&seed=bravo">',
      '</main>',
    ].join('')

    const rewritten = await rewritePreviewImageUrls(html)

    const calls = fetchMock.mock.calls as unknown as Array<
      [RequestInfo | URL, RequestInit | undefined]
    >
    expect(String(calls[0]?.[0])).toBe(
      'https://api.pexels.com/v1/search?query=glass+installations&per_page=15&orientation=landscape',
    )
    expect(calls[0]?.[1]).toEqual({
      headers: { Authorization: 'pexels-key' },
    })
    expect(rewritten).toContain('https://images.pexels.test/photo-2-large.jpg')
    expect(rewritten).toContain('https://images.pexels.test/photo-1-large.jpg')
    expect(rewritten).not.toContain('/api/pexels')
    expect(rewritten).not.toContain('picsum.photos')
  })

  it('normalizes unseeded Pexels queries exactly like the dashboard route', async () => {
    process.env.PEXELS_API_KEY = 'pexels-key'
    const fetchMock = vi.fn(async () =>
      Response.json({
        photos: [
          {
            src: {
              medium: 'https://images.pexels.test/max-medium.jpg',
              large: 'https://images.pexels.test/max-large.jpg',
              large2x: 'https://images.pexels.test/max-large2x.jpg',
              original: 'https://images.pexels.test/max-original.jpg',
            },
          },
        ],
      }),
    )
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const rewritten = await rewritePreviewImageUrls(
      '<img alt="Max the dog" src="/api/pexels?query=max-the-dog&w=800&h=600">',
    )

    const calls = fetchMock.mock.calls as unknown as Array<
      [RequestInfo | URL, RequestInit | undefined]
    >
    expect(String(calls[0]?.[0])).toBe(
      'https://api.pexels.com/v1/search?query=max+dog&per_page=15&orientation=landscape',
    )
    expect(calls[0]?.[1]).toEqual({
      headers: { Authorization: 'pexels-key' },
    })
    expect(rewritten).toContain('https://images.pexels.test/max-large.jpg')
  })

  it('resolves deployed preview images with the Vite Pexels key used by app environments', async () => {
    delete process.env.PEXELS_API_KEY
    process.env.VITE_PEXELS_API_KEY = 'vite-pexels-key'
    const fetchMock = vi.fn(async () =>
      Response.json({
        photos: [
          {
            src: {
              medium: 'https://images.pexels.test/vite-medium.jpg',
              large: 'https://images.pexels.test/vite-large.jpg',
              large2x: 'https://images.pexels.test/vite-large2x.jpg',
              original: 'https://images.pexels.test/vite-original.jpg',
            },
          },
        ],
      }),
    )
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const rewritten = await rewritePreviewImageUrls(
      '<img alt="Glass showroom" src="/api/pexels?query=glass+showroom&w=800&h=600&seed=hero">',
    )

    const calls = fetchMock.mock.calls as unknown as Array<
      [RequestInfo | URL, RequestInit | undefined]
    >
    expect(String(calls[0]?.[0])).toBe(
      'https://api.pexels.com/v1/search?query=glass+showroom&per_page=15&orientation=landscape',
    )
    expect(calls[0]?.[1]).toEqual({
      headers: { Authorization: 'vite-pexels-key' },
    })
    expect(rewritten).toContain('https://images.pexels.test/vite-large.jpg')
    expect(rewritten).not.toContain('picsum.photos')
  })
})
