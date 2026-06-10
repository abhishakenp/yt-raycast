import type { Annotation } from 'agentation'

export const AGENTATION_MCP_ENDPOINT = 'http://localhost:4747'

export const buildAgentationSessionKey = (sessionId: string) =>
  `ship-fast:generate:${sessionId}`

export const getAnnotationElementLabel = (annotation: Annotation) =>
  annotation.element || annotation.elementPath || 'Selected element'
