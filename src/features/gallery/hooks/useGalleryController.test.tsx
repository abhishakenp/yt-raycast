// @vitest-environment jsdom
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { GalleryPayload } from '@/features/gallery/components/PublicGallery'

const queryMock = vi.hoisted(() => ({
  useQuery: vi.fn(),
}))

vi.mock('convex/react', () => ({
  useQuery: queryMock.useQuery,
}))

const apiMock = vi.hoisted(() => ({
  sessions: {
    listOwnedSessions: 'listOwnedSessions' as const,
    listPublicSessions: 'listPublicSessions' as const,
  },
}))

vi.mock('../../../../convex/_generated/api', () => ({
  api: apiMock,
}))

import {
  useGalleryController,
  useOwnedGalleryController,
} from './useGalleryController'

const sampleGallery: GalleryPayload = {
  items: [
    { sessionId: 'session-1', prompt: 'a polished landing page' },
    { sessionId: 'session-2', prompt: 'a blog about dogs' },
  ],
  page: 1,
  limit: 12,
  total: 2,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
}

function withData(data: GalleryPayload | undefined) {
  queryMock.useQuery.mockReturnValue(data)
}

describe('useGalleryController', () => {
  beforeEach(() => {
    queryMock.useQuery.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it('returns gallery data from the reactive Convex query', async () => {
    withData(sampleGallery)

    const { result } = renderHook(() => useGalleryController())

    await waitFor(() => {
      expect(result.current.gallery).toEqual(sampleGallery)
    })
    expect(queryMock.useQuery).toHaveBeenCalledWith(
      apiMock.sessions.listPublicSessions,
      { limit: 12, page: 1, search: undefined, category: undefined },
    )
  })

  it('derives sessions from gallery.items', async () => {
    withData(sampleGallery)

    const { result } = renderHook(() => useGalleryController())

    await waitFor(() => {
      expect(result.current.sessions).toEqual(sampleGallery.items)
    })
  })

  it('returns gallery undefined while loading', async () => {
    withData(undefined)

    const { result } = renderHook(() => useGalleryController())

    await waitFor(() => {
      expect(result.current.gallery).toBeUndefined()
      expect(result.current.sessions).toBeUndefined()
    })
  })

  it('subscribes to public gallery metadata so preview image versions update', () => {
    withData(sampleGallery)

    renderHook(() => useGalleryController())

    expect(queryMock.useQuery.mock.lastCall).toEqual([
      apiMock.sessions.listPublicSessions,
      { category: undefined, limit: 12, page: 1, search: undefined },
    ])
  })

  it('subscribes to owned gallery metadata so preview image versions update', () => {
    withData(sampleGallery)

    renderHook(() => useOwnedGalleryController({ anonymousClientId: 'anon-1' }))

    expect(queryMock.useQuery.mock.lastCall).toEqual([
      apiMock.sessions.listOwnedSessions,
      {
        anonymousClientId: 'anon-1',
        category: undefined,
        limit: 12,
        page: 1,
        search: undefined,
      },
    ])
  })

  it('skips owned gallery subscription until anonymous client id is available', () => {
    withData(undefined)

    renderHook(() => useOwnedGalleryController())

    expect(queryMock.useQuery.mock.lastCall).toEqual([
      apiMock.sessions.listOwnedSessions,
      'skip',
    ])
  })
})
