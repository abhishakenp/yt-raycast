// @vitest-environment jsdom
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { storePendingReferral } from '@/features/referrals/lib/referral-client'
import {
  DUB_DONE_KEY,
  readPendingDubClick,
} from '@/features/partners/lib/acquisition-client'
import { writeMarketingConsent } from '@/features/partners/lib/marketing-consent'
import { useDubAttributionCapture } from './useDubAttributionCapture'

const postDubAttributionMock = vi.hoisted(() => vi.fn())

vi.mock('@/features/partners/lib/partner-client', () => ({
  postDubAttribution: postDubAttributionMock,
}))

function setClerk(clerk: unknown): void {
  Reflect.set(window, 'Clerk', clerk)
}

describe('useDubAttributionCapture', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_DUB_PARTNERS_ENABLED', 'true')
    window.localStorage.clear()
    document.cookie = 'dub_id=; Max-Age=0; path=/'
    postDubAttributionMock.mockReset()
    Reflect.deleteProperty(window, 'Clerk')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    cleanup()
    window.localStorage.clear()
    document.cookie = 'dub_id=; Max-Age=0; path=/'
    Reflect.deleteProperty(window, 'Clerk')
  })

  it('does nothing while the feature is disabled or consent is absent', async () => {
    document.cookie = 'dub_id=click_123; path=/'

    renderHook(() => useDubAttributionCapture({ enabled: false }))

    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(readPendingDubClick()).toBeNull()
    expect(postDubAttributionMock).not.toHaveBeenCalled()
  })

  it('records the consented Dub click after Clerk signs in', async () => {
    writeMarketingConsent('accepted')
    document.cookie = 'dub_id=click_123; path=/'
    setClerk({
      session: { getToken: vi.fn(async () => 'convex-token') },
      user: { id: 'user_123' },
    })
    postDubAttributionMock.mockResolvedValueOnce({
      claimed: true,
      reason: 'claimed',
    })

    renderHook(() => useDubAttributionCapture({ enabled: true }))

    await waitFor(() =>
      expect(postDubAttributionMock).toHaveBeenCalledWith('click_123'),
    )
    expect(window.localStorage.getItem(DUB_DONE_KEY)).toBe('1')
    expect(readPendingDubClick()).toBeNull()
  })

  it('waits when a native referral was captured first', async () => {
    writeMarketingConsent('accepted')
    document.cookie = 'dub_id=click_123; path=/'
    storePendingReferral('NATIVE01', 1)
    setClerk({
      session: { getToken: vi.fn(async () => 'convex-token') },
      user: { id: 'user_123' },
    })

    renderHook(() => useDubAttributionCapture({ enabled: true }))

    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(readPendingDubClick()).toBe('click_123')
    expect(postDubAttributionMock).not.toHaveBeenCalled()
  })
})
