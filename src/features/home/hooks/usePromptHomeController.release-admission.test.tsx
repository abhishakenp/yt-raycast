// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const navigate = vi.hoisted(() => vi.fn(async () => undefined))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigate,
}))

import { usePromptHomeController } from './usePromptHomeController'

interface DeferredResponse {
  promise: Promise<Response>
  resolve: (response: Response) => void
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status,
  })
}

function deferredResponse(): DeferredResponse {
  function unresolvedResponse(_response: Response): void {}
  let resolvePromise = unresolvedResponse
  const promise = new Promise<Response>((resolve) => {
    resolvePromise = resolve
  })
  return { promise, resolve: resolvePromise }
}

async function submitAndFinishFeedback(
  submitPrompt: () => Promise<void>,
): Promise<void> {
  let submission: Promise<void> | undefined
  await act(async () => {
    submission = submitPrompt()
    await Promise.resolve()
  })
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1_200)
    await submission
  })
}

describe('usePromptHomeController release admission', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    navigate.mockClear()
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('preserves an explicit quota signal so the share-bonus recovery UI can open', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse(
          {
            code: 'QUOTA_EXCEEDED',
            error:
              'Your anonymous daily generation quota is exhausted. Share on social media to continue.',
          },
          429,
        ),
      ),
    )
    const { result } = renderHook(() => usePromptHomeController())

    act(() => result.current.setPrompt('Build a launch-ready product site'))
    await submitAndFinishFeedback(result.current.submitPrompt)

    expect(result.current.errorMessage).toContain('quota is exhausted')
    expect(navigate).not.toHaveBeenCalled()
  })

  it('preserves an explicit authentication signal from the admission endpoint', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse(
          { code: 'AUTH_REQUIRED', error: 'Sign in to start generation.' },
          401,
        ),
      ),
    )
    const { result } = renderHook(() => usePromptHomeController())

    act(() => result.current.setPrompt('Build a private client portal'))
    await submitAndFinishFeedback(result.current.submitPrompt)

    expect(result.current.errorMessage).toBe('Sign in to start generation.')
    expect(navigate).not.toHaveBeenCalled()
  })

  it('retries share-bonus hydration after a non-success HTTP response', async () => {
    const fetchShareBonus = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ error: 'Unavailable' }, 503))
      .mockResolvedValueOnce(jsonResponse({ claimed: true }))
    vi.stubGlobal('fetch', fetchShareBonus)
    const { result } = renderHook(() => usePromptHomeController())

    await act(async () => result.current.refreshShareBonusStatus())
    await act(async () => result.current.refreshShareBonusStatus())

    expect(fetchShareBonus).toHaveBeenCalledTimes(2)
    expect(result.current.shareBonusClaimed).toBe(true)
  })

  it('coalesces simultaneous share-bonus claims into one request', async () => {
    const claim = deferredResponse()
    const fetchShareBonus = vi.fn(() => claim.promise)
    vi.stubGlobal('fetch', fetchShareBonus)
    const { result } = renderHook(() => usePromptHomeController())

    let firstClaim: Promise<void> | undefined
    let secondClaim: Promise<void> | undefined
    await act(async () => {
      firstClaim = result.current.claimShareBonus()
      secondClaim = result.current.claimShareBonus()
      await Promise.resolve()
    })
    claim.resolve(jsonResponse({ claimed: true }))
    await act(async () => {
      await Promise.all([firstClaim, secondClaim])
    })

    expect(fetchShareBonus).toHaveBeenCalledTimes(1)
    expect(result.current.shareBonusClaimed).toBe(true)
  })
})
