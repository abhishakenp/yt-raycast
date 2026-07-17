// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  REFERRAL_DONE_KEY,
  storePendingReferral,
} from '@/features/referrals/lib/referral-client'
import { writeMarketingConsent } from './marketing-consent'
import {
  DUB_DONE_KEY,
  DUB_PENDING_AT_KEY,
  captureDubClickFromCookie,
  getEarliestPendingAcquisition,
  markDubAttributionRecorded,
  readPendingDubClick,
} from './acquisition-client'

describe('acquisition client arbitration', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_DUB_PARTNERS_ENABLED', 'true')
    window.localStorage.clear()
    document.cookie = 'dub_id=; Max-Age=0; path=/'
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    window.localStorage.clear()
    document.cookie = 'dub_id=; Max-Age=0; path=/'
  })

  it('does not capture Dub attribution before marketing consent', () => {
    document.cookie = 'dub_id=click_without_consent; path=/'

    expect(captureDubClickFromCookie(200)).toBeNull()
    expect(readPendingDubClick()).toBeNull()
  })

  it('captures the consented Dub click and selects the earliest source', () => {
    writeMarketingConsent('accepted')
    document.cookie = 'dub_id=click_123; path=/'
    storePendingReferral('NATIVE01', 100)

    expect(captureDubClickFromCookie(200)).toBe('click_123')
    expect(getEarliestPendingAcquisition()).toEqual({
      capturedAt: 100,
      source: 'native_referral',
      sourceKey: 'NATIVE01',
    })

    window.localStorage.clear()
    writeMarketingConsent('accepted')
    document.cookie = 'dub_id=click_456; path=/'
    storePendingReferral('NATIVE02', 300)
    captureDubClickFromCookie(200)

    expect(getEarliestPendingAcquisition()).toEqual({
      capturedAt: 200,
      source: 'dub_partner',
      sourceKey: 'click_456',
    })
  })

  it('keeps the first Dub click when analytics changes its cookie', () => {
    writeMarketingConsent('accepted')
    document.cookie = 'dub_id=first_click; path=/'
    captureDubClickFromCookie(100)
    document.cookie = 'dub_id=second_click; path=/'
    captureDubClickFromCookie(200)

    expect(readPendingDubClick()).toBe('first_click')
  })

  it('ignores a stale Dub candidate after marketing consent is withdrawn', () => {
    writeMarketingConsent('accepted')
    document.cookie = 'dub_id=click_123; path=/'
    captureDubClickFromCookie(100)
    storePendingReferral('NATIVE01', 200)

    writeMarketingConsent('declined')

    expect(readPendingDubClick()).toBeNull()
    expect(window.localStorage.getItem(DUB_PENDING_AT_KEY)).toBeNull()
    expect(getEarliestPendingAcquisition()).toEqual({
      capturedAt: 200,
      source: 'native_referral',
      sourceKey: 'NATIVE01',
    })
  })

  it('ignores a stale Dub candidate while the partner program is disabled', () => {
    writeMarketingConsent('accepted')
    document.cookie = 'dub_id=click_123; path=/'
    captureDubClickFromCookie(100)
    storePendingReferral('NATIVE01', 200)

    vi.stubEnv('VITE_DUB_PARTNERS_ENABLED', 'false')

    expect(getEarliestPendingAcquisition()).toEqual({
      capturedAt: 200,
      source: 'native_referral',
      sourceKey: 'NATIVE01',
    })
  })

  it('suppresses pending claims after either source records attribution', () => {
    writeMarketingConsent('accepted')
    document.cookie = 'dub_id=click_123; path=/'
    captureDubClickFromCookie(100)

    window.localStorage.setItem(REFERRAL_DONE_KEY, '1')
    expect(getEarliestPendingAcquisition()).toBeNull()

    window.localStorage.removeItem(REFERRAL_DONE_KEY)
    markDubAttributionRecorded()
    expect(window.localStorage.getItem(DUB_DONE_KEY)).toBe('1')
    expect(getEarliestPendingAcquisition()).toBeNull()
    expect(readPendingDubClick()).toBeNull()
  })
})
