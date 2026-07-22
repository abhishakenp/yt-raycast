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
      const request = new Request(`https://ship-fast.io${routePath}`, {
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
        `https://ship-fast.io${routePath.replace('$sessionId', realSessionId)}`,
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
      `https://ship-fast.io/api/sessions/${realSessionId}/history/1/restore`,
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
      `https://ship-fast.io/api/sessions/${realSessionId}/medusa-config`,
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
      `https://ship-fast.io/api/sessions/${realSessionId}/medusa-products`,
    )

    const response = await Route.options.server.handlers.GET({
      params: { sessionId: realSessionId },
      request,
    })

    expect(Route.path).toBe('/api/sessions/$sessionId/medusa-products')
    expect(await response.text()).toBe('medusa products')
    expect(routeMocks.medusaProducts).toHaveBeenCalledWith(realSessionId, {
      env: process.env,
      fetch,
      metaEnv: {},
    })
  })

  it('replays the Medusa provision body and supplies a Convex-backed client', async () => {
    routeMocks.convexClient.mutation.mockRejectedValueOnce(
      new Error('FORBIDDEN: not owner'),
    )
    routeMocks.medusaProvision.mockImplementation(
      async (_sessionId, request, client, deps) => {
        expect(await request.text()).toBe(
          '{"products":[{"title":"Portland Pale Ale"}]}',
        )
        await expect(client.query('session:read', {})).resolves.toBeNull()
        await expect(client.mutation('session:update', {})).resolves.toEqual({
          sessionId: realSessionId,
        })
        expect(deps).toMatchObject({ env: process.env, fetch, metaEnv: {} })
        return new Response('provisioned')
      },
    )
    const Route = await importRoute('./sessions.$sessionId.provision.medusa')
    const request = new Request(
      `https://ship-fast.io/api/sessions/${realSessionId}/provision/medusa`,
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
      { env: process.env, fetch, metaEnv: {} },
    )
  })

  it('rejects clone requests with missing seed URL before starting the clone job', async () => {
    const Route = await importRoute('./clone')
    const request = new Request('https://ship-fast.io/api/clone', {
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
    const request = new Request('https://ship-fast.io/api/clone', {
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
    const request = new Request('https://ship-fast.io/api/clone', {
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

  it('falls back to deterministic Picsum redirects for real prompt-like image queries without provider keys', async () => {
    delete process.env.PEXELS_API_KEY
    delete process.env.VITE_PEXELS_API_KEY
    delete process.env.UNSPLASH_ACCESS_KEY
    delete process.env.VITE_UNSPLASH_ACCESS_KEY
    const Route = await importRoute('./pexels')
    const request = new Request(
      'https://ship-fast.io/api/pexels?query=a%20craft%20beer%20brewery%20with%20taproom%20tours&w=5000&h=50&seed=a-craft-beer-brewery',
    )

    const response = await Route.options.server.handlers.GET({ request })

    expect(Route.path).toBe('/api/pexels')
    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe(
      'https://picsum.photos/seed/a-craft-beer-brewery/2400/100',
    )
    expect(response.headers.get('Cache-Control')).toContain('max-age=3600')
  })

  it('redirects to the selected Pexels image when provider search succeeds', async () => {
    process.env.PEXELS_API_KEY = 'pexels-key'
    delete process.env.UNSPLASH_ACCESS_KEY
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          photos: [
            {
              src: {
                large: 'https://images.pexels.test/large.jpg',
                large2x: 'https://images.pexels.test/large2x.jpg',
                medium: 'https://images.pexels.test/medium.jpg',
                original: 'https://images.pexels.test/original.jpg',
              },
            },
          ],
        }),
        { headers: { 'Content-Type': 'application/json' } },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)
    const Route = await importRoute('./pexels')
    const request = new Request(
      'https://ship-fast.io/api/pexels?q=taproom%20tour&w=1600&h=900&seed=hero',
    )

    const response = await Route.options.server.handlers.GET({ request })

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe(
      'https://images.pexels.test/original.jpg',
    )
    const [searchUrl, searchInit] = fetchMock.mock.calls[0]
    expect(searchUrl.toString()).toBe(
      'https://api.pexels.com/v1/search?query=taproom+tour&per_page=15&orientation=landscape',
    )
    expect(searchInit).toEqual({ headers: { Authorization: 'pexels-key' } })
  })

  it('falls back from an unavailable Pexels provider to Unsplash before Picsum', async () => {
    process.env.PEXELS_API_KEY = 'pexels-key'
    process.env.UNSPLASH_ACCESS_KEY = 'unsplash-key'
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('{}', { status: 503 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            results: [
              {
                urls: {
                  regular: 'https://images.unsplash.test/photo.jpg?auto=format',
                },
              },
            ],
          }),
          { headers: { 'Content-Type': 'application/json' } },
        ),
      )
    vi.stubGlobal('fetch', fetchMock)
    const Route = await importRoute('./pexels')
    const request = new Request(
      'https://ship-fast.io/api/pexels?query=seasonal%20beer%20release&w=1200&h=700&seed=release',
    )

    const response = await Route.options.server.handlers.GET({ request })

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe(
      'https://images.unsplash.test/photo.jpg?auto=format&w=1200&h=700&fit=crop',
    )
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const [unsplashUrl, unsplashInit] = fetchMock.mock.calls[1]
    expect(unsplashUrl.toString()).toBe(
      'https://api.unsplash.com/search/photos?query=seasonal+beer+release&per_page=15&orientation=landscape',
    )
    expect(unsplashInit).toEqual({
      headers: { Authorization: 'Client-ID unsplash-key' },
    })
  })

  it('falls back to Picsum when image providers return malformed HTML bodies', async () => {
    process.env.PEXELS_API_KEY = 'pexels-key'
    process.env.UNSPLASH_ACCESS_KEY = 'unsplash-key'
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response('<!doctype html><title>Pexels down</title>', {
          headers: { 'Content-Type': 'text/html' },
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response('<!doctype html><title>Unsplash down</title>', {
          headers: { 'Content-Type': 'text/html' },
          status: 200,
        }),
      )
    vi.stubGlobal('fetch', fetchMock)
    const Route = await importRoute('./pexels')
    const request = new Request(
      'https://ship-fast.io/api/pexels?query=taproom%20tour&w=640&h=480&seed=hero',
    )

    const response = await Route.options.server.handlers.GET({ request })

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe(
      'https://picsum.photos/seed/hero/640/480',
    )
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
