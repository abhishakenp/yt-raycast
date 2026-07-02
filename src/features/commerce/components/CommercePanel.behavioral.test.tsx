// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CommercePanel } from './CommercePanel'

const commerceConfig = vi.hoisted(() => ({
  current: undefined as
    | {
        adminUrl?: string
        backendUrl?: string
        configJson?: string
        errorMessage?: string
        productCount?: number
        status?: string
        storefrontUrl?: string
      }
    | undefined,
}))

const fetchState = vi.hoisted(() => ({
  impl: null as null | (() => Promise<Response>),
}))

vi.mock('convex/react', () => ({
  useQuery: vi.fn(() => commerceConfig.current),
  useMutation: vi.fn(() => vi.fn()),
}))

vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    sessions: { getCommerceConfig: 'sessions.getCommerceConfig' },
  },
}))

vi.mock('@/features/session/services/anonymous-owner-secret', () => ({
  readAnonymousOwnerSecret: () => undefined,
}))

const okResponse = (body: unknown): Response =>
  ({
    ok: true,
    json: async () => body,
  }) as Response

const errorResponse = (body: unknown): Response =>
  ({
    ok: false,
    json: async () => body,
  }) as Response

describe('CommercePanel (behavioral)', () => {
  beforeEach(() => {
    commerceConfig.current = undefined
    fetchState.impl = () =>
      Promise.resolve(
        okResponse({
          handoff: {
            adminEmail: 'admin@store.test',
            adminPassword: 'secret-password',
            adminUrl: 'https://admin.medusa.test',
            backendUrl: 'https://backend.medusa.test',
            storefrontUrl: 'https://store.medusa.test',
            tenantId: 'session_123',
          },
        }),
      )
    vi.stubGlobal(
      'fetch',
      vi.fn((...args: unknown[]) => {
        void args
        return fetchState.impl?.()
      }),
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('shows the provision button when commerce is not yet provisioned', () => {
    commerceConfig.current = { status: 'pending', productCount: 0 }

    render(<CommercePanel sessionId="session_123" />)

    expect(screen.getByRole('button', { name: /Enable Commerce/ })).toBeTruthy()
    expect(screen.queryByText('Live ready')).toBeNull()
  })

  it('shows the synced product count when provisioned', () => {
    commerceConfig.current = {
      adminUrl: 'https://admin.medusa.test',
      backendUrl: 'https://backend.medusa.test',
      productCount: 7,
      status: 'ready',
      storefrontUrl: 'https://store.medusa.test',
    }

    render(<CommercePanel sessionId="session_123" />)

    expect(screen.getByText('Products')).toBeTruthy()
    expect(screen.getByText('7')).toBeTruthy()
  })

  it('triggers the provision flow when the provision button is clicked', async () => {
    commerceConfig.current = { status: 'pending', productCount: 0 }

    render(<CommercePanel sessionId="session_123" />)

    fireEvent.click(screen.getByRole('button', { name: /Enable Commerce/ }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/sessions/session_123/provision/medusa',
        expect.objectContaining({ method: 'POST' }),
      )
    })
  })

  it('shows handoff admin and storefront URLs after provisioning succeeds', async () => {
    commerceConfig.current = { status: 'pending', productCount: 0 }

    render(<CommercePanel sessionId="session_123" />)

    fireEvent.click(screen.getByRole('button', { name: /Enable Commerce/ }))

    expect(await screen.findByText('Medusa handoff')).toBeTruthy()
    expect(
      screen
        .getByRole('link', { name: 'Open storefront' })
        .getAttribute('href'),
    ).toBe('https://store.medusa.test')
    expect(
      screen.getByRole('link', { name: 'Open admin' }).getAttribute('href'),
    ).toBe('https://admin.medusa.test')
  })

  it('renders handoff URLs as clickable links that open in a new tab', async () => {
    commerceConfig.current = { status: 'pending', productCount: 0 }

    render(<CommercePanel sessionId="session_123" />)

    fireEvent.click(screen.getByRole('button', { name: /Enable Commerce/ }))

    const storefront = await screen.findByRole('link', {
      name: 'Open storefront',
    })
    const admin = screen.getByRole('link', { name: 'Open admin' })

    expect(storefront.tagName).toBe('A')
    expect(storefront.getAttribute('target')).toBe('_blank')
    expect(storefront.getAttribute('rel')).toBe('noreferrer')
    expect(admin.tagName).toBe('A')
    expect(admin.getAttribute('target')).toBe('_blank')
  })

  it('displays the live checkout warning when the config carries an error message', () => {
    commerceConfig.current = {
      adminUrl: 'https://admin.medusa.test',
      backendUrl: 'https://backend.medusa.test',
      errorMessage: 'Medusa Store API is unavailable: fetch failed',
      productCount: 0,
      status: 'ready',
      storefrontUrl: 'https://store.medusa.test',
    }

    render(<CommercePanel sessionId="session_123" />)

    expect(screen.getByText('Medusa Store API is unavailable.')).toBeTruthy()
    expect(
      screen.queryByText('Medusa Store API is unavailable: fetch failed'),
    ).toBeNull()
    expect(screen.getByText('Visual ready')).toBeTruthy()
    expect(screen.queryByText('Live ready')).toBeNull()
  })

  it('shows a success indicator when the ready state has no warning', () => {
    commerceConfig.current = {
      adminUrl: 'https://admin.medusa.test',
      backendUrl: 'https://backend.medusa.test',
      productCount: 3,
      status: 'ready',
      storefrontUrl: 'https://store.medusa.test',
    }

    render(<CommercePanel sessionId="session_123" />)

    expect(screen.getByText('Live ready')).toBeTruthy()
    expect(screen.getByText('Live commerce ready')).toBeTruthy()
    expect(screen.queryByText('Visual ready')).toBeNull()
  })

  it('shows a provisioning progress label while the provision request is in flight', async () => {
    commerceConfig.current = { status: 'pending', productCount: 0 }
    let resolveFetch!: () => void
    fetchState.impl = () =>
      new Promise<Response>((resolve) => {
        resolveFetch = () => resolve(okResponse({ handoff: undefined })) as void
      })

    render(<CommercePanel sessionId="session_123" />)

    fireEvent.click(screen.getByRole('button', { name: /Enable Commerce/ }))

    expect(await screen.findByText('Enabling...')).toBeTruthy()
    expect(
      screen.getByRole('button', { name: /Enabling\.\.\./ }),
    ).toHaveProperty('disabled', true)

    resolveFetch()
  })

  it('shows the error message when provisioning fails', async () => {
    commerceConfig.current = { status: 'pending', productCount: 0 }
    fetchState.impl = () =>
      Promise.resolve(errorResponse({ error: 'Medusa provisioning blew up' }))

    render(<CommercePanel sessionId="session_123" />)

    fireEvent.click(screen.getByRole('button', { name: /Enable Commerce/ }))

    expect(await screen.findByText('Medusa provisioning blew up')).toBeTruthy()
  })

  it('shows the EcommercifyTransformOverlay while transformation is in progress', async () => {
    commerceConfig.current = { status: 'pending', productCount: 0 }
    let resolveFetch!: () => void
    fetchState.impl = () =>
      new Promise<Response>((resolve) => {
        resolveFetch = () => resolve(okResponse({ handoff: undefined })) as void
      })

    render(<CommercePanel sessionId="session_123" />)

    fireEvent.click(screen.getByRole('button', { name: /Enable Commerce/ }))

    expect(
      await screen.findByTestId('ecommercify-transform', {}, { timeout: 3000 }),
    ).toBeTruthy()

    resolveFetch()

    await waitFor(
      () => {
        expect(screen.queryByTestId('ecommercify-transform')).toBeNull()
      },
      { timeout: 3000 },
    )
  })
})
