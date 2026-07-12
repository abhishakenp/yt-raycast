import { useMutation } from 'convex/react'
import { useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'
import { buildSectionMoveCommand } from '../lib/inline-edit-commands'

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

  const reorder = async (varName, direction) => {
    if (!sessionId) return false
    setIsReordering(true)
    setReorderError(undefined)

    try {
      const source = await getSource()
      if (!source) {
        setReorderError('Could not load current source')
        return false
      }

      const anonymousOwnerSecret =
        typeof window === 'undefined'
          ? undefined
          : readAnonymousOwnerSecret(window.localStorage, sessionId)

      const command = buildSectionMoveCommand(
        {
          varName,
          direction,
        },
        {
          sessionId,
          anonymousOwnerSecret,
          currentSource: source,
        },
      )

      await createEdit(command.args)

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
