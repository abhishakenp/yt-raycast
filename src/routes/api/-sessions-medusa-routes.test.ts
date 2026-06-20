import { describe, expect, it, vi } from 'vitest'

const provisionMock = vi.hoisted(() => vi.fn())
const productsMock = vi.hoisted(() => vi.fn())

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path: string) => (options: unknown) => ({ options, path }),
}))

vi.mock('@/features/commerce/server/commerce-api-response', () => ({
  createSessionMedusaProvisionResponse: provisionMock,
}))

vi.mock('@/features/commerce/server/medusa-product-read', () => ({
  createSessionMedusaProductsResponse: productsMock,
}))

vi.mock('@/shared/convex/http-client', () => ({
  createRuntimeConvexHttpClient: () => ({
    mutation: vi.fn(),
    query: vi.fn(),
  }),
}))

type RouteWithHandlers = {
  options: {
    server: {
      handlers: Record<string, (args: any) => Promise<Response>>
    }
  }
}

describe('session Medusa API routes', () => {
  it('passes explicit server env into Medusa provisioning', async () => {
    const request = new Request(
      'https://ship-fast.test/api/sessions/session_123/provision/medusa',
      {
        body: JSON.stringify({ products: [{ handle: 'truffle-box' }] }),
        method: 'POST',
      },
    )
    provisionMock.mockResolvedValue(new Response('{}'))

    const { Route } = await import('./sessions.$sessionId.provision.medusa')
    await (Route as unknown as RouteWithHandlers).options.server.handlers.POST({
      params: { sessionId: 'session_123' },
      request,
    })

    const [, replayRequest, client, options] = provisionMock.mock.calls[0]
    expect(await replayRequest.text()).toBe(
      JSON.stringify({ products: [{ handle: 'truffle-box' }] }),
    )
    expect(provisionMock).toHaveBeenCalledWith(
      'session_123',
      expect.any(Request),
      expect.objectContaining({
        mutation: expect.any(Function),
        query: expect.any(Function),
      }),
      expect.objectContaining({
        env: process.env,
        fetch,
        metaEnv: {},
      }),
    )
    expect(client).toMatchObject({
      mutation: expect.any(Function),
      query: expect.any(Function),
    })
    expect(options.env).toBe(process.env)
  })

  it('passes explicit server env into Medusa product reads', async () => {
    productsMock.mockResolvedValue(new Response('{}'))

    const { Route } = await import('./sessions.$sessionId.medusa-products')
    await (Route as unknown as RouteWithHandlers).options.server.handlers.GET({
      params: { sessionId: 'session_123' },
    })

    expect(productsMock).toHaveBeenCalledWith(
      'session_123',
      expect.objectContaining({
        env: process.env,
        fetch,
        metaEnv: {},
      }),
    )
  })
})
