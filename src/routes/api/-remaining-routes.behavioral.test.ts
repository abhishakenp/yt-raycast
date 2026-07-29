import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const routeMocks = vi.hoisted(() => ({
  partnerAttribution: vi.fn(),
  partnerEmbedToken: vi.fn(),
  referralRecord: vi.fn(),
  referralStatus: vi.fn(),
  previewHistory: vi.fn(),
  previewRestore: vi.fn(),
  previewHtmlSave: vi.fn(),
  inlineStyleEdit: vi.fn(),
  inlineTextEdit: vi.fn(),
  medusaConfig: vi.fn(),
  medusaProducts: vi.fn(),
  medusaProvision: vi.fn(),
  cloneJob: vi.fn(),
  convexClient: {
    mutation: vi.fn(),
    query: vi.fn(),
  },
}))

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path: string) => (options: Record<string, unknown>) => ({
    options,
    path,
  }),
}))

vi.mock('@/features/referrals/server/referral-api-response', () => ({
  createReferralRecordApiResponse: routeMocks.referralRecord,
  createReferralStatusApiResponse: routeMocks.referralStatus,
}))

vi.mock('@/features/partners/server/partner-api-response', () => ({
  createPartnerAttributionApiResponse: routeMocks.partnerAttribution,
  createPartnerEmbedTokenApiResponse: routeMocks.partnerEmbedToken,
}))

vi.mock('@/features/session/server/session-preview-edit-response', () => ({
  createPreviewHistoryResponse: routeMocks.previewHistory,
  createPreviewRestoreResponse: routeMocks.previewRestore,
  createPreviewHtmlSaveResponse: routeMocks.previewHtmlSave,
  createInlineStyleEditResponse: routeMocks.inlineStyleEdit,
  createInlineTextEditResponse: routeMocks.inlineTextEdit,
}))

vi.mock('@/features/commerce/server/commerce-api-response', () => ({
  createSessionMedusaConfigResponse: routeMocks.medusaConfig,
  createSessionMedusaProvisionResponse: routeMocks.medusaProvision,
}))

vi.mock('@/features/commerce/server/medusa-product-read', () => ({
  createSessionMedusaProductsResponse: routeMocks.medusaProducts,
}))

vi.mock('@/features/clone/server/clone-orchestrator-response', () => ({
  runCloneJob: routeMocks.cloneJob,
}))

vi.mock('@/shared/convex/http-client', () => ({
  createRuntimeConvexHttpClient: () => routeMocks.convexClient,
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

async function importRoute(path: string): Promise<RouteWithHandlers> {
  const mod = await import(path)
  return mod.Route as unknown as RouteWithHandlers
}

const realSessionId = 'k574ms14ma9f94keq30r7dq24x89n1k2'

describe('remaining API route behavior', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.clearAllMocks()
    routeMocks.cloneJob.mockResolvedValue(undefined)
    routeMocks.convexClient.mutation.mockResolvedValue({
      sessionId: realSessionId,
    })
    routeMocks.convexClient.query.mockResolvedValue(null)
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    process.env = { ...originalEnv }
  })

  it.each([
    [
      './partners.attribution',
      '/api/partners/attribution',
      'POST',
      routeMocks.partnerAttribution,
      'claimed',
    ],
    [
      './partners.embed-token',
      '/api/partners/embed-token',
      'GET',
      routeMocks.partnerEmbedToken,
      'public token',
    ],
    [
      './referrals.record',
      '/api/referrals/record',
      'POST',
      routeMocks.referralRecord,
      'recorded',
    ],
    [
      './referrals.status',
      '/api/referrals/status',
      'GET',
      routeMocks.referralStatus,
      'status',
    ],
  ] as const)(
    'delegates %s referral endpoint',
    async (modulePath, routePath, method, helper, body) => {
      helper.mockResolvedValue(new Response(body))
      const Route = await importRoute(modulePath)
      const request = new Request(`https://ship-fast.ai${routePath}`, {
        method,
      })

      const response = await Route.options.server.handlers[method]({ request })

      expect(Route.path).toBe(routePath)
      expect(await response.text()).toBe(body)
      expect(helper).toHaveBeenCalledWith(request)
    },
  )

  it.each([
    [
      './sessions.$sessionId.history',
      '/api/sessions/$sessionId/history',
      'GET',
      routeMocks.previewHistory,
      'history',
      [] as const,
    ],
    [
      './sessions.$sessionId.preview-homepage-html',
      '/api/sessions/$sessionId/preview-homepage-html',
      'POST',
      routeMocks.previewHtmlSave,
      'save html',
      ['request'] as const,
    ],
    [
      './sessions.$sessionId.preview-inline-style',
      '/api/sessions/$sessionId/preview-inline-style',
      'POST',
      routeMocks.inlineStyleEdit,
      'style edit',
      ['request'] as const,
    ],
    [
      './sessions.$sessionId.preview-inline-text',
      '/api/sessions/$sessionId/preview-inline-text',
      'POST',
      routeMocks.inlineTextEdit,
      'text edit',
      ['request'] as const,
    ],
  ] as const)(
    'delegates %s session editing endpoint',
    async (modulePath, routePath, method, helper, body, requestArgs) => {
      helper.mockResolvedValue(new Response(body))
      const Route = await importRoute(modulePath)
      const request = new Request(
        `https://ship-fast.ai${routePath.replace('$sessionId', realSessionId)}`,
        { method },
      )

      const response = await Route.options.server.handlers[method]({
        params: { sessionId: realSessionId },
        request,
      })

      expect(Route.path).toBe(routePath)
      expect(await response.text()).toBe(body)
      const expectedArgs =
        requestArgs.length > 0 ? [realSessionId, request] : [realSessionId]
      expect(helper).toHaveBeenCalledWith(...expectedArgs)
    },
  )

  it('delegates preview restore with the route version string and request body', async () => {
    routeMocks.previewRestore.mockResolvedValue(new Response('restored'))
    const Route = await importRoute(
      './sessions.$sessionId.history.$version.restore',
    )
    const request = new Request(
      `https://ship-fast.ai/api/sessions/${realSessionId}/history/1/restore`,
      {
        body: JSON.stringify({ anonymousOwnerSecret: 'secret' }),
        method: 'POST',
      },
    )

    const response = await Route.options.server.handlers.POST({
      params: { sessionId: realSessionId, version: '1' },
      request,
    })

    expect(Route.path).toBe('/api/sessions/$sessionId/history/$version/restore')
    expect(await response.text()).toBe('restored')
    expect(routeMocks.previewRestore).toHaveBeenCalledWith(
      realSessionId,
      '1',
      request,
    )
  })

  it('delegates Medusa config lookup with a real session id', async () => {
    routeMocks.medusaConfig.mockResolvedValue(new Response('medusa config'))
    const Route = await importRoute('./sessions.$sessionId.medusa-config')
    const request = new Request(
      `https://ship-fast.ai/api/sessions/${realSessionId}/medusa-config`,
    )

    const response = await Route.options.server.handlers.GET({
      params: { sessionId: realSessionId },
      request,
    })

    expect(Route.path).toBe('/api/sessions/$sessionId/medusa-config')
    expect(await response.text()).toBe('medusa config')
    expect(routeMocks.medusaConfig).toHaveBeenCalledWith(realSessionId)
  })

  it('delegates Medusa product reads with environment and fetch dependencies', async () => {
    routeMocks.medusaProducts.mockResolvedValue(new Response('medusa products'))
    const Route = await importRoute('./sessions.$sessionId.medusa-products')
    const request = new Request(
      `https://ship-fast.ai/api/sessions/${realSessionId}/medusa-products`,
    )

    const response = await Route.options.server.handlers.GET({
      params: { sessionId: realSessionId },
      request,
    })

    expect(Route.path).toBe('/api/sessions/$sessionId/medusa-products')
    expect(await response.text()).toBe('medusa products')
    expect(routeMocks.medusaProducts).toHaveBeenCalledWith(
      realSessionId,
      { fetch },
      expect.objectContaining({
        mutation: expect.any(Function),
        query: expect.any(Function),
      }),
    )
  })

  it('replays the Medusa provision body and supplies a Convex-backed client', async () => {
    routeMocks.medusaProvision.mockImplementation(
      async (_sessionId, request, client, deps) => {
        expect(await request.text()).toBe(
          '{"products":[{"title":"Portland Pale Ale"}]}',
        )
        await expect(client.query('session:read', {})).resolves.toBeNull()
        await expect(client.mutation('session:update', {})).resolves.toEqual({
          sessionId: realSessionId,
        })
        expect(deps).toMatchObject({ fetch })
        return new Response('provisioned')
      },
    )
    const Route = await importRoute('./sessions.$sessionId.provision.medusa')
    const request = new Request(
      `https://ship-fast.ai/api/sessions/${realSessionId}/provision/medusa`,
      {
        body: '{"products":[{"title":"Portland Pale Ale"}]}',
        method: 'POST',
      },
    )

    const response = await Route.options.server.handlers.POST({
      params: { sessionId: realSessionId },
      request,
    })

    expect(Route.path).toBe('/api/sessions/$sessionId/provision/medusa')
    expect(await response.text()).toBe('provisioned')
    expect(routeMocks.medusaProvision).toHaveBeenCalledWith(
      realSessionId,
      expect.any(Request),
      expect.objectContaining({
        mutation: expect.any(Function),
        query: expect.any(Function),
      }),
      { fetch },
    )
  })

  it('rejects clone requests with missing seed URL before starting the clone job', async () => {
    const Route = await importRoute('./clone')
    const request = new Request('https://ship-fast.ai/api/clone', {
      body: JSON.stringify({ sessionId: realSessionId }),
      method: 'POST',
    })

    const response = await Route.options.server.handlers.POST({ request })

    expect(Route.path).toBe('/api/clone')
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'seedUrl must be a valid http(s) URL.',
    })
    expect(routeMocks.cloneJob).not.toHaveBeenCalled()
  })

  it('starts a clone job for a real session id and returns 202 immediately', async () => {
    const Route = await importRoute('./clone')
    const request = new Request('https://ship-fast.ai/api/clone', {
      body: JSON.stringify({
        anonymousOwnerSecret: 'real-session-owner-secret-placeholder',
        brief:
          'a craft beer brewery with taproom tours and seasonal releases in portland',
        seedUrl: 'https://example.com/portland-brewery',
        sessionId: realSessionId,
      }),
      headers: { authorization: 'Bearer user-token' },
      method: 'POST',
    })

    const response = await Route.options.server.handlers.POST({ request })

    expect(response.status).toBe(202)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(routeMocks.cloneJob).toHaveBeenCalledWith({
      anonymousOwnerSecret: 'real-session-owner-secret-placeholder',
      bearer: 'user-token',
      brief:
        'a craft beer brewery with taproom tours and seasonal releases in portland',
      seedUrl: 'https://example.com/portland-brewery',
      sessionId: realSessionId,
    })
  })

  it('writes a failed clone preview state when the background clone job rejects', async () => {
    routeMocks.cloneJob.mockRejectedValueOnce(
      new Error('Chromium launch failed'),
    )
    const Route = await importRoute('./clone')
    const request = new Request('https://ship-fast.ai/api/clone', {
      body: JSON.stringify({
        anonymousOwnerSecret: 'real-session-owner-secret-placeholder',
        brief: 'a real cloned brewery homepage',
        seedUrl: 'https://example.com/portland-brewery',
        sessionId: realSessionId,
      }),
      headers: { authorization: 'Bearer user-token' },
      method: 'POST',
    })

    const response = await Route.options.server.handlers.POST({ request })

    expect(response.status).toBe(202)
    await vi.waitFor(() => {
      expect(routeMocks.convexClient.mutation).toHaveBeenCalledTimes(2)
    })
    expect(routeMocks.convexClient.mutation).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      {
        anonymousOwnerSecret: 'real-session-owner-secret-placeholder',
        byteLength: 0,
        failed: true,
        html: '',
        isHome: true,
        order: 0,
        pathname: '/',
        sessionId: realSessionId,
      },
    )
    expect(routeMocks.convexClient.mutation).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      {
        anonymousOwnerSecret: 'real-session-owner-secret-placeholder',
        sessionId: realSessionId,
      },
    )
  })

  it('generates with Pollinations when no stock providers are configured', async () => {
    delete process.env.PEXELS_API_KEY
    delete process.env.VITE_PEXELS_API_KEY
    delete process.env.UNSPLASH_ACCESS_KEY
    delete process.env.VITE_UNSPLASH_ACCESS_KEY
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00])
    const fetchMock = vi.fn(async () =>
      new Response(new Uint8Array(bytes), {
        headers: { 'Content-Type': 'image/jpeg' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const Route = await importRoute('./pexels')
    const request = new Request(
      'https://ship-fast.ai/api/pexels?query=a%20craft%20beer%20brewery%20with%20taproom%20tours&w=800&h=600&seed=a-craft-beer-brewery',
    )

    const response = await Route.options.server.handlers.GET({ request })

    expect(Route.path).toBe('/api/pexels')
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('image/jpeg')
    expect(response.headers.get('Cache-Control')).toContain(
      'max-age=31536000, immutable',
    )
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes)
    const pollinationsCall = fetchMock.mock.calls.find(([url]) =>
      url.toString().includes('image.pollinations.ai/prompt/'),
    )
    expect(pollinationsCall).toBeDefined()
  })

  it('caps oversized dimensions to the max of 1024 in the Pollinations request', async () => {
    delete process.env.PEXELS_API_KEY
    delete process.env.VITE_PEXELS_API_KEY
    delete process.env.UNSPLASH_ACCESS_KEY
    delete process.env.VITE_UNSPLASH_ACCESS_KEY
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = input.toString()
      if (url.includes('image.pollinations.ai/prompt/')) {
        return new Response(new Uint8Array([1]), {
          headers: { 'Content-Type': 'image/jpeg' },
        })
      }
      return new Response('cache miss', { status: 404 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const Route = await importRoute('./pexels')
    const request = new Request(
      'https://ship-fast.ai/api/pexels?query=hero&w=5000&h=200&seed=hero',
    )

    await Route.options.server.handlers.GET({ request })

    const pollinationsCall = fetchMock.mock.calls.find(([url]) =>
      url.toString().includes('image.pollinations.ai/prompt/'),
    )
    expect(pollinationsCall).toBeDefined()
    const url = new URL(pollinationsCall![0] as string)
    expect(url.searchParams.get('width')).toBe('1024')
    expect(url.searchParams.get('height')).toBe('200')
  })

  it('falls back to Picsum when Pollinations fails and no stock providers are configured', async () => {
    delete process.env.PEXELS_API_KEY
    delete process.env.VITE_PEXELS_API_KEY
    delete process.env.UNSPLASH_ACCESS_KEY
    delete process.env.VITE_UNSPLASH_ACCESS_KEY
    const fetchMock = vi.fn().mockRejectedValue(new Error('upstream down'))
    vi.stubGlobal('fetch', fetchMock)
    const Route = await importRoute('./pexels')
    const request = new Request(
      'https://ship-fast.ai/api/pexels?query=taproom%20tour&w=640&h=480&seed=hero',
    )

    const response = await Route.options.server.handlers.GET({ request })

    expect(response.status).toBe(302)
    const location = response.headers.get('Location') ?? ''
    expect(location).toContain('picsum.photos/seed/')
    expect(response.headers.get('Cache-Control')).toContain('max-age=3600')
  })
})
