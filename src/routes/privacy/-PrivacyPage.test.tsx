// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

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

import { PrivacyPage } from './-PrivacyPage'

describe('PrivacyPage legal content', () => {
  afterEach(cleanup)

  it('renders controller, contact, effective date, and data-use sections without unresolved placeholders', () => {
    const view = render(<PrivacyPage />)
    const shell = view.getByTestId('marketing-shell')

    expect(shell.getAttribute('data-footer')).toBe('true')
    expect(view.getByRole('heading', { name: 'Privacy policy' })).toBeTruthy()
    expect(view.getByText('2026-06-27')).toHaveProperty('tagName', 'TIME')
    expect(view.getByText('Surya Remanan and Abhishek Pandey')).toBeTruthy()
    expect(
      view
        .getAllByRole('link', { name: 'hello@ship-fast.io' })[0]
        ?.getAttribute('href'),
    ).toBe('mailto:hello%40ship-fast.io')
    expect(
      view.getByRole('heading', { name: '3. What we collect' }),
    ).toBeTruthy()
    expect(
      view.getByRole('heading', {
        name: '5. Legal bases (EEA, UK, Switzerland, and similar)',
      }),
    ).toBeTruthy()
    expect(view.queryByText(/pending incorporation/i)).toBeNull()
    expect(view.queryByText(/TODO/i)).toBeNull()
    expect(view.queryByText(/TBD/i)).toBeNull()
  })
})
