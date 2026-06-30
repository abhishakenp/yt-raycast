// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const authState = vi.hoisted(() => ({
  getToken: vi.fn(),
  requestClerkSignIn: vi.fn(),
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  requestClerkSignIn: authState.requestClerkSignIn,
  useOptionalAuth: () => ({ getToken: authState.getToken }),
}))

vi.mock('./-MarketingShell', () => ({
  MarketingShell: ({ children }: { children: ReactNode }) => (
    <main>{children}</main>
  ),
}))

vi.mock('./-pricing-main-html', () => ({
  PRICING_PAGE_MAIN_HTML: `
    <section data-testid="pricing-copy">One plan. Everything included.</section>
    <button data-pricing-checkout-cta="true">Start Pro</button>
    <div data-faq-item>
      <button type="button" data-faq-trigger aria-expanded="false" aria-controls="pricing-faq-test">
        What is included in Pro?
      </button>
      <p id="pricing-faq-test" hidden>Everything needed to ship.</p>
    </div>
  `,
}))

import { PricingPage } from './-PricingPage'

describe('PricingPage', () => {
  beforeEach(() => {
    authState.getToken.mockReset()
    authState.getToken.mockResolvedValue(null)
    authState.requestClerkSignIn.mockReset()
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Sign in before checkout.' }),
    }) as unknown as typeof fetch
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('starts checkout only from pricing CTA nodes', async () => {
    const { getByText } = render(<PricingPage />)

    fireEvent.click(getByText('One plan. Everything included.'))
    expect(fetch).not.toHaveBeenCalled()

    fireEvent.click(getByText('Start Pro'))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/checkout/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'subscription',
          tier: 'pro',
        }),
      })
    })
    expect(authState.requestClerkSignIn).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status').textContent).toContain(
      'Sign in before checkout.',
    )
  })

  it('sends an auth token when one is available for checkout', async () => {
    authState.getToken.mockResolvedValue('convex-token')
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: 'razorpay checkout is not configured.' }),
    }) as unknown as typeof fetch
    const { getByText } = render(<PricingPage />)

    fireEvent.click(getByText('Start Pro'))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/checkout/start', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer convex-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'subscription',
          tier: 'pro',
        }),
      })
    })
    expect(authState.requestClerkSignIn).not.toHaveBeenCalled()
    expect(screen.getByRole('status').textContent).toContain(
      'razorpay checkout is not configured.',
    )
  })

  it('exposes pricing FAQ questions as expandable button controls', () => {
    const { getByRole, getByText } = render(<PricingPage />)

    const question = getByRole('button', { name: 'What is included in Pro?' })
    const answer = getByText('Everything needed to ship.')

    expect(question.getAttribute('aria-expanded')).toBe('false')
    expect(answer.hidden).toBe(true)

    fireEvent.click(question)
    expect(question.getAttribute('aria-expanded')).toBe('true')
    expect(answer.hidden).toBe(false)

    fireEvent.click(question)
    expect(question.getAttribute('aria-expanded')).toBe('false')
    expect(answer.hidden).toBe(true)
  })
})
