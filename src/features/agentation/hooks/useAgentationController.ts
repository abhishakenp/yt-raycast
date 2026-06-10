import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

export const useAgentationController = (sessionId: string) => {
  const createAnnotation = useMutation(api.sessions['createAnnotation'])
  const deleteAnnotation = useMutation(api.sessions.deleteAnnotation)
  const annotations = useQuery(api.sessions.listAnnotations, { sessionId: sessionId as Id<'sessions'> })
  const [annotationError, setAnnotationError] = useState<string>()
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const create = async (
    annotationId: string,
    agentationSessionKey: string,
    comment: string,
    elementLabel: string,
    elementPath: string,
    url: string | undefined,
    payloadJson: string | undefined,
  ) => {
    setAnnotationError(undefined)
    setIsCreating(true)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined' ? undefined : readAnonymousOwnerSecret(window.localStorage, sessionId)

      await createAnnotation({
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret,
        annotationId,
        agentationSessionKey,
        comment,
        elementLabel,
        elementPath,
        url,
        payloadJson,
      })
    } catch (error) {
      setAnnotationError(error instanceof Error ? error.message : 'Create failed')
    } finally {
      setIsCreating(false)
    }
  }

  const remove = async (annotationId: Id<'agentationAnnotations'>) => {
    setAnnotationError(undefined)
    setIsDeleting(true)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined' ? undefined : readAnonymousOwnerSecret(window.localStorage, sessionId)

      await deleteAnnotation({
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret,
        annotationId,
      })
    } catch (error) {
      setAnnotationError(error instanceof Error ? error.message : 'Delete failed')
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    annotations,
    annotationError,
    create,
    isCreating,
    isDeleting,
    remove,
  }
}
