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
    expect(response.headers.get('cache-control')).toContain('max-age=30')
    expect(response.headers.get('cache-control')).toContain(
      'stale-while-revalidate=300',
    )
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

  it('returns a stable public JSON error when Convex fails to load the session payload', async () => {
    const client = {
      query: async (_ref: any, _args: any) => {
        throw new Error(
          'convex unavailable for k571fbfbggczv4pfz2evtrxdzx89qqbb a food site for dogs and other pets',
        )
      },
    }

    const response = await createSessionApiResponse(
      'k571fbfbggczv4pfz2evtrxdzx89qqbb',
      client,
    )
    const data = await response.json()

    expect(data).toEqual({ error: 'Unable to load session.' })
    expect(JSON.stringify(data)).not.toContain(
      'k571fbfbggczv4pfz2evtrxdzx89qqbb',
    )
    expect(JSON.stringify(data)).not.toContain('a food site for dogs')
    expect(response.status).toBe(503)
  })
})
