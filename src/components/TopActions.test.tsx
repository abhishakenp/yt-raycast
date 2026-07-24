// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

type ChildrenProps = {
  children?: ReactNode
}

type LinkMockProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  children?: ReactNode
  to: string
}

const topActionMocks = vi.hoisted(() => ({
  authControls: vi.fn(({ autoOpen, wrapProvider }) => (
    <button
      type="button"
      data-testid="homepage-auth-controls"
      data-auto-open={String(autoOpen)}
      data-wrap-provider={String(wrapProvider)}
    >
      Sign in
    </button>
  )),
}))

vi.mock('@tanstack/react-router', () => {
  function LinkMock({ children, to, ...props }: LinkMockProps) {
    return (
      <a href={to} {...props}>
        {children}
      </a>
    )
  }

  return { Link: LinkMock }
})

vi.mock('@/components/HomepageAuthControls', () => ({
  HomepageAuthControls: topActionMocks.authControls,
}))

vi.mock('@/features/home/components/HomePage', () => {
  throw new Error('TopActions must import glass primitives directly')
})

vi.mock('@clerk/tanstack-react-start', () => {
  function ShowMock({ children }: ChildrenProps) {
    return <>{children}</>
  }

  function SignInButtonMock({ children }: ChildrenProps) {
    return <span>{children ?? 'Sign in'}</span>
  }

  return {
    Show: ShowMock,
    SignInButton: SignInButtonMock,
    UserButton: () => <span>Account</span>,
  }
})

async function importTopActions(
  publishableKey: string | undefined,
  partnersEnabled = false,
) {
  vi.resetModules()
  vi.unstubAllEnvs()
  vi.stubEnv('VITE_DISABLE_CLERK', '')
  vi.stubEnv('VITE_DUB_PARTNERS_ENABLED', String(partnersEnabled))
  if (publishableKey !== undefined) {
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', publishableKey)
    vi.stubEnv('CLERK_PUBLISHABLE_KEY', '')
  } else {
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', '')
    vi.stubEnv('CLERK_PUBLISHABLE_KEY', '')
  }
  return import('./TopActions')
}

describe('TopActions', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllEnvs()
    vi.resetModules()
    topActionMocks.authControls.mockClear()
  })

  it('always exposes pricing as a normal navigation link', async () => {
    const { TopActions } = await importTopActions(undefined)

    render(<TopActions />)

    expect(screen.getByRole('navigation', { name: /primary/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /pricing/i })).toHaveProperty(
      'pathname',
      '/pricing',
    )
    expect(screen.queryByRole('link', { name: /partners/i })).toBeNull()
  })

  it('shows the partners link only while the client feature is enabled', async () => {
    const { TopActions } = await importTopActions(undefined, true)

    render(<TopActions />)

    expect(screen.getByRole('link', { name: 'Partners' })).toHaveProperty(
      'pathname',
      '/partners',
    )
  })

  it('keeps sign-in inert when Clerk is not configured', async () => {
    const { TopActions } = await importTopActions(undefined)

    render(<TopActions />)
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.queryByTestId('homepage-auth-controls')).toBeNull()
    expect(topActionMocks.authControls).not.toHaveBeenCalled()
  })

  it('renders one sign-in control through homepage auth controls when Clerk is configured', async () => {
    const { TopActions } = await importTopActions('pk_test_top_actions')

    render(<TopActions />)

    await waitFor(() =>
      expect(
        screen
          .getByTestId('homepage-auth-controls')
          .getAttribute('data-auto-open'),
      ).toBe('false'),
    )
    // AppProviders mounts ClerkConvexProvider on `/` from first paint, so the
    // homepage's auth controls must NOT wrap their own ClerkProvider (otherwise
    // Clerk throws "multiple <ClerkProvider>").
    expect(
      screen.getByTestId('homepage-auth-controls').dataset.wrapProvider,
    ).toBe('false')
    expect(screen.getAllByRole('button', { name: /sign in/i })).toHaveLength(1)
    expect(topActionMocks.authControls).toHaveBeenCalledWith(
      expect.objectContaining({
        autoOpen: false,
        wrapProvider: false,
      }),
      undefined,
    )
  })
})
