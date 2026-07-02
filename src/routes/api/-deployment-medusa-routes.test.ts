import { describe, expect, it, vi } from 'vitest'

const routeMocks = vi.hoisted(() => ({
  config: vi.fn(),
  products: vi.fn(),
  provision: vi.fn(),
  pull: vi.fn(),
  webhook: vi.fn(),
  provisioner: { provision: vi.fn() },
}))

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path: string) => (options: unknown) => ({ options, path }),
}))

vi.mock('@/features/commerce/server/commerce-tenant-api-response', () => ({
  createConfiguredMedusaTenantProvisioner: vi.fn(() => routeMocks.provisioner),
  createDeploymentMedusaConfigResponse: routeMocks.config,
  createDeploymentMedusaProductsResponse: routeMocks.products,
  createDeploymentMedusaProvisionResponse: routeMocks.provision,
  createDeploymentMedusaPullResponse: routeMocks.pull,
  createDeploymentMedusaWebhookResponse: routeMocks.webhook,
}))

vi.mock('@/shared/convex/http-client', () => ({
  createRuntimeConvexHttpClient: () => ({
    mutation: vi.fn(),
    query: vi.fn(),
  }),
}))

type RouteWithHandlers = {
  path: string
  options: {
    server: {
      handlers: Record<string, (args: any) => Promise<Response>>
    }
  }
}

describe('deployment Medusa API routes', () => {
  it('serves tenant config by deployment slug', async () => {
    routeMocks.config.mockResolvedValue(new Response('{}'))

    const { Route } =
      await import('./deployments.$deploymentSlug.medusa-config')
    const route = Route as unknown as RouteWithHandlers
    await route.options.server.handlers.GET({
      params: { deploymentSlug: 'deployed-store' },
    })

    expect(route.path).toBe('/api/deployments/$deploymentSlug/medusa-config')
    expect(routeMocks.config).toHaveBeenCalledWith(
      'deployed-store',
      expect.objectContaining({
        mutation: expect.any(Function),
        query: expect.any(Function),
      }),
    )
  })

  it('serves live tenant products by deployment slug', async () => {
    routeMocks.products.mockResolvedValue(new Response('{}'))

    const { Route } =
      await import('./deployments.$deploymentSlug.medusa-products')
    await (Route as unknown as RouteWithHandlers).options.server.handlers.GET({
      params: { deploymentSlug: 'deployed-store' },
    })

    expect(routeMocks.products).toHaveBeenCalledWith(
      'deployed-store',
      expect.objectContaining({ fetch }),
      expect.objectContaining({
        mutation: expect.any(Function),
        query: expect.any(Function),
      }),
    )
  })

  it('provisions tenant Medusa through the configured provider adapter', async () => {
    routeMocks.provision.mockResolvedValue(new Response('{}'))
    const request = new Request(
      'https://ship-fast.test/api/deployments/deployed-store/provision/medusa',
      {
        body: JSON.stringify({ anonymousOwnerSecret: 'owner-secret' }),
        method: 'POST',
      },
    )

    const { Route } =
      await import('./deployments.$deploymentSlug.provision.medusa')
    await (Route as unknown as RouteWithHandlers).options.server.handlers.POST({
      params: { deploymentSlug: 'deployed-store' },
      request,
    })

    expect(routeMocks.provision).toHaveBeenCalledWith(
      'deployed-store',
      expect.any(Request),
      expect.objectContaining({
        mutation: expect.any(Function),
        query: expect.any(Function),
      }),
      routeMocks.provisioner,
    )
  })

  it('manual pull route refreshes tenant products from Medusa Admin source of truth', async () => {
    routeMocks.pull.mockResolvedValue(new Response('{}'))
    const request = new Request(
      'https://ship-fast.test/api/deployments/deployed-store/medusa-pull',
      {
        body: JSON.stringify({ anonymousOwnerSecret: 'owner-secret' }),
        method: 'POST',
      },
    )

    const { Route } = await import('./deployments.$deploymentSlug.medusa-pull')
    await (Route as unknown as RouteWithHandlers).options.server.handlers.POST({
      params: { deploymentSlug: 'deployed-store' },
      request,
    })

    expect(routeMocks.pull).toHaveBeenCalledWith(
      'deployed-store',
      { anonymousOwnerSecret: 'owner-secret', fetch, source: 'manual' },
      expect.objectContaining({
        mutation: expect.any(Function),
        query: expect.any(Function),
      }),
    )
  })

  it('webhook route validates and pulls tenant products from Medusa events', async () => {
    routeMocks.webhook.mockResolvedValue(new Response('{}'))
    const request = new Request(
      'https://ship-fast.test/api/deployments/deployed-store/medusa-webhook',
      { method: 'POST' },
    )

    const { Route } =
      await import('./deployments.$deploymentSlug.medusa-webhook')
    await (Route as unknown as RouteWithHandlers).options.server.handlers.POST({
      params: { deploymentSlug: 'deployed-store' },
      request,
    })

    expect(routeMocks.webhook).toHaveBeenCalledWith(
      'deployed-store',
      request,
      expect.objectContaining({
        mutation: expect.any(Function),
        query: expect.any(Function),
      }),
      expect.objectContaining({
        env: process.env,
        fetch,
      }),
    )
  })
})
