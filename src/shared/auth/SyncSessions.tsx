import { useEffect, useRef } from 'react'

import { getReferralAuthToken } from '@/features/referrals/lib/referral-client'
import { useOptionalAuth } from '@/shared/auth/use-optional-auth'

// Renders nothing. When mounted and the user is authenticated, fires the
// claim-by-IP API so pre-login anonymous sessions on the same IP get linked to
// the signed-in userId. Convex subscriptions then auto-refresh with the newly
// claimed sessions. Idempotent server-side, so repeated mounts are safe.
//
// Mounted inside ClerkConvexProvider so it runs app-wide whenever Clerk + Convex
// are active. Fires once per signed-in session (resets on sign-out).
export const SyncSessions = () => {
  const { isSignedIn, isLoaded } = useOptionalAuth()
  const firedRef = useRef(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      if (!isSignedIn) firedRef.current = false
      return
    }
    if (firedRef.current) return
    firedRef.current = true

    void (async () => {
      try {
        const token = await getReferralAuthToken()
        const headers: Record<string, string> = {}
        if (token) headers.Authorization = `Bearer ${token}`
        await fetch('/api/claim-anon-sessions', { method: 'POST', headers })
      } catch {
        // Best-effort: quota uses the IP+userId union directly, so a failed
        // claim never grants extra quota. /mine just shows fewer sessions.
      }
    })()
  }, [isLoaded, isSignedIn])

  return null
}
