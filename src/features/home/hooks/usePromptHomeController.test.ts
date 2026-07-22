// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import {
  type Mock,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

type WatchGenerationView = {
  localQueryResult: () => unknown
  onUpdate: (callback: () => void) => () => void
}

type PromptHomeControllerTestState = {
  createSession: Mock<(...args: any[]) => Promise<unknown>>
  generationView: unknown
  mutationRefs: unknown[]
  navigate: Mock<(...args: any[]) => unknown>
  preloadRoute: Mock<(...args: any[]) => Promise<unknown>>
  prewarmQuery: Mock<
    (options: {
      args: { lookup: string }
      extendSubscriptionFor?: number
      query: unknown
    }) => void
  >
  watchQuery: Mock<
    (query: unknown, args: { lookup: string }) => WatchGenerationView
  >
  watchUpdateCallbacks: Array<() => void>
}

let originalFetch: typeof globalThis.fetch

type Deferred<Value> = {
  promise: Promise<Value>
  reject: (reason?: unknown) => void
  resolve: (value: Value) => void
}

const createDeferred = <Value>(): Deferred<Value> => {
  let resolve: (value: Value) => void = () => undefined
  let reject: (reason?: unknown) => void = () => undefined
  const promise = new Promise<Value>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, reject, resolve }
}

function getTestState(): PromptHomeControllerTestState {
  const testGlobal = globalThis as typeof globalThis & {
    __shipFastPromptHomeControllerState?: PromptHomeControllerTestState
  }
  testGlobal.__shipFastPromptHomeControllerState ??= {
    createSession: vi.fn(),
    generationView: undefined,
    mutationRefs: [],
    navigate: vi.fn(),
    preloadRoute: vi.fn(),
    prewarmQuery: vi.fn(),
    watchUpdateCallbacks: [],
    watchQuery: vi.fn(() => ({
      localQueryResult: () => getTestState().generationView,
      onUpdate: (callback) => {
        getTestState().watchUpdateCallbacks.push(callback)
        return () => {
          getTestState().watchUpdateCallbacks =
            getTestState().watchUpdateCallbacks.filter(
              (stored) => stored !== callback,
            )
        }
      },
    })),
  }
  return testGlobal.__shipFastPromptHomeControllerState
}

const readyGenerationView = () => ({
  session: { status: 'preview_ready' },
  homeModule: { source: 'export default function ReadyPreview() {}' },
})

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function fetchRequestBodyAt(index: number): Record<string, unknown> {
  const [, init] = vi.mocked(fetch).mock.calls[index] ?? []
  if (init === undefined || typeof init.body !== 'string') {
    throw new Error(`Expected fetch call ${index} to have a JSON string body`)
  }
  const parsed: unknown = JSON.parse(init.body)
  if (!isRecord(parsed)) {
    throw new Error(`Expected fetch call ${index} body to be a JSON object`)
  }
  return parsed
}

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () =>
    (
      globalThis as typeof globalThis & {
        __shipFastPromptHomeControllerState?: PromptHomeControllerTestState
      }
    ).__shipFastPromptHomeControllerState?.navigate,
  useRouter: () => ({
    preloadRoute: (
      globalThis as typeof globalThis & {
        __shipFastPromptHomeControllerState?: PromptHomeControllerTestState
      }
    ).__shipFastPromptHomeControllerState?.preloadRoute,
  }),
}))

vi.mock('convex/react', () => ({
  useConvex: () => ({
    prewarmQuery: (
      globalThis as typeof globalThis & {
        __shipFastPromptHomeControllerState?: PromptHomeControllerTestState
      }
    ).__shipFastPromptHomeControllerState?.prewarmQuery,
    watchQuery: (
      globalThis as typeof globalThis & {
        __shipFastPromptHomeControllerState?: PromptHomeControllerTestState
      }
    ).__shipFastPromptHomeControllerState?.watchQuery,
  }),
}))

vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    sessions: {
      create: 'sessions.create',
      getGenerationView: 'sessions.getGenerationView',
    },
  },
}))

vi.mock('@/shared/convex/http-client', () => ({
  createRuntimeConvexHttpClient: () => ({
    mutation: async (ref: unknown, payload: unknown) => {
      const state = (
        globalThis as typeof globalThis & {
          __shipFastPromptHomeControllerState?: PromptHomeControllerTestState
        }
      ).__shipFastPromptHomeControllerState
      state?.mutationRefs.push(ref)
      return await state?.createSession(payload)
    },
  }),
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
    state.mutationRefs = []
    state.navigate.mockReset()
    state.navigate.mockResolvedValue(undefined)
    state.preloadRoute.mockReset()
    state.preloadRoute.mockResolvedValue(undefined)
    state.generationView = undefined
    state.prewarmQuery.mockReset()
    state.watchUpdateCallbacks = []
    state.watchQuery.mockReset()
    state.watchQuery.mockImplementation(() => ({
      localQueryResult: () => getTestState().generationView,
      onUpdate: (callback) => {
        getTestState().watchUpdateCallbacks.push(callback)
        return () => {
          getTestState().watchUpdateCallbacks =
            getTestState().watchUpdateCallbacks.filter(
              (stored) => stored !== callback,
            )
        }
      },
    }))
    originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        error: 'Public preview session creation is disabled.',
      }),
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
  }, 15_000)

  it('does not replay both session transports after one rejected launch', async () => {
    const state = getTestState()
    state.createSession.mockRejectedValue(
      new Error('Convex launch request rejected'),
    )
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a release demo website')
    })

    await act(async () => {
      await result.current.submitPrompt()
    })

    const publicCreateCalls = vi
      .mocked(fetch)
      .mock.calls.filter(([input]) => input === '/api/sessions/create')
    expect({
      convexCreateRequests: state.createSession.mock.calls.length,
      publicCreateRequests: publicCreateCalls.length,
    }).toEqual({
      convexCreateRequests: 1,
      publicCreateRequests: 1,
    })
    expect(state.navigate).not.toHaveBeenCalled()
    expect(result.current.errorMessage).toBe(
      'Generation could not start. Try again.',
    )
  }, 15_000)

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
      to: '/generate/$sessionId/$',
      params: { sessionId: 'session_retry_success' },
    })
  })

  it('uses the server create route when public preview creation is enabled', async () => {
    const state = getTestState()
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        sessionId: 'session_server_preview',
        cached: false,
      }),
    } as Response)
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a free public preview website')
    })

    await act(async () => {
      await result.current.submitPrompt()
    })

    expect(fetch).toHaveBeenCalledWith(
      '/api/sessions/create',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    expect(state.createSession).not.toHaveBeenCalled()
    expect(state.navigate).toHaveBeenCalledWith({
      to: '/generate/$sessionId/$',
      params: { sessionId: 'session_server_preview' },
    })
  })

  it('falls back to Convex instead of navigating when the public create route returns malformed success JSON', async () => {
    const state = getTestState()
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('<!doctype html><title>create unavailable</title>', {
        headers: { 'Content-Type': 'text/html' },
        status: 200,
      }),
    )
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a product website after malformed create')
    })

    await act(async () => {
      await result.current.submitPrompt()
    })

    expect(state.createSession).toHaveBeenCalledTimes(1)
    expect(state.createSession.mock.calls[0]?.[0]).not.toHaveProperty('isDraft')
    expect(state.navigate).toHaveBeenCalledWith({
      to: '/generate/$sessionId/$',
      params: { sessionId: 'session_double_submit_guard' },
    })
    expect(state.navigate).not.toHaveBeenCalledWith({
      to: '/generate/$sessionId/$',
      params: { sessionId: undefined },
    })
  })

  it('falls back to Convex instead of navigating when the public create route returns JSON without a session id', async () => {
    const state = getTestState()
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        prompt:
          'a food site for dogs and other pets with a polished hero, clear navigation, trust signals, featured sections, and a direct conversion path.',
      }),
    } as Response)
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt(
        'a food site for dogs and other pets with a polished hero, clear navigation, trust signals, featured sections, and a direct conversion path.',
      )
    })

    await act(async () => {
      await result.current.submitPrompt()
    })

    expect(state.createSession).toHaveBeenCalledTimes(1)
    expect(state.navigate).toHaveBeenCalledWith({
      to: '/generate/$sessionId/$',
      params: { sessionId: 'session_double_submit_guard' },
    })
    expect(state.navigate).not.toHaveBeenCalledWith({
      to: '/generate/$sessionId/$',
      params: { sessionId: undefined },
    })
  })

  it('does not navigate or write a launch handoff when the fallback Convex create result is missing a session id', async () => {
    const state = getTestState()
    state.createSession.mockResolvedValueOnce({
      cached: false,
      prompt:
        'a boutique coffee roastery with subscription delivery and tasting events',
    })
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt(
        'a boutique coffee roastery with subscription delivery and tasting events',
      )
    })

    await act(async () => {
      await result.current.submitPrompt()
    })

    expect(state.createSession).toHaveBeenCalledTimes(1)
    expect(state.navigate).not.toHaveBeenCalled()
    expect(
      Object.keys(window.sessionStorage).filter((key) =>
        key.startsWith('ship-fast:generation-launch:'),
      ),
    ).toEqual([])
    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.errorMessage).toBe(
      'Generation could not start. Try again.',
    )
  })

  it('keeps launch feedback visible briefly when session creation fails immediately', async () => {
    vi.useFakeTimers()
    const state = getTestState()
    state.createSession.mockRejectedValue(new Error('network unavailable'))
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a launch feedback landing page')
    })

    let submitPromise: Promise<void> | undefined
    await act(async () => {
      submitPromise = result.current.submitPrompt()
      await Promise.resolve()
    })

    expect(result.current.isSubmitting).toBe(true)
    expect(result.current.errorMessage).toBeUndefined()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1199)
    })

    expect(state.createSession).toHaveBeenCalledTimes(2)
    expect(result.current.isSubmitting).toBe(true)
    expect(result.current.errorMessage).toBeUndefined()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
      await submitPromise
    })

    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.errorMessage).toBe(
      'Generation could not start. Try again.',
    )
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
      to: '/generate/$sessionId/$',
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
      to: '/generate/$sessionId/$',
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
      to: '/generate/$sessionId/$',
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

  it('uses the public HTTP create endpoint without hydrating the Convex mutation client', async () => {
    const state = getTestState()
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        sessionId: 'session_created_by_http',
        cached: false,
      }),
    } as Response)
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a public product website')
    })

    await act(async () => {
      await result.current.submitPrompt()
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/sessions/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.any(String),
    })
    expect(state.createSession).not.toHaveBeenCalled()
    expect(state.mutationRefs).toEqual([])
    expect(state.navigate).toHaveBeenCalledWith({
      to: '/generate/$sessionId/$',
      params: { sessionId: 'session_created_by_http' },
    })
  })

  it('falls back to the runtime Convex mutation only when the public HTTP create endpoint is disabled', async () => {
    const state = getTestState()
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a fallback product website')
    })

    await act(async () => {
      await result.current.submitPrompt()
    })

    expect(state.createSession).toHaveBeenCalledTimes(1)
    expect(state.mutationRefs).toEqual(['sessions.create'])
  })

  it('starts immediately on click before the speculative debounce and never creates twice', async () => {
    vi.useFakeTimers()
    const state = getTestState()
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a zero second launch website')
    })
    act(() => {
      result.current.scheduleSpeculativeGeneration()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(499)
      await result.current.submitPrompt()
      await vi.advanceTimersByTimeAsync(500)
    })

    expect(state.createSession).toHaveBeenCalledTimes(1)
    expect(state.navigate).toHaveBeenCalledWith({
      to: '/generate/$sessionId/$',
      params: { sessionId: 'session_double_submit_guard' },
    })
  })

  it('reuses the same in-flight speculative session when the user clicks', async () => {
    vi.useFakeTimers()
    const state = getTestState()
    const deferred = createDeferred<Response>()
    vi.mocked(fetch).mockReturnValueOnce(deferred.promise)
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a website while generation is running')
    })
    act(() => {
      result.current.scheduleSpeculativeGeneration()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
      await Promise.resolve()
    })

    let submitPromise: Promise<void> | undefined
    act(() => {
      submitPromise = result.current.submitPrompt()
    })

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetchRequestBodyAt(0)).toMatchObject({ isDraft: true })
    expect(state.navigate).not.toHaveBeenCalled()

    await act(async () => {
      deferred.resolve(
        new Response(
          JSON.stringify({
            sessionId: 'session_speculative_in_flight',
            cached: false,
          }),
          { headers: { 'Content-Type': 'application/json' } },
        ),
      )
      await submitPromise
    })

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetchRequestBodyAt(1)).toMatchObject({ isDraft: false })
    expect(state.preloadRoute).toHaveBeenCalledWith({
      to: '/generate/$sessionId/$',
      params: { sessionId: 'session_speculative_in_flight' },
    })
    expect(state.watchQuery).toHaveBeenCalledWith(
      'sessions.getGenerationView',
      { lookup: 'session_speculative_in_flight' },
    )
    expect(state.prewarmQuery).toHaveBeenCalledWith({
      query: 'sessions.getGenerationView',
      args: { lookup: 'session_speculative_in_flight' },
      extendSubscriptionFor: 30_000,
    })
    expect(state.createSession.mock.calls[0]?.[0]).toMatchObject({
      isDraft: false,
    })
    expect(state.navigate).toHaveBeenCalledWith({
      to: '/generate/$sessionId/$',
      params: { sessionId: 'session_speculative_in_flight' },
    })
    expect(
      window.sessionStorage.getItem(
        'ship-fast:generation-launch:session_speculative_in_flight',
      ),
    ).toBe('1')
  })

  it('navigates from a completed speculative session without creating another one', async () => {
    vi.useFakeTimers()
    const state = getTestState()
    state.generationView = readyGenerationView()
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          sessionId: 'session_speculative_ready',
          cached: false,
        }),
        { headers: { 'Content-Type': 'application/json' } },
      ),
    )
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a website before I click submit')
    })
    act(() => {
      result.current.scheduleSpeculativeGeneration()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetchRequestBodyAt(0)).toMatchObject({ isDraft: true })
    expect(state.preloadRoute).toHaveBeenCalledWith({
      to: '/generate/$sessionId/$',
      params: { sessionId: 'session_speculative_ready' },
    })
    expect(state.watchQuery).toHaveBeenCalledWith(
      'sessions.getGenerationView',
      { lookup: 'session_speculative_ready' },
    )
    expect(state.prewarmQuery).toHaveBeenCalledWith({
      query: 'sessions.getGenerationView',
      args: { lookup: 'session_speculative_ready' },
      extendSubscriptionFor: 30_000,
    })

    await act(async () => {
      await result.current.submitPrompt()
    })

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetchRequestBodyAt(1)).toMatchObject({ isDraft: false })
    expect(state.createSession.mock.calls[0]?.[0]).toMatchObject({
      isDraft: false,
    })
    expect(state.navigate).toHaveBeenCalledWith({
      to: '/generate/$sessionId/$',
      params: { sessionId: 'session_speculative_ready' },
    })
    expect(
      window.sessionStorage.getItem(
        'ship-fast:generation-launch:session_speculative_ready',
      ),
    ).toBeNull()
  })

  it('rechecks the native Convex prewarm cache at submit before showing loader', async () => {
    vi.useFakeTimers()
    const state = getTestState()
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          sessionId: 'session_ready_before_click',
          cached: false,
        }),
        { headers: { 'Content-Type': 'application/json' } },
      ),
    )
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a site that becomes ready before click')
    })
    act(() => {
      result.current.scheduleSpeculativeGeneration()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(
      window.sessionStorage.getItem(
        'ship-fast:generation-launch:session_ready_before_click',
      ),
    ).toBeNull()

    state.generationView = readyGenerationView()

    await act(async () => {
      await result.current.submitPrompt()
    })

    expect(state.watchQuery).toHaveBeenCalledWith(
      'sessions.getGenerationView',
      { lookup: 'session_ready_before_click' },
    )
    expect(
      window.sessionStorage.getItem(
        'ship-fast:generation-launch:session_ready_before_click',
      ),
    ).toBeNull()
    expect(state.navigate).toHaveBeenCalledWith({
      to: '/generate/$sessionId/$',
      params: { sessionId: 'session_ready_before_click' },
    })
  })

  it('waits briefly for a mature speculative Convex prewarm before navigating', async () => {
    vi.useFakeTimers()
    const state = getTestState()
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          sessionId: 'session_ready_during_grace',
          cached: false,
        }),
        { headers: { 'Content-Type': 'application/json' } },
      ),
    )
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a site that becomes ready during grace')
    })
    act(() => {
      result.current.scheduleSpeculativeGeneration()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
      await Promise.resolve()
      await Promise.resolve()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_500)
    })

    let submitPromise: Promise<void> = Promise.resolve()
    await act(async () => {
      submitPromise = result.current.submitPrompt()
      await Promise.resolve()
    })

    expect(state.navigate).not.toHaveBeenCalled()
    expect(
      window.sessionStorage.getItem(
        'ship-fast:generation-launch:session_ready_during_grace',
      ),
    ).toBeNull()

    await act(async () => {
      state.generationView = readyGenerationView()
      state.watchUpdateCallbacks.forEach((callback) => callback())
      await submitPromise
    })

    expect(
      window.sessionStorage.getItem(
        'ship-fast:generation-launch:session_ready_during_grace',
      ),
    ).toBeNull()
    expect(state.navigate).toHaveBeenCalledWith({
      to: '/generate/$sessionId/$',
      params: { sessionId: 'session_ready_during_grace' },
    })
  })

  it('keeps the launch handoff when native Convex prewarm is unavailable', async () => {
    vi.useFakeTimers()
    const state = getTestState()
    state.watchQuery.mockImplementationOnce(() => {
      throw new Error('prewarm unavailable')
    })
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          sessionId: 'session_speculative_unprewarmed',
          cached: false,
        }),
        { headers: { 'Content-Type': 'application/json' } },
      ),
    )
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a website before unavailable prewarm')
    })
    act(() => {
      result.current.scheduleSpeculativeGeneration()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
      await Promise.resolve()
      await Promise.resolve()
    })

    await act(async () => {
      await result.current.submitPrompt()
    })

    expect(state.watchQuery).toHaveBeenCalledTimes(1)
    expect(
      window.sessionStorage.getItem(
        'ship-fast:generation-launch:session_speculative_unprewarmed',
      ),
    ).toBe('1')
    expect(state.navigate).toHaveBeenCalledWith({
      to: '/generate/$sessionId/$',
      params: { sessionId: 'session_speculative_unprewarmed' },
    })
  })

  it('does not show a launch error when draft publish fails after speculative creation succeeded', async () => {
    vi.useFakeTimers()
    const state = getTestState()
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sessionId: 'session_speculative_publish_failure',
            cached: false,
          }),
          { headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockRejectedValueOnce(new Error('publish request failed'))
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a website before publish flakes')
    })
    act(() => {
      result.current.scheduleSpeculativeGeneration()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
      await Promise.resolve()
      await Promise.resolve()
    })

    await act(async () => {
      await result.current.submitPrompt()
      await Promise.resolve()
    })

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetchRequestBodyAt(0)).toMatchObject({ isDraft: true })
    expect(fetchRequestBodyAt(1)).toMatchObject({ isDraft: false })
    expect(result.current.errorMessage).toBeUndefined()
    expect(state.navigate).toHaveBeenCalledWith({
      to: '/generate/$sessionId/$',
      params: { sessionId: 'session_speculative_publish_failure' },
    })
  })

  it('falls back to a generated session URL when router navigation rejects after session creation', async () => {
    const state = getTestState()
    state.navigate.mockRejectedValueOnce(new Error('router navigation failed'))
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt(
        'Build a website even if client navigation fails',
      )
    })

    await act(async () => {
      await result.current.submitPrompt()
    })

    expect(result.current.errorMessage).toBeUndefined()
    expect(state.navigate).toHaveBeenCalledWith({
      to: '/generate/$sessionId/$',
      params: { sessionId: 'session_double_submit_guard' },
    })
  })

  it('does not show a launch error when storage is blocked after session creation', async () => {
    const state = getTestState()
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    state.createSession.mockImplementationOnce(async () => {
      setItem.mockImplementation(() => {
        throw new Error('storage blocked')
      })
      return {
        sessionId: 'session_storage_blocked_after_create',
        cached: false,
      }
    })
    const { result } = renderHook(() => usePromptHomeController())

    try {
      act(() => {
        result.current.setPrompt('Build a website even if storage is blocked')
      })

      await act(async () => {
        await result.current.submitPrompt()
      })
    } finally {
      setItem.mockRestore()
    }

    expect(result.current.errorMessage).toBeUndefined()
    expect(state.navigate).toHaveBeenCalledWith({
      to: '/generate/$sessionId/$',
      params: { sessionId: 'session_storage_blocked_after_create' },
    })
  })

  it('invalidates a pending speculative timer when generation options change', async () => {
    vi.useFakeTimers()
    const state = getTestState()
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.scheduleSpeculativeGeneration({
        prompt: 'Build a first product website',
        preferredLanguage: 'en',
      })
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250)
    })

    act(() => {
      result.current.scheduleSpeculativeGeneration({
        prompt: 'Build a different portfolio website',
        preferredLanguage: 'en',
        engineVersion: 'v2',
      })
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(499)
    })

    expect(state.createSession).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
      await Promise.resolve()
    })

    expect(state.createSession).toHaveBeenCalledTimes(1)
    expect(state.createSession.mock.calls[0]?.[0]).toMatchObject({
      engineVersion: 'v2',
      prompt: 'Build a different portfolio website',
    })
  })
})
