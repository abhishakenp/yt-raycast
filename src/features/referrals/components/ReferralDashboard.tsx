import { Check, Copy, Gift, RefreshCw, Share2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useReferralStatus } from '@/features/referrals/hooks/useReferralStatus'
import { GlassPillButton } from '@/features/home/components/GlassPill'

function buildReferralLink(code: string | null): string {
  if (!code) return ''
  if (typeof window === 'undefined') return `https://ship-fast.ai/?ref=${code}`
  return `${window.location.origin}/?ref=${code}`
}

const statusLabel: Record<string, string> = {
  qualified: 'Paid',
  pending: 'Signed up',
  disqualified: 'Not eligible',
}

const statusClass: Record<string, string> = {
  qualified: 'qualified',
  pending: 'pending',
  disqualified: 'disqualified',
}

export const ReferralDashboard = () => {
  const { status, isLoading, error, reload } = useReferralStatus()
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState<string | null>(null)
  const copyInFlightRef = useRef(false)
  const copyResetTimerRef = useRef<number | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (copyResetTimerRef.current !== null) {
        window.clearTimeout(copyResetTimerRef.current)
      }
    }
  }, [])

  const link = useMemo(
    () => buildReferralLink(status?.code ?? null),
    [status?.code],
  )

  const copyLink = async () => {
    if (!link || copyInFlightRef.current) return
    copyInFlightRef.current = true
    setCopyError(null)
    try {
      await navigator.clipboard.writeText(link)
      if (!isMountedRef.current) return
      setCopied(true)
      if (copyResetTimerRef.current !== null) {
        window.clearTimeout(copyResetTimerRef.current)
      }
      copyResetTimerRef.current = window.setTimeout(() => {
        if (isMountedRef.current) setCopied(false)
      }, 1_800)
    } catch {
      if (!isMountedRef.current) return
      setCopied(false)
      setCopyError(
        'Unable to copy the referral link. Copy it manually instead.',
      )
    } finally {
      copyInFlightRef.current = false
    }
  }

  const threshold = Math.max(1, status?.threshold ?? 2)
  const qualified = Math.max(0, status?.qualifiedCount ?? 0)
  const progressValue = Math.min(qualified, threshold)
  const progress = Math.round((progressValue / threshold) * 100)
  const refreshDisabled = isLoading || !status
  const discountPercent = status?.discountPercent ?? 50

  return (
    <div className="referrals-page">
      {/* Hero */}
      <section className="referrals-hero" aria-labelledby="referrals-heading">
        <span className="kicker">Referrals</span>
        <h1 id="referrals-heading">
          Refer friends,
          <br />
          get {discountPercent}% off for life
        </h1>
        <p>
          When {threshold} people you invite become paying subscribers, your
          subscription is {discountPercent}% off — for life.
        </p>
      </section>

      {error && (
        <div className="referral-error" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Share link */}
      <section className="referral-section">
        <div className="referral-card">
          <div className="referral-hero-row">
            <div className="flex items-center gap-3">
              <span
                className="grid size-11 place-items-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                aria-hidden="true"
              >
                <Gift className="size-5" />
              </span>
              <p className="referral-card-label">Your referral link</p>
            </div>
            <button
              aria-label="Refresh referrals"
              className="referral-refresh"
              disabled={refreshDisabled}
              onClick={() => void reload()}
              type="button"
            >
              <RefreshCw
                className={`size-4 ${isLoading ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
          <div className="referral-link-row mt-4">
            <input
              className="referral-link-input"
              readOnly
              value={
                link || (isLoading ? 'Loading…' : 'Sign in to get your link')
              }
              onFocus={(event) => event.currentTarget.select()}
            />
            <GlassPillButton
              className="referral-copy-btn"
              disabled={!link}
              onClick={() => void copyLink()}
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </GlassPillButton>
          </div>
          {copyError && (
            <p className="mt-3 text-sm text-rose-300" role="alert">
              {copyError}
            </p>
          )}
        </div>
      </section>

      {/* Progress */}
      <section className="referral-section">
        <div className="referral-card">
          <div className="referral-progress-header">
            <p className="referral-card-label">Progress</p>
            <p className="referral-progress-count">
              {qualified} / {threshold} paid
            </p>
          </div>
          <div
            aria-label="Referral progress"
            aria-valuemax={threshold}
            aria-valuemin={0}
            aria-valuenow={progressValue}
            className="referral-progress-track"
            role="progressbar"
          >
            <div
              className="referral-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p
            className={`referral-progress-status${status?.unlocked ? ' unlocked' : ''}`}
          >
            {status?.unlocked
              ? status.discountActive
                ? `Unlocked! Your ${discountPercent}% lifetime discount is active.`
                : status?.hasActiveSubscription === false
                  ? `Unlocked! Subscribe and your ${discountPercent}% lifetime discount applies automatically.`
                  : `Unlocked! Applying your ${discountPercent}% lifetime discount…`
              : `Invite ${status?.remaining ?? threshold} more paying ${
                  (status?.remaining ?? threshold) === 1
                    ? 'subscriber'
                    : 'subscribers'
                } to unlock your lifetime discount.`}
          </p>
        </div>
      </section>

      {/* Referral list */}
      <section className="referral-section">
        <div className="referral-card">
          <p className="referral-card-label">Your referrals</p>
          {status && status.referrals.length > 0 ? (
            <ul className="referral-list">
              {status.referrals.map((referral, index) => (
                <li
                  key={`${referral.email ?? 'anon'}-${index}`}
                  className="referral-list-item"
                >
                  <span className="referral-list-email">
                    {referral.email ?? 'Pending account'}
                  </span>
                  <span
                    className={`referral-list-status ${statusClass[referral.status] ?? 'pending'}`}
                  >
                    {statusLabel[referral.status] ?? referral.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="referral-list-empty">
              <Share2 className="size-4" />
              No referrals yet — share your link to get started.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
