import axios from 'axios'

import { getReferralAuthToken } from '@/features/referrals/lib/referral-client'

export type DubAttributionResult = {
  claimed: boolean
  reason: 'claimed' | 'native_referral_won' | 'already_claimed'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

function isDubAttributionResult(value: unknown): value is DubAttributionResult {
  if (!isRecord(value)) return false
  return (
    typeof value.claimed === 'boolean' &&
    (value.reason === 'claimed' ||
      value.reason === 'native_referral_won' ||
      value.reason === 'already_claimed')
  )
}

export async function postDubAttribution(
  clickId: string,
): Promise<DubAttributionResult | null> {
  const token = await getReferralAuthToken()
  if (!token) return null

  try {
    const response = await axios.post(
      '/api/partners/attribution',
      { clickId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )
    return isDubAttributionResult(response.data) ? response.data : null
  } catch {
    return null
  }
}
