import { useMutation } from 'convex/react'
import type { Annotation, AgentationProps } from 'agentation'
import type { ComponentType } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import {
  AGENTATION_MCP_ENDPOINT,
  buildAgentationSessionKey,
  getAnnotationElementLabel,
} from '@/lib/agentation-session'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

interface AgentationSessionBridgeProps {
  enabled: boolean
  sessionId: string
}

const getOwnerSecret = (sessionId: string) =>
  typeof window === 'undefined' ? undefined : readAnonymousOwnerSecret(window.localStorage, sessionId)

const AgentationSessionBridge = ({ enabled, sessionId }: AgentationSessionBridgeProps) => {
  const [AgentationComponent, setAgentationComponent] = useState<ComponentType<AgentationProps> | null>(null)
  const upsertAnnotation = useMutation(api.sessions.upsertAnnotation)
  const deleteAnnotation = useMutation(api.sessions.deleteAnnotationByAgentationId)
  const clearAnnotations = useMutation(api.sessions.clearAnnotations)
  const convexSessionId = sessionId as Id<'sessions'>
  const agentationSessionKey = useMemo(() => buildAgentationSessionKey(sessionId), [sessionId])

  useEffect(() => {
    if (!enabled || AgentationComponent || typeof window === 'undefined') return

    let cancelled = false
    void import('agentation').then(({ Agentation }) => {
      if (!cancelled) setAgentationComponent(() => Agentation)
    })

    return () => {
      cancelled = true
    }
  }, [AgentationComponent, enabled])

  const handleUpsertAnnotation = useCallback(
    (annotation: Annotation) => {
      void upsertAnnotation({
        sessionId: convexSessionId,
        anonymousOwnerSecret: getOwnerSecret(sessionId),
        annotationId: annotation.id,
        agentationSessionKey,
        comment: annotation.comment,
        elementLabel: getAnnotationElementLabel(annotation),
        elementPath: annotation.elementPath,
        url: annotation.url ?? undefined,
        payloadJson: JSON.stringify(annotation),
      }).catch((error) => {
        console.error('[Agentation] Failed to persist annotation:', error)
      })
    },
    [agentationSessionKey, convexSessionId, sessionId, upsertAnnotation],
  )

  const handleDeleteAnnotation = useCallback(
    (annotation: Annotation) => {
      void deleteAnnotation({
        sessionId: convexSessionId,
        anonymousOwnerSecret: getOwnerSecret(sessionId),
        annotationId: annotation.id,
      }).catch((error) => {
        console.error('[Agentation] Failed to delete annotation:', error)
      })
    },
    [convexSessionId, deleteAnnotation, sessionId],
  )

  const handleClearAnnotations = useCallback(() => {
    void clearAnnotations({
      sessionId: convexSessionId,
      anonymousOwnerSecret: getOwnerSecret(sessionId),
    }).catch((error) => {
      console.error('[Agentation] Failed to clear annotations:', error)
    })
  }, [clearAnnotations, convexSessionId, sessionId])

  if (!enabled || !AgentationComponent) return null

  return (
    <AgentationComponent
      sessionId={agentationSessionKey}
      endpoint={AGENTATION_MCP_ENDPOINT}
      copyToClipboard={true}
      onAnnotationAdd={handleUpsertAnnotation}
      onAnnotationUpdate={handleUpsertAnnotation}
      onAnnotationDelete={handleDeleteAnnotation}
      onAnnotationsClear={handleClearAnnotations}
    />
  )
}

export default AgentationSessionBridge
