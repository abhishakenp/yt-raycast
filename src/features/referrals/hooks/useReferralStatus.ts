import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/tanstack-react-start'

import { readJsonOrThrow } from '@/lib/safe-fetch'

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

export function useReferralStatus(): UseReferralStatus {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const [status, setStatus] = useState<ReferralStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      const token = await getToken({ template: 'convex' })
      if (!token) {
        setStatus(null)
        setIsLoading(false)
        return
      }
      const response = await fetch('/api/referrals/status', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await readJsonOrThrow<ReferralStatus & { error?: string }>(
        response,
        'Unable to load referrals.',
      )
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
  }, [getToken])

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setStatus(null)
      setIsLoading(false)
      return
    }
    void reload()
  }, [isLoaded, isSignedIn, reload])

  return { status, isLoading, error, reload }
}
