import { useCallback, useEffect, useState } from 'react'
import { MarketingShell } from './-MarketingShell'
import { PricingContent } from './PricingContent'
import {
  requestClerkSignIn,
  useOptionalAuth,
} from '@/shared/auth/use-optional-auth'
import { handleShareClick } from '@/features/home/components/ShareBonusPanel'
import { useReferralCode } from '@/features/referrals/hooks/useReferralCode'
import '@/styles/pricing-page.css'

type CheckoutStartResponse = {
  error?: string
  url?: string
  subscriptionId?: string
  orderId?: string
}

export const PricingPage = () => {
  const { getToken } = useOptionalAuth()
  const [checkoutMessage, setCheckoutMessage] = useState<string>()
  const [isCheckoutStarting, setIsCheckoutStarting] = useState(false)
  const { code: referralCode } = useReferralCode()

  const startCheckout = useCallback(async () => {
    if (isCheckoutStarting) return

    setIsCheckoutStarting(true)
    setCheckoutMessage('Opening Pro checkout...')

    try {
      const token = await getToken({ template: 'convex' })
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (token) headers.Authorization = `Bearer ${token}`

      const response = await fetch('/api/checkout/start', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          mode: 'subscription',
          tier: 'pro',
        }),
      })
      const data = (await response
        .json()
        .catch(() => ({}))) as CheckoutStartResponse

      if (response.status === 401) {
        setCheckoutMessage(data.error ?? 'Sign in before checkout.')
        requestClerkSignIn()
        return
      }

      if (!response.ok) {
        throw new Error(data.error ?? 'Checkout could not start.')
      }

      if (typeof data.url === 'string' && data.url.length > 0) {
        window.location.href = data.url
        return
      }

      setCheckoutMessage(
        data.subscriptionId
          ? `Razorpay subscription created: ${data.subscriptionId}`
          : data.orderId
            ? `Razorpay order created: ${data.orderId}`
            : 'Checkout created.',
      )
    } catch (error) {
      setCheckoutMessage(
        error instanceof Error ? error.message : 'Checkout could not start.',
      )
    } finally {
      setIsCheckoutStarting(false)
    }
  }, [getToken, isCheckoutStarting])

  useEffect(() => {
    const tick = () => {
      const countdown = document.getElementById('countdown-text')
      if (countdown) countdown.textContent = 'Early adopter slots still open'
    }

    tick()
    const interval = window.setInterval(tick, 30000)
    return () => window.clearInterval(interval)
  }, [])

  const onShareClick = (platform: string) => {
    void handleShareClick(platform, async () => {}, referralCode)
  }

  return (
    <MarketingShell footer>
      <PricingContent
        onCheckoutClick={startCheckout}
        isCheckoutStarting={isCheckoutStarting}
        onShareClick={onShareClick}
        referralCode={referralCode}
      />
      {checkoutMessage ? (
        <div
          className="fixed bottom-5 left-1/2 z-[80] max-w-[min(420px,calc(100%-32px))] -translate-x-1/2 rounded-full border border-white/12 bg-[#070a12]/92 px-4 py-2.5 text-center font-sans text-sm text-[#f0f0f5] shadow-[0_18px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl"
          role="status"
          aria-live="polite"
        >
          {checkoutMessage}
        </div>
      ) : null}
    </MarketingShell>
  )
}
