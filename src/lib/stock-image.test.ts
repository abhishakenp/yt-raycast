import { afterEach, describe, expect, it, vi } from 'vitest'

const originalEnv = { ...process.env }

const loadStockImage = async (env: Record<string, string | undefined> = {}) => {
  vi.resetModules()
  delete process.env.PEXELS_API_KEY
  delete process.env.VITE_PEXELS_API_KEY
  delete process.env.UNSPLASH_ACCESS_KEY
  delete process.env.VITE_UNSPLASH_ACCESS_KEY
  Object.assign(process.env, env)
  return import('./stock-image')
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.resetModules()
  process.env = { ...originalEnv }
})

describe('resolveStockImage', () => {
  it('uses Pexels first and selects the requested-size photo variant', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        photos: [
          {
            src: {
              medium: 'https://images.pexels.com/medium.jpg',
              large: 'https://images.pexels.com/large.jpg',
              large2x: 'https://images.pexels.com/large2x.jpg',
              original: 'https://images.pexels.com/original.jpg',
            },
          },
        ],
      }),
    })
    vi.stubGlobal('fetch', fetch)
    const { resolveStockImage } = await loadStockImage({
      PEXELS_API_KEY: 'pexels-key',
    })

    await expect(
      resolveStockImage({
        alt: 'Modern office workspace with founders',
        w: 900,
        h: 500,
      }),
    ).resolves.toEqual({
      imageUrl: 'https://images.pexels.com/large2x.jpg',
      source: 'pexels',
      query: 'modern office workspace founders',
    })

    const [url, init] = fetch.mock.calls[0]
    expect(String(url)).toBe(
      'https://api.pexels.com/v1/search?query=modern%20office%20workspace%20founders&per_page=15&orientation=landscape',
    )
    expect(init).toEqual({ headers: { Authorization: 'pexels-key' } })
  })

  it('falls back from Pexels to Unsplash and clamps image size parameters', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              urls: {
                regular: 'https://images.unsplash.com/photo-1',
                small: 'https://images.unsplash.com/photo-1-small',
                full: 'https://images.unsplash.com/photo-1-full',
                raw: 'https://images.unsplash.com/photo-1-raw',
              },
            },
          ],
        }),
      })
    vi.stubGlobal('fetch', fetch)
    const { resolveStockImage } = await loadStockImage({
      PEXELS_API_KEY: 'pexels-key',
      UNSPLASH_ACCESS_KEY: 'unsplash-key',
    })

    await expect(
      resolveStockImage({ query: 'boutique hotel lobby', w: 320, h: 220 }),
    ).resolves.toEqual({
      imageUrl: 'https://images.unsplash.com/photo-1&w=400&h=300&fit=crop',
      source: 'unsplash',
      query: 'boutique hotel lobby',
    })

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(String(fetch.mock.calls[1][0])).toBe(
      'https://api.unsplash.com/search/photos?query=boutique%20hotel%20lobby&per_page=15&orientation=landscape',
    )
    expect(fetch.mock.calls[1][1]).toEqual({
      headers: { Authorization: 'Client-ID unsplash-key' },
    })
  })

  it('uses deterministic picsum fallback when no stock providers are configured', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { resolveStockImage } = await loadStockImage()

    await expect(
      resolveStockImage({
        alt: 'Luxury dental clinic reception',
        w: 640,
        h: 360,
      }),
    ).resolves.toEqual({
      imageUrl:
        'https://picsum.photos/seed/luxury-dental-clinic-reception/640/360',
      source: 'picsum',
      query: 'medical clinic healthcare luxury dental reception',
    })
    expect(warn).toHaveBeenCalledWith(
      'No stock image API keys configured (PEXELS_API_KEY / VITE_PEXELS_API_KEY / UNSPLASH_ACCESS_KEY / VITE_UNSPLASH_ACCESS_KEY); using picsum fallback',
    )
  })

  it('caches resolved images by generated query and dimensions', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        photos: [
          {
            src: {
              medium: 'https://images.pexels.com/cached-medium.jpg',
              large: 'https://images.pexels.com/cached-large.jpg',
              large2x: 'https://images.pexels.com/cached-large2x.jpg',
              original: 'https://images.pexels.com/cached-original.jpg',
            },
          },
        ],
      }),
    })
    vi.stubGlobal('fetch', fetch)
    const { resolveStockImage } = await loadStockImage({
      PEXELS_API_KEY: 'pexels-key',
    })

    const first = await resolveStockImage({
      query: 'product photography watch',
      w: 300,
      h: 300,
    })
    const second = await resolveStockImage({
      query: 'product photography watch',
      w: 300,
      h: 300,
    })

    expect(first).toBe(second)
    expect(first).toEqual({
      imageUrl: 'https://images.pexels.com/cached-medium.jpg',
      source: 'pexels',
      query: 'product photography watch',
    })
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})

describe('searchStockImages', () => {
  it('returns multiple results interleaved from both providers', async () => {
    const fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('pexels')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            photos: [
              {
                src: {
                  medium: 'p1.jpg',
                  large: 'p1l.jpg',
                  large2x: 'p1x.jpg',
                  original: 'p1o.jpg',
                },
              },
              {
                src: {
                  medium: 'p2.jpg',
                  large: 'p2l.jpg',
                  large2x: 'p2x.jpg',
                  original: 'p2o.jpg',
                },
              },
              {
                src: {
                  medium: 'p3.jpg',
                  large: 'p3l.jpg',
                  large2x: 'p3x.jpg',
                  original: 'p3o.jpg',
                },
              },
            ],
          }),
        })
      }
      if (url.includes('unsplash')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            results: [
              {
                urls: { regular: 'u1', small: 'u1s', full: 'u1f', raw: 'u1r' },
              },
              {
                urls: { regular: 'u2', small: 'u2s', full: 'u2f', raw: 'u2r' },
              },
            ],
          }),
        })
      }
      return Promise.resolve({ ok: false, json: async () => ({}) })
    })
    vi.stubGlobal('fetch', fetch)
    const { searchStockImages } = await loadStockImage({
      PEXELS_API_KEY: 'pk',
      UNSPLASH_ACCESS_KEY: 'uk',
    })

    const results = await searchStockImages({
      query: 'coffee shop',
      perPage: 10,
    })

    expect(results.length).toBeLessThanOrEqual(10)
    expect(results.length).toBeGreaterThan(0)
    // Should have both pexels and unsplash results
    const sources = new Set(results.map((r) => r.source))
    expect(sources.has('pexels')).toBe(true)
    expect(sources.has('unsplash')).toBe(true)
    // Results should be interleaved (not all pexels then all unsplash)
    const firstPexels = results.findIndex((r) => r.source === 'pexels')
    const firstUnsplash = results.findIndex((r) => r.source === 'unsplash')
    expect(Math.abs(firstPexels - firstUnsplash)).toBeLessThanOrEqual(1)
  })

  it('passes page parameter to both providers', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ photos: [], results: [] }),
    })
    vi.stubGlobal('fetch', fetch)
    const { searchStockImages } = await loadStockImage({
      PEXELS_API_KEY: 'pk',
      UNSPLASH_ACCESS_KEY: 'uk',
    })

    await searchStockImages({ query: 'test', page: 3, perPage: 10 })

    const pexelsUrl = String(fetch.mock.calls[0][0])
    const unsplashUrl = String(fetch.mock.calls[1][0])
    expect(pexelsUrl).toContain('page=3')
    expect(unsplashUrl).toContain('page=3')
  })

  it('returns picsum fallback when no API keys configured', async () => {
    const { searchStockImages } = await loadStockImage()

    const results = await searchStockImages({
      query: 'test query',
      perPage: 10,
    })

    expect(results).toHaveLength(10)
    expect(results.every((r) => r.source === 'picsum')).toBe(true)
    // Each result should have a unique seed (page-indexed)
    expect(results[0].imageUrl).not.toBe(results[1].imageUrl)
  })

  it('returns empty array for empty query', async () => {
    const { searchStockImages } = await loadStockImage({
      PEXELS_API_KEY: 'pk',
    })

    const results = await searchStockImages({ query: '  ', perPage: 10 })
    expect(results).toEqual([])
  })

  it('handles one provider failing gracefully', async () => {
    const fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('pexels')) {
        return Promise.resolve({ ok: false, json: async () => ({}) })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          results: [
            { urls: { regular: 'u1', small: 'u1s', full: 'u1f', raw: 'u1r' } },
            { urls: { regular: 'u2', small: 'u2s', full: 'u2f', raw: 'u2r' } },
          ],
        }),
      })
    })
    vi.stubGlobal('fetch', fetch)
    const { searchStockImages } = await loadStockImage({
      PEXELS_API_KEY: 'pk',
      UNSPLASH_ACCESS_KEY: 'uk',
    })

    const results = await searchStockImages({ query: 'test', perPage: 10 })

    expect(results.length).toBeGreaterThan(0)
    expect(results.every((r) => r.source === 'unsplash')).toBe(true)
  })
})
