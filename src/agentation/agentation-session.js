export const AGENTATION_MCP_ENDPOINT = 'http://localhost:4747'

export function buildAgentationSessionKey(sessionId) {
  const id = String(sessionId || '').trim()
  if (!id) throw new Error('Agentation session id is required.')
  return `ship-fast:session:${id}`
}

export function normalizeAgentationAnnotation({ sessionId, annotation, now = Date.now() }) {
  if (!annotation?.id) throw new Error('Agentation annotation id is required.')
  return {
    sessionId,
    annotationId: annotation.id,
    agentationSessionId: annotation.sessionId ?? null,
    comment: annotation.comment || '',
    element: annotation.element || '',
    elementPath: annotation.elementPath || '',
    payload: annotation,
    updatedAt: now,
    url: annotation.url ?? null,
  }
}
