import { useMutation, useQuery } from 'convex/react'
import { useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'
import { buildCreateEditCommand } from '@/features/editing/lib/inline-edit-commands'
import { setCachedTranslation } from '@/island/openui/_providers/translation'

type CreateEditResult = {
  saved?: boolean
  translatedEdit?: {
    locale?: string
    sourceText?: string
    translation?: string
  }
} | null

export const useEditController = (sessionId: string) => {
  const navigate = useNavigate()
  const createEdit = useMutation(api.sessions['createEdit'])
  const forkSession = useMutation(api.sessions['forkSession'])
  const restorePreviewVersion = useMutation(api.sessions.restorePreviewVersion)
  const queriedEdits = useQuery(api.sessions.listEdits, {
    lookup: sessionId,
  })
  const queriedHistory = useQuery(api.sessions.listPreviewHistory, {
    lookup: sessionId,
  })
  const edits = Array.isArray(queriedEdits) ? queriedEdits : []
  const history = Array.isArray(queriedHistory) ? queriedHistory : []
  const [editError, setEditError] = useState<string>()
  const [isEditing, setIsEditing] = useState(false)
  const [isForking, setIsForking] = useState(false)
  // Refcount of in-flight edits so isEditing stays true while ANY edit is
  // pending, even when multiple concurrent edits overlap. A single boolean
  // would flip false after the first edit resolves while others are still
  // in flight.
  const activeEditsRef = useRef(0)
  // Ref, not state: the edit that triggers a fork is set and read within the
  // same tick (applyEdit returns 'fork_needed' → caller immediately calls
  // forkCurrentSession), so a state update would not be visible in time.
  const pendingEditRef = useRef<{
    editType: 'text' | 'ai_rewrite' | 'style' | 'image'
    targetLabel: string | undefined
    beforeText: string | undefined
    afterText: string | undefined
    instruction: string | undefined
    afterHtml?: string
    occurrenceIndex?: number
  } | null>(null)

  const applyEdit = async (
    editType: 'text' | 'ai_rewrite' | 'style' | 'image',
    targetLabel: string | undefined,
    beforeText: string | undefined,
    afterText: string | undefined,
    instruction: string | undefined,
    afterHtml?: string,
    occurrenceIndex?: number,
  ): Promise<true | 'fork_needed' | { ok: false; error: string }> => {
    // Guard: reject empty/undefined content without touching the mutation.
    // An edit must carry some content (afterText, afterHtml, or instruction);
    // a completely empty edit is a no-op and must never reach createEdit.
    const hasContent =
      (afterText !== undefined && afterText !== null && afterText !== '') ||
      (afterHtml !== undefined && afterHtml !== null && afterHtml !== '') ||
      (instruction !== undefined && instruction !== null && instruction !== '')
    if (!hasContent) {
      setEditError('Edit content is empty')
      return { ok: false, error: 'Edit content is empty' }
    }

    setEditError(undefined)
    activeEditsRef.current += 1
    setIsEditing(true)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined'
          ? undefined
          : readAnonymousOwnerSecret(window.localStorage, sessionId)

      const command = buildCreateEditCommand(
        {
          editType,
          targetLabel,
          beforeText,
          afterText,
          afterHtml,
          instruction,
          occurrenceIndex,
        },
        {
          sessionId,
          anonymousOwnerSecret,
        },
      )

      const result = (await createEdit({
        ...command.args,
        anonymousOwnerSecret,
      })) as CreateEditResult

      if (result?.saved === false) {
        throw new Error(
          'Selected text was not found in the current preview. Select a smaller text block and try again.',
        )
      }

      const translatedEdit = result?.translatedEdit
      if (
        translatedEdit &&
        typeof translatedEdit.locale === 'string' &&
        typeof translatedEdit.sourceText === 'string' &&
        typeof translatedEdit.translation === 'string'
      ) {
        setCachedTranslation(
          translatedEdit.locale,
          translatedEdit.sourceText,
          translatedEdit.translation,
        )
      }

      // No reload needed - Convex queries will automatically invalidate
      return true
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Edit failed'
      setEditError(errorMessage)

      // Check if this is a FORBIDDEN error (user doesn't own the session)
      if (
        errorMessage.includes('FORBIDDEN') ||
        errorMessage.includes('do not own')
      ) {
        // Store the pending edit so forkCurrentSession can re-apply it on the fork
        pendingEditRef.current = {
          editType,
          targetLabel,
          beforeText,
          afterText,
          instruction,
          afterHtml,
          occurrenceIndex,
        }
        // Return a special flag to indicate we need to fork
        return 'fork_needed' as const
      }

      // Return the error directly so callers can read it synchronously
      // (setEditError uses React state which is stale until next render)
      return { ok: false, error: errorMessage }
    } finally {
      activeEditsRef.current = Math.max(0, activeEditsRef.current - 1)
      setIsEditing(activeEditsRef.current > 0)
    }
  }

  const forkCurrentSession = async () => {
    setEditError(undefined)
    setIsForking(true)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined'
          ? undefined
          : readAnonymousOwnerSecret(window.localStorage, sessionId)

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
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (result.sessionId) {
        void navigate({
          to: '/generate/$sessionId',
          params: { sessionId: result.sessionId },
        })
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
        typeof window === 'undefined'
          ? undefined
          : readAnonymousOwnerSecret(window.localStorage, sessionId)

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
