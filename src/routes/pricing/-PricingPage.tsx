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
  provider?: string
  keyId?: string
  url?: string
  subscriptionId?: string
  orderId?: string
  amount?: number
  currency?: string
}

type PricingRazorpayCheckoutOptions = {
  key: string
  name: string
  description: string
  handler: () => void
  modal: { ondismiss: () => void }
  notes: Record<string, string>
  theme: { color: string }
  amount?: number
  currency?: string
  order_id?: string
  subscription_id?: string
}

type PricingRazorpayCheckout = {
  open: () => void
  on: (event: 'payment.failed', handler: () => void) => void
}

type PricingRazorpayConstructor = new (
  options: PricingRazorpayCheckoutOptions,
) => PricingRazorpayCheckout

type PricingRazorpayWindow = Window & {
  Razorpay?: PricingRazorpayConstructor
  Clerk?: {
    session?: unknown | null
    user?: unknown | null
  }
}

let razorpayScriptPromise: Promise<void> | null = null
const signedInVerificationMessage =
  'Your signed-in session could not be verified. Refresh the page or sign out and sign in again.'
const proCheckoutEndpoint = '/api/payments/razorpay/start'

const hasActiveClerkSession = (): boolean => {
  if (typeof window === 'undefined') return false

  const clerk = (window as PricingRazorpayWindow).Clerk
  return Boolean(clerk?.user || clerk?.session)
}

const loadRazorpayCheckout = async (): Promise<PricingRazorpayConstructor> => {
  const razorpayWindow = window as PricingRazorpayWindow
  if (razorpayWindow.Razorpay) return razorpayWindow.Razorpay

  razorpayScriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      razorpayScriptPromise = null
      reject(new Error('Unable to load Razorpay checkout.'))
    }
    document.body.appendChild(script)
  })

  await razorpayScriptPromise
  if (!razorpayWindow.Razorpay) {
    throw new Error('Razorpay checkout is unavailable.')
  }
  return razorpayWindow.Razorpay
}

export const PricingPage = () => {
  const { getToken, isSignedIn } = useOptionalAuth()
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
      const hasCheckoutSession = isSignedIn || hasActiveClerkSession()

      if (!hasCheckoutSession) {
        setCheckoutMessage('Sign in before checkout.')
        requestClerkSignIn()
        return
      }

      const token = await getToken({ template: 'convex' })
      if (!token) {
        setCheckoutMessage(signedInVerificationMessage)
        return
      }

      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }

      const response = await fetch(proCheckoutEndpoint, {
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
        if (hasCheckoutSession || hasActiveClerkSession()) {
          setCheckoutMessage(signedInVerificationMessage)
          return
        }

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

      if (
        data.provider === 'razorpay' &&
        typeof data.keyId === 'string' &&
        typeof data.subscriptionId === 'string'
      ) {
        setCheckoutMessage('Opening Razorpay checkout...')
        const Razorpay = await loadRazorpayCheckout()
        const checkout = new Razorpay({
          key: data.keyId,
          name: 'Ship Fast',
          description: 'Ship Fast Pro subscription',
          subscription_id: data.subscriptionId,
          handler: () => {
            setCheckoutMessage('Payment submitted. Refreshing billing...')
          },
          modal: {
            ondismiss: () => {
              setCheckoutMessage('Checkout closed.')
            },
          },
          notes: {
            mode: 'subscription',
            tier: 'pro',
          },
          theme: { color: '#67e8f9' },
        })
        checkout.on('payment.failed', () => {
          setCheckoutMessage('Razorpay payment failed.')
        })
        checkout.open()
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
  }, [getToken, isCheckoutStarting, isSignedIn])

  useEffect(() => {
    const content = pricingContentRef.current
    if (content === null) return

    const ctas = Array.from(
      content.querySelectorAll<HTMLButtonElement>(
        '[data-pricing-checkout-cta="true"]',
      ),
    )
    const handleCheckoutClick = (event: MouseEvent) => {
      event.preventDefault()
      void startCheckout()
    }

    for (const cta of ctas) {
      cta.addEventListener('click', handleCheckoutClick)
    }

    return () => {
      for (const cta of ctas) {
        cta.removeEventListener('click', handleCheckoutClick)
      }
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
    const handleFaqClick = (event: MouseEvent) => {
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
