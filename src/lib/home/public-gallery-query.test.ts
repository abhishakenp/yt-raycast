import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  fetchPublicGalleryPage,
  normalizeGalleryMeta,
} from './public-gallery-query'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('normalizeGalleryMeta', () => {
  it('derives next and previous availability from page counts', () => {
    expect(
      normalizeGalleryMeta({
        page: 1,
        limit: 12,
        total: 25,
        totalPages: 3,
        hasNext: false,
        hasPrev: true,
      }),
    ).toMatchObject({
      page: 1,
      totalPages: 3,
      hasPrev: false,
      hasNext: true,
    })
  })

  it('clamps out-of-range page values to the last available page', () => {
    expect(
      normalizeGalleryMeta({
        page: 99,
        limit: 12,
        total: 25,
        totalPages: 3,
      }),
    ).toMatchObject({
      page: 3,
      totalPages: 3,
      hasPrev: true,
      hasNext: false,
    })
  })

  it('fetches one public gallery page with the app page size and returns items', async () => {
    const payload = {
      items: [{ id: 'session_1', prompt: 'craft brewery landing page' }],
      page: 2,
      limit: 12,
      total: 13,
      totalPages: 2,
      hasNext: false,
      hasPrev: true,
    }
    const fetchMock = vi.fn(async () => Response.json(payload))
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchPublicGalleryPage(2)

    expect(fetchMock).toHaveBeenCalledWith('/api/gallery?page=2&limit=12')
    expect(result).toEqual({ ok: true, items: payload.items, data: payload })
  })

  it('treats malformed gallery item payloads as an empty page without throwing', async () => {
    const payload = {
      items: null,
      page: 1,
      limit: 12,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    }
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json(payload)),
    )

    await expect(fetchPublicGalleryPage(1)).resolves.toMatchObject({
      ok: true,
      items: [],
      data: payload,
    })
  })

  it('throws the homepage gallery load error when the API response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('unauthorized', { status: 401 })),
    )

    await expect(fetchPublicGalleryPage(1)).rejects.toThrow('recent-sessions')
  })

  it('throws the stable homepage gallery load error when the API returns malformed JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response('<!doctype html><title>Gallery unavailable</title>', {
            headers: { 'Content-Type': 'text/html' },
            status: 200,
          }),
      ),
    )

    await expect(fetchPublicGalleryPage(1)).rejects.toThrow('recent-sessions')
  })
})
