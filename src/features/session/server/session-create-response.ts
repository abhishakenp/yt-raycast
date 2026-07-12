import { createHash } from 'node:crypto'

import type { FunctionArgs } from 'convex/server'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type CreateSessionArgs = FunctionArgs<typeof api.sessions.create>

type SessionCreateClient = {
  mutation: (
    reference: unknown,
    args: Record<string, unknown>,
  ) => Promise<unknown>
}

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

function isPublicPreviewMode(): boolean {
  return process.env.SHIP_FAST_PUBLIC_PREVIEW_MODE === 'true'
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

async function readJsonBody(
  request: Request,
): Promise<Record<string, unknown>> {
  const text = await request.text()
  if (!text.trim()) return {}
  const parsed = JSON.parse(text) as unknown
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Request body must be a JSON object.')
  }
  return parsed as Record<string, unknown>
}

function errorPayload(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  if (/QUOTA_EXCEEDED/.test(message)) {
    return {
      status: 429,
      body: {
        code: 'QUOTA_EXCEEDED',
        error:
          'Free preview quota exhausted for this IP address. Try again tomorrow.',
      },
    }
  }
  if (/RATE_LIMITED/.test(message)) {
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

export async function createSessionCreateResponse(
  request: Request,
  clientOverride?: SessionCreateClient,
): Promise<Response> {
  if (!isPublicPreviewMode()) {
    return json(
      { error: 'Public preview session creation is disabled.' },
      { status: 404 },
    )
  }

  try {
    const body = await readJsonBody(request)
    const clientIpHash = hashClientIp(getClientIp(request))
    const client = clientOverride ?? createRuntimeConvexHttpClient()
    const result = await client.mutation(api.sessions.create, {
      ...body,
      clientIpHash,
    } as CreateSessionArgs)

    if (
      result === null ||
      typeof result !== 'object' ||
      typeof (result as { sessionId?: unknown }).sessionId !== 'string' ||
      !(result as { sessionId?: string }).sessionId
    ) {
      return json(
        { error: 'Generation could not start. Try again.' },
        { status: 502 },
      )
    }

    return json(result)
  } catch (error) {
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
    const payload = errorPayload(error)
    return json(payload.body, { status: payload.status })
  }
}
