import { describe, expect, it, vi } from 'vitest'

const checkoutResponseMock = vi.hoisted(() => vi.fn())
const webhookResponseMock = vi.hoisted(() => vi.fn())

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path: string) => (options: Record<string, unknown>) => ({
    options,
    path,
  }),
}))

vi.mock('@/features/billing/server/webhook-api-response', () => ({
  createWebhookApiResponse: webhookResponseMock,
}))

vi.mock('@/features/billing/server/checkout-api-response', () => ({
  createCheckoutApiResponse: checkoutResponseMock,
}))

type RouteWithHandlers = {
  path: string
  options: {
    server: {
      handlers: Record<
        string,
        (args: {
          params?: Record<string, string>
          request: Request
        }) => Promise<Response>
      >
    }
  }
}

async function importRoute(name: string): Promise<RouteWithHandlers> {
  const mod = await import(name)
  return mod.Route as unknown as RouteWithHandlers
}

describe('payments webhook alias routes', () => {
  it('razorpay alias maps the dashboard URL to the razorpay handler', async () => {
    webhookResponseMock.mockResolvedValue(new Response('{}'))
    const Route = await importRoute('./payments.razorpay.webhook')

    expect(Route.path).toBe('/api/payments/razorpay/webhook')
    await Route.options.server.handlers.POST({
      request: new Request(
        'https://ship-fast.test/api/payments/razorpay/webhook',
      ),
    })
    expect(webhookResponseMock).toHaveBeenCalledWith(
      expect.any(Request),
      'razorpay',
    )
  })

  it('stripe alias maps the dashboard URL to the stripe handler', async () => {
    webhookResponseMock.mockResolvedValue(new Response('{}'))
    const Route = await importRoute('./payments.stripe.webhook')

    expect(Route.path).toBe('/api/payments/stripe/webhook')
    await Route.options.server.handlers.POST({
      request: new Request(
        'https://ship-fast.test/api/payments/stripe/webhook',
      ),
    })
    expect(webhookResponseMock).toHaveBeenCalledWith(
      expect.any(Request),
      'stripe',
    )
  })

  it('canonical razorpay route delegates to the razorpay handler', async () => {
    webhookResponseMock.mockResolvedValue(new Response('{}'))
    const Route = await importRoute('./razorpay.webhook')

    expect(Route.path).toBe('/api/razorpay/webhook')
    await Route.options.server.handlers.POST({
      request: new Request('https://ship-fast.test/api/razorpay/webhook'),
    })
    expect(webhookResponseMock).toHaveBeenCalledWith(
      expect.any(Request),
      'razorpay',
    )
  })

  it('canonical stripe route delegates to the stripe handler', async () => {
    webhookResponseMock.mockResolvedValue(new Response('{}'))
    const Route = await importRoute('./stripe.webhook')

    expect(Route.path).toBe('/api/stripe/webhook')
    await Route.options.server.handlers.POST({
      request: new Request('https://ship-fast.test/api/stripe/webhook'),
    })
    expect(webhookResponseMock).toHaveBeenCalledWith(
      expect.any(Request),
      'stripe',
    )
  })

  it('checkout start alias maps the route gateway param to the checkout handler', async () => {
    checkoutResponseMock.mockResolvedValue(new Response('{}'))
    const Route = await importRoute('./payments.$gateway.start')
    const request = new Request(
      'https://ship-fast.test/api/payments/razorpay/start',
    )

    expect(Route.path).toBe('/api/payments/$gateway/start')
    await Route.options.server.handlers.POST({
      params: { gateway: 'razorpay' },
      request,
    })
    expect(checkoutResponseMock).toHaveBeenCalledWith(
      request,
      process.env,
      undefined,
      'razorpay',
    )
  })
})
