import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Route } from './pexels'
import { callRouteHandler } from './-route-handler.test-helper'

const originalEnv = { ...process.env }

async function requestImage(query: string) {
  const request = new Request(`https://ship-fast.io/api/pexels?${query}`)
  return callRouteHandler(Route, 'GET', { request })
}

describe('/api/pexels provider failure modes', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.PEXELS_API_KEY
    delete process.env.VITE_PEXELS_API_KEY
    delete process.env.UNSPLASH_ACCESS_KEY
    delete process.env.VITE_UNSPLASH_ACCESS_KEY
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    process.env = { ...originalEnv }
  })

  it('retries progressively shorter queries when Pexels returns no matches', async () => {
    process.env.PEXELS_API_KEY = 'pexels-key'
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ photos: [] }))
      .mockResolvedValueOnce(
        Response.json({
          photos: [
            { src: { large: 'https://images.pexels.test/seasonal.jpg' } },
          ],
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const response = await requestImage(
      'query=seasonal%20brewery%20release&w=900&h=600&seed=release',
    )

    expect(response.headers.get('Location')).toBe(
      'https://images.pexels.test/seasonal.jpg',
    )
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      new URL(
        'https://api.pexels.com/v1/search?query=seasonal+brewery&per_page=15&orientation=landscape',
      ),
      { headers: { Authorization: 'pexels-key' } },
    )
  })

  it('skips a malformed selected Pexels record when another result is usable', async () => {
    process.env.PEXELS_API_KEY = 'pexels-key'
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        photos: [
          { src: { large: 'https://images.pexels.test/usable.jpg' } },
          {},
        ],
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const response = await requestImage('query=brewery&w=900&h=600&seed=a')

    expect(response.headers.get('Location')).toBe(
      'https://images.pexels.test/usable.jpg',
    )
  })

  it('adds Unsplash resize parameters with a valid query separator', async () => {
    process.env.UNSPLASH_ACCESS_KEY = 'unsplash-key'
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        results: [
          { urls: { regular: 'https://images.unsplash.test/photo.jpg' } },
        ],
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const response = await requestImage('query=brewery&w=900&h=600&seed=hero')

    expect(response.headers.get('Location')).toBe(
      'https://images.unsplash.test/photo.jpg?w=900&h=600&fit=crop',
    )
  })

  it('bounds provider calls with an abort signal so stalled APIs cannot hang the route', async () => {
    process.env.PEXELS_API_KEY = 'pexels-key'
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('{}', { status: 503 }))
    vi.stubGlobal('fetch', fetchMock)

    await requestImage('query=brewery&w=900&h=600&seed=hero')

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('falls through to Unsplash when the Pexels network request rejects', async () => {
    process.env.PEXELS_API_KEY = 'pexels-key'
    process.env.UNSPLASH_ACCESS_KEY = 'unsplash-key'
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('network unavailable'))
      .mockResolvedValueOnce(
        Response.json({
          results: [
            {
              urls: {
                regular: 'https://images.unsplash.test/recovered.jpg?auto=1',
              },
            },
          ],
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const response = await requestImage('query=brewery&w=900&h=600&seed=hero')

    expect(response.headers.get('Location')).toBe(
      'https://images.unsplash.test/recovered.jpg?auto=1&w=900&h=600&fit=crop',
    )
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
