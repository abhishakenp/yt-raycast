import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Route } from './pexels'
import { callRouteHandler } from './-route-handler.test-helper'

const originalEnv = { ...process.env }

async function requestImage(query: string) {
  const request = new Request(`https://ship-fast.ai/api/pexels?${query}`)
  return callRouteHandler(Route, 'GET', { request })
}

// Cache deps that bypass the real Convex storage path so the stubbed global
// fetch is only exercised by the Pollinations call itself.
const bypassConvexCache = {
  readCachedImage: async () => null,
  writeCachedImage: async () => {},
}

describe('/api/pexels Pexels-first + Pollinations generation', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    process.env = { ...originalEnv }
  })

  it('serves Pexels first when PEXELS_API_KEY is set and Pexels has a match', async () => {
    process.env.PEXELS_API_KEY = 'pexels-key'
    delete process.env.UNSPLASH_ACCESS_KEY
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = input.toString()
      if (url.includes('api.pexels.com')) {
        return new Response(
          JSON.stringify({
            photos: [
              { src: { large: 'https://images.pexels.test/match.jpg' } },
            ],
          }),
          { headers: { 'Content-Type': 'application/json' } },
        )
      }
      return new Response('should not reach', { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const response = await requestImage(
      'query=seasonal%20brewery%20release&w=900&h=600&seed=release',
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe(
      'https://images.pexels.test/match.jpg',
    )
    expect(response.headers.get('X-Image-Source')).toBe('pexels')
  })

  it('generates with Pollinations when no stock providers are configured', async () => {
    delete process.env.PEXELS_API_KEY
    delete process.env.VITE_PEXELS_API_KEY
    delete process.env.UNSPLASH_ACCESS_KEY
    delete process.env.VITE_UNSPLASH_ACCESS_KEY
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0])
    const fetchMock = vi.fn(async () =>
      new Response(new Uint8Array(bytes), {
        headers: { 'Content-Type': 'image/jpeg' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const response = await requestImage(
      'query=obscure%20no%20match&w=900&h=600&seed=gen',
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('image/jpeg')
    expect(response.headers.get('X-Image-Source')).toBe('pollinations')
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes)
  })

  it('falls back to Picsum when Pollinations fails and no stock providers are configured', async () => {
    delete process.env.PEXELS_API_KEY
    delete process.env.VITE_PEXELS_API_KEY
    delete process.env.UNSPLASH_ACCESS_KEY
    delete process.env.VITE_UNSPLASH_ACCESS_KEY
    const fetchMock = vi.fn().mockRejectedValue(new Error('upstream down'))
    vi.stubGlobal('fetch', fetchMock)

    const response = await requestImage(
      'query=brewery-fail&w=900&h=600&seed=hero-fail',
    )

    expect(response.status).toBe(302)
    const location = response.headers.get('Location') ?? ''
    expect(location).toContain('picsum.photos/seed/')
    expect(response.headers.get('X-Image-Source')).toBe('picsum-fallback')
  })

  it('bounds the Pollinations call with an abort signal so a stalled API cannot hang the route', async () => {
    delete process.env.PEXELS_API_KEY
    delete process.env.VITE_PEXELS_API_KEY
    delete process.env.UNSPLASH_ACCESS_KEY
    delete process.env.VITE_UNSPLASH_ACCESS_KEY
    const fetchMock = vi.fn(async () =>
      new Response(new Uint8Array([1, 2]), {
        headers: { 'Content-Type': 'image/jpeg' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await requestImage('query=abort-signal-test&w=900&h=600&seed=abort-xyz')

    const pollinationsCall = fetchMock.mock.calls.find(([url]) =>
      url.toString().includes('image.pollinations.ai/prompt/'),
    )
    expect(pollinationsCall).toBeDefined()
    expect(pollinationsCall![1]).toEqual(
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('serves a cached blob from Convex storage without refetching', async () => {
    delete process.env.PEXELS_API_KEY
    delete process.env.VITE_PEXELS_API_KEY
    delete process.env.UNSPLASH_ACCESS_KEY
    delete process.env.VITE_UNSPLASH_ACCESS_KEY
    const cachedBytes = new Uint8Array([9, 9, 9, 9])
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const request = new Request(
      'https://ship-fast.ai/api/pexels?query=stored-hero&w=640&h=480&seed=s',
    )
    const { createPexelsPreviewImageResponse } = await import(
      '@/features/images/server/pexels-preview-image'
    )
    const response = await createPexelsPreviewImageResponse(request, {
      readCachedImage: async () => ({
        bytes: cachedBytes,
        contentType: 'image/png',
      }),
      writeCachedImage: async () => {},
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('image/png')
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(cachedBytes)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('dedupes concurrent Pollinations requests for the same cache key to a single fetch', async () => {
    delete process.env.PEXELS_API_KEY
    delete process.env.VITE_PEXELS_API_KEY
    delete process.env.UNSPLASH_ACCESS_KEY
    delete process.env.VITE_UNSPLASH_ACCESS_KEY
    const bytes = new Uint8Array([5, 6, 7, 8])
    let calls = 0
    const fetchMock = vi.fn(async () => {
      calls += 1
      await new Promise((resolve) => setTimeout(resolve, 5))
      return new Response(new Uint8Array(bytes), {
        headers: { 'Content-Type': 'image/jpeg' },
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const { createPexelsPreviewImageResponse } = await import(
      '@/features/images/server/pexels-preview-image'
    )
    const request = new Request(
      'https://ship-fast.ai/api/pexels?query=dedupe-hero&w=512&h=512&seed=d',
    )
    const [a, b] = await Promise.all([
      createPexelsPreviewImageResponse(request, bypassConvexCache),
      createPexelsPreviewImageResponse(request, bypassConvexCache),
    ])

    expect(a.status).toBe(200)
    expect(b.status).toBe(200)
    expect(calls).toBe(1)
  })
})
