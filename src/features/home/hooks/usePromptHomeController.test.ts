// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type PromptHomeControllerTestState = {
  createSession: ReturnType<typeof vi.fn>
  navigate: ReturnType<typeof vi.fn>
}

const getTestState = (): PromptHomeControllerTestState => {
  const testGlobal = globalThis as typeof globalThis & {
    __shipFastPromptHomeControllerState?: PromptHomeControllerTestState
  }
  testGlobal.__shipFastPromptHomeControllerState ??= {
    createSession: vi.fn(),
    navigate: vi.fn(),
  }
  return testGlobal.__shipFastPromptHomeControllerState
}

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () =>
    (
      globalThis as typeof globalThis & {
        __shipFastPromptHomeControllerState?: PromptHomeControllerTestState
      }
    ).__shipFastPromptHomeControllerState?.navigate,
}))

vi.mock('convex/react', () => ({
  useMutation: () =>
    (
      globalThis as typeof globalThis & {
        __shipFastPromptHomeControllerState?: PromptHomeControllerTestState
      }
    ).__shipFastPromptHomeControllerState?.createSession,
}))

vi.mock('../../../../convex/_generated/api', () => ({
  api: { sessions: { create: 'sessions.create' } },
}))

import { usePromptHomeController } from './usePromptHomeController'

describe('usePromptHomeController submit guard', () => {
  beforeEach(() => {
    const state = getTestState()
    state.createSession.mockReset()
    state.createSession.mockResolvedValue({
      sessionId: 'session_double_submit_guard',
      cached: false,
    })
    state.navigate.mockReset()
    state.navigate.mockResolvedValue(undefined)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ claimed: false }),
      }),
    )
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('guards generation creation against same-tick duplicate submits', async () => {
    const state = getTestState()
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a fast product website')
    })

    await act(async () => {
      await Promise.all([
        result.current.submitPrompt(),
        result.current.submitPrompt(),
      ])
    })

    expect(state.createSession).toHaveBeenCalledTimes(1)
    expect(state.createSession.mock.calls[0]?.[0]).toMatchObject({
      reusePublicCache: true,
    })
    expect(state.navigate).toHaveBeenCalledTimes(1)
    expect(
      window.sessionStorage.getItem(
        'ship-fast:generation-launch:session_double_submit_guard',
      ),
    ).toBe('1')
  })

  it('does not request public cache replay for private or v2 submissions', async () => {
    const state = getTestState()
    const first = renderHook(() => usePromptHomeController())

    act(() => {
      first.result.current.setPrompt('Build a fast product website')
    })

    await act(async () => {
      await first.result.current.submitPrompt({ isPrivate: true })
    })

    expect(state.createSession.mock.calls[0]?.[0]).not.toHaveProperty(
      'reusePublicCache',
    )

    first.unmount()
    state.createSession.mockClear()

    const second = renderHook(() => usePromptHomeController())

    await act(async () => {
      await second.result.current.submitPrompt({
        prompt: 'Build another fast product website',
        engineVersion: 'v2',
      })
    })

    expect(state.createSession.mock.calls[0]?.[0]).not.toHaveProperty(
      'reusePublicCache',
    )
  })

  it('retries a stalled create call with the same workspace idempotency key', async () => {
    vi.useFakeTimers()
    const state = getTestState()
    state.createSession
      .mockImplementationOnce(() => new Promise(() => {}))
      .mockResolvedValueOnce({
        sessionId: 'session_retry_success',
        cached: false,
      })
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a resilient product website')
    })

    const submit = act(async () => {
      const promise = result.current.submitPrompt()
      await vi.advanceTimersByTimeAsync(12_000 + 450)
      await promise
    })

    await submit

    expect(state.createSession).toHaveBeenCalledTimes(2)
    expect(state.createSession.mock.calls[0]?.[0].workspace).toBe(
      state.createSession.mock.calls[1]?.[0].workspace,
    )
    expect(state.navigate).toHaveBeenCalledWith({
      to: '/generate/$sessionId',
      params: { sessionId: 'session_retry_success' },
    })
  })

  it('navigates directly when a ready prompt cache entry verifies', async () => {
    const state = getTestState()
    window.localStorage.setItem(
      'ship-fast:ready-session:v1:en:build a cached product website',
      JSON.stringify({
        sessionId: 'session_ready_cache',
        prompt: 'Build a cached product website',
        preferredLanguage: 'en',
        createdAt: Date.now(),
      }),
    )
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sessionId: 'session_ready_cache',
        prompt: 'Build a cached product website',
        preferredLanguage: 'en',
        status: 'preview_ready',
      }),
    } as Response)
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a cached product website')
    })

    await act(async () => {
      await result.current.submitPrompt()
    })

    expect(fetch).toHaveBeenCalledWith(
      '/api/sessions/session_ready_cache',
      expect.objectContaining({
        headers: { Accept: 'application/json' },
        signal: expect.any(AbortSignal),
      }),
    )
    expect(state.createSession).not.toHaveBeenCalled()
    expect(state.navigate).toHaveBeenCalledWith({
      to: '/generate/$sessionId',
      params: { sessionId: 'session_ready_cache' },
    })
  })

  it('falls back to create when ready prompt cache verification misses', async () => {
    const state = getTestState()
    window.localStorage.setItem(
      'ship-fast:ready-session:v1:en:build a stale product website',
      JSON.stringify({
        sessionId: 'session_stale_cache',
        prompt: 'Build a stale product website',
        preferredLanguage: 'en',
        createdAt: Date.now(),
      }),
    )
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sessionId: 'session_stale_cache',
        prompt: 'Build another website',
        preferredLanguage: 'en',
        status: 'preview_ready',
      }),
    } as Response)
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a stale product website')
    })

    await act(async () => {
      await result.current.submitPrompt()
    })

    expect(state.createSession).toHaveBeenCalledTimes(1)
    expect(
      window.localStorage.getItem(
        'ship-fast:ready-session:v1:en:build a stale product website',
      ),
    ).toBeNull()
  })

  it('does not hydrate share bonus on the homepage load path', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.mocked(fetch)

    renderHook(() => usePromptHomeController())

    expect(fetchMock).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(10_000)
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('hydrates share bonus status only after an explicit refresh request', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ claimed: true }),
    } as Response)
    const { result } = renderHook(() => usePromptHomeController())

    await act(async () => {
      await result.current.refreshShareBonusStatus()
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('/api/share-bonus')
    expect(result.current.shareBonusClaimed).toBe(true)
  })
})
