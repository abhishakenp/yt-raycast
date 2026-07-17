import {
  hasRecordedReferral,
  readPendingReferral,
  readPendingReferralCapturedAt,
} from '@/features/referrals/lib/referral-client'
import {
  clearPendingDubAttribution,
  DUB_PENDING_AT_KEY,
  DUB_PENDING_KEY,
  readMarketingConsent,
} from './marketing-consent'
import { isPartnerProgramClientEnabled } from './partner-config'

export {
  clearPendingDubAttribution,
  DUB_PENDING_AT_KEY,
  DUB_PENDING_KEY,
} from './marketing-consent'
export const DUB_DONE_KEY = 'shipfast_dub_recorded'

export type PendingAcquisition = {
  capturedAt: number
  source: 'native_referral' | 'dub_partner'
  sourceKey: string
}

function getStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

function readTimestamp(key: string): number | null {
  const value = getStorage()?.getItem(key)
  if (!value) return null
  const timestamp = Number(value)
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const prefix = `${name}=`
  const pair = document.cookie
    .split(';')
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix))
  if (!pair) return null
  try {
    return decodeURIComponent(pair.slice(prefix.length)) || null
  } catch {
    return null
  }
}

export function readPendingDubClick(): string | null {
  return getStorage()?.getItem(DUB_PENDING_KEY) ?? null
}

export function captureDubClickFromCookie(
  capturedAt = Date.now(),
): string | null {
  if (readMarketingConsent() !== 'accepted') return null
  const storage = getStorage()
  const clickId = readCookie('dub_id')
  if (!storage || !clickId || storage.getItem(DUB_DONE_KEY)) return null

  if (!storage.getItem(DUB_PENDING_KEY)) {
    storage.setItem(DUB_PENDING_KEY, clickId)
    storage.setItem(DUB_PENDING_AT_KEY, String(capturedAt))
  }
  return storage.getItem(DUB_PENDING_KEY)
}

export function markDubAttributionRecorded(): void {
  const storage = getStorage()
  if (!storage) return
  storage.setItem(DUB_DONE_KEY, '1')
  clearPendingDubAttribution()
}

export function getEarliestPendingAcquisition(): PendingAcquisition | null {
  const storage = getStorage()
  if (!storage || hasRecordedReferral() || storage.getItem(DUB_DONE_KEY)) {
    return null
  }

  const candidates: PendingAcquisition[] = []
  const referralCode = readPendingReferral()
  if (referralCode) {
    candidates.push({
      capturedAt: readPendingReferralCapturedAt() ?? 0,
      source: 'native_referral',
      sourceKey: referralCode,
    })
  }

  const dubClickId =
    isPartnerProgramClientEnabled() && readMarketingConsent() === 'accepted'
      ? readPendingDubClick()
      : null
  if (dubClickId) {
    candidates.push({
      capturedAt: readTimestamp(DUB_PENDING_AT_KEY) ?? Number.MAX_SAFE_INTEGER,
      source: 'dub_partner',
      sourceKey: dubClickId,
    })
  }

  return (
    candidates.sort((left, right) => left.capturedAt - right.capturedAt)[0] ??
    null
  )
}
