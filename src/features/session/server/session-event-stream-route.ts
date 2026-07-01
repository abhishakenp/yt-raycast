import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type GenerationEvent = {
  _id?: string
  eventType: string
  message?: string
  previewVersion?: number
  createdAt: number
  elapsedMs?: number
  cost?: number
  provider?: string
  error?: string
  quotaHit?: boolean
  cacheHit?: boolean
}

type EventStreamData = {
  cursor?: number
  events: GenerationEvent[]
  session: { sessionId: string }
} | null

type SessionEventStreamConvexClient = {
  query: (
    query: unknown,
    args: Record<string, unknown>,
  ) => Promise<EventStreamData>
  setAuth?: (token: string) => void
}

const parseSince = (request: Request): number | undefined => {
  const url = new URL(request.url)
  const raw =
    url.searchParams.get('since') ?? request.headers.get('Last-Event-ID')
  if (raw === null) return undefined

  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

const getOwnerSecret = (request: Request): string | undefined => {
  const url = new URL(request.url)
  return (
    request.headers.get('x-ship-fast-owner-secret') ??
    url.searchParams.get('anonymousOwnerSecret') ??
    url.searchParams.get('anonOwnerSecret') ??
    undefined
  )
}

const getBearerToken = (request: Request): string | null => {
  const auth = request.headers.get('authorization') ?? ''
  const match = auth.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || null
}

const sseLine = (field: string, value: string) =>
  `${field}: ${value.replace(/\r?\n/g, '\n')}\n`

const serializeSseEvent = (event: GenerationEvent): string => {
  const payload = {
    type: event.eventType,
    eventType: event.eventType,
    message: event.message,
    previewVersion: event.previewVersion,
    createdAt: event.createdAt,
    elapsedMs: event.elapsedMs,
    cost: event.cost,
    provider: event.provider,
    error: event.error,
    quotaHit: event.quotaHit,
    cacheHit: event.cacheHit,
  }

  return [
    sseLine('id', String(event.createdAt)),
    sseLine('event', event.eventType),
    sseLine('data', JSON.stringify(payload)),
    '\n',
  ].join('')
}

const createSseResponse = (body: string, init?: ResponseInit) =>
  new Response(body, {
    ...init,
    headers: {
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream; charset=utf-8',
      ...init?.headers,
    },
  })

export const createSessionEventStreamResponse = async (
  sessionId: string,
  request: Request,
  clientOverride?: SessionEventStreamConvexClient,
): Promise<Response> => {
  try {
    const client =
      clientOverride ??
      (createRuntimeConvexHttpClient() as unknown as SessionEventStreamConvexClient)
    const token = getBearerToken(request)
    if (token !== null) client.setAuth?.(token)
    const anonymousOwnerSecret = getOwnerSecret(request)
    const data = await client.query(api.sessions.getEventStream, {
      lookup: sessionId,
      since: parseSince(request),
      ...(anonymousOwnerSecret === undefined ? {} : { anonymousOwnerSecret }),
    })

    if (data === null) {
      return createSseResponse(
        [
          sseLine('event', 'error'),
          sseLine('data', JSON.stringify({ error: 'Session not found' })),
          '\n',
        ].join(''),
        { status: 404 },
      )
    }

    if (
      !data.session ||
      typeof data.session.sessionId !== 'string' ||
      !Array.isArray(data.events)
    ) {
      return createSseResponse(
        [
          sseLine('event', 'error'),
          sseLine(
            'data',
            JSON.stringify({ error: 'Unable to load session events.' }),
          ),
          '\n',
        ].join(''),
        { status: 502 },
      )
    }

    const events = data.events
    const replay = events.map(serializeSseEvent).join('')
    const cursor = data.cursor ?? parseSince(request) ?? Date.now()
    const heartbeatKeepAlive = `: heartbeat keep-alive ${Date.now()}\n`
    const replayComplete = [
      sseLine('id', String(cursor)),
      sseLine('event', 'replay_complete'),
      sseLine(
        'data',
        JSON.stringify({
          sessionId: data.session.sessionId,
          cursor,
          count: events.length,
        }),
      ),
      '\n',
    ].join('')

    return createSseResponse(`${heartbeatKeepAlive}${replay}${replayComplete}`)
  } catch (error) {
    const isForbidden =
      error instanceof Error &&
      typeof (error as { data?: { code?: string } }).data?.code === 'string' &&
      (error as unknown as { data: { code: string } }).data.code === 'FORBIDDEN'

    return createSseResponse(
      [
        sseLine('event', 'error'),
        sseLine(
          'data',
          JSON.stringify({
            error: isForbidden
              ? (error as Error).message
              : 'Unable to load session events.',
          }),
        ),
        '\n',
      ].join(''),
      { status: isForbidden ? 403 : 500 },
    )
  }
}
