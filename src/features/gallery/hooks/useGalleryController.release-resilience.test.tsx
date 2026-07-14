// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { GalleryPayload } from '@/features/gallery/components/PublicGallery'
import { useGalleryController } from './useGalleryController'

interface DeferredResponse {
  promise: Promise<GalleryResponse>
  resolve: (response: GalleryResponse) => void
}

interface GalleryResponse {
  ok: boolean
  json: () => Promise<GalleryPayload>
}

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

function createResponse(total: number): GalleryResponse {
  const payload = { ...emptyGallery, total }
  return {
    ok: true,
    json: async function readPayload() {
      return payload
    },
  }
}

function createDeferredResponse(): DeferredResponse {
  function unresolvedResponse(_response: GalleryResponse) {}
  let resolvePromise = unresolvedResponse
  const promise = new Promise<GalleryResponse>(function captureResolve(
    resolve,
  ) {
    resolvePromise = resolve
  })
  return { promise, resolve: resolvePromise }
}

describe('useGalleryController release resilience', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = originalFetch
  })

  afterEach(() => {
    cleanup()
    globalThis.fetch = originalFetch
    vi.useRealTimers()
  })

  it('retries after an offline response instead of caching failure as an empty gallery', async () => {
    const fetchGallery = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('network offline'))
      .mockResolvedValue(createResponse(4))
    globalThis.fetch = fetchGallery

    const firstView = renderHook(function renderOfflineGallery() {
      return useGalleryController({ search: 'offline-route-remount-release' })
    })
    await waitFor(function waitForOfflineFallback() {
      expect(firstView.result.current.gallery?.total).toBe(0)
    })
    firstView.unmount()

    const recoveredView = renderHook(function renderRecoveredGallery() {
      return useGalleryController({ search: 'offline-route-remount-release' })
    })
    await waitFor(function waitForRecoveredGallery() {
      expect(recoveredView.result.current.gallery?.total).toBe(4)
    })

    expect(fetchGallery).toHaveBeenCalledTimes(2)
  })

  it('ignores a late response from a superseded search', async () => {
    const staleResponse = createDeferredResponse()
    const fetchGallery = vi
      .fn()
      .mockImplementationOnce(function fetchStaleGallery() {
        return staleResponse.promise
      })
      .mockResolvedValueOnce(createResponse(7))
    globalThis.fetch = fetchGallery
    let search = 'superseded-search-release'
    const view = renderHook(function renderGallery() {
      return useGalleryController({ search })
    })

    search = 'current-search-release'
    view.rerender()
    await waitFor(function waitForCurrentGallery() {
      expect(view.result.current.gallery?.total).toBe(7)
    })

    await act(async function resolveStaleGallery() {
      staleResponse.resolve(createResponse(2))
      await staleResponse.promise
    })

    expect(view.result.current.gallery?.total).toBe(7)
    expect(fetchGallery).toHaveBeenCalledTimes(2)
  })

  it('settles a hung request instead of rendering gallery skeletons indefinitely', async () => {
    vi.useFakeTimers()
    const fetchGallery = vi.fn(function fetchHungGallery() {
      return new Promise<Response>(function keepRequestPending(resolve) {
        void resolve
      })
    })
    globalThis.fetch = fetchGallery
    const view = renderHook(function renderHungGallery() {
      return useGalleryController({ search: 'hung-gallery-release' })
    })

    await act(async function elapseRequestTimeout() {
      await vi.advanceTimersByTimeAsync(15_000)
    })

    expect(fetchGallery).toHaveBeenCalledTimes(1)
    expect(view.result.current.gallery).not.toBeUndefined()
  })
})
