// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  MARKETING_CONSENT_CHANGED_EVENT,
  MARKETING_CONSENT_KEY,
  clearDubAttributionCookie,
  readMarketingConsent,
  writeMarketingConsent,
} from './marketing-consent'

describe('marketing consent', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.cookie = 'dub_id=click_123; path=/'
  })

  afterEach(() => {
    window.localStorage.clear()
    document.cookie = 'dub_id=; Max-Age=0; path=/'
  })

  it('persists only explicit accepted or declined consent states', () => {
    expect(readMarketingConsent()).toBeNull()

    writeMarketingConsent('accepted')
    expect(readMarketingConsent()).toBe('accepted')
    expect(window.localStorage.getItem(MARKETING_CONSENT_KEY)).toBe('accepted')

    writeMarketingConsent('declined')
    expect(readMarketingConsent()).toBe('declined')
  })

  it('notifies the current page when consent changes', () => {
    let changes = 0
    window.addEventListener(MARKETING_CONSENT_CHANGED_EVENT, () => {
      changes += 1
    })

    writeMarketingConsent('accepted')

    expect(changes).toBe(1)
  })

  it('treats an unexpected stored value as no consent', () => {
    window.localStorage.setItem(MARKETING_CONSENT_KEY, 'legacy-true')

    expect(readMarketingConsent()).toBeNull()
  })

  it('clears the Dub attribution cookie when consent is withdrawn', () => {
    const script = document.createElement('script')
    script.setAttribute('data-sdkn', '@dub/analytics')
    document.head.appendChild(script)
    Object.defineProperty(window, 'DubAnalytics', {
      configurable: true,
      value: { partner: { id: 'partner_123' } },
    })
    Object.defineProperty(window, 'dubAnalytics', {
      configurable: true,
      value: () => undefined,
    })
    expect(document.cookie).toContain('dub_id=click_123')

    clearDubAttributionCookie()

    expect(document.cookie).not.toContain('dub_id=')
    expect(
      document.head.querySelector('script[data-sdkn="@dub/analytics"]'),
    ).toBeNull()
    expect(Reflect.has(window, 'DubAnalytics')).toBe(false)
    expect(Reflect.has(window, 'dubAnalytics')).toBe(false)
  })
})
