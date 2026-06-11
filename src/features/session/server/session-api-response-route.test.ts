import { describe, expect, it } from 'vitest'

import { createSessionApiResponse } from './session-api-response-route'

describe('createSessionApiResponse', () => {
  it('returns the reconstructed session response from Convex', async () => {
    const calls: unknown[] = []
    const client = {
      query: async (_ref: any, args: any) => {
        calls.push(args)
        return {
          id: 'session_123',
          prompt: 'Build a fitness app',
          taskCount: 1,
          done: 1,
        }
      },
    }

    const response = await createSessionApiResponse('session_123', client)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('application/json')
    expect(response.headers.get('cache-control')).toContain('private')
    expect(calls).toEqual([{ lookup: 'session_123' }])
    expect(data).toMatchObject({
      id: 'session_123',
      prompt: 'Build a fitness app',
      taskCount: 1,
      done: 1,
    })
  })

  it('returns 404 when Convex cannot reconstruct a session', async () => {
    const client = {
      query: async (_ref: any, _args: any) => null,
    }

    const response = await createSessionApiResponse('missing', client)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({ error: 'Session not found' })
  })

  it('returns JSON errors for Convex failures', async () => {
    const client = {
      query: async (_ref: any, _args: any) => {
        throw new Error('convex unavailable')
      },
    }

    const response = await createSessionApiResponse('session_123', client)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'convex unavailable' })
  })
})
