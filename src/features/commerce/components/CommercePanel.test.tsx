// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CommercePanel } from './CommercePanel'

const commerceState = vi.hoisted(() => ({
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
}))

vi.mock('../hooks/useCommerceController', () => ({
  useCommerceController: () => ({
    commerceError: undefined,
    commerceHandoff: commerceState.handoff,
    config: {
      errorMessage: 'Medusa Store API is unavailable: fetch failed',
      productCount: 0,
      status: 'ready',
    },
    isSaving: false,
    provisionCommerce: vi.fn(),
  }),
}))

describe('CommercePanel', () => {
  afterEach(() => {
    cleanup()
    commerceState.handoff = undefined
  })

  it('shows visual readiness with a live checkout warning', () => {
    render(<CommercePanel sessionId="session_123" />)

    expect(screen.getByText('Visual ready')).toBeTruthy()
    expect(
      screen.getByText(
        'Commerce enabled. Live checkout needs Medusa Store API configuration.',
      ),
    ).toBeTruthy()
    expect(screen.queryByText('Automatic')).toBeNull()
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
