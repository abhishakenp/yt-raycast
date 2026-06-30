import { useMutation } from 'convex/react'
import { useEffect, useRef } from 'react'

import { api } from '../../../convex/_generated/api'
import { createAnonymousClientId } from '@/features/session/services/session-create-payload'
import { useOptionalAuth } from '@/shared/auth/use-optional-auth'

// On sign-in, link all of the caller's anonymous sessions (matched by the
// localStorage anonymousClientIdHash) to their signed-in userId so /mine and
// ownership checks follow them across the anon→authenticated transition.
//
// Fires once per sign-in transition (anonymous → signed-in) and is idempotent
// server-side. Errors are swallowed — claiming is a best-effort migration, not
// a blocking UX. Runs only in the browser (localStorage is client-only).
//
// This hook MUST be rendered inside a Convex provider. The caller is
// responsible for guarding it when Convex is not configured.
export const useClaimAnonymousSessionsOnSignIn = () => {
  const { isSignedIn, isLoaded } = useOptionalAuth()
  const claimAnonymousSessions = useMutation(
    api.sessions.claimAnonymousSessionsByClientIdMutation,
  )
  const claimedForSignedInRef = useRef<boolean>(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      // Reset when signed out so a future sign-in re-claims.
      if (!isSignedIn) claimedForSignedInRef.current = false
      return
    }
    if (claimedForSignedInRef.current) return
    claimedForSignedInRef.current = true

    const anonymousClientId = createAnonymousClientId(window.localStorage)
    void claimAnonymousSessions({ anonymousClientId }).catch(() => undefined)
  }, [isLoaded, isSignedIn, claimAnonymousSessions])
}
