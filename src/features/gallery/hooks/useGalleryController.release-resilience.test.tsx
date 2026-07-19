// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { GalleryPayload } from '@/features/gallery/components/PublicGallery'

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

let useQueryResult: GalleryPayload | undefined
const convexUseQueryMock = vi.fn(function useQueryMock() {
  return useQueryResult
})

vi.mock('convex/react', () => ({
  useQuery: convexUseQueryMock,
}))

vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    sessions: {
      listPublicSessions: 'listPublicSessions',
    },
  },
}))

const { useGalleryController } = await import('./useGalleryController')

describe('useGalleryController release resilience', () => {
  beforeEach(() => {
    convexUseQueryMock.mockClear()
    useQueryResult = undefined
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns gallery undefined while the Convex subscription has not resolved', () => {
    useQueryResult = undefined

    const { result } = renderHook(function renderLoadingGallery() {
      return useGalleryController({ search: 'pending' })
    })

    expect(result.current.gallery).toBeUndefined()
    expect(result.current.sessions).toBeUndefined()
  })

  it('returns gallery data when the Convex subscription resolves', async () => {
    const gallery: GalleryPayload = { ...emptyGallery, total: 4 }
    useQueryResult = gallery

    const { result } = renderHook(function renderResolvedGallery() {
      return useGalleryController({ search: 'resolved' })
    })

    await waitFor(function waitForGallery() {
      expect(result.current.gallery?.total).toBe(4)
    })

    expect(result.current.sessions).toEqual(gallery.items)
  })
})
