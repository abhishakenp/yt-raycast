// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { Mock } from 'vitest'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CommercePanel } from './CommercePanel'

type CommercePanelConfig = {
  adminUrl?: string
  backendUrl?: string
  errorMessage?: string
  productCount: number
  status: string
  storefrontUrl?: string
}

type CommercePanelHandoff = {
  adminUrl: string
  backendUrl: string
  storefrontUrl: string
  tenantId: string
}

type CommercePanelTestState = {
  config: CommercePanelConfig
  handoff: CommercePanelHandoff | undefined
  hostedMedusaConfig: {
    backendUrl?: string
    enabled?: boolean
  }
  isHostedMedusaConfigLoading: boolean
  provisionCommerce: Mock
  useCommerceController: Mock
}

const commerceState = vi.hoisted<CommercePanelTestState>(() => ({
  config: {
    errorMessage: 'Medusa Store API is unavailable: fetch failed',
    productCount: 0,
    status: 'ready',
  },
  handoff: undefined,
  hostedMedusaConfig: {},
  isHostedMedusaConfigLoading: false,
  provisionCommerce: vi.fn(),
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
      provisionCommerce: commerceState.provisionCommerce,
    }
  },
  useHostedMedusaConfig: () => ({
    config: commerceState.hostedMedusaConfig,
    isLoading: commerceState.isHostedMedusaConfigLoading,
  }),
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
    commerceState.hostedMedusaConfig = {}
    commerceState.isHostedMedusaConfigLoading = false
    commerceState.useCommerceController.mockClear()
    commerceState.provisionCommerce.mockReset()
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

  it('offers Medusa storefront and admin links without exposing credentials', () => {
    commerceState.handoff = {
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
  })

  it('requires a user-created admin account before enabling commerce', () => {
    commerceState.config = { productCount: 0, status: 'setup' }
    render(<CommercePanel sessionId="session_123" />)

    const button = screen.getByRole('button', { name: 'Enable Commerce' })
    expect(button.hasAttribute('disabled')).toBe(true)

    fireEvent.change(screen.getByLabelText('Admin email'), {
      target: { value: 'owner@store.test' },
    })
    fireEvent.change(screen.getByLabelText('Admin password'), {
      target: { value: 'user-created-password' },
    })
    expect(button.hasAttribute('disabled')).toBe(false)
    fireEvent.click(button)

    expect(commerceState.provisionCommerce).toHaveBeenCalledWith({
      email: 'owner@store.test',
      password: 'user-created-password',
    })
  })

  it('uses hosted Medusa setup without asking for a user-created admin account', () => {
    commerceState.config = { productCount: 0, status: 'setup' }
    commerceState.hostedMedusaConfig = {
      backendUrl: 'https://medusa.devliv.io',
      enabled: true,
    }

    render(<CommercePanel sessionId="session_123" />)

    expect(screen.queryByLabelText('Admin email')).toBeNull()
    expect(screen.queryByLabelText('Admin password')).toBeNull()
    const button = screen.getByRole('button', { name: 'Enable Commerce' })
    expect(button.hasAttribute('disabled')).toBe(false)

    fireEvent.click(button)

    expect(commerceState.provisionCommerce).toHaveBeenCalledWith(undefined)
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

  it('opens the generated storefront when persisted Medusa storefront points at the API root', () => {
    commerceState.config = {
      adminUrl: 'http://localhost:9116/app',
      backendUrl: 'http://localhost:9116',
      productCount: 3,
      status: 'ready',
      storefrontUrl: 'http://localhost:9116',
    }

    render(<CommercePanel sessionId="session_123" />)

    expect(
      screen
        .getByRole('link', { name: 'Open storefront' })
        .getAttribute('href'),
    ).toBe('/generate/session_123')
    expect(
      screen.getByRole('link', { name: 'Open admin' }).getAttribute('href'),
    ).toBe('http://localhost:9116/app')
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
