// @vitest-environment jsdom
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  REFERRAL_DONE_KEY,
  REFERRAL_PENDING_KEY,
} from '@/features/referrals/lib/referral-client'
import { useReferralCapture } from './useReferralCapture'

const originalFetch = globalThis.fetch

function setClerk(clerk: unknown) {
  ;(window as Window & { Clerk?: unknown }).Clerk = clerk
}

describe('useReferralCapture', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn()
    window.localStorage.clear()
    window.history.pushState(null, '', '/')
    delete (window as Window & { Clerk?: unknown }).Clerk
  })

  afterEach(() => {
    cleanup()
    globalThis.fetch = originalFetch
    window.localStorage.clear()
    window.history.pushState(null, '', '/')
    delete (window as Window & { Clerk?: unknown }).Clerk
    vi.useRealTimers()
  })

  it('captures a referral query code, normalizes it, and cleans the URL', () => {
    window.history.pushState(null, '', '/?ref=ab-cd-2345&utm=keep')

    renderHook(() => useReferralCapture())

    expect(window.localStorage.getItem(REFERRAL_PENDING_KEY)).toBe('ABCD2345')
    expect(window.location.search).toBe('?utm=keep')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('records a pending referral once the global Clerk session can provide a token', async () => {
    window.localStorage.setItem(REFERRAL_PENDING_KEY, 'ABCD2345')
    setClerk({
      user: { primaryEmailAddress: { emailAddress: 'new-user@example.com' } },
      session: {
        getToken: vi.fn(async () => 'convex-token'),
      },
    })
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({ recorded: true, reason: 'recorded' }),
    )

    renderHook(() => useReferralCapture())

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/referrals/record', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer convex-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: 'ABCD2345',
          email: 'new-user@example.com',
        }),
      })
    })
    expect(window.localStorage.getItem(REFERRAL_DONE_KEY)).toBe('1')
    expect(window.localStorage.getItem(REFERRAL_PENDING_KEY)).toBeNull()
  })

  it('clears invalid pending referral codes without marking attribution done', async () => {
    window.localStorage.setItem(REFERRAL_PENDING_KEY, 'BADCODE')
    setClerk({
      user: { primaryEmailAddress: { emailAddress: 'new-user@example.com' } },
      session: {
        getToken: vi.fn(async () => 'convex-token'),
      },
    })
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({ recorded: false, reason: 'invalid_code' }),
    )

    renderHook(() => useReferralCapture())

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
    expect(window.localStorage.getItem(REFERRAL_PENDING_KEY)).toBeNull()
    expect(window.localStorage.getItem(REFERRAL_DONE_KEY)).toBeNull()
  })

  it('keeps a pending referral when attribution returns malformed JSON so a later retry can record it', async () => {
    window.localStorage.setItem(REFERRAL_PENDING_KEY, 'BREWERY50')
    setClerk({
      user: { primaryEmailAddress: { emailAddress: 'new-user@example.com' } },
      session: {
        getToken: vi.fn(async () => 'convex-token'),
      },
    })
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('<!doctype html><title>referral unavailable</title>', {
        headers: { 'Content-Type': 'text/html' },
        status: 200,
      }),
    )

    renderHook(() => useReferralCapture())

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
    expect(window.localStorage.getItem(REFERRAL_PENDING_KEY)).toBe('BREWERY50')
    expect(window.localStorage.getItem(REFERRAL_DONE_KEY)).toBeNull()
  })

  it('does not overwrite an already recorded attribution with a new query code', () => {
    window.localStorage.setItem(REFERRAL_DONE_KEY, '1')
    window.history.pushState(null, '', '/?ref=NEWCODE1')

    renderHook(() => useReferralCapture())

    expect(window.localStorage.getItem(REFERRAL_PENDING_KEY)).toBeNull()
    expect(window.localStorage.getItem(REFERRAL_DONE_KEY)).toBe('1')
    expect(window.location.search).toBe('')
  })
})
