import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const clientState = vi.hoisted(() => ({
  constructor: vi.fn(),
  options: new Map<string, unknown>(),
}))

vi.mock('convex/browser', () => ({
  ConvexHttpClient: class FakeConvexHttpClient {
    constructor(url: string, options: { fetch: typeof fetch }) {
      clientState.constructor(url, options)
      clientState.options.set('fetch', options.fetch)
    }

    backendUrl() {
      return 'https://convex.example/api'
    }
  },
}))

import { createRuntimeConvexHttpClient } from './http-client'

const observedSignals: AbortSignal[] = []

function isFetch(value: unknown): value is typeof fetch {
  return typeof value === 'function'
}

function getCapturedFetch() {
  const value = clientState.options.get('fetch')
  if (!isFetch(value)) throw new Error('Convex fetch implementation missing')
  return value
}

async function resolveAndRecordSignal(
  _input: RequestInfo | URL,
  init?: RequestInit,
) {
  if (init?.signal) observedSignals.push(init.signal)
  return new Response('ok')
}

function stallUntilAbort(_input: RequestInfo | URL, init?: RequestInit) {
  const signal = init?.signal
  if (!signal) return Promise.reject(new Error('Abort signal missing'))

  return new Promise<Response>((_resolve, reject) => {
    signal.addEventListener(
      'abort',
      () => reject(new DOMException('aborted', 'AbortError')),
      { once: true },
    )
  })
}

beforeEach(() => {
  clientState.options.clear()
  observedSignals.length = 0
  vi.stubEnv('CONVEX_SELF_HOSTED_URL', 'https://convex.example')
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('runtime Convex HTTP client cancellation', () => {
  it('propagates caller cancellation to the fetch used by Convex', async () => {
    vi.stubGlobal('fetch', vi.fn(resolveAndRecordSignal))
    createRuntimeConvexHttpClient(5_000)
    const caller = new AbortController()

    await getCapturedFetch()('https://convex.example/api/query', {
      signal: caller.signal,
    })
    caller.abort()

    expect(observedSignals).toHaveLength(1)
    expect(observedSignals[0]?.aborted).toBe(true)
  })

  it('aborts a stalled Convex request at the configured deadline', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn(stallUntilAbort))
    createRuntimeConvexHttpClient(1_000)
    const rejected = vi.fn()

    void getCapturedFetch()('https://convex.example/api/query').catch(rejected)
    await vi.advanceTimersByTimeAsync(1_001)

    expect(rejected).toHaveBeenCalledOnce()
    expect(rejected.mock.calls[0]?.[0]).toMatchObject({ name: 'AbortError' })
  })

  it('clears the deadline after a completed Convex request', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn(resolveAndRecordSignal))
    createRuntimeConvexHttpClient(1_000)

    await getCapturedFetch()('https://convex.example/api/query')
    await vi.advanceTimersByTimeAsync(1_001)

    expect(observedSignals).toHaveLength(1)
    expect(observedSignals[0]?.aborted).toBe(false)
  })
})
