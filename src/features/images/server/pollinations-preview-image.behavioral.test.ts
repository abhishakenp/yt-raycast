import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  buildPollinationsCacheKey,
  buildPollinationsUrl,
  createPexelsPreviewImageResponse,
  resolvePollinationsPrompt,
} from './pexels-preview-image'

describe('buildPollinationsUrl', () => {
  it('encodes the prompt into the path and sets deterministic query params', () => {
    const url = buildPollinationsUrl('craft beer brewery', 800, 600, 42)
    const parsed = new URL(url)
    expect(parsed.origin).toBe('https://image.pollinations.ai')
    expect(parsed.pathname).toBe('/prompt/craft%20beer%20brewery')
    expect(parsed.searchParams.get('width')).toBe('800')
    expect(parsed.searchParams.get('height')).toBe('600')
    expect(parsed.searchParams.get('seed')).toBe('42')
    expect(parsed.searchParams.get('model')).toBe('flux')
    expect(parsed.searchParams.get('nologo')).toBe('true')
    expect(parsed.searchParams.get('enhance')).toBe('true')
    expect(parsed.searchParams.get('referrer')).toBe('ship-fast.ai')
  })

  it('caps dimensions at the max of 1024', () => {
    const url = buildPollinationsUrl('hero', 2400, 2400, 1)
    const parsed = new URL(url)
    expect(parsed.searchParams.get('width')).toBe('1024')
    expect(parsed.searchParams.get('height')).toBe('1024')
  })
})

describe('buildPollinationsCacheKey', () => {
  it('is deterministic for the same prompt/dims/seed/model', () => {
    const a = buildPollinationsCacheKey('hero', 800, 600, 7, 'flux')
    const b = buildPollinationsCacheKey('hero', 800, 600, 7, 'flux')
    expect(a).toBe(b)
    expect(a).toBe('hero|800x600|7|flux')
  })

  it('differs when any component changes', () => {
    const base = buildPollinationsCacheKey('hero', 800, 600, 7, 'flux')
    expect(buildPollinationsCacheKey('hero', 801, 600, 7, 'flux')).not.toBe(base)
    expect(buildPollinationsCacheKey('hero', 800, 600, 8, 'flux')).not.toBe(base)
    expect(buildPollinationsCacheKey('hero', 800, 600, 7, 'turbo')).not.toBe(base)
  })
})

describe('resolvePollinationsPrompt', () => {
  it('derives a numeric seed from the seed param and reuses query generation', () => {
    const parsed = new URL(
      'https://ship-fast.ai/api/pexels?query=craft%20beer%20brewery&w=800&h=600&seed=hero',
    )
    const { prompt, width, height, seed, cacheKey } = resolvePollinationsPrompt(
      parsed,
    )
    expect(prompt).toBe('craft beer brewery')
    expect(width).toBe(800)
    expect(height).toBe(600)
    expect(typeof seed).toBe('number')
    expect(cacheKey).toBe(`${prompt}|${width}x${height}|${seed}|flux`)
  })

  it('falls back to a default query when none is provided', () => {
    const parsed = new URL('https://ship-fast.ai/api/pexels?w=400&h=300')
    const { prompt } = resolvePollinationsPrompt(parsed)
    expect(prompt).toBe('nature')
  })
})

describe('createPexelsPreviewImageResponse (Pollinations proxy)', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
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
      // Pollinations should NOT be called
      return new Response('should not reach', { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const response = await createPexelsPreviewImageResponse(
      new Request(
        'https://ship-fast.ai/api/pexels?query=craft%20beer%20brewery&w=800&h=600&seed=hero',
      ),
      {
        readCachedImage: async () => null,
        writeCachedImage: async () => {},
      },
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe(
      'https://images.pexels.test/match.jpg',
    )
    expect(response.headers.get('X-Image-Source')).toBe('pexels')
    // Pollinations should not have been called
    const pollinationsCall = fetchMock.mock.calls.find(([url]) =>
      url.toString().includes('image.pollinations.ai/prompt/'),
    )
    expect(pollinationsCall).toBeUndefined()
    delete process.env.PEXELS_API_KEY
  })

  it('generates with Pollinations when Pexels has no match (no API key)', async () => {
    delete process.env.PEXELS_API_KEY
    delete process.env.VITE_PEXELS_API_KEY
    delete process.env.UNSPLASH_ACCESS_KEY
    delete process.env.VITE_UNSPLASH_ACCESS_KEY
    const imageBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0])
    const fetchMock = vi.fn(async () =>
      new Response(new Uint8Array(imageBytes), {
        headers: { 'Content-Type': 'image/jpeg' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const response = await createPexelsPreviewImageResponse(
      new Request(
        'https://ship-fast.ai/api/pexels?query=obscure%20no%20match%20query&w=800&h=600&seed=gen',
      ),
      {
        readCachedImage: async () => null,
        writeCachedImage: async () => {},
      },
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('image/jpeg')
    expect(response.headers.get('X-Image-Source')).toBe('pollinations')
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(imageBytes)
    const pollinationsCall = fetchMock.mock.calls.find(([url]) =>
      url.toString().includes('image.pollinations.ai/prompt/'),
    )
    expect(pollinationsCall).toBeDefined()
  })

  it('serves from the in-memory Pollinations cache without refetching on a second request', async () => {
    delete process.env.PEXELS_API_KEY
    delete process.env.VITE_PEXELS_API_KEY
    delete process.env.UNSPLASH_ACCESS_KEY
    delete process.env.VITE_UNSPLASH_ACCESS_KEY
    const imageBytes = new Uint8Array([1, 2, 3, 4])
    const fetchMock = vi.fn(async () =>
      new Response(new Uint8Array(imageBytes), {
        headers: { 'Content-Type': 'image/jpeg' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const search = 'query=cached-mem-hero&w=400&h=300&seed=x'
    const deps = {
      readCachedImage: async () => null,
      writeCachedImage: async () => {},
    }
    await createPexelsPreviewImageResponse(
      new Request(`https://ship-fast.ai/api/pexels?${search}`),
      deps,
    )
    await createPexelsPreviewImageResponse(
      new Request(`https://ship-fast.ai/api/pexels?${search}`),
      deps,
    )

    // Only the first request hits fetch; the second is served from memory.
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('serves from the injected Convex-storage cache without hitting Pollinations', async () => {
    delete process.env.PEXELS_API_KEY
    delete process.env.VITE_PEXELS_API_KEY
    delete process.env.UNSPLASH_ACCESS_KEY
    delete process.env.VITE_UNSPLASH_ACCESS_KEY
    const cachedBytes = new Uint8Array([9, 9, 9])
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await createPexelsPreviewImageResponse(
      new Request('https://ship-fast.ai/api/pexels?query=stored&w=200&h=200'),
      {
        readCachedImage: async () => ({
          bytes: cachedBytes,
          contentType: 'image/png',
        }),
        writeCachedImage: async () => {},
      },
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('image/png')
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(cachedBytes)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('falls back to Picsum when Pollinations fails and no stock providers are configured', async () => {
    delete process.env.PEXELS_API_KEY
    delete process.env.VITE_PEXELS_API_KEY
    delete process.env.UNSPLASH_ACCESS_KEY
    delete process.env.VITE_UNSPLASH_ACCESS_KEY
    const fetchMock = vi.fn().mockRejectedValue(new Error('upstream down'))
    vi.stubGlobal('fetch', fetchMock)

    const response = await createPexelsPreviewImageResponse(
      new Request(
        'https://ship-fast.ai/api/pexels?query=broken-picsum-fallback&w=500&h=400&seed=fail',
      ),
      {
        readCachedImage: async () => null,
        writeCachedImage: async () => {},
      },
    )

    expect(response.status).toBe(302)
    const location = response.headers.get('Location') ?? ''
    expect(location).toContain('picsum.photos/seed/')
    expect(response.headers.get('X-Image-Source')).toBe('picsum-fallback')
  })

  it('falls back to Unsplash when Pollinations fails and UNSPLASH_ACCESS_KEY is set', async () => {
    delete process.env.PEXELS_API_KEY
    delete process.env.VITE_PEXELS_API_KEY
    process.env.UNSPLASH_ACCESS_KEY = 'unsplash-key'
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = input.toString()
      if (url.includes('image.pollinations.ai/prompt/')) {
        throw new Error('rate limited')
      }
      if (url.includes('api.unsplash.com')) {
        return new Response(
          JSON.stringify({
            results: [
              { urls: { regular: 'https://images.unsplash.test/fallback.jpg?auto=format' } },
            ],
          }),
          { headers: { 'Content-Type': 'application/json' } },
        )
      }
      return new Response('no', { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const response = await createPexelsPreviewImageResponse(
      new Request(
        'https://ship-fast.ai/api/pexels?query=unsplash-fallback-test&w=500&h=400&seed=unsplash-fb',
      ),
      {
        readCachedImage: async () => null,
        writeCachedImage: async () => {},
      },
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toContain(
      'images.unsplash.test/fallback.jpg',
    )
    expect(response.headers.get('X-Image-Source')).toBe('unsplash-fallback')
    delete process.env.UNSPLASH_ACCESS_KEY
  })

  it('sticky cache: once Pexels is used, the same cacheKey returns the same URL without retrying', async () => {
    process.env.PEXELS_API_KEY = 'pexels-key'
    delete process.env.UNSPLASH_ACCESS_KEY
    let pexelsCalls = 0
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = input.toString()
      if (url.includes('api.pexels.com')) {
        pexelsCalls++
        return new Response(
          JSON.stringify({
            photos: [
              { src: { large: 'https://images.pexels.test/sticky.jpg' } },
            ],
          }),
          { headers: { 'Content-Type': 'application/json' } },
        )
      }
      return new Response('no', { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const deps = {
      readCachedImage: async () => null,
      writeCachedImage: async () => {},
    }
    const request = new Request(
      'https://ship-fast.ai/api/pexels?query=sticky-test&w=500&h=400&seed=sticky',
    )

    // First request: Pexels match → redirect
    const r1 = await createPexelsPreviewImageResponse(request, deps)
    expect(r1.status).toBe(302)
    expect(r1.headers.get('Location')).toBe(
      'https://images.pexels.test/sticky.jpg',
    )
    expect(r1.headers.get('X-Image-Source')).toBe('pexels')
    expect(pexelsCalls).toBe(1)

    // Second request: same Pexels URL from sticky cache, no refetch
    const r2 = await createPexelsPreviewImageResponse(request, deps)
    expect(r2.status).toBe(302)
    expect(r2.headers.get('Location')).toBe(
      'https://images.pexels.test/sticky.jpg',
    )
    expect(r2.headers.get('X-Image-Source')).toBe('sticky-fallback')
    expect(pexelsCalls).toBe(1) // still 1 — no retry

    delete process.env.PEXELS_API_KEY
  })
})
