import { describe, expect, it } from 'vitest'

import { createHealthApiResponse } from './health-api-response'

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

async function readJsonObject(response: Response) {
  const body: unknown = await response.json()
  if (!isRecord(body)) throw new Error('Health response must be a JSON object')
  return body
}

function expectOperationalHeaders(response: Response) {
  expect(response.headers.get('cache-control')).toBe('no-store')
  expect(response.headers.get('content-type')).toContain('application/json')
  expect(response.headers.get('x-content-type-options')).toBe('nosniff')
  expect(response.headers.get('access-control-allow-origin')).not.toBe('*')
  expect(response.headers.get('set-cookie')).toBeNull()
}

describe('health endpoint release operations', () => {
  it('does not expose dependency errors or credentials in degraded responses', async () => {
    const credential = 'postgres://release_user:release_password@db.internal'
    const response = await createHealthApiResponse({
      query: async () => {
        throw new Error(`Convex failed while connecting to ${credential}`)
      },
    })
    const body = await readJsonObject(response)
    const serialized = JSON.stringify(body)

    expect(response.status).toBe(503)
    expect(body.error).toBe('Dependency health check failed.')
    expect(serialized).not.toContain(credential)
    expect(serialized).not.toContain('release_password')
    expect(serialized).not.toContain('db.internal')
  })

  it('prevents caching and sniffing of healthy operational responses', async () => {
    const response = await createHealthApiResponse({
      query: async () => ({ items: [] }),
    })

    expect(response.status).toBe(200)
    expectOperationalHeaders(response)
  })

  it('prevents caching and sniffing of dependency-degraded responses', async () => {
    const response = await createHealthApiResponse({
      query: async () => {
        throw new Error('dependency unavailable')
      },
    })

    expect(response.status).toBe(503)
    expectOperationalHeaders(response)
  })
})
