import type { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import {
  buildAgentationSessionKey,
  getAnnotationElementLabel,
  readSessionIdFromAgentationSessionKey,
} from '@/lib/agentation-session'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type AgentationSyncClient = Pick<ConvexHttpClient, 'query' | 'mutation'>
type JsonBody = Record<string, unknown>

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

const createClient = (clientOverride?: AgentationSyncClient) =>
  clientOverride ?? createRuntimeConvexHttpClient()

const asSessionId = (sessionId: string): Id<'sessions'> =>
  sessionId as Id<'sessions'>

const readJsonBody = async (request: Request): Promise<JsonBody> => {
  const text = await request.text()
  if (!text.trim()) return {}
  const parsed = JSON.parse(text) as unknown
  return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
    ? (parsed as JsonBody)
    : {}
}

const getString = (body: JsonBody, key: string) => {
  const value = body[key]
  return typeof value === 'string' ? value : undefined
}

const getSessionIdFromUrl = (url: string | undefined) => {
  if (!url) return undefined

  try {
    const parsed = new URL(url)
    const match = parsed.pathname.match(/\/generate\/([^/?#]+)/)
    return match?.[1] ? decodeURIComponent(match[1]) : undefined
  } catch {
    const match = url.match(/\/generate\/([^/?#]+)/)
    return match?.[1] ? decodeURIComponent(match[1]) : undefined
  }
}

const normalizeAnnotation = (annotation: JsonBody) => {
  const id =
    getString(annotation, 'id') ?? getString(annotation, 'annotationId')
  const comment = getString(annotation, 'comment') ?? ''
  const elementLabel =
    getString(annotation, 'element') ??
    getString(annotation, 'elementLabel') ??
    getString(annotation, 'elementPath') ??
    'Selected element'
  const elementPath = getString(annotation, 'elementPath') ?? elementLabel

  return id
    ? {
        annotationId: id,
        comment,
        elementLabel,
        elementPath,
        url: getString(annotation, 'url'),
        payloadJson: JSON.stringify(annotation),
      }
    : undefined
}

const readAnnotationPayload = (row: {
  annotationId: string
  comment: string
  elementLabel?: string
  elementPath?: string
  url?: string
  payloadJson?: string
}) => {
  if (row.payloadJson) {
    try {
      const parsed = JSON.parse(row.payloadJson) as unknown
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed
      }
    } catch {
      // Fall through to the normalized payload below.
    }
  }

  return {
    id: row.annotationId,
    x: 0,
    y: 0,
    comment: row.comment,
    element: row.elementLabel ?? 'Selected element',
    elementPath: row.elementPath ?? row.elementLabel ?? 'Selected element',
    timestamp: Date.now(),
    url: row.url,
  }
}

const errorResponse = (error: unknown) =>
  json(
    {
      error: error instanceof Error ? error.message : 'Agentation sync failed',
    },
    { status: 500 },
  )

export const createAgentationHealthResponse = () => json({ ok: true })

export const createAgentationSessionResponse = async (
  request: Request,
): Promise<Response> => {
  try {
    const body = await readJsonBody(request)
    const sessionId = getSessionIdFromUrl(getString(body, 'url'))
    if (!sessionId) {
      return json(
        { error: 'Unable to resolve Ship Fast session id' },
        { status: 400 },
      )
    }

    return json({
      id: buildAgentationSessionKey(sessionId),
      url: getString(body, 'url'),
      annotations: [],
    })
  } catch (error) {
    return errorResponse(error)
  }
}

export const getAgentationSessionResponse = async (
  agentationSessionKey: string,
  clientOverride?: AgentationSyncClient,
): Promise<Response> => {
  try {
    const sessionId =
      readSessionIdFromAgentationSessionKey(agentationSessionKey)
    if (!sessionId)
      return json({ error: 'Invalid Agentation session id' }, { status: 400 })

    const annotations = await createClient(clientOverride).query(
      api.sessions.listAnnotations,
      { sessionId: asSessionId(sessionId) },
    )

    return json({
      id: agentationSessionKey,
      annotations: annotations.map(readAnnotationPayload),
    })
  } catch (error) {
    return errorResponse(error)
  }
}

export const createAgentationAnnotationResponse = async (
  agentationSessionKey: string,
  request: Request,
  clientOverride?: AgentationSyncClient,
): Promise<Response> => {
  try {
    const body = await readJsonBody(request)
    const annotation = normalizeAnnotation(body)
    if (!annotation)
      return json({ error: 'Annotation id is required' }, { status: 400 })

    await createClient(clientOverride).mutation(
      (api.sessions as any).upsertAgentationSyncAnnotation,
      {
        agentationSessionKey,
        ...annotation,
      },
    )

    return json({
      id: annotation.annotationId,
      comment: annotation.comment,
      element: annotation.elementLabel,
      elementPath: annotation.elementPath,
      url: annotation.url,
      ...body,
    })
  } catch (error) {
    return errorResponse(error)
  }
}

export const updateAgentationAnnotationResponse = async (
  annotationId: string,
  request: Request,
  clientOverride?: AgentationSyncClient,
): Promise<Response> => {
  try {
    const body = await readJsonBody(request)
    const annotation = normalizeAnnotation({ ...body, id: annotationId })
    if (!annotation)
      return json({ error: 'Annotation id is required' }, { status: 400 })

    await createClient(clientOverride).mutation(
      (api.sessions as any).updateAgentationSyncAnnotation,
      annotation,
    )

    return json({
      id: annotation.annotationId,
      comment: annotation.comment,
      element: getAnnotationElementLabel({
        id: annotation.annotationId,
        x: 0,
        y: 0,
        comment: annotation.comment,
        element: annotation.elementLabel,
        elementPath: annotation.elementPath,
        timestamp: Date.now(),
      }),
      elementPath: annotation.elementPath,
      url: annotation.url,
      ...body,
    })
  } catch (error) {
    return errorResponse(error)
  }
}

export const deleteAgentationAnnotationResponse = async (
  annotationId: string,
  clientOverride?: AgentationSyncClient,
): Promise<Response> => {
  try {
    await createClient(clientOverride).mutation(
      (api.sessions as any).deleteAgentationSyncAnnotation,
      { annotationId },
    )
    return json({ id: annotationId, deleted: true })
  } catch (error) {
    return errorResponse(error)
  }
}

export const createAgentationEventsResponse = () =>
  new Response(': connected\n\n', {
    headers: {
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream',
    },
  })
