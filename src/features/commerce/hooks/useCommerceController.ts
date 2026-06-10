import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

export const useCommerceController = (sessionId: string) => {
  const upsertConfig = useMutation(api.sessions.upsertCommerceConfig)
  const config = useQuery(api.sessions.getCommerceConfig, { sessionId: sessionId as Id<'sessions'> })
  const [commerceError, setCommerceError] = useState<string>()
  const [isSaving, setIsSaving] = useState(false)

  const saveConfig = async (
    backendUrl: string | undefined,
    adminUrl: string | undefined,
    storefrontUrl: string | undefined,
    configJson: string | undefined,
  ) => {
    setCommerceError(undefined)
    setIsSaving(true)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined' ? undefined : readAnonymousOwnerSecret(window.localStorage, sessionId)

      await upsertConfig({
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret,
        backendUrl,
        adminUrl,
        storefrontUrl,
        configJson,
      })
    } catch (error) {
      setCommerceError(error instanceof Error ? error.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  return {
    commerceError,
    config,
    isSaving,
    saveConfig,
  }
}
