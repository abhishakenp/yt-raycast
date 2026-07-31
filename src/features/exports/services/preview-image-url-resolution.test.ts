import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  extractPreviewImageSourceReferences,
  rewritePreviewImageUrls,
} from './preview-image-url-resolution'

const originalPexelsKey = process.env.PEXELS_API_KEY
const originalVitePexelsKey = process.env.VITE_PEXELS_API_KEY
const originalUnsplashKey = process.env.UNSPLASH_ACCESS_KEY
const originalViteUnsplashKey = process.env.VITE_UNSPLASH_ACCESS_KEY
const originalAppBaseUrl = process.env.APP_BASE_URL
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
  if (originalAppBaseUrl === undefined) {
    delete process.env.APP_BASE_URL
  } else {
    process.env.APP_BASE_URL = originalAppBaseUrl
  }
}

describe('preview image URL resolution', () => {
  beforeEach(() => {
    restoreEnv()
    delete process.env.UNSPLASH_ACCESS_KEY
    delete process.env.VITE_UNSPLASH_ACCESS_KEY
    delete process.env.APP_BASE_URL
    globalThis.fetch = originalFetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    restoreEnv()
  })

  it('extracts preview image sources with decoded alt text and encoded source keys', () => {
    const sources = extractPreviewImageSourceReferences(
      [
        '<main>',
        '<img alt="Dashboard &amp; hero" src="/api/pexels?query=playground+structures&w=600&h=400">',
        '<img alt=Thumbnail src="https://cdn.example.test/thumb.jpg">',
        '<img alt="Ignored" src="mailto:nope">',
        '</main>',
      ].join(''),
    )

    expect(sources).toEqual([
      {
        alt: 'Dashboard & hero',
        originalSrc: '/api/pexels?query=playground+structures&w=600&h=400',
        originalSrcKey:
          '%2Fapi%2Fpexels%3Fquery%3Dplayground%2Bstructures%26w%3D600%26h%3D400',
      },
      {
        alt: 'Thumbnail',
        originalSrc: 'https://cdn.example.test/thumb.jpg',
        originalSrcKey: 'https%3A%2F%2Fcdn.example.test%2Fthumb.jpg',
      },
    ])
  })

  it('reuses the dashboard preview route resolved image instead of re-searching Pexels', async () => {
    process.env.APP_BASE_URL = 'https://ship-fast.test'
    process.env.PEXELS_API_KEY = 'pexels-key'
    const fetchMock = vi.fn(async (input) => {
      const url = new URL(String(input))
      if (url.origin === 'https://ship-fast.test') {
        return new Response(null, {
          status: 302,
          headers: {
            Location:
              'https://images.pexels.test/photos/exact-dashboard-image.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
          },
        })
      }
      throw new Error(`unexpected provider lookup ${String(input)}`)
    })
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const rewritten = await rewritePreviewImageUrls(
      '<img alt="Hero" src="/api/pexels?query=glass+installations&w=800&h=600&seed=dashboard-seed">',
    )

    const calls = fetchMock.mock.calls as unknown as Array<
      [RequestInfo | URL, RequestInit | undefined]
    >
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String(calls[0]?.[0])).toBe(
      'https://ship-fast.test/api/pexels?query=glass+installations&w=800&h=600&seed=dashboard-seed',
    )
    expect(calls[0]?.[1]).toMatchObject({
      redirect: 'manual',
    })
    expect(rewritten).toContain(
      'https://images.pexels.test/photos/exact-dashboard-image.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    )
    expect(rewritten).not.toContain('/api/pexels')
    expect(rewritten).not.toContain('picsum.photos')
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

  it('rewrites generated image preload hrefs so exports do not depend on Ship Fast image routes', async () => {
    process.env.PEXELS_API_KEY = 'pexels-key'
    const fetchMock = vi.fn(async () =>
      Response.json({
        photos: [
          {
            src: {
              large: 'https://images.pexels.test/context-large.jpg',
            },
          },
        ],
      }),
    )
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const rewritten = await rewritePreviewImageUrls(
      '<link rel="preload" as="image" href="/api/pexels?query=cited+answers&w=800&h=600&seed=hero">',
    )

    expect(rewritten).toContain(
      'href="https://images.pexels.test/context-large.jpg"',
    )
    expect(rewritten).not.toContain('/api/pexels')
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

  it('does NOT use VITE_PEXELS_API_KEY fallback (security: prevents client bundle leakage)', async () => {
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

    // The Pexels API should NOT be called with the VITE_ key — it must fall
    // back to picsum since PEXELS_API_KEY is not set.
    expect(fetchMock).not.toHaveBeenCalled()
    expect(rewritten).toContain('picsum.photos')
    expect(rewritten).not.toContain('images.pexels.test')
  })
})
