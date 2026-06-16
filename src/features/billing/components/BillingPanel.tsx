import { CreditCard, RefreshCw, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useOptionalAuth } from '@/shared/auth/use-optional-auth'

type BillingPanelProps = {
  sessionId: string
}

type BillingOverview = {
  userId?: string
  subscription?: {
    active: boolean
    planId?: string | null
    provider?: string
    status?: string | null
  } | null
  credits?: {
    remaining: number
  }
  exportAccess?: {
    unlocked: boolean
    reason?: string
    viaCredits?: boolean
  }
}

type CheckoutMode = 'subscription' | 'credit_pack'

export const BillingPanel = ({ sessionId }: BillingPanelProps) => {
  const { getToken, isSignedIn } = useOptionalAuth()
  const [overview, setOverview] = useState<BillingOverview | null>(null)
  const [error, setError] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [checkoutState, setCheckoutState] = useState<string>()

  const loadOverview = async () => {
    setError(undefined)
    setIsLoading(true)

    try {
      const token = await getToken()
      if (!token || !isSignedIn) {
        setOverview(null)
        setError('Sign in to view billing details.')
        return
      }

      const response = await fetch('/api/billing-overview', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error ?? 'Unable to load billing')
      setOverview(data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load billing')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadOverview()
  }, [isSignedIn])

  const startCheckout = async (mode: CheckoutMode, packId?: '3_credits' | '10_credits') => {
    setError(undefined)
    setCheckoutState(mode === 'subscription' ? 'Opening subscription checkout...' : 'Opening credit checkout...')

    try {
      const token = await getToken()
      if (!token || !isSignedIn) throw new Error('Sign in before checkout.')

      const response = await fetch('/api/checkout/start', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          tier: 'pro',
          packId,
          sessionId,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error ?? 'Checkout failed')

      if (typeof data.url === 'string' && data.url) {
        window.location.href = data.url
        return
      }

      setCheckoutState(
        data.subscriptionId
          ? `Razorpay subscription created: ${data.subscriptionId}`
          : data.orderId
            ? `Razorpay order created: ${data.orderId}`
            : 'Checkout created.',
      )
    } catch (checkoutError) {
      setCheckoutState(undefined)
      setError(checkoutError instanceof Error ? checkoutError.message : 'Checkout failed')
    }
  }

  const credits = overview?.credits?.remaining ?? 0
  const subscription = overview?.subscription
  const exportAccess = overview?.exportAccess

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <CreditCard className="size-4 text-cyan-200" />
          <div>
            <h2 className="m-0 text-sm font-semibold uppercase tracking-[0.1em] text-white">Billing</h2>
            <p className="m-0 mt-1 text-xs leading-5 text-white/48">Subscription and export credits for this account.</p>
          </div>
        </div>
        <button
          aria-label="Refresh billing"
          className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/62 hover:bg-white/[0.08] hover:text-white"
          disabled={isLoading}
          onClick={() => void loadOverview()}
          type="button"
        >
          <RefreshCw className="size-4" />
        </button>
      </div>

      <div className="grid gap-3">
        <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
          <p className="m-0 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-white/42">Export access</p>
          <p className="m-0 mt-2 text-sm font-semibold text-white">
            {exportAccess?.unlocked ? 'Unlocked' : 'Locked'}
          </p>
          <p className="m-0 mt-1 text-xs leading-5 text-white/48">
            {exportAccess?.reason ?? 'Subscribe or use credits to unlock ZIP exports.'}
          </p>
        </section>

        <section className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <p className="m-0 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-white/42">Plan</p>
            <p className="m-0 mt-2 text-sm font-semibold text-white">
              {subscription?.active ? subscription.planId ?? 'Active' : 'Free'}
            </p>
            <p className="m-0 mt-1 text-[0.68rem] uppercase tracking-[0.08em] text-white/34">
              {subscription?.provider ?? subscription?.status ?? 'No subscription'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <p className="m-0 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-white/42">Credits</p>
            <p className="m-0 mt-2 text-sm font-semibold text-white">{credits}</p>
            <p className="m-0 mt-1 text-[0.68rem] uppercase tracking-[0.08em] text-white/34">Remaining</p>
          </div>
        </section>

        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45"
          disabled={isLoading}
          onClick={() => void startCheckout('subscription')}
          type="button"
        >
          <CreditCard className="size-4" />
          Upgrade to Pro
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/72 transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-45"
            disabled={isLoading}
            onClick={() => void startCheckout('credit_pack', '3_credits')}
            type="button"
          >
            <Wallet className="size-3.5" />
            3 credits
          </button>
          <button
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/72 transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-45"
            disabled={isLoading}
            onClick={() => void startCheckout('credit_pack', '10_credits')}
            type="button"
          >
            <Wallet className="size-3.5" />
            10 credits
          </button>
        </div>
      </div>

      {checkoutState && (
        <p className="m-0 rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-100">
          {checkoutState}
        </p>
      )}
      {error && (
        <p className="m-0 rounded-xl border border-rose-500/30 bg-rose-500/12 p-3 text-sm text-rose-200">
          {error}
        </p>
      )}
    </div>
  )
}
