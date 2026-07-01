// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  REFERRAL_DONE_KEY,
  REFERRAL_PENDING_KEY,
  clearPendingReferral,
  getClerkUserEmail,
  getReferralAuthToken,
  hasRecordedReferral,
  isClerkSignedIn,
  markReferralRecorded,
  normalizeRefParam,
  postReferralRecord,
  readPendingReferral,
  storePendingReferral,
} from './referral-client'

const originalFetch = globalThis.fetch

const setClerk = (clerk: unknown) => {
  ;(window as Window & { Clerk?: unknown }).Clerk = clerk
}

describe('referral client helpers', () => {
  beforeEach(() => {
    window.localStorage.clear()
    globalThis.fetch = vi.fn()
    delete (window as Window & { Clerk?: unknown }).Clerk
  })

  afterEach(() => {
    window.localStorage.clear()
    globalThis.fetch = originalFetch
    delete (window as Window & { Clerk?: unknown }).Clerk
  })

  it('normalizes referral query params to the canonical attribution code', () => {
    expect(normalizeRefParam(' ab-cd_2345-extra ')).toBe('ABCD2345')
    expect(normalizeRefParam(null)).toBe('')
  })

  it('stores pending codes only until attribution has been recorded', () => {
    storePendingReferral('ABCD2345')
    expect(readPendingReferral()).toBe('ABCD2345')

    markReferralRecorded()

    expect(hasRecordedReferral()).toBe(true)
    expect(readPendingReferral()).toBeNull()

    storePendingReferral('NEWCODE1')

    expect(window.localStorage.getItem(REFERRAL_DONE_KEY)).toBe('1')
    expect(window.localStorage.getItem(REFERRAL_PENDING_KEY)).toBeNull()
  })

  it('clears pending referral codes without clearing the recorded marker', () => {
    window.localStorage.setItem(REFERRAL_PENDING_KEY, 'ABCD2345')
    window.localStorage.setItem(REFERRAL_DONE_KEY, '1')

    clearPendingReferral()

    expect(readPendingReferral()).toBeNull()
    expect(hasRecordedReferral()).toBe(true)
  })

  it('falls back to a default Clerk token when the Convex template token fails', async () => {
    const getToken = vi
      .fn()
      .mockRejectedValueOnce(
        new Error('No JWT template exists with name convex'),
      )
      .mockResolvedValueOnce('default-token')
    setClerk({
      user: { primaryEmailAddress: { emailAddress: 'ref@example.com' } },
      session: { getToken },
    })

    await expect(getReferralAuthToken()).resolves.toBe('default-token')
    expect(getToken).toHaveBeenNthCalledWith(1, { template: 'convex' })
    expect(getToken).toHaveBeenNthCalledWith(2)
    expect(isClerkSignedIn()).toBe(true)
    expect(getClerkUserEmail()).toBe('ref@example.com')
  })

  it('posts referral attribution with bearer auth and the Clerk email', async () => {
    setClerk({
      user: { primaryEmailAddress: { emailAddress: 'ref@example.com' } },
      session: { getToken: vi.fn(async () => 'convex-token') },
    })
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({ recorded: true, reason: 'recorded' }),
    )

    await expect(postReferralRecord('ABCD2345')).resolves.toEqual({
      recorded: true,
      reason: 'recorded',
    })
    expect(fetch).toHaveBeenCalledWith('/api/referrals/record', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer convex-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: 'ABCD2345', email: 'ref@example.com' }),
    })
  })
})
