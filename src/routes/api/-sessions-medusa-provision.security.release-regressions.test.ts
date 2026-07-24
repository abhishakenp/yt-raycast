import { afterEach, describe, expect, it, vi } from 'vitest'

const mutationMock = vi.hoisted(() => vi.fn())
const provisionResponseMock = vi.hoisted(() => vi.fn())

vi.mock('@/shared/convex/http-client', () => ({
  createRuntimeConvexHttpClient: () => ({
    mutation: mutationMock,
    query: vi.fn(),
  }),
}))

vi.mock('@/features/commerce/server/commerce-api-response', () => ({
  createSessionMedusaProvisionResponse: provisionResponseMock,
}))

import { Route } from './sessions.$sessionId.provision.medusa'
import { callRouteHandler } from './-route-handler.test-helper'

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function'
}

async function simulateProvisionResponse(...args: unknown[]) {
  const client = args[2]
  if (!isRecord(client) || !isFunction(client.mutation)) {
    throw new Error('Provision client mutation is missing')
  }

  try {
    await client.mutation('sessions.requireOwner', {
      sessionId: 'session-private',
    })
    return Response.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const status = message.includes('FORBIDDEN') ? 403 : 500
    return Response.json({ error: message }, { status })
  }
}

function postProvision(body: string) {
  const request = new Request(
    'https://ship-fast.ai/api/sessions/session-private/provision/medusa',
    {
      body,
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    },
  )

  return callRouteHandler(Route, 'POST', {
    params: { sessionId: 'session-private' },
    request,
  })
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('session Medusa provisioning authorization boundaries', () => {
  it('does not convert an ownership denial into successful product provisioning', async () => {
    mutationMock.mockRejectedValue(new Error('FORBIDDEN: not session owner'))
    provisionResponseMock.mockImplementation(simulateProvisionResponse)

    const response = await postProvision(
      JSON.stringify({ products: [{ handle: 'private-product' }] }),
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      error: 'FORBIDDEN: not session owner',
    })
  })

  it('does not mistake an unrelated Unknown-mutation failure for owner authorization', async () => {
    mutationMock.mockRejectedValue(new Error('Unknown mutation endpoint'))
    provisionResponseMock.mockImplementation(simulateProvisionResponse)

    const response = await postProvision(
      JSON.stringify({ products: [{ handle: 'private-product' }] }),
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Unknown mutation endpoint',
    })
  })

  it('preserves successful owner checks for legitimate provisioning', async () => {
    mutationMock.mockResolvedValue({ sessionId: 'session-private' })
    provisionResponseMock.mockImplementation(simulateProvisionResponse)

    const response = await postProvision(
      JSON.stringify({ products: [{ handle: 'owned-product' }] }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
  })
})
