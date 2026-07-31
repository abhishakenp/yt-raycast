import { createFileRoute } from '@tanstack/react-router'

import {
  enforceUserInputModeration,
  moderationErrorResponse,
} from '@/features/moderation/server/enforce-user-input-moderation'
import { CONTENT_MODERATION_UNAVAILABLE_MESSAGE } from '@/features/moderation/server/moderation-classifier'
import { api } from '../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import { rateLimitByIp, rewriteHits } from '@/lib/rate-limit'
import { admitModelCall, modelSpendBlockedResponse } from '@/lib/spend-cap'

const MAX_REWRITE_BODY_BYTES = 1_000_000
const REWRITE_TIMEOUT_MS = 30_000

function isAuthDisabled(): boolean {
  // Never honoured in production — see convex/lib/session_export_helpers.ts.
  const isProduction = process.env.NODE_ENV === 'production'
  const isDev = (process.env.IS_DEV ?? '').trim().toLowerCase() === 'true'
  if (isProduction && !isDev) return false
  return (process.env.VITE_DISABLE_CLERK ?? '').trim().toLowerCase() === 'true'
}

/**
 * Verify the caller actually holds a valid session.
 *
 * The previous check was `/^Bearer\s+.+$/` — it accepted the literal string
 * `Bearer x`. This is an LLM endpoint with no quota of its own, so "any
 * non-empty token" meant anyone on the internet could spend model budget
 * without limit. The token is now handed to Convex, which verifies the Clerk
 * signature; an invalid one throws and we reject.
 */
async function isAuthenticated(request: Request): Promise<boolean> {
  if (isAuthDisabled()) return true

  const token = (request.headers.get('authorization') ?? '').match(
    /^Bearer\s+(.+)$/i,
  )?.[1]
  if (!token?.trim()) return false

  try {
    const client = createRuntimeConvexHttpClient(10_000)
    client.setAuth?.(token.trim())
    await client.query(api.billing.getSubscriptionStatus, {})
    return true
  } catch {
    return false
  }
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

const loadRewriteRuntime = async () => {
  const [{ generateText }, { DEFAULT_MODEL }] = await Promise.all([
    import('@ship-fast/engine'),
    import('@ship-fast/engine/model-list.js'),
  ])

  return { generateText, DEFAULT_MODEL }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

async function readRewriteBody(request: Request): Promise<string | null> {
  const contentLength = Number(request.headers.get('content-length'))
  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_REWRITE_BODY_BYTES
  ) {
    return null
  }

  const reader = request.body?.getReader()
  if (!reader) return ''

  const decoder = new TextDecoder()
  let byteLength = 0
  let body = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      byteLength += value.byteLength
      if (byteLength > MAX_REWRITE_BODY_BYTES) {
        await reader.cancel()
        return null
      }
      body += decoder.decode(value, { stream: true })
    }
    return body + decoder.decode()
  } finally {
    reader.releaseLock()
  }
}

export const Route = createFileRoute('/api/rewrite')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Rate limit BEFORE the auth round-trip so an unauthenticated flood
        // cannot turn into a Convex query flood.
        const limited = rateLimitByIp(request, rewriteHits, 10)
        if (limited) return limited

        if (!(await isAuthenticated(request))) {
          return json({ error: 'Authentication required' }, { status: 401 })
        }

        const spend = admitModelCall('rewrite')
        if (!spend.allowed) return modelSpendBlockedResponse(spend)

        const rawBody = await readRewriteBody(request)
        if (rawBody === null) {
          return json(
            { error: 'Rewrite request is too large' },
            { status: 413 },
          )
        }

        let parsedBody: unknown

        try {
          parsedBody = JSON.parse(rawBody)
        } catch {
          return json({ error: 'Invalid JSON' }, { status: 400 })
        }

        const body = isRecord(parsedBody) ? parsedBody : {}

        const text = typeof body.text === 'string' ? body.text.trim() : ''
        const instruction =
          typeof body.instruction === 'string' ? body.instruction.trim() : ''

        if (!text || !instruction) {
          return json(
            { error: 'Text and instruction are required' },
            { status: 422 },
          )
        }

        try {
          const auth = request.headers.get('authorization') ?? ''
          const bearerToken =
            auth.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || null
          await enforceUserInputModeration({
            bearerToken,
            fields: {
              rewriteInstruction: instruction,
              rewriteText: text,
            },
            surface: 'rewrite_instruction',
          })
        } catch (error) {
          const response = moderationErrorResponse(error)
          if (response) return response
          return json(
            {
              code: 'CONTENT_MODERATION_UNAVAILABLE',
              error: CONTENT_MODERATION_UNAVAILABLE_MESSAGE,
            },
            { status: 503 },
          )
        }

        try {
          const system =
            'You are a skilled copywriter. Rewrite the user text according to the instruction. Output only the rewritten text, with no quotes, no markdown, and no explanation. Keep the same approximate length unless asked otherwise.'
          const user = `Original text: "${text}"\n\nInstruction: ${instruction}\n\nRewritten text:`
          const { generateText, DEFAULT_MODEL } = await loadRewriteRuntime()
          const abortController = new AbortController()
          let timeoutId: ReturnType<typeof setTimeout> | undefined
          const timeout = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => {
              abortController.abort()
              reject(new Error('Rewrite request timed out'))
            }, REWRITE_TIMEOUT_MS)
          })
          const result = await Promise.race([
            generateText(
              DEFAULT_MODEL,
              system,
              user,
              abortController.signal,
              2,
            ),
            timeout,
          ]).finally(() => clearTimeout(timeoutId))
          const rewritten = result.trim().replace(/^["“”]+|["“”]+$/g, '')
          if (!rewritten) throw new Error('Rewrite result is empty')
          return json({
            rewritten,
          })
        } catch {
          return json({ error: 'Rewrite failed.' }, { status: 502 })
        }
      },
    },
  },
})
