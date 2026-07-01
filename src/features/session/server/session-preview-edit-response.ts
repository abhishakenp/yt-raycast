import type { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type PreviewEditClient = Pick<ConvexHttpClient, 'query' | 'mutation'>

type JsonBody = Record<string, unknown>

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

const readJsonBody = async (request: Request): Promise<JsonBody> => {
  const text = await request.text()
  if (!text.trim()) return {}

  const parsed = JSON.parse(text) as unknown
  return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
    ? (parsed as JsonBody)
    : {}
}

const asSessionId = (sessionId: string): Id<'sessions'> =>
  sessionId as Id<'sessions'>

const getString = (body: JsonBody, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = body[key]
    if (typeof value === 'string') return value
  }
  return undefined
}

const getOwnerSecret = (request: Request, body: JsonBody): string | undefined =>
  getString(body, ['anonymousOwnerSecret', 'anonOwnerSecret']) ??
  request.headers.get('x-ship-fast-owner-secret') ??
  undefined

const createClient = (clientOverride?: PreviewEditClient): PreviewEditClient =>
  clientOverride ?? createRuntimeConvexHttpClient()

const isInvalidSessionIdError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error)
  return (
    message.includes('ArgumentValidationError') &&
    message.includes('Validator: v.id("sessions")')
  )
}

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Preview edit request failed'

const getConvexErrorPayload = (
  message: string,
): { code?: string; message?: string } | null => {
  const match = message.match(/\{.*\}/)
  if (!match) return null

  try {
    const parsed = JSON.parse(match[0]) as unknown
    if (
      parsed === null ||
      typeof parsed !== 'object' ||
      Array.isArray(parsed)
    ) {
      return null
    }

    const payload = parsed as Record<string, unknown>
    return {
      code: typeof payload.code === 'string' ? payload.code : undefined,
      message:
        typeof payload.message === 'string' ? payload.message : undefined,
    }
  } catch {
    return null
  }
}

const isTextNotFoundError = (error: unknown): boolean => {
  const message = getErrorMessage(error)
  return (
    message.includes('TEXT_NOT_FOUND') ||
    getConvexErrorPayload(message)?.code === 'TEXT_NOT_FOUND'
  )
}

const errorResponse = (error: unknown) => {
  const message = getErrorMessage(error)
  const convexPayload = getConvexErrorPayload(message)
  const responseMessage =
    typeof convexPayload?.message === 'string' && convexPayload.message.trim()
      ? convexPayload.message
      : message

  return json(
    {
      error: responseMessage,
    },
    {
      status: isInvalidSessionIdError(error)
        ? 404
        : isTextNotFoundError(error)
          ? 409
          : 500,
    },
  )
}

export const createPreviewHistoryResponse = async (
  sessionId: string,
  clientOverride?: PreviewEditClient,
): Promise<Response> => {
  try {
    const history = await createClient(clientOverride).query(
      api.sessions.listPreviewHistory,
      { lookup: sessionId },
    )
    return json({ history })
  } catch (error) {
    return errorResponse(error)
  }
}

export const createPreviewRestoreResponse = async (
  sessionId: string,
  version: string,
  request: Request,
  clientOverride?: PreviewEditClient,
): Promise<Response> => {
  try {
    const body = await readJsonBody(request)
    const parsedVersion = Number(version)
    if (!Number.isInteger(parsedVersion) || parsedVersion < 1) {
      return json({ error: 'Invalid preview version' }, { status: 400 })
    }

    const result = await createClient(clientOverride).mutation(
      api.sessions.restorePreviewVersion,
      {
        sessionId: asSessionId(sessionId),
        version: parsedVersion,
        anonymousOwnerSecret: getOwnerSecret(request, body),
      },
    )

    return json(result)
  } catch (error) {
    return errorResponse(error)
  }
}

export const createPreviewHtmlSaveResponse = async (
  sessionId: string,
  request: Request,
  clientOverride?: PreviewEditClient,
): Promise<Response> => {
  try {
    const body = await readJsonBody(request)
    const html = getString(body, ['html', 'previewHtml', 'homepageHtml'])
    if (html === undefined || !html.trim()) {
      return json({ error: 'Preview HTML is required' }, { status: 400 })
    }

    const result = await createClient(clientOverride).mutation(
      api.sessions.createEdit,
      {
        sessionId: asSessionId(sessionId),
        editType: 'style',
        targetLabel: getString(body, ['targetLabel']) ?? 'Preview HTML',
        afterHtml: html,
        instruction: getString(body, ['instruction']),
        anonymousOwnerSecret: getOwnerSecret(request, body),
      },
    )

    return json(result)
  } catch (error) {
    return errorResponse(error)
  }
}

export const createInlineTextEditResponse = async (
  sessionId: string,
  request: Request,
  clientOverride?: PreviewEditClient,
): Promise<Response> => {
  try {
    const body = await readJsonBody(request)
    const beforeText = getString(body, ['beforeText', 'oldText', 'text'])
    const afterText = getString(body, ['afterText', 'newText', 'replacement'])
    if (beforeText === undefined || afterText === undefined) {
      return json(
        { error: 'beforeText and afterText are required' },
        { status: 400 },
      )
    }

    const result = await createClient(clientOverride).mutation(
      api.sessions.createEdit,
      {
        sessionId: asSessionId(sessionId),
        editType: 'text',
        targetLabel: getString(body, ['targetLabel', 'label']),
        beforeText,
        afterText,
        instruction: getString(body, ['instruction']),
        anonymousOwnerSecret: getOwnerSecret(request, body),
      },
    )

    return json(result)
  } catch (error) {
    return errorResponse(error)
  }
}

export const createInlineStyleEditResponse = async (
  sessionId: string,
  request: Request,
  clientOverride?: PreviewEditClient,
): Promise<Response> => {
  try {
    const body = await readJsonBody(request)
    const afterHtml = getString(body, ['afterHtml', 'html', 'fragmentHtml'])
    if (afterHtml === undefined || !afterHtml.trim()) {
      return json({ error: 'afterHtml is required' }, { status: 400 })
    }

    const result = await createClient(clientOverride).mutation(
      api.sessions.createEdit,
      {
        sessionId: asSessionId(sessionId),
        editType: 'style',
        targetLabel: getString(body, ['targetLabel', 'label']),
        afterHtml,
        instruction: getString(body, ['instruction']),
        anonymousOwnerSecret: getOwnerSecret(request, body),
      },
    )

    return json(result)
  } catch (error) {
    return errorResponse(error)
  }
}
