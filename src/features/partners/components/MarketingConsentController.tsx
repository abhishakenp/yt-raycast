import { Analytics as DubAnalytics } from '@dub/analytics/react'
import { useEffect, useState } from 'react'

import {
  MARKETING_CONSENT_CHANGED_EVENT,
  readMarketingConsent,
  writeMarketingConsent,
} from '@/features/partners/lib/marketing-consent'
import type { MarketingConsent } from '@/features/partners/lib/marketing-consent'

type MarketingConsentControllerProps = {
  enabled?: boolean
  publishableKey?: string
  referralDomain?: string
  siteDomain?: string
}

function isEnabled(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === 'true'
}

export function MarketingConsentController({
  enabled = isEnabled(import.meta.env.VITE_DUB_PARTNERS_ENABLED),
  publishableKey = import.meta.env.VITE_DUB_PUBLISHABLE_KEY,
  referralDomain = import.meta.env.VITE_DUB_REFERRAL_DOMAIN,
  siteDomain = import.meta.env.VITE_DUB_SITE_DOMAIN,
}: MarketingConsentControllerProps): React.ReactNode {
  const [consent, setConsent] = useState<MarketingConsent | null>(null)
  useEffect(() => {
    const syncConsent = () => setConsent(readMarketingConsent())
    syncConsent()
    window.addEventListener(MARKETING_CONSENT_CHANGED_EVENT, syncConsent)
    return () =>
      window.removeEventListener(MARKETING_CONSENT_CHANGED_EVENT, syncConsent)
  }, [])

  const configured = Boolean(
    enabled && publishableKey && referralDomain && siteDomain,
  )

  if (!configured) return null

  if (consent === 'accepted') {
    return (
      <DubAnalytics
        attributionModel="first-click"
        cookieOptions={{ expiresInDays: 30 }}
        domainsConfig={{
          refer: referralDomain,
          site: siteDomain,
        }}
        publishableKey={publishableKey}
      />
    )
  }

  if (consent === 'declined') return null

  function chooseConsent(nextConsent: MarketingConsent): void {
    writeMarketingConsent(nextConsent)
    setConsent(nextConsent)
  }

  return (
    <section
      aria-label="Marketing cookies"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-background px-4 py-4 text-foreground shadow-[0_-8px_24px_rgba(0,0,0,0.08)]"
      role="dialog"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Allow marketing cookies to attribute partner referrals. Essential
          product cookies remain unchanged.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            className="h-9 border border-border px-3 text-sm font-medium hover:bg-muted"
            onClick={() => chooseConsent('declined')}
            type="button"
          >
            Decline
          </button>
          <button
            className="h-9 bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            onClick={() => chooseConsent('accepted')}
            type="button"
          >
            Allow marketing
          </button>
        </div>
      </div>
    </section>
  )
}
