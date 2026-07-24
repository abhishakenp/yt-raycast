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
  it('delegates the ownership boundary to the provisioning service without a route mutation preflight', async () => {
    provisionResponseMock.mockResolvedValue(Response.json({ ok: true }))

    const response = await postProvision(
      JSON.stringify({ products: [{ handle: 'owned-product' }] }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(mutationMock).not.toHaveBeenCalled()
    expect(provisionResponseMock).toHaveBeenCalledWith(
      'session-private',
      expect.any(Request),
      expect.objectContaining({ mutation: mutationMock }),
      expect.objectContaining({ fetch }),
    )
  })
})
