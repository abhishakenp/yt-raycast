import { describe, expect, it } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import { hashOwnerSecret } from './session_access_helpers'
import {
  clampEventStreamLimit,
  loadSessionEventStream,
} from './session_event_stream_helpers'

type EventStreamCtx = Pick<QueryCtx, 'auth' | 'db'>

const sessionId = 'session_event_stream' as Id<'sessions'>

function sessionDoc(overrides: Partial<Doc<'sessions'>> = {}) {
  return {
    _id: sessionId,
    _creationTime: 1,
    prompt: 'Build an event stream',
    workspace: 'default',
    status: 'streaming',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    createdAt: 100,
    updatedAt: 120,
    ...overrides,
  } as Doc<'sessions'>
}

function eventDoc(
  id: string,
  createdAt: number,
  message: string,
): Doc<'generationEvents'> {
  return {
    _id: id as Id<'generationEvents'>,
    _creationTime: createdAt,
    sessionId,
    eventType: 'status',
    message,
    createdAt,
  } as Doc<'generationEvents'>
}

function ctxFor(input: {
  sessions?: Doc<'sessions'>[]
  events?: Doc<'generationEvents'>[]
  userId?: string
}): EventStreamCtx {
  const sessions = [...(input.sessions ?? [])]
  const events = [...(input.events ?? [])]

  const db = {
    normalizeId: (table, value) =>
      table === 'sessions' && sessions.some((session) => session._id === value)
        ? value
        : null,
    get: async (id) => sessions.find((session) => session._id === id) ?? null,
    query: (table) => {
      let rows = table === 'generationEvents' ? [...events] : []

      const builder = {
        withIndex: (_indexName, applyIndex) => {
          const equalFilters = new Map<string, unknown>()
          const gtFilters = new Map<string, number>()
          const index = {
            eq: (field, value) => {
              equalFilters.set(field, value)
              return index
            },
            gt: (field, value) => {
              gtFilters.set(field, value)
              return index
            },
          }

          applyIndex(index)
          rows = rows.filter((row) => {
            const record = row as Record<string, unknown>

            return (
              Array.from(equalFilters.entries()).every(
                ([field, value]) => record[field] === value,
              ) &&
              Array.from(gtFilters.entries()).every(
                ([field, value]) => (record[field] as number) > value,
              )
            )
          })

          return builder
        },
        order: (direction) => {
          rows = [...rows].sort((left, right) =>
            direction === 'desc'
              ? right.createdAt - left.createdAt
              : left.createdAt - right.createdAt,
          )

          return builder
        },
        take: async (limit) => rows.slice(0, limit),
      }

      return builder
    },
  } as unknown as EventStreamCtx['db']

  return {
    auth: {
      getUserIdentity: async () =>
        input.userId === undefined
          ? null
          : ({
              issuer: 'https://convex.test',
              subject: input.userId,
              tokenIdentifier: input.userId,
            } as NonNullable<
              Awaited<ReturnType<EventStreamCtx['auth']['getUserIdentity']>>
            >),
    },
    db,
  }
}

describe('session event stream helpers', () => {
  it('clamps requested limits to the supported event-stream range', () => {
    expect(clampEventStreamLimit(undefined)).toBe(100)
    expect(clampEventStreamLimit(0)).toBe(1)
    expect(clampEventStreamLimit(300)).toBe(250)
    expect(clampEventStreamLimit(25)).toBe(25)
  })

  it('loads ordered events after the cursor and returns the next cursor', async () => {
    const ctx = ctxFor({
      sessions: [sessionDoc()],
      events: [
        eventDoc('event_newest', 30, 'Newest'),
        eventDoc('event_oldest', 10, 'Oldest'),
        eventDoc('event_middle', 20, 'Middle'),
      ],
    })

    const stream = await loadSessionEventStream(ctx, {
      lookup: sessionId,
      since: 10,
      limit: 1,
    })

    expect(stream?.session).toMatchObject({
      sessionId,
      status: 'streaming',
    })
    expect(stream?.events.map((event) => event.message)).toEqual(['Middle'])
    expect(stream?.cursor).toBe(20)
  })

  it('returns the supplied cursor when no newer events exist', async () => {
    const stream = await loadSessionEventStream(
      ctxFor({
        sessions: [sessionDoc()],
        events: [eventDoc('event_old', 10, 'Old')],
      }),
      { sessionId, since: 20 },
    )

    expect(stream?.events).toEqual([])
    expect(stream?.cursor).toBe(20)
  })

  it('returns null when lookup resolution or session loading fails', async () => {
    await expect(
      loadSessionEventStream(ctxFor({}), { lookup: 'missing' }),
    ).resolves.toBeNull()

    const ctx = ctxFor({
      sessions: [sessionDoc()],
    })

    await expect(
      loadSessionEventStream(ctx, {
        sessionId: 'deleted_session' as Id<'sessions'>,
      }),
    ).resolves.toBeNull()
  })

  it('preserves private-session access checks for anonymous owner secrets', async () => {
    const anonOwnerSecretHash = await hashOwnerSecret('owner-secret')
    const ctx = ctxFor({
      sessions: [sessionDoc({ isPrivate: true, anonOwnerSecretHash })],
      events: [eventDoc('event_private', 10, 'Private')],
    })

    await expect(
      loadSessionEventStream(ctx, {
        lookup: sessionId,
        anonymousOwnerSecret: 'wrong-secret',
      }),
    ).rejects.toMatchObject({
      data: {
        code: 'FORBIDDEN',
        message: 'You do not own this session',
      },
    })

    await expect(
      loadSessionEventStream(ctx, {
        lookup: sessionId,
        anonymousOwnerSecret: 'owner-secret',
      }),
    ).resolves.toMatchObject({
      cursor: 10,
      events: [expect.objectContaining({ message: 'Private' })],
    })
  })
})
