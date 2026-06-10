import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

export const useCmsController = (sessionId: string) => {
  const upsertConfig = useMutation(api.sessions.upsertCmsConfig)
  const config = useQuery(api.sessions.getCmsConfig, { sessionId: sessionId as Id<'sessions'> })
  const [cmsError, setCmsError] = useState<string>()
  const [isSaving, setIsSaving] = useState(false)

  const saveConfig = async (
    projectId: string | undefined,
    dataset: string | undefined,
    configJson: string | undefined,
  ) => {
    setCmsError(undefined)
    setIsSaving(true)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined' ? undefined : readAnonymousOwnerSecret(window.localStorage, sessionId)

      await upsertConfig({
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret,
        projectId,
        dataset,
        configJson,
      })
    } catch (error) {
      setCmsError(error instanceof Error ? error.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  return {
    config,
    cmsError,
    isSaving,
    saveConfig,
  }
}
