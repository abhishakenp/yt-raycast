import { useCallback, useEffect, useState } from 'react'

import {
  getReferralAuthToken,
  waitForClerkReady,
} from '@/features/referrals/lib/referral-client'

export type ReferralListItem = {
  status: 'pending' | 'qualified' | 'disqualified'
  email: string | null
  createdAt: number
  paidAt: number | null
}

export type ReferralStatus = {
  code: string | null
  threshold: number
  discountPercent: number
  qualifiedCount: number
  pendingCount: number
  remaining: number
  unlocked: boolean
  unlockedAt: number | null
  discountApplied: boolean
  discountActive: boolean
  hasActiveSubscription: boolean
  referrals: ReferralListItem[]
}

type UseReferralStatus = {
  status: ReferralStatus | null
  isLoading: boolean
  error: string | null
  reload: () => Promise<void>
}

export const useReferralStatus = (): UseReferralStatus => {
  const [status, setStatus] = useState<ReferralStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      // Wait for the Clerk SDK to finish hydrating so a signed-in user who lands
      // here directly isn't shown the signed-out state on first paint.
      await waitForClerkReady()
      const token = await getReferralAuthToken()
      if (!token) {
        setStatus(null)
        setError('Sign in to see your referral rewards.')
        return
      }
      const response = await fetch('/api/referrals/status', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to load referrals.')
      }
      setStatus(data as ReferralStatus)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load referrals.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { status, isLoading, error, reload }
}
