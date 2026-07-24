// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const clerkMocks = vi.hoisted(() => ({
  provider: vi.fn(({ children }) => (
    <div data-testid="clerk-provider">{children}</div>
  )),
}))

const authMocks = vi.hoisted(() => ({
  getToken: vi.fn(),
}))

vi.mock('@clerk/tanstack-react-start', () => ({
  ClerkProvider: clerkMocks.provider,
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  useOptionalAuth: () => ({
    getToken: authMocks.getToken,
    isLoaded: true,
    isSignedIn: Boolean((window as Window & { Clerk?: TestClerk }).Clerk?.user),
  }),
}))

vi.mock('@/app/providers/clerk-appearance', () => ({
  clerkFrostedGlassAppearance: { variables: { colorPrimary: '#fff' } },
}))

type TestClerk = {
  openSignIn?: ReturnType<typeof vi.fn>
  user?: unknown
  mountUserButton?: ReturnType<typeof vi.fn>
  unmountUserButton?: ReturnType<typeof vi.fn>
}

async function importControls(publishableKey: string | undefined) {
  vi.resetModules()
  vi.unstubAllEnvs()
  vi.stubEnv('VITE_DISABLE_CLERK', '')
  if (publishableKey !== undefined) {
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', publishableKey)
    vi.stubEnv('CLERK_PUBLISHABLE_KEY', '')
  } else {
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', '')
    vi.stubEnv('CLERK_PUBLISHABLE_KEY', '')
  }
  return import('./HomepageAuthControls')
}

function setClerk(clerk: TestClerk) {
  Object.defineProperty(window, 'Clerk', {
    configurable: true,
    writable: true,
    value: clerk,
  })
}

describe('HomepageAuthControls', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    vi.resetModules()
    delete (window as Window & { Clerk?: TestClerk }).Clerk
    document.body.replaceChildren()
    clerkMocks.provider.mockClear()
    authMocks.getToken.mockReset()
  })

  it('does not render auth UI when Clerk is not configured', async () => {
    const { HomepageAuthControls } = await importControls(undefined)

    const { container } = render(<HomepageAuthControls />)

    expect(container.childElementCount).toBe(0)
    expect(screen.queryByRole('button', { name: /sign in/i })).toBeNull()
  })

  it('wraps the sign-in control in ClerkProvider when configured', async () => {
    setClerk({ openSignIn: vi.fn() })
    const { HomepageAuthControls } = await importControls('pk_test_homepage')

    render(<HomepageAuthControls />)

    expect(screen.getByTestId('clerk-provider')).toBeTruthy()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy()
    expect(clerkMocks.provider).toHaveBeenCalledWith(
      expect.objectContaining({ publishableKey: 'pk_test_homepage' }),
      undefined,
    )
  })

  it('renders the visible sign-in control with the liquid-glass pill structure', async () => {
    setClerk({ openSignIn: vi.fn() })
    const { HomepageAuthControls } = await importControls('pk_test_homepage')

    const { container } = render(<HomepageAuthControls wrapProvider={false} />)
    const button = screen.getByRole('button', { name: /sign in/i })

    expect(button.classList.contains('pill')).toBe(true)
    expect(button.classList.contains('pill--top-actions')).toBe(true)
    expect(container.querySelector('.pill__body')?.textContent).toContain(
      'Sign in',
    )
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBe(7)
  })

  it('opens Clerk sign-in from the visible control', async () => {
    const openSignIn = vi.fn()
    setClerk({ openSignIn })
    const { HomepageAuthControls } = await importControls('pk_test_homepage')

    render(<HomepageAuthControls wrapProvider={false} />)
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(openSignIn).toHaveBeenCalledTimes(1)
  })

  it('auto-opens sign-in once when used as a lazy auth trigger', async () => {
    const openSignIn = vi.fn()
    setClerk({ openSignIn })
    const { HomepageAuthControls } = await importControls('pk_test_homepage')

    const { rerender } = render(
      <HomepageAuthControls
        autoOpen
        renderButton={false}
        wrapProvider={false}
      />,
    )
    rerender(
      <HomepageAuthControls
        autoOpen
        renderButton={false}
        wrapProvider={false}
      />,
    )

    expect(openSignIn).toHaveBeenCalledTimes(1)
  })

  it('mounts and unmounts the Clerk user button for signed-in users', async () => {
    const mountUserButton = vi.fn()
    const unmountUserButton = vi.fn()
    setClerk({
      user: { id: 'user_123' },
      mountUserButton,
      unmountUserButton,
    })
    const { HomepageAuthControls } = await importControls('pk_test_homepage')

    const { unmount } = render(<HomepageAuthControls wrapProvider={false} />)

    await waitFor(() => expect(mountUserButton).toHaveBeenCalledTimes(1))
    expect(screen.queryByRole('button', { name: /sign in/i })).toBeNull()

    const mountedElement = mountUserButton.mock.calls[0]?.[0]
    unmount()

    expect(unmountUserButton).toHaveBeenCalledWith(mountedElement)
  })

  it('shows a Pro badge on the mounted Clerk user button when billing is active', async () => {
    const mountUserButton = vi.fn()
    authMocks.getToken.mockResolvedValue('convex-token')
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ subscription: { active: true } }),
    }) as unknown as typeof fetch
    setClerk({
      user: { id: 'user_123' },
      mountUserButton,
    })
    const { HomepageAuthControls } = await importControls('pk_test_homepage')

    render(<HomepageAuthControls wrapProvider={false} />)

    await waitFor(() => expect(screen.getByText('PRO')).toBeTruthy())
    expect(screen.getByLabelText('Pro plan active')).toBeTruthy()
    expect(fetch).toHaveBeenCalledWith('/api/billing-overview', {
      headers: { Authorization: 'Bearer convex-token' },
    })
  })

  it('refreshes the Pro badge when billing status changes after checkout', async () => {
    authMocks.getToken.mockResolvedValue('convex-token')
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ subscription: { active: false } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ subscription: { active: true } }),
      }) as unknown as typeof fetch
    setClerk({
      user: { id: 'user_123' },
      mountUserButton: vi.fn(),
    })
    const { HomepageAuthControls } = await importControls('pk_test_homepage')
    const { billingStatusChangedEventName } =
      await import('@/features/billing/billing-events')

    render(<HomepageAuthControls wrapProvider={false} />)

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
    expect(screen.queryByText('PRO')).toBeNull()

    window.dispatchEvent(new CustomEvent(billingStatusChangedEventName))

    await waitFor(() => expect(screen.getByText('PRO')).toBeTruthy())
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('hides the app content from assistive tech while the Clerk modal is open', async () => {
    setClerk({ openSignIn: vi.fn() })
    const appContent = document.createElement('main')
    appContent.id = 'ship-fast-app-content'
    appContent.textContent = 'Homepage'
    document.body.append(appContent)
    const { HomepageAuthControls } = await importControls('pk_test_homepage')

    render(<HomepageAuthControls wrapProvider={false} />)

    const modal = document.createElement('div')
    modal.className = 'cl-modalContent'
    modal.setAttribute('role', 'dialog')
    document.body.append(modal)

    await waitFor(() => {
      expect(appContent.getAttribute('aria-hidden')).toBe('true')
      expect(appContent.hasAttribute('inert')).toBe(true)
    })

    modal.remove()

    await waitFor(() => {
      expect(appContent.hasAttribute('aria-hidden')).toBe(false)
      expect(appContent.hasAttribute('inert')).toBe(false)
    })
  })

  it('restores app content accessibility if auth controls unmount while the Clerk modal exists', async () => {
    setClerk({ openSignIn: vi.fn() })
    const appContent = document.createElement('main')
    appContent.id = 'ship-fast-app-content'
    appContent.textContent = 'Homepage'
    document.body.append(appContent)
    const { HomepageAuthControls } = await importControls('pk_test_homepage')

    const { unmount } = render(<HomepageAuthControls wrapProvider={false} />)

    const modal = document.createElement('div')
    modal.className = 'cl-modalContent'
    modal.setAttribute('role', 'dialog')
    document.body.append(modal)

    await waitFor(() => {
      expect(appContent.getAttribute('aria-hidden')).toBe('true')
      expect(appContent.hasAttribute('inert')).toBe(true)
    })

    unmount()

    expect(appContent.hasAttribute('aria-hidden')).toBe(false)
    expect(appContent.hasAttribute('inert')).toBe(false)
  })
})
