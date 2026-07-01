// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    ...props
  }: {
    children: ReactNode
    to: string
    [key: string]: unknown
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('../pricing/-MarketingShell', () => ({
  MarketingShell: ({
    children,
    footer,
  }: {
    children: ReactNode
    footer?: boolean
  }) => (
    <div data-footer={footer ? 'true' : 'false'} data-testid="marketing-shell">
      {children}
    </div>
  ),
}))

import { TermsPage } from './-TermsPage'

describe('TermsPage legal placeholders', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders resolved legal copy without unresolved incorporation placeholders', () => {
    const view = render(<TermsPage />)
    const shell = view.getByTestId('marketing-shell')

    expect(shell.getAttribute('data-footer')).toBe('true')
    expect(view.getByRole('heading', { name: 'Terms of service' })).toBeTruthy()
    expect(view.getByText(/Livio Gama/)).toBeTruthy()
    expect(
      view
        .getByRole('link', { name: 'privacy@ship-fast.devliv.io' })
        .getAttribute('href'),
    ).toBe('mailto:privacy%40ship-fast.devliv.io')
    expect(
      view.getByRole('link', { name: 'Privacy policy' }).getAttribute('href'),
    ).toBe('/privacy')
    expect(view.queryByText(/pending incorporation/i)).toBeNull()
    expect(view.queryByText(/Incorporation jurisdiction:/)).toBeNull()
    expect(view.queryByText(/Company registration number:/)).toBeNull()
  })
})
