import { useQuery } from 'convex/react'
import { useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'
import { readJsonOrThrow } from '@/lib/safe-fetch'
import { useOptionalAuth } from '@/shared/auth/use-optional-auth'
import type { GeneratedCommerceProduct } from '../services/generated-commerce-products'

type CommerceHandoff = {
  adminUrl: string
  backendUrl: string
  storefrontUrl: string
  tenantId: string
}

export type MedusaAdminCredentials = {
  email?: string
  password?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

async function readProvisionError(response: Response): Promise<string> {
  const fallback = 'Commerce provisioning failed'
  try {
    const payload: unknown = await response.json()
    if (isRecord(payload) && typeof payload.error === 'string') {
      return payload.error
    }
  } catch {
    return fallback
  }

  return fallback
}

export function useCommerceController(
  sessionId: string,
  visualProducts: Array<GeneratedCommerceProduct> = [],
) {
  const { getToken, isSignedIn } = useOptionalAuth()
  const config = useQuery(api.sessions.getCommerceConfig, {
    sessionId: sessionId as Id<'sessions'>,
  })
  const [commerceError, setCommerceError] = useState<string>()
  const [commerceHandoff, setCommerceHandoff] = useState<CommerceHandoff>()
  const [isSaving, setIsSaving] = useState(false)

  const provisionCommerce = async (
    credentials: MedusaAdminCredentials = {},
  ) => {
    setCommerceError(undefined)
    setIsSaving(true)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined'
          ? undefined
          : readAnonymousOwnerSecret(window.localStorage, sessionId)
      const authToken = isSignedIn
        ? await getToken({ template: 'convex' })
        : null
      const adminEmail = credentials.email?.trim()
      const adminPassword = credentials.password
      const adminCredentialPayload =
        adminEmail && adminPassword ? { adminEmail, adminPassword } : {}

      const response = await fetch(
        `/api/sessions/${encodeURIComponent(sessionId)}/provision/medusa`,
        {
          method: 'POST',
          headers: {
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            'Content-Type': 'application/json',
            ...(anonymousOwnerSecret === undefined
              ? {}
              : { 'x-ship-fast-owner-secret': anonymousOwnerSecret }),
          },
          body: JSON.stringify({
            ...adminCredentialPayload,
            anonymousOwnerSecret,
            products: visualProducts,
          }),
        },
      )

      if (!response.ok) {
        throw new Error(await readProvisionError(response))
      }

      const payload = await readJsonOrThrow<{ handoff?: CommerceHandoff }>(
        response,
        'Commerce provisioning failed',
      )
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
