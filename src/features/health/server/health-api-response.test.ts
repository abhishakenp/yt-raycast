import { describe, expect, it } from 'vitest'

import { createHealthApiResponse } from './health-api-response'

describe('createHealthApiResponse', () => {
  it('reports ok with latency when Convex answers', async () => {
    const response = await createHealthApiResponse({
      query: async () => ({ items: [] }),
    })

    expect(response.status).toBe(200)
    const body = (await response.json()) as {
      ok: boolean
      convex: string
      latencyMs: number
    }
    expect(body.ok).toBe(true)
    expect(body.convex).toBe('reachable')
    expect(body.latencyMs).toBeGreaterThanOrEqual(0)
  })

  it('reports 503 when the Convex query rejects', async () => {
    const response = await createHealthApiResponse({
      query: async () => {
        throw new Error('boom')
      },
    })

    expect(response.status).toBe(503)
    const body = (await response.json()) as { ok: boolean; convex: string }
    expect(body.ok).toBe(false)
    expect(body.convex).toBe('unreachable')
  })

  it('reports 503 when Convex exceeds the timeout', async () => {
    const response = await createHealthApiResponse(
      { query: () => new Promise(() => undefined) },
      50,
    )

    expect(response.status).toBe(503)
    expect(((await response.json()) as { error: string }).error).toBe(
      'convex timeout',
    )
  })
})
