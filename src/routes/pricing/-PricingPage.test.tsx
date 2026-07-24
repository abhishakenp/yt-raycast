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
  isSignedIn: false,
  requestClerkSignIn: vi.fn(),
}))

const confirmState = vi.hoisted(() => ({
  confirmRazorpaySubscriptionPayment: vi.fn(),
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  requestClerkSignIn: authState.requestClerkSignIn,
  useOptionalAuth: () => ({
    getToken: authState.getToken,
    isSignedIn: authState.isSignedIn,
  }),
}))

vi.mock('@/features/billing/client/razorpay-confirm', () => ({
  confirmRazorpaySubscriptionPayment:
    confirmState.confirmRazorpaySubscriptionPayment,
}))

vi.mock('./-MarketingShell', () => ({
  MarketingShell: ({ children }: { children: ReactNode }) => (
    <main>{children}</main>
  ),
}))

vi.mock('./-pricing-main-html', () => ({
  PRICING_PAGE_MAIN_HTML: `
    <section data-testid="pricing-copy">One plan. Everything included.</section>
    <button data-pricing-checkout-cta="true"><span>Start Pro</span></button>
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
    authState.isSignedIn = false
    authState.requestClerkSignIn.mockReset()
    confirmState.confirmRazorpaySubscriptionPayment.mockReset()
    confirmState.confirmRazorpaySubscriptionPayment.mockResolvedValue({
      active: true,
      status: 'authenticated',
      planId: 'plan_pro',
      providerSubscriptionId: 'sub_test_123',
    })
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

    expect(fetch).not.toHaveBeenCalled()
    expect(authState.requestClerkSignIn).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status').textContent).toContain(
      'Sign in before checkout.',
    )
  })

  it('sends an auth token when one is available for checkout', async () => {
    authState.isSignedIn = true
    authState.getToken.mockResolvedValue('convex-token')
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: 'razorpay checkout is not configured.' }),
    }) as unknown as typeof fetch
    const { getByText } = render(<PricingPage />)

    fireEvent.click(getByText('Start Pro'))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/payments/razorpay/start', {
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

  it('does not reopen Clerk when checkout rejects a signed-in session token', async () => {
    authState.isSignedIn = true
    authState.getToken.mockResolvedValue('convex-token')
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Sign in before checkout.' }),
    }) as unknown as typeof fetch
    const { getByText } = render(<PricingPage />)

    fireEvent.click(getByText('Start Pro'))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/payments/razorpay/start', {
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
      'Your signed-in session could not be verified.',
    )
  })

  it('opens Razorpay checkout when Pro checkout returns a subscription', async () => {
    const checkoutOpen = vi.fn()
    const checkoutOn = vi.fn()
    const razorpayOptions: Record<string, unknown>[] = []
    class RazorpayMock {
      constructor(options: Record<string, unknown>) {
        razorpayOptions.push(options)
      }

      open = checkoutOpen
      on = checkoutOn
    }
    vi.stubGlobal('Razorpay', RazorpayMock)
    authState.isSignedIn = true
    authState.getToken.mockResolvedValue('convex-token')
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        provider: 'razorpay',
        keyId: 'rzp_test_key',
        subscriptionId: 'sub_test_123',
      }),
    }) as unknown as typeof fetch
    const { getByText } = render(<PricingPage />)

    fireEvent.click(getByText('Start Pro'))

    await waitFor(() => expect(checkoutOpen).toHaveBeenCalledTimes(1))
    expect(razorpayOptions[0]).toMatchObject({
      key: 'rzp_test_key',
      subscription_id: 'sub_test_123',
      notes: {
        mode: 'subscription',
        tier: 'pro',
      },
    })
    expect(checkoutOn).toHaveBeenCalledWith(
      'payment.failed',
      expect.any(Function),
    )
    expect(screen.getByRole('status').textContent).toContain(
      'Opening Razorpay checkout...',
    )
  })

  it('confirms Razorpay subscription payment after checkout succeeds', async () => {
    const razorpayOptions: Record<string, unknown>[] = []
    class RazorpayMock {
      constructor(options: Record<string, unknown>) {
        razorpayOptions.push(options)
      }

      open = vi.fn()
      on = vi.fn()
    }
    vi.stubGlobal('Razorpay', RazorpayMock)
    authState.isSignedIn = true
    authState.getToken.mockResolvedValue('convex-token')
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        provider: 'razorpay',
        keyId: 'rzp_test_key',
        subscriptionId: 'sub_test_123',
      }),
    }) as unknown as typeof fetch
    const { getByText } = render(<PricingPage />)

    fireEvent.click(getByText('Start Pro'))

    await waitFor(() => expect(razorpayOptions[0]).toBeDefined())
    const handler = razorpayOptions[0]?.handler
    expect(typeof handler).toBe('function')
    ;(handler as (response: Record<string, string>) => void)({
      razorpay_payment_id: 'pay_test_123',
      razorpay_subscription_id: 'sub_test_123',
      razorpay_signature: 'sig_test_123',
    })

    await waitFor(() => {
      expect(
        confirmState.confirmRazorpaySubscriptionPayment,
      ).toHaveBeenCalledWith('convex-token', {
        razorpay_payment_id: 'pay_test_123',
        razorpay_subscription_id: 'sub_test_123',
        razorpay_signature: 'sig_test_123',
      })
    })
    expect(screen.getByRole('status').textContent).toContain('Pro activated.')
  })

  it('shows Current plan and disables pricing checkout when paid quota remains', async () => {
    authState.isSignedIn = true
    authState.getToken.mockResolvedValue('convex-token')
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        subscription: { active: true },
        generationQuota: { canRenew: false },
      }),
    }) as unknown as typeof fetch

    const { getByText } = render(<PricingPage />)

    await waitFor(() => {
      expect(getByText('Current plan')).toBeTruthy()
    })
    expect((getByText('Current plan') as HTMLButtonElement).disabled).toBe(true)
  })

  it('shows Renew Pro and keeps pricing checkout enabled when paid quota is exhausted', async () => {
    authState.isSignedIn = true
    authState.getToken.mockResolvedValue('convex-token')
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        subscription: { active: true },
        generationQuota: { canRenew: true },
      }),
    }) as unknown as typeof fetch

    const { getByText } = render(<PricingPage />)

    await waitFor(() => {
      expect(getByText('Renew Pro')).toBeTruthy()
    })
    expect((getByText('Renew Pro') as HTMLButtonElement).disabled).toBe(false)
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
