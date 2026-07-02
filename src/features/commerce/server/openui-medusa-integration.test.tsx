// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  IntegrationProvider,
  OpenUIMedusaContext,
} from '../../../../packages/ship-fast-blocks/src/integrations'

const MedusaProbe = () => (
  <OpenUIMedusaContext.Consumer>
    {(medusa) => (
      <output data-testid="medusa-state">
        {JSON.stringify({
          backendUrl: medusa.backendUrl,
          error: medusa.error,
          ready: medusa.ready,
          status: medusa.status,
        })}
      </output>
    )}
  </OpenUIMedusaContext.Consumer>
)

describe('OpenUI Medusa integration provider', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('uses the session-scoped Medusa config route and avoids the stale provision route', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          config: {
            backendUrl: 'https://backend.medusa.test',
            configJson: JSON.stringify({
              liveStoreApiReady: false,
              warning: 'Medusa Store API is unavailable: fetch failed',
            }),
            errorMessage: 'Medusa Store API is unavailable: fetch failed',
            status: 'ready',
            storefrontUrl: 'https://store.medusa.test',
          },
          enabled: true,
        }),
        { status: 200 },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    render(
      <IntegrationProvider medusa={{ enabled: true }} sessionId="session_123">
        <MedusaProbe />
      </IntegrationProvider>,
    )

    await waitFor(() => {
      const state = JSON.parse(
        screen.getByTestId('medusa-state').textContent ?? '{}',
      )
      expect(state.ready).toBe(true)
      expect(state.status).toBe('ready')
      expect(state.backendUrl).toBe('https://backend.medusa.test')
      expect(state.error).toBe('Medusa Store API is unavailable.')
    })
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/sessions/session_123/medusa-config',
      {
        headers: { Accept: 'application/json' },
      },
    )
    expect(fetchMock).not.toHaveBeenCalledWith(
      '/api/provision/medusa',
      expect.anything(),
    )
  })

  it('surfaces a stable error when the Medusa config route returns malformed HTML', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('<!doctype html><title>Medusa config unavailable</title>', {
        headers: { 'Content-Type': 'text/html' },
        status: 200,
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    render(
      <IntegrationProvider medusa={{ enabled: true }} sessionId="session_123">
        <MedusaProbe />
      </IntegrationProvider>,
    )

    await waitFor(() => {
      const state = JSON.parse(
        screen.getByTestId('medusa-state').textContent ?? '{}',
      )
      expect(state.ready).toBe(false)
      expect(state.status).toBe('error')
      expect(state.error).toBe('Medusa config check failed')
    })
    expect(screen.getByTestId('medusa-state').textContent).not.toMatch(
      /unexpected token|valid json|doctype|medusa config unavailable/i,
    )
  })
})
