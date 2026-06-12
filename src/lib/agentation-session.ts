import type { Annotation } from 'agentation'

export const DEFAULT_AGENTATION_SYNC_ENDPOINT = '/api/agentation-sync'

const normalizeEndpoint = (value: string | undefined) => {
  const endpoint = value?.trim()
  if (!endpoint) return DEFAULT_AGENTATION_SYNC_ENDPOINT
  return endpoint.replace(/\/+$/, '')
}

export const getAgentationMcpEndpoint = () =>
  normalizeEndpoint(
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env
      ?.VITE_AGENTATION_MCP_ENDPOINT,
  )

export const AGENTATION_MCP_ENDPOINT = getAgentationMcpEndpoint()

export const buildAgentationSessionKey = (sessionId: string) =>
  `ship-fast:generate:${sessionId}`

export const readSessionIdFromAgentationSessionKey = (
  agentationSessionKey: string,
) => {
  const prefix = 'ship-fast:generate:'
  return agentationSessionKey.startsWith(prefix)
    ? agentationSessionKey.slice(prefix.length)
    : undefined
}

export const getAnnotationElementLabel = (annotation: Annotation) =>
  annotation.element || annotation.elementPath || 'Selected element'
