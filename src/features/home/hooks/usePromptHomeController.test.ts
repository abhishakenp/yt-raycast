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

type PromptHomeControllerTestState = {
  createSession: Mock<(...args: any[]) => Promise<unknown>>
  mutationRefs: unknown[]
  navigate: Mock<(...args: any[]) => unknown>
  preloadRoute: Mock<(...args: any[]) => Promise<unknown>>
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
    mutationRefs: [],
    navigate: vi.fn(),
    preloadRoute: vi.fn(),
  }
  return testGlobal.__shipFastPromptHomeControllerState
}

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

const referralAuthToken = vi.fn<() => Promise<string | null>>()
vi.mock('@/features/referrals/lib/referral-client', () => ({
  getReferralAuthToken: () => referralAuthToken(),
}))

import { usePromptHomeController } from './usePromptHomeController'
import { CONTENT_POLICY_CLIENT_MESSAGE } from '@/lib/content-policy'

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
    referralAuthToken.mockReset()
    referralAuthToken.mockResolvedValue(null)
    originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        sessionId: 'session_double_submit_guard',
        cached: false,
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

    const publicCreateCalls = vi
      .mocked(fetch)
      .mock.calls.filter(([input]) => input === '/api/sessions/create')
    expect(publicCreateCalls).toHaveLength(1)
    expect(
      window.sessionStorage.getItem(
        'ship-fast:generation-launch:session_double_submit_guard',
      ),
    ).toBeNull()
  }, 15_000)

  it('does not retry via a second transport after one rejected launch', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Convex launch request rejected' }),
    } as Response)
    const state = getTestState()
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
    expect(publicCreateCalls).toHaveLength(1)
    expect(state.createSession).not.toHaveBeenCalled()
    expect(state.navigate).not.toHaveBeenCalled()
    expect(result.current.errorMessage).toBe(
      'Generation could not start. Try again.',
    )
  }, 15_000)

  it('submits blocked prompts to the authoritative server and displays its policy warning', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          code: 'CONTENT_POLICY',
          error: CONTENT_POLICY_CLIENT_MESSAGE,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 422,
        },
      ),
    )
    const state = getTestState()
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a ph1shing l0gin page')
    })

    await act(async () => {
      await result.current.submitPrompt()
    })

    expect(fetch).toHaveBeenCalledWith(
      '/api/sessions/create',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(state.navigate).not.toHaveBeenCalled()
    expect(result.current.errorMessage).toBe(CONTENT_POLICY_CLIENT_MESSAGE)
  }, 15_000)

  it('does not request public cache replay for private or v2 submissions', async () => {
    const first = renderHook(() => usePromptHomeController())

    act(() => {
      first.result.current.setPrompt('Build a fast product website')
    })

    await act(async () => {
      await first.result.current.submitPrompt({ isPrivate: true })
    })

    const firstBody = fetchRequestBodyAt(0)
    expect(firstBody).not.toHaveProperty('reusePublicCache')

    first.unmount()
    vi.mocked(fetch).mockClear()

    const second = renderHook(() => usePromptHomeController())

    await act(async () => {
      await second.result.current.submitPrompt({
        prompt: 'Build another fast product website',
      })
    })

    const secondBody = fetchRequestBodyAt(0)
    expect(secondBody).not.toHaveProperty('reusePublicCache')
  })

  it('retries a failed create call with the same workspace idempotency key', async () => {
    const state = getTestState()
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'create_session_timeout' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          sessionId: 'session_retry_success',
          cached: false,
        }),
      } as Response)
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a resilient product website')
    })

    await act(async () => {
      await result.current.submitPrompt()
    })

    const publicCreateCalls = vi
      .mocked(fetch)
      .mock.calls.filter(([input]) => input === '/api/sessions/create')
    expect(publicCreateCalls).toHaveLength(2)
    const firstBody = fetchRequestBodyAt(0)
    const secondBody = fetchRequestBodyAt(1)
    expect(firstBody.workspace).toBe(secondBody.workspace)
    expect(state.navigate).toHaveBeenCalledWith({
      to: '/generate/$sessionId/$',
      params: { sessionId: 'session_retry_success' },
    })
  })

  it('clears the prompt after a successful generation', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        sessionId: 'session_clear_prompt',
        cached: false,
      }),
    } as Response)
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a product website')
    })
    expect(result.current.prompt).toBe('Build a product website')

    await act(async () => {
      await result.current.submitPrompt()
    })

    expect(result.current.prompt).toBe('')
  })

  it('clears the prompt before navigate resolves', async () => {
    const state = getTestState()
    let promptAtNavigateCall: string | null = null
    state.navigate.mockImplementationOnce(() => {
      promptAtNavigateCall = window.localStorage.getItem(
        'ship-fast:prompt-session-cache',
      )
      return Promise.resolve()
    })

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        sessionId: 'session_clear_before_navigate',
        cached: false,
      }),
    } as Response)
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a product website')
    })
    expect(
      window.localStorage.getItem('ship-fast:prompt-session-cache'),
    ).not.toBeNull()

    await act(async () => {
      await result.current.submitPrompt()
    })

    expect(promptAtNavigateCall).toBeNull()
    expect(result.current.prompt).toBe('')
  })

  it('uses the server create route for all session creation', async () => {
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

  it('errors instead of navigating when the create route returns malformed HTML', async () => {
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

    expect(state.createSession).not.toHaveBeenCalled()
    expect(state.navigate).not.toHaveBeenCalled()
    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.errorMessage).toBe(
      'Generation could not start. Try again.',
    )
  })

  it('errors instead of navigating when the create route returns JSON without a session id', async () => {
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

    expect(state.createSession).not.toHaveBeenCalled()
    expect(state.navigate).not.toHaveBeenCalled()
    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.errorMessage).toBe(
      'Generation could not start. Try again.',
    )
  })

  it('does not navigate or write a launch handoff when the create result is missing a session id', async () => {
    const state = getTestState()
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        cached: false,
        prompt:
          'a boutique coffee roastery with subscription delivery and tasting events',
      }),
    } as Response)
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt(
        'a boutique coffee roastery with subscription delivery and tasting events',
      )
    })

    await act(async () => {
      await result.current.submitPrompt()
    })

    expect(state.createSession).not.toHaveBeenCalled()
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
    vi.mocked(fetch).mockRejectedValue(new Error('network unavailable'))
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

    const publicCreateCalls = vi
      .mocked(fetch)
      .mock.calls.filter(([input]) => input === '/api/sessions/create')
    expect(publicCreateCalls).toHaveLength(2)
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

    const publicCreateCalls = vi
      .mocked(fetch)
      .mock.calls.filter(([input]) => input === '/api/sessions/create')
    expect(publicCreateCalls).toHaveLength(1)
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
    expect(fetchRequestBodyAt(1)).toMatchObject({
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
    ).toBeNull()
  })

  it('preloads the completed speculative route before navigating', async () => {
    vi.useFakeTimers()
    const state = getTestState()
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

    await act(async () => {
      await result.current.submitPrompt()
    })

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetchRequestBodyAt(1)).toMatchObject({ isDraft: false })
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
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        setItem.mockImplementation(() => {
          throw new Error('storage blocked')
        })
        return {
          sessionId: 'session_storage_blocked_after_create',
          cached: false,
        }
      },
    } as Response)
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
      })
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(499)
    })

    const publicCreateCallsBefore = vi
      .mocked(fetch)
      .mock.calls.filter(([input]) => input === '/api/sessions/create')
    expect(publicCreateCallsBefore).toHaveLength(0)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
      await Promise.resolve()
    })

    const publicCreateCallsAfter = vi
      .mocked(fetch)
      .mock.calls.filter(([input]) => input === '/api/sessions/create')
    expect(publicCreateCallsAfter).toHaveLength(1)
    expect(fetchRequestBodyAt(0)).toMatchObject({
      prompt: 'Build a different portfolio website',
    })
  })

  it('shows sign-in message when server returns ANON_DAILY_EXHAUSTED', async () => {
    const { result } = renderHook(() => usePromptHomeController())

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({
        error:
          'Anonymous daily quota exhausted. Sign in to get 2 more free generations.',
        code: 'ANON_DAILY_EXHAUSTED',
      }),
    } as Response)

    act(() => {
      result.current.setPrompt('Build a product website after quota exhaustion')
    })

    await act(async () => {
      await result.current.submitPrompt()
    })

    expect(result.current.errorMessage).toBe(
      'Anonymous daily quota exhausted. Sign in to get 2 more free generations.',
    )
  })

  it('shows share suggestion when server returns ANON_DAILY_LIMIT_REACHED', async () => {
    const { result } = renderHook(() => usePromptHomeController())

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({
        error:
          'Anonymous daily quota exhausted. Share on social media for +1 free generation.',
        code: 'ANON_DAILY_LIMIT_REACHED',
      }),
    } as Response)

    act(() => {
      result.current.setPrompt('Build a product website before share bonus')
    })

    await act(async () => {
      await result.current.submitPrompt()
    })

    expect(result.current.errorMessage).toBe(
      'Anonymous daily quota exhausted. Share on social media for +1 free generation.',
    )
  })

  it('sends the Clerk bearer token as Authorization when the user is signed in', async () => {
    referralAuthToken.mockResolvedValue('clerk.convex.jwt.token')
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        sessionId: 'session_authed_http',
        cached: false,
      }),
    } as Response)
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a signed-in public preview site')
    })

    await act(async () => {
      await result.current.submitPrompt()
    })

    expect(referralAuthToken).toHaveBeenCalled()
    expect(fetch).toHaveBeenCalledWith(
      '/api/sessions/create',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer clerk.convex.jwt.token',
        },
      }),
    )
  })
})

describe('usePromptHomeController speculative substance gate', () => {
  beforeEach(() => {
    const state = getTestState()
    state.createSession.mockReset()
    state.createSession.mockResolvedValue({
      sessionId: 'session_substance_gate',
      cached: false,
    })
    state.mutationRefs = []
    state.navigate.mockReset()
    state.navigate.mockResolvedValue(undefined)
    state.preloadRoute.mockReset()
    state.preloadRoute.mockResolvedValue(undefined)
    referralAuthToken.mockReset()
    referralAuthToken.mockResolvedValue(null)
    originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        sessionId: 'session_substance_gate',
        cached: false,
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

  it('does not fire speculative for prompts shorter than 3 words', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('build website')
    })
    act(() => {
      result.current.scheduleSpeculativeGeneration()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
    })

    expect(fetch).not.toHaveBeenCalled()
  })

  it('does not fire speculative for gibberish prompts', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('test test test test test test')
    })
    act(() => {
      result.current.scheduleSpeculativeGeneration()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
    })

    expect(fetch).not.toHaveBeenCalled()
  })

  it('does not prelaunch speculative generation for blocked prompts', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a ph1shing l0gin page')
      result.current.scheduleSpeculativeGeneration({
        prompt: 'Build a ph1shing l0gin page',
      })
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
    })

    expect(fetch).not.toHaveBeenCalled()
  })

  it('reuses a semantic policy rejection so one explicit submit creates one flag', async () => {
    vi.useFakeTimers()
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          code: 'CONTENT_POLICY',
          error: CONTENT_POLICY_CLIENT_MESSAGE,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 422,
        },
      ),
    )
    const { result } = renderHook(() => usePromptHomeController())
    const prompt =
      'Create a gallery that encourages violent extremist recruitment'

    act(() => {
      result.current.setPrompt(prompt)
      result.current.scheduleSpeculativeGeneration({ prompt })
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
      await Promise.resolve()
    })
    expect(fetch).toHaveBeenCalledTimes(1)

    let submitPromise: Promise<void> | undefined
    act(() => {
      submitPromise = result.current.submitPrompt()
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_201)
      await submitPromise
    })

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(result.current.errorMessage).toBe(CONTENT_POLICY_CLIENT_MESSAGE)
  })

  it('fires speculative for substantive prompts', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('a blog about dogs with photo galleries')
    })
    act(() => {
      result.current.scheduleSpeculativeGeneration()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
    })

    expect(fetch).toHaveBeenCalledTimes(1)
  })
})

describe('usePromptHomeController speculative fingerprint cache', () => {
  beforeEach(() => {
    const state = getTestState()
    state.createSession.mockReset()
    state.createSession.mockResolvedValue({
      sessionId: 'session_fingerprint_cache',
      cached: false,
    })
    state.mutationRefs = []
    state.navigate.mockReset()
    state.navigate.mockResolvedValue(undefined)
    state.preloadRoute.mockReset()
    state.preloadRoute.mockResolvedValue(undefined)
    referralAuthToken.mockReset()
    referralAuthToken.mockResolvedValue(null)
    originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        sessionId: 'session_fingerprint_cache',
        cached: false,
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

  it('does not re-fire speculative for a completed fingerprint when typing away and back', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => usePromptHomeController())

    // Type a substantive prompt and let speculative complete.
    act(() => {
      result.current.setPrompt('a blog about dogs with photo galleries')
    })
    act(() => {
      result.current.scheduleSpeculativeGeneration()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
      await Promise.resolve()
    })

    expect(fetch).toHaveBeenCalledTimes(1)

    // Type something different.
    act(() => {
      result.current.setPrompt('a saas landing page for analytics')
    })
    act(() => {
      result.current.scheduleSpeculativeGeneration()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
      await Promise.resolve()
    })

    expect(fetch).toHaveBeenCalledTimes(2)

    // Type back to the original prompt — should NOT re-fire (completed fingerprint).
    act(() => {
      result.current.setPrompt('a blog about dogs with photo galleries')
    })
    act(() => {
      result.current.scheduleSpeculativeGeneration()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
      await Promise.resolve()
    })

    expect(fetch).toHaveBeenCalledTimes(2)
  })
})

describe('usePromptHomeController unified prompt-session cache', () => {
  beforeEach(() => {
    const state = getTestState()
    state.createSession.mockReset()
    state.createSession.mockResolvedValue({
      sessionId: 'session_unified_cache',
      cached: false,
    })
    state.mutationRefs = []
    state.navigate.mockReset()
    state.navigate.mockResolvedValue(undefined)
    state.preloadRoute.mockReset()
    state.preloadRoute.mockResolvedValue(undefined)
    referralAuthToken.mockReset()
    referralAuthToken.mockResolvedValue(null)
    originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        sessionId: 'session_unified_cache',
        cached: false,
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

  it('persists the prompt to the unified cache on setPrompt', () => {
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('A cozy coffee shop')
    })

    const raw = window.localStorage.getItem('ship-fast:prompt-session-cache')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!) as { prompt: string }
    expect(parsed.prompt).toBe('A cozy coffee shop')
  })

  it('restores the prompt from the unified cache on mount', () => {
    window.localStorage.setItem(
      'ship-fast:prompt-session-cache',
      JSON.stringify({
        prompt: 'A restored coffee shop prompt',
        fingerprint: '',
        preferredLanguage: 'en',
        createdAt: Date.now(),
      }),
    )

    const { result } = renderHook(() => usePromptHomeController())
    expect(result.current.prompt).toBe('A restored coffee shop prompt')
  })

  it('clears the unified cache on successful generate', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        sessionId: 'session_clear_cache',
        cached: false,
      }),
    } as Response)
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('Build a product website')
    })
    expect(
      window.localStorage.getItem('ship-fast:prompt-session-cache'),
    ).not.toBeNull()

    await act(async () => {
      await result.current.submitPrompt()
    })

    expect(
      window.localStorage.getItem('ship-fast:prompt-session-cache'),
    ).toBeNull()
    expect(result.current.prompt).toBe('')
  })

  it('persists the speculative session to the unified cache on completion', async () => {
    vi.useFakeTimers()
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        sessionId: 'session_spec_cache_persist',
        cached: false,
      }),
    } as Response)

    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('a blog about dogs with photo galleries')
    })
    act(() => {
      result.current.scheduleSpeculativeGeneration()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
      await Promise.resolve()
    })

    const raw = window.localStorage.getItem('ship-fast:prompt-session-cache')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!) as {
      sessionId: string
      fingerprint: string
      workspace: string
    }
    expect(parsed.sessionId).toBe('session_spec_cache_persist')
    expect(parsed.fingerprint).not.toBe('')
    expect(parsed.workspace).not.toBe('')
  })

  it('does not re-fire speculative on reload when a cached session exists', async () => {
    vi.useFakeTimers()
    // Simulate a prior speculative session persisted to localStorage.
    const fingerprint = JSON.stringify({
      cloneUrl: '',
      designReferenceNotes: '',
      designReferenceUrls: [],
      isPrivate: false,
      preferredLanguage: 'en',
      prompt: 'a blog about dogs with photo galleries',
    })
    window.localStorage.setItem(
      'ship-fast:prompt-session-cache',
      JSON.stringify({
        prompt: 'a blog about dogs with photo galleries',
        fingerprint,
        preferredLanguage: 'en',
        sessionId: 'session_cached_reload',
        anonymousOwnerSecret: 'secret_cached',
        workspace: 'workspace_cached',
        createdAt: Date.now(),
      }),
    )

    // Mount the hook — should hydrate the cached session and NOT fire
    // speculative for the same fingerprint.
    const { result } = renderHook(() => usePromptHomeController())

    expect(result.current.prompt).toBe('a blog about dogs with photo galleries')

    act(() => {
      result.current.scheduleSpeculativeGeneration()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
      await Promise.resolve()
    })

    // No fetch should have been made — the cached fingerprint prevents
    // a duplicate speculative draft.
    expect(fetch).not.toHaveBeenCalled()
  })

  it('reuses the cached speculative session on submit instead of creating a new one', async () => {
    vi.useFakeTimers()
    const fingerprint = JSON.stringify({
      cloneUrl: '',
      designReferenceNotes: '',
      designReferenceUrls: [],
      isPrivate: false,
      preferredLanguage: 'en',
      prompt: 'a blog about dogs with photo galleries',
    })
    window.localStorage.setItem(
      'ship-fast:prompt-session-cache',
      JSON.stringify({
        prompt: 'a blog about dogs with photo galleries',
        fingerprint,
        preferredLanguage: 'en',
        sessionId: 'session_cached_reuse',
        anonymousOwnerSecret: 'secret_cached',
        workspace: 'workspace_cached',
        createdAt: Date.now(),
      }),
    )

    const state = getTestState()
    const { result } = renderHook(() => usePromptHomeController())

    await act(async () => {
      await result.current.submitPrompt()
    })

    // The only fetch to /api/sessions/create should be the draft-promote
    // call (isDraft: false), NOT a new session creation. The promote
    // reuses the same workspace so the idempotency check finds and
    // promotes the existing draft.
    const createCalls = vi
      .mocked(fetch)
      .mock.calls.filter(([url]) => url === '/api/sessions/create')
    expect(createCalls).toHaveLength(1)
    const promoteBody = JSON.parse(createCalls[0]![1]!.body as string)
    expect(promoteBody.isDraft).toBe(false)
    expect(promoteBody.workspace).toBe('workspace_cached')

    // We navigated to the cached session, not a new one.
    expect(state.navigate).toHaveBeenCalledWith({
      to: '/generate/$sessionId/$',
      params: { sessionId: 'session_cached_reuse' },
    })

    // And the cache was cleared.
    expect(
      window.localStorage.getItem('ship-fast:prompt-session-cache'),
    ).toBeNull()
  })

  it('syncs prompt state from cache on bfcache restore (pageshow persisted)', async () => {
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('A prompt that should be cleared')
    })
    expect(result.current.prompt).toBe('A prompt that should be cleared')

    // Simulate: user hits generate → cache cleared
    window.localStorage.removeItem('ship-fast:prompt-session-cache')

    // Simulate bfcache restore
    await act(async () => {
      window.dispatchEvent(
        new PageTransitionEvent('pageshow', { persisted: true }),
      )
    })

    expect(result.current.prompt).toBe('')
  })

  it('does not alter prompt on non-persisted pageshow (normal load)', async () => {
    const { result } = renderHook(() => usePromptHomeController())

    act(() => {
      result.current.setPrompt('A prompt that stays')
    })

    await act(async () => {
      window.dispatchEvent(
        new PageTransitionEvent('pageshow', { persisted: false }),
      )
    })

    expect(result.current.prompt).toBe('A prompt that stays')
  })
})
