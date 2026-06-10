import { useMutation, useQuery } from 'convex/react'
import { useMemo, useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { readAnonymousOwnerSecret, forgetAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

export const useAuthController = (sessionId: string) => {
  const session = useQuery(api.sessions.getWorkspace, { sessionId: sessionId as Id<'sessions'> })
  const claimAnonymous = useMutation(api.sessions.claimAnonymous)
  const [claimError, setClaimError] = useState<string>()
  const [isClaiming, setIsClaiming] = useState(false)

  const isAnonymousOwner = useMemo(() => session?.session.canClaimAnonymous ?? false, [session])

  const canClaim = isAnonymousOwner && !isClaiming
  const isOwned = session?.session.userId !== undefined

  const claimSession = async () => {
    if (!canClaim) return

    setClaimError(undefined)
    setIsClaiming(true)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined' ? undefined : readAnonymousOwnerSecret(window.localStorage, sessionId)

      if (!anonymousOwnerSecret) {
        throw new Error('Owner secret not found. This browser may not own this session.')
      }

      await claimAnonymous({
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret,
      })

      if (typeof window !== 'undefined') {
        forgetAnonymousOwnerSecret(window.localStorage, sessionId)
      }
    } catch (error) {
      setClaimError(error instanceof Error ? error.message : 'Claim failed')
    } finally {
      setIsClaiming(false)
    }
  }

  return {
    canClaim,
    claimError,
    claimSession,
    isAnonymousOwner,
    isClaiming,
    isOwned,
    userId: session?.session.userId,
  }
}
