import { createFileRoute } from '@tanstack/react-router'

import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import { toPublicErrorMessage } from '@/shared/errors/public-error-message'
import { runCloneJob } from '@/features/clone/server/clone-orchestrator-response'
import {
  enforceUserInputModeration,
  moderationErrorResponse,
} from '@/features/moderation/server/enforce-user-input-moderation'

// POST /api/clone — kick off a server-side verbatim clone job for a session.
// Body: { sessionId, anonymousOwnerSecret?, seedUrl, brief }. Bearer in the
// `authorization` header (for authed owners). Returns 202 immediately; the client
// streams the cloned pages via its Convex session subscription.

const CONVEX_DOCUMENT_ID_PATTERN = /^[a-z0-9]{32}$/
const MAX_CLONE_BRIEF_BYTES = 32_000

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
}

async function readJsonBody(
  request: Request,
): Promise<Record<string, unknown>> {
  const text = await request.text()
  if (!text.trim()) return {}
  try {
    const parsed: unknown = JSON.parse(text)
    return isJsonObject(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function getString(
  body: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = body[key]
  return typeof value === 'string' ? value : undefined
}

function getBearerToken(request: Request): string | undefined {
  const auth = request.headers.get('authorization') ?? ''
  const match = auth.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || undefined
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

const sensitiveCloneValues = (
  anonymousOwnerSecret: string | undefined,
  bearer: string | undefined,
): string[] =>
  [anonymousOwnerSecret, bearer].filter(
    (value): value is string => typeof value === 'string' && value.length > 0,
  )

const isPublicHttpUrl = async (value: string): Promise<boolean> => {
  try {
    const { assertPublicUrlPreflight } =
      await import('@ship-fast/engine/clone/security.ts')
    assertPublicUrlPreflight(value)
    return true
  } catch {
    return false
  }
}

// Best-effort: mark the session's clone preview as a failed home doc so the UI can
// surface the failure instead of spinning forever. Never throws.
async function writeFailedState(
  sessionId: string,
  anonymousOwnerSecret: string | undefined,
  bearer: string | undefined,
): Promise<void> {
  try {
    const client = createRuntimeConvexHttpClient(30_000)
    if (bearer) client.setAuth?.(bearer)
    await client.mutation(api.sessions.writeClonePageDoc, {
      sessionId: sessionId as Id<'sessions'>,
      anonymousOwnerSecret,
      pathname: '/',
      html: '',
      isHome: true,
      failed: true,
      order: 0,
      byteLength: 0,
    })
    await client.mutation(api.sessions.finalizeClonePreview, {
      sessionId: sessionId as Id<'sessions'>,
      anonymousOwnerSecret,
    })
  } catch (err) {
    console.warn(
      `[clone] failed to write failed-state for ${sessionId}:`,
      toPublicErrorMessage(
        err,
        sensitiveCloneValues(anonymousOwnerSecret, bearer),
      ),
    )
  }
}

async function handlePost(request: Request): Promise<Response> {
  const body = await readJsonBody(request)
  const sessionId = getString(body, 'sessionId')
  const seedUrl = getString(body, 'seedUrl')
  const anonymousOwnerSecret =
    getString(body, 'anonymousOwnerSecret') ??
    getString(body, 'anonOwnerSecret')
  const brief = getString(body, 'brief') ?? ''
  const bearer = getBearerToken(request)

  if (!sessionId) {
    return json({ error: 'sessionId is required.' }, { status: 400 })
  }
  if (!CONVEX_DOCUMENT_ID_PATTERN.test(sessionId)) {
    return json(
      { error: 'sessionId must be a valid session id.' },
      { status: 400 },
    )
  }
  if (!seedUrl || !isHttpUrl(seedUrl)) {
    return json(
      { error: 'seedUrl must be a valid http(s) URL.' },
      { status: 400 },
    )
  }
  if (!bearer && !anonymousOwnerSecret?.trim()) {
    return json({ error: 'Session ownership is required.' }, { status: 401 })
  }
  if (new TextEncoder().encode(brief).byteLength > MAX_CLONE_BRIEF_BYTES) {
    return json({ error: 'Clone request is too large.' }, { status: 413 })
  }
  if (!(await isPublicHttpUrl(seedUrl))) {
    return json(
      { error: 'seedUrl must resolve to a public http(s) address.' },
      { status: 400 },
    )
  }

  try {
    await enforceUserInputModeration({
      anonymousClientId: anonymousOwnerSecret,
      bearerToken: bearer,
      fields: { cloneBrief: brief },
      sessionId: sessionId as Id<'sessions'>,
      surface: 'clone_brief',
    })
  } catch (error) {
    const response = moderationErrorResponse(error)
    if (response) return response
    throw error
  }

  // Fire-and-forget — like queueGalleryThumbCapture. Do NOT await; the client
  // streams results via the Convex subscription. Catch + log errors, and on a
  // hard failure (e.g. Chromium launch) write a failed state to the session.
  void runCloneJob({
    sessionId,
    anonymousOwnerSecret,
    bearer,
    seedUrl,
    brief,
  }).catch(async (err) => {
    console.error(
      `[clone] clone job failed for session ${sessionId}:`,
      toPublicErrorMessage(
        err,
        sensitiveCloneValues(anonymousOwnerSecret, bearer),
      ),
    )
    await writeFailedState(sessionId, anonymousOwnerSecret, bearer)
  })

  return json({ ok: true }, { status: 202 })
}

export const Route = createFileRoute('/api/clone')({
  server: {
    handlers: {
      POST: async ({ request }) => handlePost(request),
    },
  },
})
