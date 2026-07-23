import { api } from '../../../../convex/_generated/api'
import type { DashboardGenerationView } from '@/features/dashboard/components/Dashboard'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type GenerationRouteLoaderClient = {
  query: (
    query: typeof api.sessions.getGenerationView,
    args: { lookup: string },
  ) => Promise<DashboardGenerationView | null>
}

type LoadGenerationRouteViewOptions = {
  client?: GenerationRouteLoaderClient
  maxWaitMs?: number
  pollMs?: number
  sessionId: string
  signal?: AbortSignal
}

const DEFAULT_MAX_WAIT_MS = 60_000
const DEFAULT_POLL_MS = 250
const QUERY_TIMEOUT_MS = 10_000

const delay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Route load aborted', 'AbortError'))
      return
    }

    const timeout = setTimeout(() => {
      signal?.removeEventListener('abort', abort)
      resolve()
    }, ms)
    const abort = () => {
      clearTimeout(timeout)
      reject(new DOMException('Route load aborted', 'AbortError'))
    }

    signal?.addEventListener('abort', abort, { once: true })
  })

const hasRenderableGenerationSource = (view: DashboardGenerationView) =>
  (typeof view.homeModule?.source === 'string' &&
    view.homeModule.source.trim().length > 0) ||
  (typeof view.latestPreview?.html === 'string' &&
    view.latestPreview.html.trim().length > 0)

export const isGenerationRouteViewReady = (
  view: DashboardGenerationView | null,
) =>
  view === null ||
  Boolean(view.session.errorCode) ||
  (view.session.status === 'preview_ready' &&
    hasRenderableGenerationSource(view))

export const loadGenerationRouteView = async ({
  client,
  maxWaitMs = DEFAULT_MAX_WAIT_MS,
  pollMs = DEFAULT_POLL_MS,
  sessionId,
  signal,
}: LoadGenerationRouteViewOptions) => {
  const deadline = Date.now() + maxWaitMs
  let latestView: DashboardGenerationView | null | undefined
  let routeClient = client

  while (!signal?.aborted) {
    try {
      routeClient ??= createRuntimeConvexHttpClient(QUERY_TIMEOUT_MS)
      latestView = await routeClient.query(api.sessions.getGenerationView, {
        lookup: sessionId,
      })
    } catch {
      if (signal?.aborted) {
        throw new DOMException('Route load aborted', 'AbortError')
      }
      return latestView
    }
    if (isGenerationRouteViewReady(latestView)) return latestView
    if (Date.now() >= deadline) return latestView
    await delay(pollMs, signal)
  }

  throw new DOMException('Route load aborted', 'AbortError')
}
