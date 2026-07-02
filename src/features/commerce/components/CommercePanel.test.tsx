// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CommercePanel } from './CommercePanel'

const commerceState = vi.hoisted(() => ({
  config: {
    errorMessage: 'Medusa Store API is unavailable: fetch failed',
    productCount: 0,
    status: 'ready',
  } as {
    adminUrl?: string
    backendUrl?: string
    errorMessage?: string
    productCount: number
    status: string
    storefrontUrl?: string
  },
  handoff: undefined as
    | {
        adminEmail: string
        adminPassword: string
        adminUrl: string
        backendUrl: string
        storefrontUrl: string
        tenantId: string
      }
    | undefined,
  useCommerceController: vi.fn(),
}))

vi.mock('../hooks/useCommerceController', () => ({
  useCommerceController: (...args: unknown[]) => {
    commerceState.useCommerceController(...args)
    return {
      commerceError: undefined,
      commerceHandoff: commerceState.handoff,
      config: commerceState.config,
      isSaving: false,
      provisionCommerce: vi.fn(),
    }
  },
}))

describe('CommercePanel', () => {
  afterEach(() => {
    cleanup()
    commerceState.config = {
      errorMessage: 'Medusa Store API is unavailable: fetch failed',
      productCount: 0,
      status: 'ready',
    }
    commerceState.handoff = undefined
    commerceState.useCommerceController.mockClear()
  })

  it('shows visual readiness with a live checkout warning', () => {
    render(<CommercePanel sessionId="session_123" />)

    expect(screen.getByText('Visual ready')).toBeTruthy()
    expect(screen.getByText('Medusa Store API is unavailable.')).toBeTruthy()
    expect(
      screen.queryByText('Medusa Store API is unavailable: fetch failed'),
    ).toBeNull()
    expect(screen.queryByText('Automatic')).toBeNull()
  })

  it('shows a sanitized Store API failure instead of raw network details', () => {
    render(<CommercePanel sessionId="session_123" />)

    expect(screen.getByText('Medusa Store API is unavailable.')).toBeTruthy()
    expect(
      screen.queryByText('Medusa Store API is unavailable: fetch failed'),
    ).toBeNull()
    expect(
      screen.queryByText(
        'Commerce enabled. Live checkout needs Medusa Store API configuration.',
      ),
    ).toBeNull()
  })

  it('shows visual product count when live Medusa products are not synced yet', () => {
    render(<CommercePanel sessionId="session_123" visualProductCount={6} />)

    expect(screen.getByText('Products')).toBeTruthy()
    expect(screen.getByText('6')).toBeTruthy()
  })

  it('passes generated visual products into the commerce controller', () => {
    const visualProducts = [
      { handle: 'truffle-box', price: 79, title: 'Truffle Box' },
    ]

    render(
      <CommercePanel
        sessionId="session_123"
        visualProductCount={visualProducts.length}
        visualProducts={visualProducts}
      />,
    )

    expect(commerceState.useCommerceController).toHaveBeenCalledWith(
      'session_123',
      visualProducts,
    )
  })

  it('offers Medusa storefront and admin credentials when provisioning returns a handoff', () => {
    commerceState.handoff = {
      adminEmail: 'admin@store.test',
      adminPassword: 'secret-password',
      adminUrl: 'https://admin.medusa.test',
      backendUrl: 'https://backend.medusa.test',
      storefrontUrl: 'https://store.medusa.test',
      tenantId: 'session_123',
    }

    render(<CommercePanel sessionId="session_123" />)

    expect(
      screen
        .getByRole('link', { name: 'Open storefront' })
        .getAttribute('href'),
    ).toBe('https://store.medusa.test')
    expect(
      screen.getByRole('link', { name: 'Open admin' }).getAttribute('href'),
    ).toBe('https://admin.medusa.test')
    expect(screen.getByText('admin@store.test')).toBeTruthy()
    expect(screen.getByText('secret-password')).toBeTruthy()
  })

  it('keeps Medusa studio links available from persisted tenant config', () => {
    commerceState.config = {
      adminUrl: 'https://admin.persisted-medusa.test/app',
      backendUrl: 'https://backend.persisted-medusa.test',
      productCount: 3,
      status: 'ready',
      storefrontUrl: 'https://store.persisted-medusa.test',
    }

    render(<CommercePanel sessionId="session_123" />)

    expect(
      screen
        .getByRole('link', { name: 'Open storefront' })
        .getAttribute('href'),
    ).toBe('https://store.persisted-medusa.test')
    expect(
      screen.getByRole('link', { name: 'Open admin' }).getAttribute('href'),
    ).toBe('https://admin.persisted-medusa.test/app')
    expect(
      screen.queryByText(
        'Set Medusa backend, admin, and storefront URLs to unlock links.',
      ),
    ).toBeNull()
  })

  it('does not show persisted fallback localhost links when Medusa is not reachable', () => {
    commerceState.config = {
      adminUrl: 'http://localhost:7001',
      backendUrl: 'http://localhost:9000',
      errorMessage: 'Medusa Store API is unavailable: fetch failed',
      productCount: 0,
      status: 'ready',
      storefrontUrl: 'http://localhost:9000',
    }

    render(<CommercePanel sessionId="session_123" />)

    expect(screen.queryByRole('link', { name: 'Open storefront' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Open admin' })).toBeNull()
    expect(
      screen.getByText(
        'Set Medusa backend, admin, and storefront URLs to unlock links.',
      ),
    ).toBeTruthy()
  })

  it('does not show dead handoff links when no Medusa handoff exists', () => {
    render(<CommercePanel sessionId="session_123" />)

    expect(screen.queryByRole('link', { name: 'Open storefront' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Open admin' })).toBeNull()
    expect(
      screen.getByText(
        'Set Medusa backend, admin, and storefront URLs to unlock links.',
      ),
    ).toBeTruthy()
  })
})
