import { describe, expect, it, vi } from 'vitest'

import { createSessionEventStreamResponse } from './session-event-stream-route'

const realCraftBeerGenerationEvents = [
  {
    _id: 'nn71e09qjzhekm9357c588n1wn89n1y3',
    createdAt: 1782814094925,
    eventType: 'preview_ready',
    message: 'Homepage preview ready',
    previewVersion: 1,
    sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
  },
  {
    _id: 'nn73dxzcz5emzpgw6xwgrt6gwh89mwbw',
    cacheHit: false,
    cost: 0,
    createdAt: 1782814095839,
    elapsedMs: 6424,
    eventType: 'run_completed',
    message: 'Generation completed',
    previewVersion: 1,
    provider: 'ship-fast-engine-v3',
    sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
  },
  {
    _id: 'nn7bc9kw22rpxj960nfs6kkwy189m33k',
    createdAt: 1782814139243,
    eventType: 'published',
    message:
      'Published Lakebed app to https://silver-river-766492ba9a.lakebed.app',
    previewVersion: 1,
    sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
  },
]

describe('createSessionEventStreamResponse', () => {
  it('replays Convex generation events as server-sent events', async () => {
    const calls: unknown[] = []
    const response = await createSessionEventStreamResponse(
      'session_123',
      new Request('http://localhost/api/sessions/session_123/stream?since=100'),
      {
        query: async (_ref, args) => {
          calls.push(args)
          return {
            session: { sessionId: 'session_123' },
            cursor: 200,
            events: [
              {
                _id: 'event_1',
                eventType: 'homepage_ready',
                message: 'Homepage ready',
                previewVersion: 1,
                createdAt: 150,
                elapsedMs: 1234,
                cost: 0.25,
                provider: 'groq',
                cacheHit: true,
              },
            ],
          }
        },
      },
    )

    const text = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('text/event-stream')
    expect(calls).toEqual([{ lookup: 'session_123', since: 100 }])
    expect(text).toContain('id: 150')
    expect(text).toContain('event: homepage_ready')
    expect(text).toContain('"message":"Homepage ready"')
    expect(text).toContain('"elapsedMs":1234')
    expect(text).toContain('"cost":0.25')
    expect(text).toContain('"provider":"groq"')
    expect(text).toContain('"cacheHit":true')
    expect(text).toContain('event: replay_complete')
    expect(text).toContain('"count":1')
  })

  it('returns an SSE 404 error when the session is missing', async () => {
    const response = await createSessionEventStreamResponse(
      'missing',
      new Request('http://localhost/api/sessions/missing/stream'),
      {
        query: async () => null,
      },
    )

    const text = await response.text()

    expect(response.status).toBe(404)
    expect(text).toContain('event: error')
    expect(text).toContain('Session not found')
  })

  it('forwards bearer auth and anonymous owner secret to Convex', async () => {
    const setAuth = vi.fn()
    const client = {
      query: async (_ref: unknown, args: unknown) => {
        expect(args).toEqual({
          lookup: 'session_123',
          since: 100,
          anonymousOwnerSecret: 'owner-secret',
        })
        return {
          session: { sessionId: 'session_123' },
          cursor: 100,
          events: [],
        }
      },
      setAuth,
    }

    const response = await createSessionEventStreamResponse(
      'session_123',
      new Request(
        'http://localhost/api/sessions/session_123/stream?since=100',
        {
          headers: {
            authorization: 'Bearer token_123',
            'x-ship-fast-owner-secret': 'owner-secret',
          },
        },
      ),
      client,
    )

    expect(response.status).toBe(200)
    expect(setAuth).toHaveBeenCalledWith('token_123')
  })

  it('serializes real Convex generation event shapes with stable replay metadata', async () => {
    const client = {
      query: vi.fn(async () => ({
        cursor: 1782814139243,
        events: realCraftBeerGenerationEvents,
        session: { sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2' },
      })),
    }

    const response = await createSessionEventStreamResponse(
      'k574ms14ma9f94keq30r7dq24x89n1k2',
      new Request(
        'http://localhost/api/sessions/k574ms14ma9f94keq30r7dq24x89n1k2/stream',
        { headers: { 'Last-Event-ID': '1782814094000' } },
      ),
      client,
    )
    const text = await response.text()

    expect(response.status).toBe(200)
    expect(client.query).toHaveBeenCalledWith(expect.anything(), {
      lookup: 'k574ms14ma9f94keq30r7dq24x89n1k2',
      since: 1782814094000,
    })
    expect(text).toContain('event: preview_ready')
    expect(text).toContain('"message":"Homepage preview ready"')
    expect(text).toContain('event: run_completed')
    expect(text).toContain('"provider":"ship-fast-engine-v3"')
    expect(text).toContain('"elapsedMs":6424')
    expect(text).toContain('event: published')
    expect(text).toContain('silver-river-766492ba9a.lakebed.app')
    expect(text).toContain('event: replay_complete')
    expect(text).toContain('"count":3')
    expect(text).toContain('"cursor":1782814139243')
  })
})
