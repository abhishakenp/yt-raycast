import { useMutation } from 'convex/react'
import { useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'
import { reorderInStack } from '../lib/reorder-source'

interface UseReorderElementArgs {
  sessionId: string | undefined
  getSource: () => Promise<string | undefined>
}

export function useReorderElement({
  sessionId,
  getSource,
}: UseReorderElementArgs) {
  const createEdit = useMutation(api.sessions.createEdit)
  const [isReordering, setIsReordering] = useState(false)
  const [reorderError, setReorderError] = useState<string>()

  const reorder = async (
    varName: string,
    direction: 'up' | 'down',
  ): Promise<boolean> => {
    if (!sessionId) return false
    setIsReordering(true)
    setReorderError(undefined)

    try {
      const source = await getSource()
      if (!source) {
        setReorderError('Could not load current source')
        return false
      }

      const result = reorderInStack(source, varName, direction)
      if (!result.reordered) {
        setReorderError(
          direction === 'up'
            ? 'Element is already at the top'
            : 'Element is already at the bottom',
        )
        return false
      }

      const anonymousOwnerSecret =
        typeof window === 'undefined'
          ? undefined
          : readAnonymousOwnerSecret(window.localStorage, sessionId)

      await createEdit({
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret,
        editType: 'ai_rewrite',
        targetLabel: `reorder ${varName} ${direction}`,
        afterHtml: result.source,
        instruction: `reorder ${varName} ${direction}`,
      })

      return true
    } catch (error) {
      setReorderError(error instanceof Error ? error.message : 'Reorder failed')
      return false
    } finally {
      setIsReordering(false)
    }
  }

  return { reorder, isReordering, reorderError }
}
