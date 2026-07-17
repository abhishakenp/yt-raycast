export const MARKETING_CONSENT_KEY = 'shipfast_marketing_consent_v1'
export const MARKETING_CONSENT_CHANGED_EVENT =
  'shipfast:marketing-consent-changed'
export const DUB_PENDING_KEY = 'shipfast_dub_pending_click'
export const DUB_PENDING_AT_KEY = 'shipfast_dub_pending_at'

export type MarketingConsent = 'accepted' | 'declined'

function getStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export function readMarketingConsent(): MarketingConsent | null {
  const value = getStorage()?.getItem(MARKETING_CONSENT_KEY)
  return value === 'accepted' || value === 'declined' ? value : null
}

export function clearDubAttributionCookie(): void {
  if (typeof document === 'undefined') return

  const expiredCookie = 'dub_id=; Max-Age=0; path=/; SameSite=Lax'
  document.cookie = expiredCookie
  document.cookie = `${expiredCookie}; domain=ship-fast.ai`
  document.cookie = `${expiredCookie}; domain=.ship-fast.ai`

  document
    .querySelectorAll('script[data-sdkn="@dub/analytics"]')
    .forEach((script) => script.remove())

  if (typeof window !== 'undefined') {
    Reflect.deleteProperty(window, 'DubAnalytics')
    Reflect.deleteProperty(window, 'dubAnalytics')
  }
}

export function clearPendingDubAttribution(): void {
  const storage = getStorage()
  storage?.removeItem(DUB_PENDING_KEY)
  storage?.removeItem(DUB_PENDING_AT_KEY)
}

export function writeMarketingConsent(consent: MarketingConsent): void {
  getStorage()?.setItem(MARKETING_CONSENT_KEY, consent)
  if (consent === 'declined') {
    clearPendingDubAttribution()
    clearDubAttributionCookie()
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(MARKETING_CONSENT_CHANGED_EVENT))
  }
}

export function withdrawMarketingConsent(): void {
  writeMarketingConsent('declined')
}
