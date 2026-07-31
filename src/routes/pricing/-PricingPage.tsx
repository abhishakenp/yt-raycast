import {
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { MarketingShell } from './-MarketingShell'
import { PricingContent } from './PricingContent'
import {
  requestClerkSignIn,
  useOptionalAuth,
} from '@/shared/auth/use-optional-auth'
import { handleShareClick } from '@/features/home/components/ShareBonusPanel'
import { useReferralCode } from '@/features/referrals/hooks/useReferralCode'
import {
  confirmRazorpaySubscriptionPayment,
  type RazorpaySubscriptionPaymentResponse,
} from '@/features/billing/client/razorpay-confirm'
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

type BillingOverviewResponse = {
  subscription?: { active?: boolean } | null
  generationQuota?: {
    canRenew?: boolean
  } | null
}

type PricingRazorpayCheckoutOptions = {
  key: string
  name: string
  description: string
  handler: (response: RazorpaySubscriptionPaymentResponse) => void
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
  const { code: referralCode } = useReferralCode()
  const [billingOverview, setBillingOverview] =
    useState<BillingOverviewResponse | null>(null)
  const pricingContentRef = useRef<HTMLDivElement>(null)

  const refreshBillingOverview = useCallback(async () => {
    if (!isSignedIn && !hasActiveClerkSession()) {
      setBillingOverview(null)
      return
    }

    try {
      const token = await getToken({ template: 'convex' })
      if (!token) {
        setBillingOverview(null)
        return
      }
      const response = await fetch('/api/billing-overview', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = (await response.json().catch(() => ({}))) as
        | BillingOverviewResponse
        | { error?: string }
      setBillingOverview(response.ok ? (data as BillingOverviewResponse) : null)
    } catch {
      setBillingOverview(null)
    }
  }, [getToken, isSignedIn])

  useEffect(() => {
    void refreshBillingOverview()
  }, [refreshBillingOverview])

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
          handler: (paymentResponse) => {
            setCheckoutMessage('Payment submitted. Confirming Pro...')
            void confirmRazorpaySubscriptionPayment(token, paymentResponse)
              .then(() => {
                setCheckoutMessage('Pro activated.')
                void refreshBillingOverview()
              })
              .catch((confirmError: unknown) => {
                setCheckoutMessage(
                  confirmError instanceof Error
                    ? confirmError.message
                    : 'Razorpay payment confirmation failed.',
                )
              })
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
  }, [getToken, isCheckoutStarting, isSignedIn, refreshBillingOverview])

  useEffect(() => {
    const tick = () => {
      const countdown = document.getElementById('countdown-text')
      if (countdown) countdown.textContent = 'Early adopter slots still open'
    }

    tick()
    const interval = window.setInterval(tick, 30000)
    return () => window.clearInterval(interval)
  }, [])

  const handlePricingContentClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const cta = target.closest<HTMLButtonElement>(
        '[data-pricing-checkout-cta="true"]',
      )
      if (cta === null || !event.currentTarget.contains(cta)) return

      event.preventDefault()
      event.stopPropagation()
      void startCheckout()
    },
    [startCheckout],
  )

  useEffect(() => {
    const content = pricingContentRef.current
    if (content === null) return

    const isCurrentPlan = Boolean(
      billingOverview?.subscription?.active &&
      !billingOverview.generationQuota?.canRenew,
    )
    const label = billingOverview?.subscription?.active
      ? billingOverview.generationQuota?.canRenew
        ? 'Renew Pro'
        : 'Current plan'
      : 'Start Pro'
    const ctas = Array.from(
      content.querySelectorAll<HTMLButtonElement>(
        '[data-pricing-checkout-cta="true"]',
      ),
    )

    for (const cta of ctas) {
      cta.disabled = isCheckoutStarting || isCurrentPlan
      cta.setAttribute('aria-busy', String(isCheckoutStarting))
      cta.textContent = label
    }
  }, [billingOverview, isCheckoutStarting])

  const onShareClick = (platform: string) => {
    void handleShareClick(platform, async () => {}, referralCode)
  }

  return (
    <MarketingShell footer>
      <div ref={pricingContentRef} onClickCapture={handlePricingContentClick}>
        <PricingContent
          onCheckoutClick={startCheckout}
          isCheckoutStarting={isCheckoutStarting}
          onShareClick={onShareClick}
          referralCode={referralCode}
        />
      </div>
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
