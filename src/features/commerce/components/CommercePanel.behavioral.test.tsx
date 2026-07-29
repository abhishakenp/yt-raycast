// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CommercePanel } from './CommercePanel'

type AccessState = {
  current: unknown
}

type MutationState = {
  enableCommerce: (args: unknown) => Promise<unknown>
  requestAdminSso: (args: unknown) => Promise<unknown>
}

const accessState = vi.hoisted<AccessState>(() => ({ current: undefined }))
const mutationState = vi.hoisted<MutationState>(() => ({
  enableCommerce: async () => ({
    commerceInstanceId: 'instance_1',
    commerceStoreId: 'store_1',
    instanceCreated: true,
    storeCreated: true,
  }),
  requestAdminSso: async () => ({
    url: 'https://admin.medusa.test/?ssoToken=token',
  }),
}))

vi.mock('convex/react', () => ({
  useQuery: vi.fn(() => accessState.current),
  useMutation: vi.fn((ref: string) => {
    if (String(ref).includes('enableCommerce')) {
      return (args: unknown) => mutationState.enableCommerce(args)
    }
    return (args: unknown) => mutationState.requestAdminSso(args)
  }),
}))

vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    commerceInstances: {
      enableCommerce: 'commerceInstances.enableCommerce',
      getCommerceAccess: 'commerceInstances.getCommerceAccess',
      requestAdminSso: 'commerceInstances.requestAdminSso',
    },
  },
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  requestClerkSignIn: vi.fn(),
}))

describe('CommercePanel (behavioral)', () => {
  beforeEach(() => {
    accessState.current = {
      authState: 'paid',
      enabled: false,
      instanceStatus: null,
      storeStatus: null,
    }
    mutationState.enableCommerce = async () => ({
      commerceInstanceId: 'instance_1',
      commerceStoreId: 'store_1',
      instanceCreated: true,
      storeCreated: true,
    })
    mutationState.requestAdminSso = async () => ({
      url: 'https://admin.medusa.test/?ssoToken=token',
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('calls the enableCommerce mutation with the session id when clicked', async () => {
    const enableSpy = vi.fn(async () => ({
      commerceInstanceId: 'instance_1',
      commerceStoreId: 'store_1',
      instanceCreated: true,
      storeCreated: true,
    }))
    mutationState.enableCommerce = enableSpy

    render(<CommercePanel sessionId="session_123" />)
    fireEvent.click(screen.getByRole('button', { name: 'Enable Commerce' }))

    await waitFor(() => {
      expect(enableSpy).toHaveBeenCalledWith({ sessionId: 'session_123' })
    })
  })

  it('shows a provisioning progress label while enabling is in flight', async () => {
    let resolveEnable!: () => void
    mutationState.enableCommerce = () =>
      new Promise((resolve) => {
        resolveEnable = () =>
          resolve({
            commerceInstanceId: 'instance_1',
            commerceStoreId: 'store_1',
            instanceCreated: true,
            storeCreated: true,
          })
      })

    render(<CommercePanel sessionId="session_123" />)
    fireEvent.click(screen.getByRole('button', { name: 'Enable Commerce' }))

    expect(await screen.findByText('Enabling...')).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Enabling...' }),
    ).toHaveProperty('disabled', true)

    resolveEnable()
  })

  it('shows the EcommercifyTransformOverlay while transformation is in progress', async () => {
    let resolveEnable!: () => void
    mutationState.enableCommerce = () =>
      new Promise((resolve) => {
        resolveEnable = () =>
          resolve({
            commerceInstanceId: 'instance_1',
            commerceStoreId: 'store_1',
            instanceCreated: true,
            storeCreated: true,
          })
      })

    render(<CommercePanel sessionId="session_123" />)
    fireEvent.click(screen.getByRole('button', { name: 'Enable Commerce' }))

    expect(
      await screen.findByTestId('ecommercify-transform', {}, { timeout: 3000 }),
    ).toBeTruthy()

    resolveEnable()

    await waitFor(
      () => {
        expect(screen.queryByTestId('ecommercify-transform')).toBeNull()
      },
      { timeout: 3000 },
    )
  })

  it('surfaces the error message when enabling commerce fails, without any admin credential fields ever appearing', async () => {
    mutationState.enableCommerce = async () => {
      throw new Error('A paid subscription is required to enable commerce.')
    }

    render(<CommercePanel sessionId="session_123" />)
    fireEvent.click(screen.getByRole('button', { name: 'Enable Commerce' }))

    expect(
      await screen.findByText(
        'A paid subscription is required to enable commerce.',
      ),
    ).toBeTruthy()
    expect(screen.queryByLabelText('Admin email')).toBeNull()
    expect(screen.queryByLabelText('Admin password')).toBeNull()
  })

  it('requests an admin SSO URL and opens it in a new tab when Open admin is clicked', async () => {
    accessState.current = {
      authState: 'paid',
      enabled: true,
      instanceStatus: 'ready',
      storeStatus: 'ready',
      adminUrl: 'https://admin.medusa.test',
      storefrontUrl: 'https://store.medusa.test',
    }
    const requestSpy = vi.fn(async () => ({
      url: 'https://admin.medusa.test/?ssoToken=one-time-token',
    }))
    mutationState.requestAdminSso = requestSpy
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    render(<CommercePanel sessionId="session_123" />)
    fireEvent.click(screen.getByRole('button', { name: 'Open admin' }))

    await waitFor(() => {
      expect(requestSpy).toHaveBeenCalledWith({ sessionId: 'session_123' })
    })
    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith(
        'https://admin.medusa.test/?ssoToken=one-time-token',
        '_blank',
        'noopener,noreferrer',
      )
    })
  })

  it('surfaces an admin SSO failure without navigating anywhere', async () => {
    accessState.current = {
      authState: 'paid',
      enabled: true,
      instanceStatus: 'ready',
      storeStatus: 'ready',
      adminUrl: 'https://admin.medusa.test',
      storefrontUrl: 'https://store.medusa.test',
    }
    mutationState.requestAdminSso = async () => {
      throw new Error('Admin SSO token rejected: EXPIRED')
    }
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    render(<CommercePanel sessionId="session_123" />)
    fireEvent.click(screen.getByRole('button', { name: 'Open admin' }))

    expect(
      await screen.findByText('Admin SSO token rejected: EXPIRED'),
    ).toBeTruthy()
    expect(openSpy).not.toHaveBeenCalled()
  })
})
