import type { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { isUnsafePublicPreviewHtml } from '../../../../convex/lib/openui_error_html'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type PreviewEditClient = Pick<ConvexHttpClient, 'query' | 'mutation'>

type JsonBody = Record<string, unknown>

const EXECUTABLE_PREVIEW_FRAGMENT_PATTERN =
  /<\s*\/?\s*(?:script|iframe|object|embed|base|meta|link|foreignObject)\b|\s(?:on[a-z]+|srcdoc)\s*=|\s(?:href|src|action|formaction|xlink:href)\s*=\s*["']?\s*(?:(?:javascript|vbscript)\s*:|data\s*:\s*text\/html)/i

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

class MalformedJsonError extends Error {
  constructor() {
    super('Request body must be valid JSON.')
    this.name = 'MalformedJsonError'
  }
}

function isMalformedJsonError(error: unknown): error is MalformedJsonError {
  return error instanceof MalformedJsonError
}

async function readJsonBody(request: Request): Promise<JsonBody> {
  const text = await request.text()
  if (!text.trim()) return {}

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new MalformedJsonError()
  }
  return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
    ? (parsed as JsonBody)
    : {}
}

function asSessionId(sessionId: string): Id<'sessions'> {
  return sessionId as Id<'sessions'>
}

function getString(body: JsonBody, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = body[key]
    if (typeof value === 'string') return value
  }
  return undefined
}

function getOwnerSecret(request: Request, body: JsonBody): string | undefined {
  const bodySecret = getString(body, [
    'anonymousOwnerSecret',
    'anonOwnerSecret',
  ])?.trim()
  if (bodySecret) return bodySecret

  const headerSecret = request.headers.get('x-ship-fast-owner-secret')?.trim()
  return headerSecret || undefined
}

function containsExecutablePreviewFragment(html: string): boolean {
  return EXECUTABLE_PREVIEW_FRAGMENT_PATTERN.test(html)
}

function createClient(clientOverride?: PreviewEditClient): PreviewEditClient {
  return clientOverride ?? createRuntimeConvexHttpClient()
}

function isInvalidSessionIdError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return (
    message.includes('ArgumentValidationError') &&
    message.includes('Validator: v.id("sessions")')
  )
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Preview edit request failed'
}

function getConvexErrorPayload(
  message: string,
): { code?: string; message?: string } | null {
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

function isTextNotFoundError(error: unknown): boolean {
  const message = getErrorMessage(error)
  return (
    message.includes('TEXT_NOT_FOUND') ||
    getConvexErrorPayload(message)?.code === 'TEXT_NOT_FOUND'
  )
}

function errorResponse(error: unknown) {
  if (isMalformedJsonError(error)) {
    return json({ error: error.message }, { status: 400 })
  }

  if (isInvalidSessionIdError(error)) {
    return json({ error: 'Session not found' }, { status: 404 })
  }

  if (isTextNotFoundError(error)) {
    return json({ error: 'Selected text was not found' }, { status: 409 })
  }

  return json({ error: 'Preview edit request failed' }, { status: 500 })
}

export async function createPreviewHistoryResponse(
  sessionId: string,
  clientOverride?: PreviewEditClient,
): Promise<Response> {
  try {
    const history = await createClient(clientOverride).query(
      api.sessions.listPreviewHistory,
      { lookup: sessionId },
    )
    return json({ history })
  } catch {
    return json({ error: 'Unable to load preview history.' }, { status: 503 })
  }
}

export async function createPreviewRestoreResponse(
  sessionId: string,
  version: string,
  request: Request,
  clientOverride?: PreviewEditClient,
): Promise<Response> {
  try {
    const body = await readJsonBody(request)
    const parsedVersion = Number(version)
    if (!Number.isSafeInteger(parsedVersion) || parsedVersion < 1) {
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

export async function createPreviewHtmlSaveResponse(
  sessionId: string,
  request: Request,
  clientOverride?: PreviewEditClient,
): Promise<Response> {
  try {
    const body = await readJsonBody(request)
    const html = getString(body, ['html', 'previewHtml', 'homepageHtml'])
    if (html === undefined || !html.trim()) {
      return json({ error: 'Preview HTML is required' }, { status: 400 })
    }

    if (isUnsafePublicPreviewHtml(html)) {
      return json(
        {
          error: 'Preview HTML is not available. Regenerate the preview first.',
        },
        { status: 422 },
      )
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

export async function createInlineTextEditResponse(
  sessionId: string,
  request: Request,
  clientOverride?: PreviewEditClient,
): Promise<Response> {
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
    if (!beforeText.trim()) {
      return json({ error: 'beforeText must not be empty' }, { status: 400 })
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

export async function createInlineStyleEditResponse(
  sessionId: string,
  request: Request,
  clientOverride?: PreviewEditClient,
): Promise<Response> {
  try {
    const body = await readJsonBody(request)
    const afterHtml = getString(body, ['afterHtml', 'html', 'fragmentHtml'])
    if (afterHtml === undefined || !afterHtml.trim()) {
      return json({ error: 'afterHtml is required' }, { status: 400 })
    }
    if (containsExecutablePreviewFragment(afterHtml)) {
      return json(
        { error: 'Executable preview fragments are not allowed' },
        { status: 422 },
      )
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
