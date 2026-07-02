// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const topActionMocks = vi.hoisted(() => ({
  authControls: vi.fn(({ autoOpen }: { autoOpen?: boolean }) => (
    <div
      data-testid="homepage-auth-controls"
      data-auto-open={String(autoOpen)}
    />
  )),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode
    to: string
    [key: string]: unknown
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('@/components/HomepageAuthControls', () => ({
  HomepageAuthControls: topActionMocks.authControls,
}))

vi.mock('@clerk/tanstack-react-start', () => ({
  Show: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignInButton: ({ children }: { children?: React.ReactNode }) => (
    <span>{children ?? 'Sign in'}</span>
  ),
  UserButton: () => <span>Account</span>,
}))

const importTopActions = async (publishableKey: string | undefined) => {
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
  })

  it('keeps sign-in inert when Clerk is not configured', async () => {
    const { TopActions } = await importTopActions(undefined)

    render(<TopActions />)
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.queryByTestId('homepage-auth-controls')).toBeNull()
    expect(topActionMocks.authControls).not.toHaveBeenCalled()
  })

  it('loads the homepage auth controls and auto-opens sign-in when Clerk is configured', async () => {
    const { TopActions } = await importTopActions('pk_test_top_actions')

    render(<TopActions />)
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() =>
      expect(
        screen
          .getByTestId('homepage-auth-controls')
          .getAttribute('data-auto-open'),
      ).toBe('true'),
    )
    expect(topActionMocks.authControls).toHaveBeenCalledWith(
      expect.objectContaining({ autoOpen: true }),
      undefined,
    )
  })
})
