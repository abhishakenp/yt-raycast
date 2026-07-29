import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useGalleryThumbnailRegeneration } from './useGalleryThumbnailRegeneration'

describe('useGalleryThumbnailRegeneration', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  const stubDashboardAuth = () => {
    vi.stubGlobal('Clerk', {
      session: { getToken: vi.fn().mockResolvedValue('dashboard-token') },
    })
  }

  it('builds once after a ready website revision is durably available', async () => {
    vi.useFakeTimers()
    stubDashboardAuth()
    const fetchMock = vi.fn().mockResolvedValue(new Response())
    vi.stubGlobal('fetch', fetchMock)

    renderHook(() =>
      useGalleryThumbnailRegeneration({
        isPreviewReady: true,
        revision: 'revision-1',
        sessionId: 'session-1',
      }),
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(350)
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/images/session-1?v=revision-1',
      {
        body: undefined,
        headers: { Authorization: 'Bearer dashboard-token' },
        method: 'POST',
        signal: expect.any(AbortSignal),
      },
    )
  })

  it('does not run while generation is incomplete', async () => {
    vi.useFakeTimers()
    stubDashboardAuth()
    const fetchMock = vi.fn().mockResolvedValue(new Response())
    vi.stubGlobal('fetch', fetchMock)

    const { rerender } = renderHook(
      ({ isPreviewReady }) =>
        useGalleryThumbnailRegeneration({
          isPreviewReady,
          revision: 'revision-1',
          sessionId: 'session-1',
        }),
      { initialProps: { isPreviewReady: false } },
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(350)
    })
    expect(fetchMock).not.toHaveBeenCalled()

    rerender({ isPreviewReady: true })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350)
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('coalesces rapid saved revisions and builds only the final revision', async () => {
    vi.useFakeTimers()
    stubDashboardAuth()
    const fetchMock = vi.fn().mockResolvedValue(new Response())
    vi.stubGlobal('fetch', fetchMock)

    const { rerender } = renderHook(
      ({ revision }) =>
        useGalleryThumbnailRegeneration({
          isPreviewReady: true,
          revision,
          sessionId: 'session-1',
        }),
      { initialProps: { revision: 'revision-1' } },
    )

    rerender({ revision: 'revision-2' })
    rerender({ revision: 'revision-3' })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350)
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      '/api/images/session-1?v=revision-3',
    )
  })

  it('regenerates after a later persisted content revision', async () => {
    vi.useFakeTimers()
    stubDashboardAuth()
    const fetchMock = vi.fn().mockResolvedValue(new Response())
    vi.stubGlobal('fetch', fetchMock)

    const { rerender } = renderHook(
      ({ revision }) =>
        useGalleryThumbnailRegeneration({
          isPreviewReady: true,
          revision,
          sessionId: 'session-1',
        }),
      { initialProps: { revision: 'generation-1' } },
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(350)
    })
    rerender({ revision: 'theme-edit-2' })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350)
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      '/api/images/session-1?v=theme-edit-2',
    )
  })
})
