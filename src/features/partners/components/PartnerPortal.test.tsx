// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PartnerPortal } from './PartnerPortal'

const mocks = vi.hoisted(() => ({
  controller: vi.fn(),
  embed: vi.fn(() => <div data-testid="dub-embed" />),
  retry: vi.fn(),
  signIn: vi.fn(),
}))

vi.mock('@dub/embed-react', () => ({
  DubEmbed: mocks.embed,
}))

vi.mock('@/features/partners/hooks/usePartnerPortalController', () => ({
  usePartnerPortalController: mocks.controller,
}))

describe('PartnerPortal', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('prompts a signed-out user to authenticate', () => {
    mocks.controller.mockReturnValue({
      retry: mocks.retry,
      signIn: mocks.signIn,
      status: 'signed_out',
    })

    render(<PartnerPortal />)
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(mocks.signIn).toHaveBeenCalledTimes(1)
    expect(mocks.embed).not.toHaveBeenCalled()
  })

  it('offers retry after an embed token failure', () => {
    mocks.controller.mockReturnValue({
      retry: mocks.retry,
      signIn: mocks.signIn,
      status: 'error',
    })

    render(<PartnerPortal />)
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(mocks.retry).toHaveBeenCalledTimes(1)
  })

  it('renders the Dub referrals dashboard with the public token', () => {
    mocks.controller.mockReturnValue({
      publicToken: 'dub_public_token',
      retry: mocks.retry,
      signIn: mocks.signIn,
      status: 'ready',
    })

    render(<PartnerPortal />)

    expect(screen.getByTestId('dub-embed')).toBeTruthy()
    expect(mocks.embed).toHaveBeenCalledWith(
      {
        className: 'min-h-[720px] w-full',
        data: 'referrals',
        options: {
          theme: 'dark',
          themeOptions: { backgroundColor: '#06070d' },
        },
        token: 'dub_public_token',
      },
      undefined,
    )
  })
})
