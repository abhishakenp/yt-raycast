// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react'
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
import { MARKETING_CONSENT_KEY } from '@/features/partners/lib/marketing-consent'

describe('PrivacyPage legal content', () => {
  afterEach(cleanup)

  it('renders controller, contact, effective date, and data-use sections without unresolved placeholders', () => {
    const view = render(<PrivacyPage />)
    const shell = view.getByTestId('marketing-shell')

    expect(shell.getAttribute('data-footer')).toBe('true')
    expect(view.getByRole('heading', { name: 'Privacy policy' })).toBeTruthy()
    expect(view.getByText('2026-07-17')).toHaveProperty('tagName', 'TIME')
    expect(view.getByText('Surya Remanan and Abhishek Pandey')).toBeTruthy()
    expect(
      view
        .getAllByRole('link', { name: 'hello@ship-fast.ai' })[0]
        ?.getAttribute('href'),
    ).toBe('mailto:hello%40ship-fast.ai')
    expect(
      view.getByRole('heading', { name: '3. What we collect' }),
    ).toBeTruthy()
    expect(
      view.getByRole('heading', {
        name: '5. Legal bases (EEA, UK, Switzerland, and similar)',
      }),
    ).toBeTruthy()
    expect(view.container.textContent).toMatch(
      /SHA-256 hash of your IP address/i,
    )
    expect(view.container.textContent).toMatch(/cryptographic 32-byte salt/i)
    expect(view.container.textContent).toMatch(
      /automatically (remove|cleared).*90 days/i,
    )
    expect(view.container.textContent).toMatch(/legitimate interests/i)
    expect(view.queryByText(/pending incorporation/i)).toBeNull()
    expect(view.queryByText(/TODO/i)).toBeNull()
    expect(view.queryByText(/TBD/i)).toBeNull()
  })

  it('discloses Dub partner processing and lets visitors withdraw marketing consent', () => {
    window.localStorage.setItem(MARKETING_CONSENT_KEY, 'accepted')
    document.cookie = 'dub_id=click_123; path=/'
    const view = render(<PrivacyPage />)

    expect(
      view.getByRole('heading', {
        name: '3.5 Partner attribution and partner programme',
      }),
    ).toBeTruthy()
    expect(view.container.textContent).toMatch(/up to 30 days/i)
    expect(view.container.textContent).toMatch(/first-source attribution/i)
    expect(view.container.textContent).toMatch(/commissions and payouts/i)
    expect(view.container.textContent).toMatch(/Stripe and Razorpay/i)

    fireEvent.click(
      view.getByRole('button', { name: 'Withdraw marketing consent' }),
    )

    expect(window.localStorage.getItem(MARKETING_CONSENT_KEY)).toBe('declined')
    expect(document.cookie).not.toContain('dub_id=')
  })
})
