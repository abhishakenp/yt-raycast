import { createHash } from 'node:crypto'

import type { ConvexHttpClient } from 'convex/browser'
import type { FunctionArgs } from 'convex/server'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import { startVpsGeneration } from '@/features/generation/server/vps-generation-handler'
import {
  enforceUserInputModeration,
  moderationErrorResponse,
} from '@/features/moderation/server/enforce-user-input-moderation'

type CreateSessionArgs = FunctionArgs<typeof api.sessions.create>

type SessionCreateClient = Pick<ConvexHttpClient, 'mutation'> &
  Partial<Pick<ConvexHttpClient, 'setAuth'>>

type SessionCreateResult = {
  sessionId: Id<'sessions'>
  cached?: boolean
  cloned?: boolean
  remaining?: number
}

const MAX_REQUEST_BODY_BYTES = 1_048_576
const REQUEST_BODY_TOO_LARGE_ERROR = 'Request body is too large.'

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      ...init?.headers,
    },
  })
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const firstForwarded = forwarded.split(',')[0]?.trim()
    if (firstForwarded) return firstForwarded
  }

  return (
    request.headers.get('cf-connecting-ip')?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    request.headers.get('fly-client-ip')?.trim() ||
    'unknown'
  )
}

export function hashClientIp(
  ip: string,
  salt = process.env.SHIP_FAST_IP_HASH_SALT ?? '',
): string {
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 48)
}

function getBearerToken(request: Request): string | null {
  const match = (request.headers.get('authorization') ?? '').match(
    /^Bearer\s+(.+)$/i,
  )
  return match?.[1]?.trim() || null
}

async function readJsonBody(
  request: Request,
): Promise<Record<string, unknown>> {
  const contentLength = Number(request.headers.get('content-length'))
  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_REQUEST_BODY_BYTES
  ) {
    throw new Error(REQUEST_BODY_TOO_LARGE_ERROR)
  }

  const reader = request.body?.getReader()
  if (!reader) return {}

  const decoder = new TextDecoder()
  let byteLength = 0
  let text = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      byteLength += value.byteLength
      if (byteLength > MAX_REQUEST_BODY_BYTES) {
        await reader.cancel()
        throw new Error(REQUEST_BODY_TOO_LARGE_ERROR)
      }
      text += decoder.decode(value, { stream: true })
    }
    text += decoder.decode()
  } finally {
    reader.releaseLock()
  }

  if (!text.trim()) return {}
  const parsed = JSON.parse(text) as unknown
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Request body must be a JSON object.')
  }
  return parsed as Record<string, unknown>
}

function errorPayload(error: unknown) {
  // ConvexError carries structured data in .data (e.g. {code, message}).
  const errorData =
    error && typeof error === 'object' && 'data' in error
      ? (error as { data: unknown }).data
      : undefined
  const code =
    errorData && typeof errorData === 'object' && 'code' in errorData
      ? (errorData as { code: string }).code
      : undefined
  const dataMessage =
    errorData && typeof errorData === 'object' && 'message' in errorData
      ? (errorData as { message: string }).message
      : undefined

  if (
    code === 'ANON_DAILY_LIMIT_REACHED' ||
    code === 'ANON_DAILY_EXHAUSTED' ||
    code === 'AUTH_DAILY_LIMIT_REACHED' ||
    code === 'QUOTA_EXCEEDED'
  ) {
    return {
      status: 429,
      body: {
        code,
        error: dataMessage ?? 'Quota exceeded.',
      },
    }
  }
  if (code === 'RATE_LIMITED') {
    return {
      status: 429,
      body: {
        code: 'RATE_LIMITED',
        error:
          'Too many generation requests. Please wait a few minutes and try again.',
      },
    }
  }
  return {
    status: 500,
    body: { error: 'Generation could not start. Try again.' },
  }
}

const VALID_EXPORT_TARGETS = ['html', 'react', 'next', 'lakebed'] as const
type ExportTarget = (typeof VALID_EXPORT_TARGETS)[number]

function isExportTarget(value: unknown): value is ExportTarget {
  return (
    typeof value === 'string' &&
    VALID_EXPORT_TARGETS.some((target) => target === value)
  )
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string')
}

function parseCreateSessionArgs(
  body: Record<string, unknown>,
  clientIpHash: string,
): CreateSessionArgs {
  const prompt = typeof body.prompt === 'string' ? body.prompt : ''
  const preferredLanguage =
    typeof body.preferredLanguage === 'string' ? body.preferredLanguage : 'en'
  const preferredExportTarget: ExportTarget = isExportTarget(
    body.preferredExportTarget,
  )
    ? body.preferredExportTarget
    : 'html'
  const isPrivate = body.isPrivate === true
  const workspace = typeof body.workspace === 'string' ? body.workspace : ''

  const args: CreateSessionArgs = {
    prompt,
    preferredLanguage,
    preferredExportTarget,
    isPrivate,
    workspace,
    clientIpHash,
  }

  if (typeof body.anonymousOwnerSecret === 'string') {
    args.anonymousOwnerSecret = body.anonymousOwnerSecret
  }
  if (typeof body.anonymousClientId === 'string') {
    args.anonymousClientId = body.anonymousClientId
  }
  if (isStringArray(body.designReferenceUrls)) {
    args.designReferenceUrls = body.designReferenceUrls
  }
  if (typeof body.designReferenceNotes === 'string') {
    args.designReferenceNotes = body.designReferenceNotes
  }
  if (typeof body.cloneUrl === 'string') {
    args.cloneUrl = body.cloneUrl
  }
  if (typeof body.engineVersion === 'string') {
    args.engineVersion = body.engineVersion
  }
  if (body.isDraft === true) {
    args.isDraft = true
  }
  return args
}

function isSessionCreateResult(value: unknown): value is SessionCreateResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    'sessionId' in value &&
    typeof value.sessionId === 'string' &&
    value.sessionId.length > 0
  )
}

export async function createSessionCreateResponse(
  request: Request,
  clientOverride?: SessionCreateClient,
): Promise<Response> {
  const contentType = request.headers
    .get('content-type')
    ?.split(';', 1)[0]
    ?.trim()
    .toLowerCase()
  if (request.headers.has('origin') && contentType !== 'application/json') {
    return json(
      { error: 'Content-Type must be application/json.' },
      { status: 415 },
    )
  }

  try {
    const body = await readJsonBody(request)
    const clientIpHash = hashClientIp(getClientIp(request))
    const client = clientOverride ?? createRuntimeConvexHttpClient()
    const token = getBearerToken(request)
    if (token !== null) client.setAuth?.(token)
    const args = parseCreateSessionArgs(body, clientIpHash)
    await enforceUserInputModeration({
      anonymousClientId: args.anonymousClientId,
      bearerToken: token,
      clientIpHash,
      fields: {
        designReferenceNotes: args.designReferenceNotes,
        prompt: args.prompt,
      },
      surface: 'session_create',
    })
    const result = await client.mutation(api.sessions.create, args)

    if (!isSessionCreateResult(result)) {
      return json(
        { error: 'Generation could not start. Try again.' },
        { status: 502 },
      )
    }

    const anonymousOwnerSecret =
      typeof body.anonymousOwnerSecret === 'string'
        ? body.anonymousOwnerSecret
        : undefined

    // Session admitted — kick off generation on the VPS (warm Node process).
    // Fire-and-forget: the client subscribes to getGenerationView on Convex
    // and sees progress reactively. No data flows through the client.
    void startVpsGeneration({
      sessionId: result.sessionId,
      anonymousOwnerSecret,
      bearerToken: token,
    }).catch((error) => {
      console.error('[session-create] VPS generation failed', {
        sessionId: result.sessionId,
        error: error instanceof Error ? error.message : String(error),
      })
    })

    return json(result)
  } catch (error) {
    const moderationResponse = moderationErrorResponse(error)
    if (moderationResponse !== null) return moderationResponse
    if (error instanceof SyntaxError) {
      return json(
        { error: 'Request body must be valid JSON.' },
        { status: 400 },
      )
    }
    if (
      error instanceof Error &&
      error.message === 'Request body must be a JSON object.'
    ) {
      return json({ error: error.message }, { status: 400 })
    }
    if (
      error instanceof Error &&
      error.message === REQUEST_BODY_TOO_LARGE_ERROR
    ) {
      return json({ error: error.message }, { status: 413 })
    }
    console.error(error)
    const payload = errorPayload(error)
    return json(payload.body, { status: payload.status })
  }
}
