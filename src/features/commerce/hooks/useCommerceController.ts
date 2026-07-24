import { useQuery } from 'convex/react'
import { useEffect, useState } from 'react'

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

type HostedMedusaConfig = {
  backendUrl?: string
  enabled?: boolean
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

const hostedMedusaConfig = (value: unknown): HostedMedusaConfig => {
  if (!isRecord(value)) {
    return {}
  }

  return {
    ...(typeof value.backendUrl === 'string'
      ? { backendUrl: value.backendUrl }
      : {}),
    ...(typeof value.enabled === 'boolean' ? { enabled: value.enabled } : {}),
  }
}

export const useHostedMedusaConfig = () => {
  const [config, setConfig] = useState<HostedMedusaConfig>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    const loadConfig = async () => {
      try {
        const response = await fetch('/api/medusa-store/config', {
          signal: controller.signal,
        })
        if (!response.ok) return
        const payload: unknown = await response.json()
        if (!controller.signal.aborted) {
          setConfig(hostedMedusaConfig(payload))
        }
      } catch {
        // Hosted Medusa config is optional; per-session setup still works.
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadConfig()

    return () => {
      controller.abort()
    }
  }, [])

  return { config, isLoading }
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
