// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type PromptHomeControllerTestState = {
  createSession: ReturnType<typeof vi.fn>
  navigate: ReturnType<typeof vi.fn>
}

let originalFetch: typeof globalThis.fetch

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
  api: {
    sessions: {
      create: 'sessions.create',
    },
  },
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
    originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ claimed: false }),
    }) as unknown as typeof globalThis.fetch
    window.localStorage.clear()
    window.sessionStorage.clear()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    globalThis.fetch = originalFetch
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
    expect(state.navigate).toHaveBeenCalledTimes(1)
    expect(
      window.sessionStorage.getItem(
        'ship-fast:generation-launch:session_double_submit_guard',
      ),
    ).toBe('1')
  })

  it('retries a failed create call with the same workspace idempotency key', async () => {
    const state = getTestState()
    state.createSession
      .mockRejectedValueOnce(new Error('create_session_timeout'))
      .mockResolvedValueOnce({
        sessionId: 'session_retry_success',
        cached: false,
      })
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a resilient product website')
    })

    await act(async () => {
      await result.current.submitPrompt()
    })

    expect(state.createSession).toHaveBeenCalledTimes(2)
    expect(state.createSession.mock.calls[0]?.[0].workspace).toBe(
      state.createSession.mock.calls[1]?.[0].workspace,
    )
    expect(state.navigate).toHaveBeenCalledWith({
      to: '/generate/$sessionId',
      params: { sessionId: 'session_retry_success' },
    })
  })

  it('starts a v1 clone job when the prompt contains a reference URL', async () => {
    const state = getTestState()
    state.createSession.mockResolvedValueOnce({
      sessionId: 'session_prompt_clone',
      cached: false,
    })
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Clone https://tvnl.in/ exactly')
    })

    await act(async () => {
      await result.current.submitPrompt({ engineVersion: 'v2' })
    })

    expect(state.createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: 'Clone https://tvnl.in/ exactly',
        cloneUrl: 'https://tvnl.in/',
      }),
    )
    expect(state.createSession.mock.calls[0]?.[0]).not.toHaveProperty(
      'engineVersion',
    )
    const cloneCall = vi
      .mocked(fetch)
      .mock.calls.find((call) => call[0] === '/api/clone')
    expect(cloneCall?.[1]).toMatchObject({ method: 'POST' })
    expect(JSON.parse(String(cloneCall?.[1]?.body))).toMatchObject({
      sessionId: 'session_prompt_clone',
      anonymousOwnerSecret: expect.any(String),
      seedUrl: 'https://tvnl.in/',
      brief: 'Clone exactly',
    })
  })

  it('starts a v1 clone job when the reference URL field supplies cloneUrl', async () => {
    const state = getTestState()
    state.createSession.mockResolvedValueOnce({
      sessionId: 'session_reference_clone',
      cached: false,
    })
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Create an identical public utility portal')
    })

    await act(async () => {
      await result.current.submitPrompt({
        cloneUrl: 'https://tvnl.in/',
        designReferenceUrls: ['https://tvnl.in/'],
        engineVersion: 'v2',
      })
    })

    expect(state.createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: 'Create an identical public utility portal',
        cloneUrl: 'https://tvnl.in/',
        designReferenceUrls: ['https://tvnl.in/'],
      }),
    )
    expect(state.createSession.mock.calls[0]?.[0]).not.toHaveProperty(
      'engineVersion',
    )
    const cloneCall = vi
      .mocked(fetch)
      .mock.calls.find((call) => call[0] === '/api/clone')
    expect(cloneCall?.[1]).toMatchObject({ method: 'POST' })
    expect(JSON.parse(String(cloneCall?.[1]?.body))).toMatchObject({
      sessionId: 'session_reference_clone',
      anonymousOwnerSecret: expect.any(String),
      seedUrl: 'https://tvnl.in/',
      brief: 'Create an identical public utility portal',
    })
  })

  it('navigates immediately from a ready prompt cache entry', async () => {
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

  it('does not wait for ready prompt cache verification before navigating', async () => {
    const state = getTestState()
    window.localStorage.setItem(
      'ship-fast:ready-session:v1:en:build an instant cached website',
      JSON.stringify({
        sessionId: 'session_instant_cache',
        prompt: 'Build an instant cached website',
        preferredLanguage: 'en',
        createdAt: Date.now(),
      }),
    )
    vi.mocked(fetch).mockImplementationOnce(() => new Promise(() => {}))
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build an instant cached website')
    })

    await act(async () => {
      await result.current.submitPrompt()
    })

    expect(state.createSession).not.toHaveBeenCalled()
    expect(state.navigate).toHaveBeenCalledWith({
      to: '/generate/$sessionId',
      params: { sessionId: 'session_instant_cache' },
    })
  })

  it('forgets stale ready prompt cache verification misses in the background', async () => {
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
    await act(async () => {
      await Promise.resolve()
    })

    expect(state.createSession).not.toHaveBeenCalled()
    expect(state.navigate).toHaveBeenCalledWith({
      to: '/generate/$sessionId',
      params: { sessionId: 'session_stale_cache' },
    })
    expect(
      window.localStorage.getItem(
        'ship-fast:ready-session:v1:en:build a stale product website',
      ),
    ).toBeNull()
  })

  it('does not hydrate share bonus on the homepage load path', async () => {
    const fetchMock = vi.mocked(fetch)

    renderHook(() => usePromptHomeController())

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

  it('keeps generation deletion out of the prompt form controller', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/features/home/hooks/usePromptHomeController.ts'),
      'utf8',
    )

    expect(source).not.toContain('sessions.deleteMine')
    expect(source).not.toContain('ship-fast:generations-deleted')
  })
})
