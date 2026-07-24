// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const authState = vi.hoisted(() => ({
  getToken: vi.fn(async () => 'convex-token'),
  isSignedIn: true,
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  useIsAdmin: () => false,
  useOptionalAuth: () => authState,
}))

import { BillingPanel } from './BillingPanel'

interface DeferredResponse {
  promise: Promise<Response>
  resolve: (response: Response) => void
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status,
  })
}

function overviewResponse(): Response {
  return jsonResponse({
    credits: { remaining: 2 },
    exportAccess: { unlocked: false },
    subscription: { active: false },
  })
}

function unresolvedResponse(_response: Response) {}

function deferredResponse(): DeferredResponse {
  let resolvePromise = unresolvedResponse
  const promise = new Promise<Response>((resolve) => {
    resolvePromise = resolve
  })
  return { promise, resolve: resolvePromise }
}

async function renderLoadedPanel(fetchMock: ReturnType<typeof vi.fn>) {
  vi.stubGlobal('fetch', fetchMock)
  const view = render(<BillingPanel sessionId="billing-release" />)
  await waitFor(() => expect(view.getByText('Free')).toBeTruthy())
  return view
}

describe('BillingPanel release boundaries', () => {
  beforeEach(() => {
    authState.getToken.mockClear()
    authState.isSignedIn = true
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('locks checkout actions until the active checkout request settles', async () => {
    const checkout = deferredResponse()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(overviewResponse())
      .mockReturnValue(checkout.promise)
    const view = await renderLoadedPanel(fetchMock)
    const upgrade = view.getByRole('button', { name: 'Upgrade to Pro' })

    fireEvent.click(upgrade)
    const disabledDuringCheckout = upgrade.hasAttribute('disabled')
    checkout.resolve(jsonResponse({ orderId: 'order-release' }))
    await waitFor(() =>
      expect(
        view.getByText('Razorpay order created: order-release'),
      ).toBeTruthy(),
    )

    expect(disabledDuringCheckout).toBe(true)
  })

  it('coalesces rapid checkout clicks into one payment request', async () => {
    const checkout = deferredResponse()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(overviewResponse())
      .mockReturnValue(checkout.promise)
    const view = await renderLoadedPanel(fetchMock)
    const upgrade = view.getByRole('button', { name: 'Upgrade to Pro' })

    fireEvent.click(upgrade)
    fireEvent.click(upgrade)
    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(1))
    checkout.resolve(jsonResponse({ orderId: 'order-once' }))
    await waitFor(() =>
      expect(view.getByText('Razorpay order created: order-once')).toBeTruthy(),
    )

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('announces checkout progress without moving keyboard focus', async () => {
    const checkout = deferredResponse()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(overviewResponse())
      .mockReturnValue(checkout.promise)
    const view = await renderLoadedPanel(fetchMock)

    fireEvent.click(view.getByRole('button', { name: 'Upgrade to Pro' }))
    expect(view.getByText('Opening subscription checkout...')).toBeTruthy()
    const status = view.getByRole('status')
    checkout.resolve(jsonResponse({ orderId: 'order-status' }))
    await waitFor(() =>
      expect(
        view.getByText('Razorpay order created: order-status'),
      ).toBeTruthy(),
    )

    expect(status.textContent).toContain('Opening subscription checkout')
  })

  it('announces checkout failures to assistive technology', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(overviewResponse())
      .mockResolvedValueOnce(
        jsonResponse({ error: 'Payment provider unavailable' }, 503),
      )
    const view = await renderLoadedPanel(fetchMock)

    fireEvent.click(view.getByRole('button', { name: 'Upgrade to Pro' }))
    await waitFor(() =>
      expect(view.getByText('Payment provider unavailable')).toBeTruthy(),
    )

    expect(view.getByRole('alert').textContent).toContain(
      'Payment provider unavailable',
    )
  })
})
