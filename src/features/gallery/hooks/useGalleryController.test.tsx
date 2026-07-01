// @vitest-environment jsdom
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { GalleryPayload } from '@/features/gallery/components/PublicGallery'
import {
  prewarmGalleryPayload,
  prewarmGalleryThumbnails,
  useGalleryController,
} from './useGalleryController'

let originalFetch: typeof globalThis.fetch

const emptyGallery: GalleryPayload = {
  availableCategories: [],
  hasNext: false,
  hasPrev: false,
  items: [],
  limit: 12,
  page: 1,
  total: 0,
  totalPages: 1,
}

const dbObservedPublicSession = {
  prompt:
    'a food site for dogs and other pets with a polished hero, clear navigation, trust signals, featured sections, and a direct conversion path.',
  sessionId: 'k571fbfbggczv4pfz2evtrxdzx89qqbb',
}

describe('useGalleryController cache prewarm', () => {
  beforeEach(() => {
    originalFetch = globalThis.fetch
  })

  afterEach(() => {
    cleanup()
    globalThis.fetch = originalFetch
  })

  it('reuses a prewarmed public gallery payload when the gallery later mounts', async () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      total: 3,
    }
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => gallery,
    })

    await prewarmGalleryPayload({ search: 'prewarmed-public-gallery' })

    const { result } = renderHook(() =>
      useGalleryController({ search: 'prewarmed-public-gallery' }),
    )

    await waitFor(() => {
      expect(result.current.gallery?.total).toBe(3)
    })
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('falls back to an empty gallery when the public gallery API returns malformed JSON', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => {
        throw new SyntaxError('Unexpected token < in JSON')
      },
    })

    const { result } = renderHook(() =>
      useGalleryController({ search: 'malformed-public-gallery-payload' }),
    )

    await waitFor(() => {
      expect(result.current.gallery).toEqual(emptyGallery)
      expect(result.current.sessions).toEqual([])
    })
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/sessions/recent?limit=12&page=1&search=malformed-public-gallery-payload',
      { headers: { accept: 'application/json' } },
    )
  })

  it('falls back to an empty gallery when the public gallery API returns a parseable payload with malformed items', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ...emptyGallery,
        items: {
          [dbObservedPublicSession.sessionId]: dbObservedPublicSession,
        },
        total: 1,
      }),
    })

    const { result } = renderHook(() =>
      useGalleryController({ search: 'parseable-malformed-gallery-payload' }),
    )

    await waitFor(() => {
      expect(result.current.gallery).toEqual(emptyGallery)
      expect(result.current.sessions).toEqual([])
    })
  })

  it('does not prewarm PNG thumbnails because gallery previews must come from server-rendered HTML', async () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        {
          sessionId: 'thumb-session',
          previewVersion: 7,
        },
      ],
      total: 1,
    }
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:gallery-thumb')
    globalThis.URL.revokeObjectURL = vi.fn()
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['thumb']),
    })

    await prewarmGalleryThumbnails(gallery)

    expect(globalThis.fetch).not.toHaveBeenCalled()
    expect(globalThis.URL.createObjectURL).not.toHaveBeenCalled()
  })
})
