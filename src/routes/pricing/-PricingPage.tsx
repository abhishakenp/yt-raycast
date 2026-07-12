import { useCallback, useEffect, useRef, useState } from 'react'
import { MarketingShell } from './-MarketingShell'
import { PRICING_PAGE_MAIN_HTML } from './-pricing-main-html'
import {
  requestClerkSignIn,
  useOptionalAuth,
} from '@/shared/auth/use-optional-auth'
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
  const pricingContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tick = () => {
      const countdown = document.getElementById('countdown-text')
      if (countdown) countdown.textContent = 'Early adopter slots still open'
    }

    tick()
    const interval = window.setInterval(tick, 30000)
    return () => window.clearInterval(interval)
  }, [])

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
    const content = pricingContentRef.current
    if (content === null) return

    const ctas = Array.from(
      content.querySelectorAll<HTMLButtonElement>(
        '[data-pricing-checkout-cta="true"]',
      ),
    )
    const handleCtaClick = (event) => {
      event.preventDefault()
      void startCheckout()
    }

    for (const cta of ctas) cta.addEventListener('click', handleCtaClick)

    return () => {
      for (const cta of ctas) cta.removeEventListener('click', handleCtaClick)
    }
  }, [startCheckout])

  useEffect(() => {
    const content = pricingContentRef.current
    if (content === null) return

    const ctas = Array.from(
      content.querySelectorAll<HTMLButtonElement>(
        '[data-pricing-checkout-cta="true"]',
      ),
    )

    for (const cta of ctas) {
      cta.disabled = isCheckoutStarting
      cta.setAttribute('aria-busy', String(isCheckoutStarting))
    }
  }, [isCheckoutStarting])

  useEffect(() => {
    const content = pricingContentRef.current
    if (content === null) return

    const faqTriggers = Array.from(
      content.querySelectorAll<HTMLButtonElement>('[data-faq-trigger]'),
    )
    const handleFaqClick = (event) => {
      const trigger = event.currentTarget as HTMLButtonElement
      const item = trigger.closest<HTMLElement>('[data-faq-item]')
      const panelId = trigger.getAttribute('aria-controls')
      const panel = panelId === null ? null : document.getElementById(panelId)
      const nextExpanded = trigger.getAttribute('aria-expanded') !== 'true'

      trigger.setAttribute('aria-expanded', String(nextExpanded))
      item?.toggleAttribute('data-open', nextExpanded)
      if (panel !== null) panel.hidden = !nextExpanded
    }

    for (const trigger of faqTriggers) {
      trigger.addEventListener('click', handleFaqClick)
    }

    return () => {
      for (const trigger of faqTriggers) {
        trigger.removeEventListener('click', handleFaqClick)
      }
    }
  }, [])

  return (
    <MarketingShell footer>
      <div
        ref={pricingContentRef}
        dangerouslySetInnerHTML={{ __html: PRICING_PAGE_MAIN_HTML }}
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
