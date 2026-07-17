import { useEffect } from 'react'

import { isClerkSignedIn } from '@/features/referrals/lib/referral-client'
import {
  captureDubClickFromCookie,
  getEarliestPendingAcquisition,
  markDubAttributionRecorded,
} from '@/features/partners/lib/acquisition-client'
import { postDubAttribution } from '@/features/partners/lib/partner-client'

const POLL_INTERVAL_MS = 2000
const MAX_ATTEMPT_WINDOW_MS = 120000

type UseDubAttributionCaptureOptions = {
  enabled?: boolean
}

function isEnabled(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === 'true'
}

export function useDubAttributionCapture({
  enabled = isEnabled(import.meta.env.VITE_DUB_PARTNERS_ENABLED),
}: UseDubAttributionCaptureOptions = {}): void {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const startedAt = Date.now()
    let cancelled = false
    let timer: ReturnType<typeof setInterval> | undefined

    const stop = () => {
      if (timer) clearInterval(timer)
      timer = undefined
    }

    const attempt = async () => {
      captureDubClickFromCookie()
      const acquisition = getEarliestPendingAcquisition()
      if (Date.now() - startedAt > MAX_ATTEMPT_WINDOW_MS) {
        stop()
        return
      }
      if (acquisition?.source !== 'dub_partner' || !isClerkSignedIn()) return

      const result = await postDubAttribution(acquisition.sourceKey)
      if (cancelled || !result) return

      markDubAttributionRecorded()
      stop()
    }

    void attempt()
    timer = setInterval(() => void attempt(), POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      stop()
    }
  }, [enabled])
}
