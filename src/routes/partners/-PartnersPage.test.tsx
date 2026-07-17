// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PartnersPage } from './-PartnersPage'

vi.mock('@/features/partners/components/PartnerPortal', () => ({
  PartnerPortal: () => <main>Partner portal content</main>,
}))

vi.mock('@/routes/pricing/-MarketingShell', () => ({
  MarketingShell: ({
    children,
    footer,
  }: {
    children: React.ReactNode
    footer?: boolean
  }) => (
    <div data-footer={String(footer)} data-testid="marketing-shell">
      {children}
    </div>
  ),
}))

describe('PartnersPage', () => {
  afterEach(() => cleanup())

  it('renders the partner portal inside marketing navigation and footer', () => {
    render(<PartnersPage />)

    expect(screen.getByText('Partner portal content')).toBeTruthy()
    expect(screen.getByTestId('marketing-shell').dataset.footer).toBe('true')
  })
})
