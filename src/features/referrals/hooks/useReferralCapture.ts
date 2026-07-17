import { useEffect } from 'react'

import {
  clearPendingReferral,
  hasRecordedReferral,
  isClerkSignedIn,
  markReferralRecorded,
  normalizeRefParam,
  postReferralRecord,
  readPendingReferral,
  REFERRAL_QUERY_PARAM,
  storePendingReferral,
} from '@/features/referrals/lib/referral-client'
import { getEarliestPendingAcquisition } from '@/features/partners/lib/acquisition-client'

const POLL_INTERVAL_MS = 2000
const MAX_ATTEMPT_WINDOW_MS = 120000

/**
 * App-wide hook (mounted once at the root):
 *  1. Captures a `?ref=CODE` query param into localStorage the moment a visitor
 *     lands from a referral link.
 *  2. Once the visitor signs in (global Clerk SDK reports a user), attributes
 *     them to that code via the server, exactly once.
 *
 * Sign-in happens through the global Clerk modal which doesn't re-render React,
 * so we poll for a bounded window rather than relying on a hook dependency.
 */
export function useReferralCapture(): void {
  // 1. Capture the ref param and clean the URL.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    const raw = url.searchParams.get(REFERRAL_QUERY_PARAM)
    const code = normalizeRefParam(raw)
    if (!code) return

    storePendingReferral(code)
    url.searchParams.delete(REFERRAL_QUERY_PARAM)
    window.history.replaceState(null, '', url.toString())
  }, [])

  // 2. Attribute once signed in.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (hasRecordedReferral()) return
    if (!readPendingReferral()) return

    const startedAt = Date.now()
    let cancelled = false
    let timer: ReturnType<typeof setInterval> | undefined

    const attempt = async () => {
      const code = readPendingReferral()
      if (!code || hasRecordedReferral()) {
        stop()
        return
      }
      if (Date.now() - startedAt > MAX_ATTEMPT_WINDOW_MS) {
        stop()
        return
      }
      const acquisition = getEarliestPendingAcquisition()
      if (
        acquisition?.source !== 'native_referral' ||
        acquisition.sourceKey !== code
      ) {
        return
      }
      if (!isClerkSignedIn()) return

      const result = await postReferralRecord(code)
      if (cancelled) return
      if (result === null) return // token not ready yet — retry next tick
      // Any terminal answer (recorded, self_referral, invalid, already) ends it.
      if (result.reason === 'invalid_code') {
        clearPendingReferral()
      } else {
        markReferralRecorded()
      }
      stop()
    }

    const stop = () => {
      if (timer) clearInterval(timer)
      timer = undefined
    }

    void attempt()
    timer = setInterval(() => void attempt(), POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      stop()
    }
  }, [])
}
