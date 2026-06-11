import { describe, expect, it } from 'vitest'

import { createSessionEventStreamResponse } from './session-event-stream-route'

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
            session: { id: 'session_123' },
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
})
