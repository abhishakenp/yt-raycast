// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { GalleryPayload } from '@/features/gallery/components/PublicGallery'

const queryMock = vi.hoisted(() => ({
  useQuery: vi.fn(),
}))

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>(
    '@tanstack/react-query',
  )
  return {
    ...actual,
    useQuery: queryMock.useQuery,
  }
})

const convexClientMock = vi.hoisted(() => ({
  query: vi.fn(),
}))

vi.mock('@/shared/convex/http-client', () => ({
  createRuntimeConvexHttpClient: () => convexClientMock,
}))

const apiMock = vi.hoisted(() => ({
  sessions: { listPublicSessions: 'listPublicSessions' as const },
}))

vi.mock('../../../../convex/_generated/api', () => ({
  api: apiMock,
}))

import { useGalleryController } from './useGalleryController'

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

function createWrapper(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

function withData(data: GalleryPayload | undefined) {
  queryMock.useQuery.mockReturnValue({ data })
}

function withQueryFnResolved(data: GalleryPayload) {
  queryMock.useQuery.mockImplementation(
    (opts: { queryFn: () => Promise<GalleryPayload> }) => {
      void opts.queryFn()
      return { data }
    },
  )
}

describe('useGalleryController', () => {
  beforeEach(() => {
    queryMock.useQuery.mockReset()
    convexClientMock.query.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it('returns gallery data from the mocked Convex client query', async () => {
    convexClientMock.query.mockResolvedValue(sampleGallery)
    withQueryFnResolved(sampleGallery)

    const { result } = renderHook(() => useGalleryController(), {
      wrapper: createWrapper(new QueryClient()),
    })

    await waitFor(() => {
      expect(result.current.gallery).toEqual(sampleGallery)
    })
    expect(convexClientMock.query).toHaveBeenCalledWith(
      apiMock.sessions.listPublicSessions,
      { limit: 12, page: 1, search: undefined, category: undefined },
    )
  })

  it('derives sessions from gallery.items', async () => {
    withData(sampleGallery)

    const { result } = renderHook(() => useGalleryController(), {
      wrapper: createWrapper(new QueryClient()),
    })

    await waitFor(() => {
      expect(result.current.sessions).toEqual(sampleGallery.items)
    })
  })

  it('returns gallery undefined while loading', async () => {
    withData(undefined)

    const { result } = renderHook(() => useGalleryController(), {
      wrapper: createWrapper(new QueryClient()),
    })

    await waitFor(() => {
      expect(result.current.gallery).toBeUndefined()
      expect(result.current.sessions).toBeUndefined()
    })
  })
})
