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

const queryMock = vi.fn()
let useQueryResult: { data?: GalleryPayload } = { data: undefined }
let capturedQueryFn: (() => Promise<GalleryPayload>) | undefined

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(function useQueryMock(options: {
    queryFn: () => Promise<GalleryPayload>
  }) {
    capturedQueryFn = options.queryFn
    return useQueryResult
  }),
}))

vi.mock('@/shared/convex/http-client', () => ({
  createRuntimeConvexHttpClient: vi.fn(function createClient() {
    return { query: queryMock }
  }),
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
    queryMock.mockReset()
    useQueryResult = { data: undefined }
    capturedQueryFn = undefined
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns gallery undefined while the Convex query has not resolved', () => {
    queryMock.mockReturnValue(new Promise(() => {}))
    useQueryResult = { data: undefined }

    const { result } = renderHook(function renderLoadingGallery() {
      return useGalleryController({ search: 'pending' })
    })

    expect(result.current.gallery).toBeUndefined()
    expect(result.current.sessions).toBeUndefined()
  })

  it('returns gallery data when the Convex query resolves', async () => {
    const gallery: GalleryPayload = { ...emptyGallery, total: 4 }
    queryMock.mockResolvedValue(gallery)
    useQueryResult = { data: gallery }

    const { result } = renderHook(function renderResolvedGallery() {
      return useGalleryController({ search: 'resolved' })
    })

    await waitFor(function waitForGallery() {
      expect(result.current.gallery?.total).toBe(4)
    })

    expect(result.current.sessions).toEqual(gallery.items)
  })

  it('does not crash when the Convex query rejects', async () => {
    queryMock.mockRejectedValue(new Error('convex down'))
    useQueryResult = { data: undefined }

    const { result } = renderHook(function renderRejectedGallery() {
      return useGalleryController({ search: 'rejected' })
    })

    await expect(capturedQueryFn).rejects.toThrow('convex down')

    expect(result.current.gallery).toBeUndefined()
    expect(() => result.current).not.toThrow()
  })
})
