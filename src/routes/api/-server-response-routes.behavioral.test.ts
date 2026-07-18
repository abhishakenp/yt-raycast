import { beforeEach, describe, expect, it, vi } from 'vitest'

const routeMocks = vi.hoisted(() => ({
  billing: vi.fn(),
  brandProfile: vi.fn(),
  checkout: vi.fn(),
  lakebedPublish: vi.fn(),
  sessionCreate: vi.fn(),
  sessionDownload: vi.fn(),
  sessionExport: vi.fn(),
  githubPush: vi.fn(),
  previewRaw: vi.fn(),
  sectionEdit: vi.fn(),
  sessionStream: vi.fn(),
  sessionApi: vi.fn(),
  translate: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path: string) => (options: Record<string, unknown>) => ({ options, path }),
}))

vi.mock('@/features/billing/server/billing-api-response', () => ({
  createBillingApiResponse: routeMocks.billing,
}))

vi.mock('@/features/brand/server/brand-profile-response', () => ({
  createBrandProfileResponse: routeMocks.brandProfile,
}))

vi.mock('@/features/billing/server/checkout-api-response', () => ({
  createCheckoutApiResponse: routeMocks.checkout,
}))

vi.mock('@/features/deployments/server/lakebed-publish-response', () => ({
  createLakebedPublishResponse: routeMocks.lakebedPublish,
}))

vi.mock('@/features/session/server/session-create-response', () => ({
  createSessionCreateResponse: routeMocks.sessionCreate,
}))

vi.mock('@/features/exports/server/export-api-response', () => ({
  createSessionDownloadResponse: routeMocks.sessionDownload,
  createSessionExportResponse: routeMocks.sessionExport,
}))

vi.mock('@/features/github/server/github-push-response', () => ({
  createGitHubPushResponse: routeMocks.githubPush,
}))

vi.mock('@/features/session/server/session-preview-raw-response', () => ({
  createSessionPreviewRawResponse: routeMocks.previewRaw,
}))

vi.mock('@/features/editing/server/section-edit-response', () => ({
  createSectionEditResponse: routeMocks.sectionEdit,
}))

vi.mock('@/features/session/server/session-event-stream-route', () => ({
  createSessionEventStreamResponse: routeMocks.sessionStream,
}))

vi.mock('@/features/session/server/session-api-response-route', () => ({
  createSessionApiResponse: routeMocks.sessionApi,
}))

vi.mock('@/features/localization/server/translate-response', () => ({
  createTranslateResponse: routeMocks.translate,
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

describe('API server response route wrappers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.each([
    [
      './billing-overview',
      '/api/billing-overview',
      'GET',
      routeMocks.billing,
      ['billing-overview'],
    ],
    ['./credits', '/api/credits', 'GET', routeMocks.billing, ['credits']],
    [
      './subscription-status',
      '/api/subscription-status',
      'GET',
      routeMocks.billing,
      ['subscription-status'],
    ],
    [
      './brand-profile',
      '/api/brand-profile',
      'GET',
      routeMocks.brandProfile,
      [],
    ],
    [
      './checkout.start',
      '/api/checkout/start',
      'POST',
      routeMocks.checkout,
      [],
    ],
    ['./translate', '/api/translate', 'POST', routeMocks.translate, []],
  ] as const)(
    'delegates %s to its response helper',
    async (modulePath, routePath, method, helper, trailingArgs) => {
      helper.mockResolvedValue(new Response(`${routePath} response`))
      const Route = await importRoute(modulePath)
      const request = new Request(`https://ship-fast.io${routePath}`, {
        method,
      })

      const response = await Route.options.server.handlers[method]({ request })

      expect(Route.path).toBe(routePath)
      expect(response.status).toBe(200)
      expect(await response.text()).toBe(`${routePath} response`)
      expect(helper).toHaveBeenCalledWith(request, ...trailingArgs)
    },
  )

  it('delegates Lakebed deployment publishing with a real session id from Convex', async () => {
    routeMocks.lakebedPublish.mockResolvedValue(new Response('deploy response'))
    const Route = await importRoute('./sessions.$sessionId.deploy.lakebed')
    const request = new Request(
      `https://ship-fast.io/api/sessions/${realSessionId}/deploy/lakebed`,
      { method: 'POST' },
    )

    const response = await Route.options.server.handlers.POST({
      params: { sessionId: realSessionId },
      request,
    })

    expect(Route.path).toBe('/api/sessions/$sessionId/deploy/lakebed')
    expect(await response.text()).toBe('deploy response')
    expect(routeMocks.lakebedPublish).toHaveBeenCalledWith(
      request,
      realSessionId,
    )
  })

  it('delegates export download with real session and target params from Convex', async () => {
    routeMocks.sessionDownload.mockResolvedValue(new Response('download body'))
    const Route = await importRoute('./sessions.$sessionId.download.$target')
    const request = new Request(
      `https://ship-fast.io/api/sessions/${realSessionId}/download/html`,
    )

    const response = await Route.options.server.handlers.GET({
      params: { sessionId: realSessionId, target: 'html' },
      request,
    })

    expect(Route.path).toBe('/api/sessions/$sessionId/download/$target')
    expect(await response.text()).toBe('download body')
    expect(routeMocks.sessionDownload).toHaveBeenCalledWith(
      realSessionId,
      'html',
      request,
    )
  })

  it.each([
    [
      './sessions.$sessionId.export',
      '/api/sessions/$sessionId/export',
      'POST',
      routeMocks.sessionExport,
      'export response',
    ],
    [
      './sessions.$sessionId.stream',
      '/api/sessions/$sessionId/stream',
      'GET',
      routeMocks.sessionStream,
      'stream response',
    ],
  ] as const)(
    'delegates %s with session id and request',
    async (modulePath, routePath, method, helper, body) => {
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
      expect(helper).toHaveBeenCalledWith(realSessionId, request)
    },
  )

  it('delegates GitHub push with request first and real session id second', async () => {
    routeMocks.githubPush.mockResolvedValue(new Response('github response'))
    const Route = await importRoute('./sessions.$sessionId.github.push')
    const request = new Request(
      `https://ship-fast.io/api/sessions/${realSessionId}/github/push`,
      { method: 'POST' },
    )

    const response = await Route.options.server.handlers.POST({
      params: { sessionId: realSessionId },
      request,
    })

    expect(Route.path).toBe('/api/sessions/$sessionId/github/push')
    expect(await response.text()).toBe('github response')
    expect(routeMocks.githubPush).toHaveBeenCalledWith(request, realSessionId)
  })

  it('delegates preview raw without requiring a request object', async () => {
    routeMocks.previewRaw.mockResolvedValue(new Response('raw html'))
    const Route = await importRoute('./sessions.$sessionId.preview-raw')
    const request = new Request(
      `https://ship-fast.io/api/sessions/${realSessionId}/preview-raw`,
    )

    const response = await Route.options.server.handlers.GET({
      params: { sessionId: realSessionId },
      request,
    })

    expect(Route.path).toBe('/api/sessions/$sessionId/preview-raw')
    expect(await response.text()).toBe('raw html')
    expect(routeMocks.previewRaw).toHaveBeenCalledWith(realSessionId)
  })

  it('loads section editing lazily and delegates with the real session id', async () => {
    routeMocks.sectionEdit.mockResolvedValue(new Response('section edit'))
    const Route = await importRoute('./sessions.$sessionId.section-edit')
    const request = new Request(
      `https://ship-fast.io/api/sessions/${realSessionId}/section-edit`,
      { method: 'POST' },
    )

    const response = await Route.options.server.handlers.POST({
      params: { sessionId: realSessionId },
      request,
    })

    expect(Route.path).toBe('/api/sessions/$sessionId/section-edit')
    expect(await response.text()).toBe('section edit')
    expect(routeMocks.sectionEdit).toHaveBeenCalledWith(realSessionId, request)
  })

  it('delegates the session API route with a real session id from Convex', async () => {
    routeMocks.sessionApi.mockResolvedValue(new Response('session api'))
    const Route = await importRoute('./sessions.$sessionId')
    const request = new Request(
      `https://ship-fast.io/api/sessions/${realSessionId}`,
    )

    const response = await Route.options.server.handlers.GET({
      params: { sessionId: realSessionId },
      request,
    })

    expect(Route.path).toBe('/api/sessions/$sessionId')
    expect(await response.text()).toBe('session api')
    expect(routeMocks.sessionApi).toHaveBeenCalledWith(realSessionId)
  })
})
