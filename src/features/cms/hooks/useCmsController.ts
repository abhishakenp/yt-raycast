import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

type CmsContentType = 'text' | 'richtext' | 'image' | 'link'

export const useCmsController = (sessionId: string) => {
  const upsertContentEntry = useMutation(api.sessions.upsertCmsContentEntry)
  const restoreContentRevision = useMutation(
    api.sessions.restoreCmsContentRevision,
  )
  const content = useQuery(api.sessions.listCmsContent, {
    sessionId: sessionId as Id<'sessions'>,
  })
  const [cmsError, setCmsError] = useState<string>()
  const [isSaving, setIsSaving] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

  const saveContent = async (input: {
    bindingId?: Id<'cmsBindings'>
    selector?: string
    type?: CmsContentType
    field?: string
    content: string
    contentType?: string
    beforeContent?: string
  }) => {
    setCmsError(undefined)
    setIsSaving(true)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined'
          ? undefined
          : readAnonymousOwnerSecret(window.localStorage, sessionId)

      await upsertContentEntry({
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret,
        ...input,
      })
    } catch (error) {
      setCmsError(error instanceof Error ? error.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  const restoreRevision = async (revisionId: Id<'cmsRevisions'>) => {
    setCmsError(undefined)
    setIsRestoring(true)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined'
          ? undefined
          : readAnonymousOwnerSecret(window.localStorage, sessionId)

      await restoreContentRevision({
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret,
        revisionId,
      })
    } catch (error) {
      setCmsError(error instanceof Error ? error.message : 'Restore failed')
    } finally {
      setIsRestoring(false)
    }
  }

  return {
    content,
    cmsError,
    isRestoring,
    isSaving,
    restoreRevision,
    saveContent,
  }
}
