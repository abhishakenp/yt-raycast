import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

export const useEditController = (sessionId: string) => {
  const createEdit = useMutation(api.sessions.createEdit)
  const edits = useQuery(api.sessions.listEdits, { sessionId: sessionId as Id<'sessions'> })
  const [editError, setEditError] = useState<string>()
  const [isEditing, setIsEditing] = useState(false)

  const applyEdit = async (
    editType: 'text' | 'ai_rewrite' | 'chat',
    targetLabel: string | undefined,
    beforeText: string | undefined,
    afterText: string | undefined,
    instruction: string | undefined,
  ) => {
    setEditError(undefined)
    setIsEditing(true)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined' ? undefined : readAnonymousOwnerSecret(window.localStorage, sessionId)

      await createEdit({
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret,
        editType,
        targetLabel,
        beforeText,
        afterText,
        instruction,
      })
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Edit failed')
    } finally {
      setIsEditing(false)
    }
  }

  return {
    applyEdit,
    editError,
    edits,
    isEditing,
  }
}
