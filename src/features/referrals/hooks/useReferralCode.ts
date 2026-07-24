import { useEffect, useState } from 'react'

import {
  getReferralAuthToken,
  isClerkSignedIn,
  waitForClerkReady,
} from '@/features/referrals/lib/referral-client'

type UseReferralCode = {
  code: string | null
  isLoading: boolean
}

const POLL_INTERVAL_MS = 3000
const MAX_POLL_MS = 30000

/**
 * Lightweight hook that fetches only the current user's referral code.
 * Used by share surfaces (ShareBonusPanel) to append `?ref=CODE` to shared links.
 * Silently returns `null` when signed out — callers fall back to a bare URL.
 *
 * Polls for Clerk sign-in state because the global Clerk SDK doesn't trigger
 * React re-renders when a user signs in through the modal.
 */
export function useReferralCode(): UseReferralCode {
  const [code, setCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setInterval> | undefined
    const startedAt = Date.now()
    let firstAttemptDone = false

    const stopPolling = () => {
      if (timer) {
        clearInterval(timer)
        timer = undefined
      }
    }

    const fetchCode = async () => {
      if (cancelled) return

      if (!isClerkSignedIn()) {
        if (!firstAttemptDone) {
          firstAttemptDone = true
          if (!cancelled) setIsLoading(false)
        }
        if (Date.now() - startedAt > MAX_POLL_MS) {
          stopPolling()
        }
        return
      }

      try {
        await waitForClerkReady()
        const token = await getReferralAuthToken()
        if (!token || cancelled) {
          if (!firstAttemptDone) {
            firstAttemptDone = true
            if (!cancelled) setIsLoading(false)
          }
          return
        }

        const response = await fetch('/api/referrals/status', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (cancelled) return

        if (!response.ok) {
          if (!firstAttemptDone) {
            firstAttemptDone = true
            if (!cancelled) setIsLoading(false)
          }
          // Persistent error (4xx/5xx) — stop polling, no point retrying.
          stopPolling()
          return
        }

        const data = (await response.json()) as { code?: string | null }
        if (cancelled) return

        setCode(data.code ?? null)
        firstAttemptDone = true
        setIsLoading(false)
        stopPolling()
      } catch {
        if (!firstAttemptDone) {
          firstAttemptDone = true
          if (!cancelled) setIsLoading(false)
        }
        // Network error — could be transient, let the poll retry.
      }
    }

    void fetchCode()
    timer = setInterval(() => void fetchCode(), POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      if (timer) clearInterval(timer)
    }
  }, [])

  return { code, isLoading }
}
