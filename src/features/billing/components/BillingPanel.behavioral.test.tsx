// @vitest-environment jsdom
import { fireEvent, render, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/auth/use-optional-auth', () => ({
  useOptionalAuth: vi.fn(),
}))

const confirmState = vi.hoisted(() => ({
  confirmRazorpaySubscriptionPayment: vi.fn(),
}))

vi.mock('@/features/billing/client/razorpay-confirm', () => ({
  confirmRazorpaySubscriptionPayment:
    confirmState.confirmRazorpaySubscriptionPayment,
}))

import { useOptionalAuth } from '@/shared/auth/use-optional-auth'
import { BillingPanel } from './BillingPanel'

type Overview = {
  subscription?: {
    active: boolean
    planId?: string | null
    provider?: string
    status?: string | null
  } | null
  credits?: { remaining: number }
  generationQuota?: {
    limit: number
    used: number
    remaining: number
    exhausted: boolean
    activeSubscriptionCount: number
    canRenew: boolean
  }
  exportAccess?: { unlocked: boolean; reason?: string; viaCredits?: boolean }
}

const authed = {
  getToken: vi.fn(async () => 'convex-token'),
  isSignedIn: true,
  isLoaded: true,
}

function overviewResponse(body: Overview, ok = true) {
  return {
    ok,
    status: ok ? 200 : 400,
    json: async () => body,
  } as unknown as Response
}

function checkoutResponse(body: Record<string, unknown>, ok = true) {
  return {
    ok,
    status: ok ? 200 : 400,
    json: async () => body,
  } as unknown as Response
}

describe('BillingPanel: behavioral', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useOptionalAuth).mockReturnValue(authed)
    authed.getToken.mockReset()
    authed.getToken.mockResolvedValue('convex-token')
    confirmState.confirmRazorpaySubscriptionPayment.mockReset()
    confirmState.confirmRazorpaySubscriptionPayment.mockResolvedValue({
      active: true,
      status: 'authenticated',
      planId: 'plan_pro',
      providerSubscriptionId: 'sub_test_123',
    })
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    // prevent window.location.href redirect from throwing in jsdom
    Object.defineProperty(window, 'location', {
      value: { ...window.location, href: '' },
      writable: true,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows free subscription status when no active subscription', async () => {
    fetchMock.mockResolvedValue(
      overviewResponse({
        subscription: { active: false, planId: null, status: null },
        credits: { remaining: 0 },
        exportAccess: { unlocked: false },
      }),
    )

    const { container } = render(<BillingPanel sessionId="sess-1" />)
    const scope = within(container)

    await waitFor(() => expect(scope.getByText('Free')).not.toBeNull())
    expect(scope.getByText('No subscription')).not.toBeNull()
  })

  it('shows active subscription status with plan id', async () => {
    fetchMock.mockResolvedValue(
      overviewResponse({
        subscription: {
          active: true,
          planId: 'pro_monthly',
          provider: 'razorpay',
          status: 'active',
        },
        credits: { remaining: 42 },
        exportAccess: { unlocked: true, reason: 'Subscription active' },
      }),
    )

    const { container } = render(<BillingPanel sessionId="sess-1" />)
    const scope = within(container)

    await waitFor(() => expect(scope.getByText('pro_monthly')).not.toBeNull())
    expect(scope.getByText('razorpay')).not.toBeNull()
  })

  it('shows credit balance number', async () => {
    fetchMock.mockResolvedValue(
      overviewResponse({
        subscription: { active: false },
        credits: { remaining: 17 },
        exportAccess: { unlocked: false },
      }),
    )

    const { container } = render(<BillingPanel sessionId="sess-1" />)
    const scope = within(container)

    await waitFor(() => expect(scope.getByText('17')).not.toBeNull())
    expect(scope.getByText('Remaining')).not.toBeNull()
  })

  it('shows export access granted (Unlocked) and denied (Locked)', async () => {
    // denied
    fetchMock.mockResolvedValue(
      overviewResponse({
        exportAccess: { unlocked: false, reason: 'Subscribe to unlock' },
        credits: { remaining: 0 },
      }),
    )
    const { unmount, container: deniedContainer } = render(
      <BillingPanel sessionId="sess-1" />,
    )
    const deniedScope = within(deniedContainer)
    await waitFor(() => expect(deniedScope.getByText('Locked')).not.toBeNull())
    expect(deniedScope.getByText('Subscribe to unlock')).not.toBeNull()
    unmount()

    // granted
    fetchMock.mockResolvedValue(
      overviewResponse({
        exportAccess: { unlocked: true, reason: 'Unlocked via subscription' },
        credits: { remaining: 5 },
      }),
    )
    const { container: grantedContainer } = render(
      <BillingPanel sessionId="sess-1" />,
    )
    const grantedScope = within(grantedContainer)
    await waitFor(() =>
      expect(grantedScope.getByText('Unlocked')).not.toBeNull(),
    )
  })

  it('Upgrade to Pro button is present and triggers subscription checkout', async () => {
    fetchMock.mockResolvedValue(
      overviewResponse({
        subscription: { active: false },
        credits: { remaining: 0 },
        exportAccess: { unlocked: false },
      }),
    )

    const { container } = render(<BillingPanel sessionId="sess-42" />)
    const scope = within(container)
    const upgrade = await scope.findByRole('button', {
      name: /upgrade to pro/i,
    })
    expect(upgrade).not.toBeNull()

    fetchMock.mockResolvedValueOnce(
      checkoutResponse({ subscriptionId: 'sub_123' }),
    )

    fireEvent.click(upgrade)

    await waitFor(() => {
      const checkoutCall = fetchMock.mock.calls.find(
        (c) => (c[1] as RequestInit)?.method === 'POST',
      )
      expect(checkoutCall).toBeDefined()
    })

    const postCall = fetchMock.mock.calls.find(
      (c) => (c[1] as RequestInit)?.method === 'POST',
    )!
    const body = JSON.parse((postCall[1] as RequestInit).body as string)
    expect(body).toMatchObject({
      mode: 'subscription',
      tier: 'pro',
      sessionId: 'sess-42',
    })
    expect(body.packId).toBeUndefined()
  })

  it('3 credits button triggers credit_pack checkout with packId 3_credits', async () => {
    fetchMock.mockResolvedValue(
      overviewResponse({
        subscription: { active: false },
        credits: { remaining: 0 },
        exportAccess: { unlocked: false },
      }),
    )

    const { container } = render(<BillingPanel sessionId="sess-9" />)
    const scope = within(container)
    const threeCreditBtn = await scope.findByRole('button', {
      name: /3 credits/i,
    })
    expect(threeCreditBtn).not.toBeNull()

    fetchMock.mockResolvedValueOnce(checkoutResponse({ orderId: 'order_3' }))

    fireEvent.click(threeCreditBtn)

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          (c) =>
            (c[1] as RequestInit)?.method === 'POST' &&
            JSON.parse((c[1] as RequestInit).body as string).packId ===
              '3_credits',
        ),
      ).toBe(true)
    })

    const postCall = fetchMock.mock.calls.find(
      (c) =>
        (c[1] as RequestInit)?.method === 'POST' &&
        JSON.parse((c[1] as RequestInit).body as string).packId === '3_credits',
    )!
    const body = JSON.parse((postCall[1] as RequestInit).body as string)
    expect(body).toMatchObject({
      mode: 'credit_pack',
      packId: '3_credits',
      sessionId: 'sess-9',
    })
  })

  it('10 credits button triggers credit_pack checkout with packId 10_credits', async () => {
    fetchMock.mockResolvedValue(
      overviewResponse({
        subscription: { active: false },
        credits: { remaining: 0 },
        exportAccess: { unlocked: false },
      }),
    )

    const { container } = render(<BillingPanel sessionId="sess-10" />)
    const scope = within(container)
    const tenCreditBtn = await scope.findByRole('button', {
      name: /10 credits/i,
    })
    expect(tenCreditBtn).not.toBeNull()

    fetchMock.mockResolvedValueOnce(checkoutResponse({ orderId: 'order_10' }))

    fireEvent.click(tenCreditBtn)

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          (c) =>
            (c[1] as RequestInit)?.method === 'POST' &&
            JSON.parse((c[1] as RequestInit).body as string).packId ===
              '10_credits',
        ),
      ).toBe(true)
    })

    const postCall = fetchMock.mock.calls.find(
      (c) =>
        (c[1] as RequestInit)?.method === 'POST' &&
        JSON.parse((c[1] as RequestInit).body as string).packId ===
          '10_credits',
    )!
    const body = JSON.parse((postCall[1] as RequestInit).body as string)
    expect(body).toMatchObject({ mode: 'credit_pack', packId: '10_credits' })
  })

  it('refresh button re-fetches billing overview and updates status', async () => {
    fetchMock.mockResolvedValueOnce(
      overviewResponse({
        subscription: { active: false },
        credits: { remaining: 1 },
        exportAccess: { unlocked: false },
      }),
    )

    const { container } = render(<BillingPanel sessionId="sess-r" />)
    const scope = within(container)
    await waitFor(() => expect(scope.getByText('1')).not.toBeNull())

    // second load returns different credits
    fetchMock.mockResolvedValueOnce(
      overviewResponse({
        subscription: { active: true, planId: 'pro_monthly' },
        credits: { remaining: 99 },
        exportAccess: { unlocked: true },
      }),
    )

    const refresh = scope.getByRole('button', { name: /refresh billing/i })
    fireEvent.click(refresh)

    await waitFor(() => expect(scope.getByText('99')).not.toBeNull())
    expect(scope.getByText('pro_monthly')).not.toBeNull()
    expect(scope.getByText('Unlocked')).not.toBeNull()
  })

  it('error state shows error message', async () => {
    fetchMock.mockResolvedValue(
      overviewResponse(
        { error: 'Unable to load billing' } as unknown as Overview,
        false,
      ),
    )

    const { container } = render(<BillingPanel sessionId="sess-err" />)
    const scope = within(container)

    await waitFor(() =>
      expect(scope.getByText('Unable to load billing')).not.toBeNull(),
    )
  })

  it('error state shows error message on fetch rejection', async () => {
    fetchMock.mockRejectedValue(new Error('Network down'))

    const { container } = render(<BillingPanel sessionId="sess-net" />)
    const scope = within(container)

    await waitFor(() => expect(scope.getByText('Network down')).not.toBeNull())
  })

  it('shows a stable billing error when the overview API returns malformed JSON', async () => {
    fetchMock.mockResolvedValue(
      new Response('<html>bad gateway</html>', {
        headers: { 'Content-Type': 'text/html' },
        status: 502,
      }),
    )

    const { container } = render(<BillingPanel sessionId="sess-bad-json" />)
    const scope = within(container)

    await waitFor(() =>
      expect(scope.getByText('Unable to load billing')).not.toBeNull(),
    )
    expect(container.textContent).not.toContain('Unexpected token')
  })

  it('loading state disables action buttons while overview is fetching', async () => {
    let resolveOverview!: (r: Response) => void
    fetchMock.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveOverview = resolve
      }),
    )

    const { container } = render(<BillingPanel sessionId="sess-load" />)
    const scope = within(container)

    const upgrade = await scope.findByRole('button', {
      name: /upgrade to pro/i,
    })
    const refresh = scope.getByRole('button', { name: /refresh billing/i })
    const threeCredit = scope.getByRole('button', { name: /3 credits/i })
    const tenCredit = scope.getByRole('button', { name: /10 credits/i })

    // while pending, all action buttons are disabled
    expect((upgrade as HTMLButtonElement).disabled).toBeTruthy()
    expect((refresh as HTMLButtonElement).disabled).toBeTruthy()
    expect((threeCredit as HTMLButtonElement).disabled).toBeTruthy()
    expect((tenCredit as HTMLButtonElement).disabled).toBeTruthy()

    resolveOverview(
      overviewResponse({
        subscription: { active: false },
        credits: { remaining: 0 },
        exportAccess: { unlocked: false },
      }),
    )

    await waitFor(() =>
      expect((upgrade as HTMLButtonElement).disabled).not.toBeTruthy(),
    )
    expect((refresh as HTMLButtonElement).disabled).not.toBeTruthy()
  })

  it('active subscription shows plan details', async () => {
    fetchMock.mockResolvedValue(
      overviewResponse({
        subscription: {
          active: true,
          planId: 'pro_yearly',
          provider: 'razorpay',
          status: 'active',
        },
        credits: { remaining: 250 },
        exportAccess: {
          unlocked: true,
          reason: 'Subscription active',
          viaCredits: false,
        },
      }),
    )

    const { container } = render(<BillingPanel sessionId="sess-active" />)
    const scope = within(container)

    await waitFor(() => expect(scope.getByText('pro_yearly')).not.toBeNull())
    expect(scope.getByText('razorpay')).not.toBeNull()
    expect(scope.getByText('250')).not.toBeNull()
    expect(scope.getByText('Unlocked')).not.toBeNull()
  })

  it('shows Current plan and disables subscription checkout while Pro quota remains', async () => {
    fetchMock.mockResolvedValue(
      overviewResponse({
        subscription: {
          active: true,
          planId: 'pro_monthly',
          provider: 'razorpay',
          status: 'active',
        },
        credits: { remaining: 0 },
        generationQuota: {
          limit: 30,
          used: 12,
          remaining: 18,
          exhausted: false,
          activeSubscriptionCount: 1,
          canRenew: false,
        },
        exportAccess: { unlocked: true },
      }),
    )

    const { container } = render(<BillingPanel sessionId="sess-current" />)
    const scope = within(container)

    const currentPlan = await scope.findByRole('button', {
      name: /current plan/i,
    })
    expect((currentPlan as HTMLButtonElement).disabled).toBe(true)
    expect(scope.getByText('12/30 used')).toBeTruthy()
    expect(scope.getByText('18 generations remaining this month.')).toBeTruthy()
  })

  it('shows Renew Pro and starts subscription checkout when paid quota is exhausted', async () => {
    fetchMock.mockResolvedValue(
      overviewResponse({
        subscription: {
          active: true,
          planId: 'pro_monthly',
          provider: 'razorpay',
          status: 'active',
        },
        credits: { remaining: 0 },
        generationQuota: {
          limit: 30,
          used: 30,
          remaining: 0,
          exhausted: true,
          activeSubscriptionCount: 1,
          canRenew: true,
        },
        exportAccess: { unlocked: true },
      }),
    )

    const { container } = render(<BillingPanel sessionId="sess-renew" />)
    const scope = within(container)
    const renew = await scope.findByRole('button', { name: /renew pro/i })
    expect((renew as HTMLButtonElement).disabled).toBe(false)
    expect(scope.getByText('30/30 used')).toBeTruthy()
    expect(
      scope.getByText('Renew Pro to add another 30 generations.'),
    ).toBeTruthy()

    fetchMock.mockResolvedValueOnce(
      checkoutResponse({ subscriptionId: 'sub_renew' }),
    )

    fireEvent.click(renew)

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          (c) =>
            (c[1] as RequestInit)?.method === 'POST' &&
            JSON.parse((c[1] as RequestInit).body as string).mode ===
              'subscription',
        ),
      ).toBe(true)
    })
  })

  it('checkout POST is sent to Razorpay checkout with Bearer token', async () => {
    fetchMock.mockResolvedValue(
      overviewResponse({
        subscription: { active: false },
        credits: { remaining: 0 },
        exportAccess: { unlocked: false },
      }),
    )

    const { container } = render(<BillingPanel sessionId="sess-auth" />)
    const scope = within(container)
    const upgrade = await scope.findByRole('button', {
      name: /upgrade to pro/i,
    })

    fetchMock.mockResolvedValueOnce(
      checkoutResponse({ subscriptionId: 'sub_auth' }),
    )

    fireEvent.click(upgrade)

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          (c) =>
            c[0] === '/api/payments/razorpay/start' &&
            (c[1] as RequestInit)?.method === 'POST',
        ),
      ).toBe(true)
    })

    const postCall = fetchMock.mock.calls.find(
      (c) =>
        c[0] === '/api/payments/razorpay/start' &&
        (c[1] as RequestInit)?.method === 'POST',
    )!
    const headers = (postCall[1] as RequestInit).headers as Record<
      string,
      string
    >
    expect(headers.Authorization).toBe('Bearer convex-token')
    expect(headers['Content-Type']).toBe('application/json')
  })

  it('checkout success with url redirects via window.location.href', async () => {
    fetchMock.mockResolvedValue(
      overviewResponse({
        subscription: { active: false },
        credits: { remaining: 0 },
        exportAccess: { unlocked: false },
      }),
    )

    const { container } = render(<BillingPanel sessionId="sess-redir" />)
    const scope = within(container)
    const upgrade = await scope.findByRole('button', {
      name: /upgrade to pro/i,
    })

    fetchMock.mockResolvedValueOnce(
      checkoutResponse({ url: 'https://checkout.example.com/pay' }),
    )

    fireEvent.click(upgrade)

    await waitFor(() => {
      expect(window.location.href).toBe('https://checkout.example.com/pay')
    })
  })

  it('opens Razorpay Checkout for a Clerk-authenticated subscription checkout', async () => {
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
    fetchMock.mockResolvedValue(
      overviewResponse({
        subscription: { active: false },
        credits: { remaining: 0 },
        exportAccess: { unlocked: false },
      }),
    )

    const { container } = render(<BillingPanel sessionId="sess-razorpay-sub" />)
    const scope = within(container)
    const upgrade = await scope.findByRole('button', {
      name: /upgrade to pro/i,
    })

    fetchMock.mockResolvedValueOnce(
      checkoutResponse({
        provider: 'razorpay',
        keyId: 'rzp_test_key',
        subscriptionId: 'sub_test_123',
      }),
    )

    fireEvent.click(upgrade)

    await waitFor(() => expect(checkoutOpen).toHaveBeenCalledTimes(1))
    expect(razorpayOptions[0]).toMatchObject({
      key: 'rzp_test_key',
      subscription_id: 'sub_test_123',
      notes: {
        mode: 'subscription',
        sessionId: 'sess-razorpay-sub',
      },
    })
    expect(checkoutOn).toHaveBeenCalledWith(
      'payment.failed',
      expect.any(Function),
    )

    const postCall = fetchMock.mock.calls.find(
      (c) => (c[1] as RequestInit)?.method === 'POST',
    )!
    const headers = (postCall[1] as RequestInit).headers as Record<
      string,
      string
    >
    expect(headers.Authorization).toBe('Bearer convex-token')
  })

  it('confirms Razorpay subscription payments and refreshes billing', async () => {
    const razorpayOptions: Record<string, unknown>[] = []
    class RazorpayMock {
      constructor(options: Record<string, unknown>) {
        razorpayOptions.push(options)
      }

      open = vi.fn()
      on = vi.fn()
    }
    vi.stubGlobal('Razorpay', RazorpayMock)
    fetchMock.mockResolvedValueOnce(
      overviewResponse({
        subscription: { active: false },
        credits: { remaining: 0 },
        exportAccess: { unlocked: false },
      }),
    )

    const { container } = render(<BillingPanel sessionId="sess-confirm-sub" />)
    const scope = within(container)
    const upgrade = await scope.findByRole('button', {
      name: /upgrade to pro/i,
    })

    fetchMock
      .mockResolvedValueOnce(
        checkoutResponse({
          provider: 'razorpay',
          keyId: 'rzp_test_key',
          subscriptionId: 'sub_test_123',
        }),
      )
      .mockResolvedValueOnce(
        overviewResponse({
          subscription: {
            active: true,
            planId: 'plan_pro',
            provider: 'razorpay',
            status: 'authenticated',
          },
          credits: { remaining: 0 },
          exportAccess: { unlocked: true },
        }),
      )

    fireEvent.click(upgrade)

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
    await waitFor(() => expect(scope.getByText('plan_pro')).toBeTruthy())
    expect(scope.getByText('razorpay')).toBeTruthy()
  })

  it('opens Razorpay Checkout for Clerk-authenticated credit pack orders', async () => {
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
    fetchMock.mockResolvedValue(
      overviewResponse({
        subscription: { active: false },
        credits: { remaining: 0 },
        exportAccess: { unlocked: false },
      }),
    )

    const { container } = render(
      <BillingPanel sessionId="sess-razorpay-pack" />,
    )
    const scope = within(container)
    const threeCreditBtn = await scope.findByRole('button', {
      name: /3 credits/i,
    })

    fetchMock.mockResolvedValueOnce(
      checkoutResponse({
        provider: 'razorpay',
        keyId: 'rzp_test_key',
        orderId: 'order_test_123',
        amount: 19900,
        currency: 'INR',
      }),
    )

    fireEvent.click(threeCreditBtn)

    await waitFor(() => expect(checkoutOpen).toHaveBeenCalledTimes(1))
    expect(razorpayOptions[0]).toMatchObject({
      key: 'rzp_test_key',
      order_id: 'order_test_123',
      amount: 19900,
      currency: 'INR',
      notes: {
        mode: 'credit_pack',
        packId: '3_credits',
        sessionId: 'sess-razorpay-pack',
      },
    })
    expect(checkoutOn).toHaveBeenCalledWith(
      'payment.failed',
      expect.any(Function),
    )
  })

  it('shows a stable checkout error when checkout returns malformed JSON', async () => {
    fetchMock.mockResolvedValue(
      overviewResponse({
        subscription: { active: false },
        credits: { remaining: 0 },
        exportAccess: { unlocked: false },
      }),
    )

    const { container } = render(<BillingPanel sessionId="sess-bad-checkout" />)
    const scope = within(container)
    const upgrade = await scope.findByRole('button', {
      name: /upgrade to pro/i,
    })

    fetchMock.mockResolvedValueOnce(
      new Response('<html>checkout unavailable</html>', {
        headers: { 'Content-Type': 'text/html' },
        status: 503,
      }),
    )

    fireEvent.click(upgrade)

    await waitFor(() =>
      expect(scope.getByText('Checkout failed')).not.toBeNull(),
    )
    expect(container.textContent).not.toContain('Unexpected token')
  })
})
