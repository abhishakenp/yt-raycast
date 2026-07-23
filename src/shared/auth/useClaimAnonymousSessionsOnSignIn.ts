import { useEffect, useRef } from 'react'

import { getReferralAuthToken } from '@/features/referrals/lib/referral-client'
import { useOptionalAuth } from '@/shared/auth/use-optional-auth'

// On sign-in, link all of the caller's anonymous sessions (matched by the
// server-derived clientIpHash) to their signed-in userId so /mine and ownership
// checks follow them across the anon→authenticated transition.
//
// Fires once per sign-in transition (anonymous → signed-in) and is idempotent
// server-side. Errors are swallowed — claiming is a best-effort migration, not
// a blocking UX. Runs only in the browser.
//
// The clientIpHash is derived server-side from request headers by the
// /api/claim-anon-sessions HTTP route (unforgeable), replacing the old
// localStorage anonymousClientId approach. Quota counting does not depend on
// this — loadGenerationAdmission counts the union of IP + userId buckets
// directly — so a failed claim never grants extra quota.
//
// This hook MUST be rendered inside a Convex provider. The caller is
// responsible for guarding it when Convex is not configured.
export const useClaimAnonymousSessionsOnSignIn = () => {
  const { isSignedIn, isLoaded } = useOptionalAuth()
  const claimedForSignedInRef = useRef<boolean>(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      // Reset when signed out so a future sign-in re-claims.
      if (!isSignedIn) claimedForSignedInRef.current = false
      return
    }
    if (claimedForSignedInRef.current) return
    claimedForSignedInRef.current = true

    void (async () => {
      try {
        const token = await getReferralAuthToken()
        const headers: Record<string, string> = {}
        if (token) headers.Authorization = `Bearer ${token}`
        await fetch('/api/claim-anon-sessions', { method: 'POST', headers })
      } catch {
        // Best-effort: a failed claim does not grant extra quota because
        // loadGenerationAdmission counts the IP+userId union directly.
      }
    })()
  }, [isLoaded, isSignedIn])
}
