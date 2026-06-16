import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

export const useEditController = (sessionId: string) => {
  const createEdit = useMutation(api.sessions['createEdit'])
  const restorePreviewVersion = useMutation(api.sessions.restorePreviewVersion)
  const edits = useQuery(api.sessions.listEdits, { sessionId: sessionId as Id<'sessions'> })
  const history = useQuery(api.sessions.listPreviewHistory, { sessionId: sessionId as Id<'sessions'> })
  const [editError, setEditError] = useState<string>()
  const [isEditing, setIsEditing] = useState(false)

  const applyEdit = async (
    editType: 'text' | 'ai_rewrite' | 'chat' | 'style' | 'image',
    targetLabel: string | undefined,
    beforeText: string | undefined,
    afterText: string | undefined,
    instruction: string | undefined,
    afterHtml?: string,
  ) => {
    setEditError(undefined)
    setIsEditing(true)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined' ? undefined : readAnonymousOwnerSecret(window.localStorage, sessionId)

      const result = (await createEdit({
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret,
        editType,
        targetLabel,
        beforeText,
        afterText,
        afterHtml,
        instruction,
      })) as { saved?: boolean } | null

      if (result?.saved === false) {
        throw new Error(
          'Selected text was not found in the current preview. Select a smaller text block and try again.',
        )
      }

      // Force a page reload to refresh the preview with the new version
      // This is needed because Convex queries don't automatically invalidate after createEdit
      if (typeof window !== 'undefined') {
        window.location.reload()
      }

      return true
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Edit failed')
      return false
    } finally {
      setIsEditing(false)
    }
  }

  const restoreVersion = async (version: number) => {
    setEditError(undefined)
    setIsEditing(true)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined' ? undefined : readAnonymousOwnerSecret(window.localStorage, sessionId)

      await restorePreviewVersion({
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret,
        version,
      })
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Restore failed')
    } finally {
      setIsEditing(false)
    }
  }

  return {
    applyEdit,
    editError,
    edits,
    history,
    isEditing,
    restoreVersion,
  }
}
