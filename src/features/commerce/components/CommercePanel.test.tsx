// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import type { Mock } from 'vitest'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CommercePanel } from './CommercePanel'

type CommerceAccessValue =
  | { authState: 'signed-out' }
  | { authState: 'unpaid' }
  | {
      authState: 'paid'
      enabled: boolean
      instanceStatus: string | null
      storeStatus: string | null
      backendUrl?: string
      adminUrl?: string
      storefrontUrl?: string
      publishableKey?: string
      productCount?: number
    }
  | undefined

type CommerceAccessTestState = {
  access: CommerceAccessValue
  adminError: string | undefined
  enableCommerce: Mock
  enableError: string | undefined
  isEnabling: boolean
  isOpeningAdmin: boolean
  openAdmin: Mock
  useCommerceAccess: Mock
}

const commerceState = vi.hoisted<CommerceAccessTestState>(() => ({
  access: { authState: 'signed-out' },
  adminError: undefined,
  enableCommerce: vi.fn(),
  enableError: undefined,
  isEnabling: false,
  isOpeningAdmin: false,
  openAdmin: vi.fn(),
  useCommerceAccess: vi.fn(),
}))

vi.mock('../hooks/useCommerceAccess', () => ({
  useCommerceAccess: (...args: unknown[]) => {
    commerceState.useCommerceAccess(...args)
    return {
      access: commerceState.access,
      adminError: commerceState.adminError,
      enableCommerce: commerceState.enableCommerce,
      enableError: commerceState.enableError,
      isEnabling: commerceState.isEnabling,
      isOpeningAdmin: commerceState.isOpeningAdmin,
      openAdmin: commerceState.openAdmin,
    }
  },
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  requestClerkSignIn: vi.fn(),
}))

describe('CommercePanel', () => {
  afterEach(() => {
    cleanup()
    commerceState.access = { authState: 'signed-out' }
    commerceState.adminError = undefined
    commerceState.enableError = undefined
    commerceState.isEnabling = false
    commerceState.isOpeningAdmin = false
    commerceState.enableCommerce.mockReset()
    commerceState.openAdmin.mockReset()
    commerceState.useCommerceAccess.mockClear()
  })

  it('shows a sign-in prompt and no admin credential fields for signed-out visitors', () => {
    commerceState.access = { authState: 'signed-out' }
    render(<CommercePanel sessionId="session_123" />)

    expect(screen.getByRole('button', { name: /Sign in/ })).toBeTruthy()
    expect(screen.queryByLabelText('Admin email')).toBeNull()
    expect(screen.queryByLabelText('Admin password')).toBeNull()
    expect(screen.queryByRole('button', { name: /Enable Commerce/ })).toBeNull()
  })

  it('shows an upgrade prompt for signed-in users without an active subscription', () => {
    commerceState.access = { authState: 'unpaid' }
    render(<CommercePanel sessionId="session_123" />)

    expect(screen.getByRole('link', { name: /Upgrade/ })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Enable Commerce/ })).toBeNull()
  })

  it('shows Enable Commerce for a paid user who has not enabled commerce yet', () => {
    commerceState.access = {
      authState: 'paid',
      enabled: false,
      instanceStatus: null,
      storeStatus: null,
    }
    render(<CommercePanel sessionId="session_123" />)

    const button = screen.getByRole('button', { name: 'Enable Commerce' })
    expect(button.hasAttribute('disabled')).toBe(false)
    expect(screen.queryByLabelText('Admin email')).toBeNull()
    expect(screen.queryByLabelText('Admin password')).toBeNull()
  })

  it('shows a deterministic provisioning state while the instance is being created', () => {
    commerceState.access = {
      authState: 'paid',
      enabled: true,
      instanceStatus: 'provisioning',
      storeStatus: 'not_enabled',
    }
    render(<CommercePanel sessionId="session_123" />)

    expect(screen.getByText('Provisioning...')).toBeTruthy()
    expect(
      screen.getByText(/updates automatically — no need to refresh/),
    ).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Enable Commerce' })).toBeNull()
  })

  it('shows a degraded warning without hiding the storefront when the instance is degraded', () => {
    commerceState.access = {
      authState: 'paid',
      enabled: true,
      instanceStatus: 'degraded',
      storeStatus: 'ready',
    }
    render(<CommercePanel sessionId="session_123" />)

    expect(screen.getByText('Degraded')).toBeTruthy()
    expect(
      screen.getByText(/Commerce is degraded/),
    ).toBeTruthy()
  })

  it('shows storefront and Open Admin action once fully ready, with no credential UI', () => {
    commerceState.access = {
      authState: 'paid',
      enabled: true,
      instanceStatus: 'ready',
      storeStatus: 'ready',
      adminUrl: 'https://admin.medusa.test',
      backendUrl: 'https://backend.medusa.test',
      storefrontUrl: 'https://store.medusa.test',
      productCount: 5,
    }
    render(<CommercePanel sessionId="session_123" />)

    expect(screen.getByText('Live ready')).toBeTruthy()
    expect(
      screen
        .getByRole('link', { name: 'Open storefront' })
        .getAttribute('href'),
    ).toBe('https://store.medusa.test')
    expect(screen.getByRole('button', { name: 'Open admin' })).toBeTruthy()
    expect(screen.queryByLabelText('Admin email')).toBeNull()
    expect(screen.queryByLabelText('Admin password')).toBeNull()
    expect(screen.getByText('5')).toBeTruthy()
  })

  it('falls back to the visual product count before any live product sync', () => {
    commerceState.access = {
      authState: 'paid',
      enabled: false,
      instanceStatus: null,
      storeStatus: null,
    }
    render(<CommercePanel sessionId="session_123" visualProductCount={6} />)

    expect(screen.getByText('Products')).toBeTruthy()
    expect(screen.getByText('6')).toBeTruthy()
  })

  it('surfaces an enable error message', () => {
    commerceState.access = {
      authState: 'paid',
      enabled: false,
      instanceStatus: null,
      storeStatus: null,
    }
    commerceState.enableError = 'Enabling commerce failed.'
    render(<CommercePanel sessionId="session_123" />)

    expect(screen.getByText('Enabling commerce failed.')).toBeTruthy()
  })

  it('surfaces an admin SSO error message without exposing credentials', () => {
    commerceState.access = {
      authState: 'paid',
      enabled: true,
      instanceStatus: 'ready',
      storeStatus: 'ready',
      adminUrl: 'https://admin.medusa.test',
    }
    commerceState.adminError = 'Could not open the admin.'
    render(<CommercePanel sessionId="session_123" />)

    expect(screen.getByText('Could not open the admin.')).toBeTruthy()
  })
})
