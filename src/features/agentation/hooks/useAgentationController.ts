import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

export const useAgentationController = (sessionId: string) => {
  const createAnnotation = useMutation(api.sessions['createAnnotation'])
  const deleteAnnotation = useMutation(api.sessions.deleteAnnotation)
  const annotations = useQuery(api.sessions.listAnnotations, {
    sessionId: sessionId as Id<'sessions'>,
  })
  const [annotationError, setAnnotationError] = useState<string>()
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const sendAnnotations = async () => {
    setAnnotationError(undefined)
    setIsSending(true)

    try {
      const currentAnnotations = annotations ?? []
      const anonymousOwnerSecret =
        typeof window === 'undefined'
          ? undefined
          : readAnonymousOwnerSecret(window.localStorage, sessionId)
      const content = [
        'Apply these annotated preview changes.',
        '',
        ...currentAnnotations.map((annotation, index) =>
          [
            `${index + 1}. ${annotation.elementLabel}`,
            annotation.elementPath
              ? `Path: ${annotation.elementPath}`
              : undefined,
            annotation.comment,
          ]
            .filter(Boolean)
            .join('\n'),
        ),
      ].join('\n\n')

      const response = await fetch(
        `/api/sessions/${encodeURIComponent(sessionId)}/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ anonymousOwnerSecret, content }),
        },
      )

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(data?.error ?? `Send failed with ${response.status}`)
      }
    } catch (error) {
      setAnnotationError(error instanceof Error ? error.message : 'Send failed')
    } finally {
      setIsSending(false)
    }
  }

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
        typeof window === 'undefined'
          ? undefined
          : readAnonymousOwnerSecret(window.localStorage, sessionId)

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
      setAnnotationError(
        error instanceof Error ? error.message : 'Create failed',
      )
    } finally {
      setIsCreating(false)
    }
  }

  const remove = async (annotationId: Id<'agentationAnnotations'>) => {
    setAnnotationError(undefined)
    setIsDeleting(true)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined'
          ? undefined
          : readAnonymousOwnerSecret(window.localStorage, sessionId)

      await deleteAnnotation({
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret,
        annotationId,
      })
    } catch (error) {
      setAnnotationError(
        error instanceof Error ? error.message : 'Delete failed',
      )
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
    isSending,
    remove,
    sendAnnotations,
  }
}
