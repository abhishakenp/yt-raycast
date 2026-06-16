import { useQuery } from 'convex/react'
import { useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

type CommerceHandoff = {
  adminEmail?: string
  adminPassword?: string
  adminUrl: string
  backendUrl: string
  storefrontUrl: string
  tenantId: string
}

export const useCommerceController = (sessionId: string) => {
  const config = useQuery(api.sessions.getCommerceConfig, {
    sessionId: sessionId as Id<'sessions'>,
  })
  const [commerceError, setCommerceError] = useState<string>()
  const [commerceHandoff, setCommerceHandoff] = useState<CommerceHandoff>()
  const [isSaving, setIsSaving] = useState(false)

  const provisionCommerce = async () => {
    setCommerceError(undefined)
    setIsSaving(true)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined'
          ? undefined
          : readAnonymousOwnerSecret(window.localStorage, sessionId)

      const response = await fetch(
        `/api/sessions/${encodeURIComponent(sessionId)}/provision/medusa`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(anonymousOwnerSecret === undefined
              ? {}
              : { 'x-ship-fast-owner-secret': anonymousOwnerSecret }),
          },
          body: JSON.stringify({ anonymousOwnerSecret }),
        },
      )

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string
        }
        throw new Error(payload.error ?? 'Commerce provisioning failed')
      }

      const payload = (await response.json()) as { handoff?: CommerceHandoff }
      setCommerceHandoff(payload.handoff)
      return payload
    } catch (error) {
      setCommerceError(error instanceof Error ? error.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  return {
    commerceError,
    commerceHandoff,
    config,
    isSaving,
    provisionCommerce,
  }
}
