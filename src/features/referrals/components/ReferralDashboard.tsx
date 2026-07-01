import { Check, Copy, Gift, RefreshCw, Share2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useReferralStatus } from '@/features/referrals/hooks/useReferralStatus'
import { requestClerkSignIn } from '@/shared/auth/use-optional-auth'

const buildReferralLink = (code: string | null): string => {
  if (!code) return ''
  if (typeof window === 'undefined') return `https://ship-fast.io/?ref=${code}`
  return `${window.location.origin}/?ref=${code}`
}

const statusLabel: Record<string, string> = {
  qualified: 'Paid ✓',
  pending: 'Signed up',
  disqualified: 'Not eligible',
}

const statusClass: Record<string, string> = {
  qualified: 'text-emerald-300',
  pending: 'text-white/60',
  disqualified: 'text-rose-300',
}

export const ReferralDashboard = () => {
  const { status, isLoading, error, reload } = useReferralStatus()
  const [copied, setCopied] = useState(false)

  const signInForReferrals = () => {
    requestClerkSignIn()
    window.setTimeout(() => void reload(), 1200)
    window.setTimeout(() => void reload(), 3000)
  }

  const link = useMemo(() => buildReferralLink(status?.code ?? null), [status])

  const copyLink = async () => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  const threshold = status?.threshold ?? 2
  const qualified = status?.qualifiedCount ?? 0
  const progress = Math.min(100, Math.round((qualified / threshold) * 100))
  const refreshDisabled = isLoading || !status

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-5 p-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">
            <Gift className="size-5" />
          </span>
          <div>
            <h1 className="m-0 text-lg font-bold text-white">
              Refer friends, get {status?.discountPercent ?? 50}% off for life
            </h1>
            <p className="m-0 mt-1 text-sm text-white/55">
              When {threshold} people you invite become paying subscribers, your
              subscription is {status?.discountPercent ?? 50}% off — for life.
            </p>
          </div>
        </div>
        <button
          aria-label="Refresh referrals"
          className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white/[0.04] disabled:hover:text-white/60"
          disabled={refreshDisabled}
          onClick={() => void reload()}
          type="button"
        >
          <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/12 p-3">
          <p className="m-0 text-sm text-rose-200">{error}</p>
          <button
            className="inline-flex h-9 shrink-0 items-center rounded-xl bg-cyan-300 px-3 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-px"
            onClick={signInForReferrals}
            type="button"
          >
            Sign in
          </button>
        </div>
      )}

      {/* Share link */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <p className="m-0 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-white/42">
          Your referral link
        </p>
        <div className="mt-3 flex items-center gap-2">
          <input
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/85"
            readOnly
            value={
              link || (isLoading ? 'Loading…' : 'Sign in to get your link')
            }
            onFocus={(event) => event.currentTarget.select()}
          />
          <button
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-cyan-300 px-3 py-2 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-px disabled:opacity-45"
            disabled={!link}
            onClick={() => void copyLink()}
            type="button"
          >
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </section>

      {/* Progress */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <div className="flex items-center justify-between">
          <p className="m-0 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-white/42">
            Progress
          </p>
          <p className="m-0 text-sm font-semibold text-white">
            {qualified} / {threshold} paid
          </p>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="m-0 mt-3 text-sm text-white/65">
          {status?.unlocked
            ? status.discountActive
              ? `🎉 Unlocked! Your ${status.discountPercent}% lifetime discount is active.`
              : status?.hasActiveSubscription === false
                ? `🎉 Unlocked! Subscribe and your ${status.discountPercent}% lifetime discount applies automatically.`
                : `🎉 Unlocked! Applying your ${status?.discountPercent}% lifetime discount…`
            : `Invite ${status?.remaining ?? threshold} more paying ${
                (status?.remaining ?? threshold) === 1
                  ? 'subscriber'
                  : 'subscribers'
              } to unlock your lifetime discount.`}
        </p>
      </section>

      {/* Referral list */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <p className="m-0 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-white/42">
          Your referrals
        </p>
        {status && status.referrals.length > 0 ? (
          <ul className="m-0 mt-3 grid list-none gap-2 p-0">
            {status.referrals.map((referral, index) => (
              <li
                key={`${referral.email ?? 'anon'}-${index}`}
                className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-sm"
              >
                <span className="truncate text-white/80">
                  {referral.email ?? 'Pending account'}
                </span>
                <span
                  className={`shrink-0 font-semibold ${
                    statusClass[referral.status] ?? 'text-white/60'
                  }`}
                >
                  {statusLabel[referral.status] ?? referral.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 mt-3 flex items-center gap-2 text-sm text-white/55">
            <Share2 className="size-4" />
            No referrals yet — share your link to get started.
          </p>
        )}
      </section>
    </div>
  )
}
