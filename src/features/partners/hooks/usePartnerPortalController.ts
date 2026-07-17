import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'

import {
  requestClerkSignIn,
  useOptionalAuth,
} from '@/shared/auth/use-optional-auth'

export type PartnerPortalStatus =
  | 'unavailable'
  | 'signed_out'
  | 'loading'
  | 'ready'
  | 'error'

type UsePartnerPortalControllerOptions = {
  enabled?: boolean
}

type PartnerPortalController = {
  publicToken?: string
  retry: () => void
  signIn: () => void
  status: PartnerPortalStatus
}

function isEnabled(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === 'true'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

function readPublicToken(value: unknown): string | null {
  if (!isRecord(value)) return null
  const publicToken = value.publicToken
  return typeof publicToken === 'string' && publicToken.length > 0
    ? publicToken
    : null
}

export function usePartnerPortalController({
  enabled = isEnabled(import.meta.env.VITE_DUB_PARTNERS_ENABLED),
}: UsePartnerPortalControllerOptions = {}): PartnerPortalController {
  const { getToken, isSignedIn } = useOptionalAuth()
  const [attempt, setAttempt] = useState(0)
  const [publicToken, setPublicToken] = useState<string>()
  const [status, setStatus] = useState<PartnerPortalStatus>(() =>
    !enabled ? 'unavailable' : isSignedIn ? 'loading' : 'signed_out',
  )

  useEffect(() => {
    if (!enabled) {
      setStatus('unavailable')
      setPublicToken(undefined)
      return
    }
    if (!isSignedIn) {
      setStatus('signed_out')
      setPublicToken(undefined)
      return
    }

    let cancelled = false
    setStatus('loading')
    const load = async () => {
      try {
        const token = await getToken({ template: 'convex' })
        if (!token) throw new Error('Authentication token unavailable')
        const response = await axios.get('/api/partners/embed-token', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const nextToken = readPublicToken(response.data)
        if (!nextToken) throw new Error('Partner portal token unavailable')
        if (cancelled) return
        setPublicToken(nextToken)
        setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }
    void load()

    return () => {
      cancelled = true
    }
  }, [attempt, enabled, getToken, isSignedIn])

  const retry = useCallback(() => setAttempt((current) => current + 1), [])

  return {
    publicToken,
    retry,
    signIn: requestClerkSignIn,
    status,
  }
}
