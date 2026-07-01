// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const authControlMock = vi.hoisted(() =>
  vi.fn(
    ({
      autoOpen,
      renderButton,
    }: {
      autoOpen?: boolean
      renderButton?: boolean
    }) => (
      <div
        data-auto-open={String(autoOpen)}
        data-render-button={String(renderButton)}
        data-testid="homepage-auth-controls"
      />
    ),
  ),
)

vi.mock('@/components/HomepageAuthControls', () => ({
  HomepageAuthControls: authControlMock,
}))

import { SignInModalHost } from './SignInModalHost'

describe('SignInModalHost', () => {
  afterEach(() => {
    cleanup()
    authControlMock.mockClear()
  })

  it('renders nothing before a sign-in request exists', () => {
    const { container } = render(<SignInModalHost requestId={0} />)

    expect(container.childElementCount).toBe(0)
    expect(authControlMock).not.toHaveBeenCalled()
  })

  it('lazy-renders homepage auth controls as an auto-open modal host after a request', async () => {
    render(<SignInModalHost requestId={7} />)

    const controls = await screen.findByTestId('homepage-auth-controls')
    expect(controls.getAttribute('data-auto-open')).toBe('true')
    expect(controls.getAttribute('data-render-button')).toBe('false')
  })
})
