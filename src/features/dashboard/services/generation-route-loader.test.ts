import { describe, expect, it, vi } from 'vitest'

import type { DashboardGenerationView } from '@/features/dashboard/components/Dashboard'
import {
  isGenerationRouteViewReady,
  loadGenerationRouteView,
} from './generation-route-loader'

const sessionId = (
  value: string,
): DashboardGenerationView['session']['sessionId'] =>
  value as DashboardGenerationView['session']['sessionId']

const readyView = (
  overrides: Partial<DashboardGenerationView> = {},
): DashboardGenerationView => ({
  events: [],
  homeModule: {
    moduleKey: 'home',
    source: '<html><body>Ready</body></html>',
    status: 'succeeded',
    updatedAt: 1,
  },
  latestPreview: null,
  session: {
    sessionId: sessionId('session_ready'),
    status: 'preview_ready',
    previewVersion: 1,
    prompt: 'Build a ready site',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    elapsed: 1200,
    isPrivate: false,
    themeOverride: null,
    selectedBrandLogo: null,
    designReferenceUrls: [],
    designReferenceNotes: '',
  },
  siteSpec: null,
  tasks: [],
  ...overrides,
})

const runningView = (): DashboardGenerationView =>
  readyView({
    homeModule: {
      moduleKey: 'home',
      source: '',
      status: 'running',
      updatedAt: 1,
    },
    session: {
      ...readyView().session,
      status: 'running',
    },
    tasks: [
      { taskKey: 'homepage', title: 'Generate homepage', status: 'running' },
    ],
  })

describe('generation route loader', () => {
  it('treats renderable preview_ready views as route-ready', () => {
    expect(isGenerationRouteViewReady(readyView())).toBe(true)
    expect(isGenerationRouteViewReady(runningView())).toBe(false)
    expect(isGenerationRouteViewReady(null)).toBe(true)
  })

  it('returns an already-ready route view immediately', async () => {
    const query = vi.fn().mockResolvedValue(readyView())

    const view = await loadGenerationRouteView({
      client: { query },
      sessionId: 'session_ready',
    })

    expect(view?.session.status).toBe('preview_ready')
    expect(query).toHaveBeenCalledTimes(1)
  })

  it('waits in the route loader until Convex returns a ready preview', async () => {
    vi.useFakeTimers()
    try {
      const query = vi
        .fn()
        .mockResolvedValueOnce(runningView())
        .mockResolvedValueOnce(readyView())

      const request = loadGenerationRouteView({
        client: { query },
        maxWaitMs: 1000,
        pollMs: 250,
        sessionId: 'session_eventually_ready',
      })

      await vi.advanceTimersByTimeAsync(250)
      const view = await request

      expect(view?.session.status).toBe('preview_ready')
      expect(query).toHaveBeenCalledTimes(2)
    } finally {
      vi.useRealTimers()
    }
  })

  it('returns the latest running view when the route loader reaches its wait budget', async () => {
    vi.useFakeTimers()
    try {
      const query = vi.fn().mockResolvedValue(runningView())

      const request = loadGenerationRouteView({
        client: { query },
        maxWaitMs: 250,
        pollMs: 250,
        sessionId: 'session_still_running',
      })

      await vi.advanceTimersByTimeAsync(250)
      const view = await request

      expect(view?.session.status).toBe('running')
      expect(query).toHaveBeenCalledTimes(2)
    } finally {
      vi.useRealTimers()
    }
  })

  it('returns undefined instead of route-crashing when the first query fetch fails', async () => {
    const query = vi.fn().mockRejectedValue(new Error('fetch failed'))

    const view = await loadGenerationRouteView({
      client: { query },
      sessionId: 'session_network_unavailable',
    })

    expect(view).toBeUndefined()
    expect(query).toHaveBeenCalledTimes(1)
  })

  it('returns the latest observed view when a later query fetch fails', async () => {
    vi.useFakeTimers()
    try {
      const query = vi
        .fn()
        .mockResolvedValueOnce(runningView())
        .mockRejectedValueOnce(new Error('fetch failed'))

      const request = loadGenerationRouteView({
        client: { query },
        maxWaitMs: 1000,
        pollMs: 250,
        sessionId: 'session_transient_fetch_failure',
      })

      await vi.advanceTimersByTimeAsync(250)
      const view = await request

      expect(view?.session.status).toBe('running')
      expect(query).toHaveBeenCalledTimes(2)
    } finally {
      vi.useRealTimers()
    }
  })
})
