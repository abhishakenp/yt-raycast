import { useMutation, useQuery } from 'convex/react'
import { useRef, useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

export const useEditController = (sessionId: string) => {
  const createEdit = useMutation(api.sessions['createEdit'])
  const forkSession = useMutation(api.sessions['forkSession'])
  const restorePreviewVersion = useMutation(api.sessions.restorePreviewVersion)
  const edits = useQuery(api.sessions.listEdits, { sessionId: sessionId as Id<'sessions'> })
  const history = useQuery(api.sessions.listPreviewHistory, { sessionId: sessionId as Id<'sessions'> })
  const [editError, setEditError] = useState<string>()
  const [isEditing, setIsEditing] = useState(false)
  const [isForking, setIsForking] = useState(false)
  // Ref, not state: the edit that triggers a fork is set and read within the
  // same tick (applyEdit returns 'fork_needed' → caller immediately calls
  // forkCurrentSession), so a state update would not be visible in time.
  const pendingEditRef = useRef<{
    editType: 'text' | 'ai_rewrite' | 'chat' | 'style' | 'image'
    targetLabel: string | undefined
    beforeText: string | undefined
    afterText: string | undefined
    instruction: string | undefined
    afterHtml?: string
    occurrenceIndex?: number
  } | null>(null)

  const applyEdit = async (
    editType: 'text' | 'ai_rewrite' | 'chat' | 'style' | 'image',
    targetLabel: string | undefined,
    beforeText: string | undefined,
    afterText: string | undefined,
    instruction: string | undefined,
    afterHtml?: string,
    occurrenceIndex?: number,
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
        occurrenceIndex,
      })) as { saved?: boolean } | null

      if (result?.saved === false) {
        throw new Error(
          'Selected text was not found in the current preview. Select a smaller text block and try again.',
        )
      }

      // No reload needed - Convex queries will automatically invalidate
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Edit failed'
      setEditError(errorMessage)
      
      // Check if this is a FORBIDDEN error (user doesn't own the session)
      if (errorMessage.includes('FORBIDDEN') || errorMessage.includes('do not own')) {
        // Store the pending edit so forkCurrentSession can re-apply it on the fork
        pendingEditRef.current = { editType, targetLabel, beforeText, afterText, instruction, afterHtml, occurrenceIndex }
        // Return a special flag to indicate we need to fork
        return 'fork_needed' as const
      }
      
      // Return false for all other errors
      return false
    } finally {
      setIsEditing(false)
    }
  }

  const forkCurrentSession = async () => {
    setEditError(undefined)
    setIsForking(true)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined' ? undefined : readAnonymousOwnerSecret(window.localStorage, sessionId)

      // Fork the session, re-applying the edit that triggered the fork so the
      // change is already present on the owned copy the user lands on.
      const result = await forkSession({
        sourceSessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret,
        edit: pendingEditRef.current ?? undefined,
      })

      if (!result?.sessionId) {
        throw new Error('Fork failed: no session ID returned')
      }

      pendingEditRef.current = null

      // Wait a moment to ensure all server-side operations complete
      await new Promise(resolve => setTimeout(resolve, 500))

      if (typeof window !== 'undefined' && result.sessionId) {
        window.location.href = `/generate/${result.sessionId}`
      }

      return result
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Fork failed')
      return null
    } finally {
      setIsForking(false)
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
    isForking,
    forkCurrentSession,
    restoreVersion,
  }
}
