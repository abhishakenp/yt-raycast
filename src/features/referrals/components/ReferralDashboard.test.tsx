// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ReferralDashboard } from './ReferralDashboard'
import type { ReferralStatus } from '../hooks/useReferralStatus'

const state = vi.hoisted(() => ({
  status: null as ReferralStatus | null,
  isLoading: false,
  error: null as string | null,
  reload: vi.fn(),
}))

vi.mock('../hooks/useReferralStatus', () => ({
  useReferralStatus: () => ({
    status: state.status,
    isLoading: state.isLoading,
    error: state.error,
    reload: state.reload,
  }),
}))

const baseStatus: ReferralStatus = {
  code: 'ABCD2345',
  threshold: 2,
  discountPercent: 50,
  qualifiedCount: 0,
  pendingCount: 0,
  remaining: 2,
  unlocked: false,
  unlockedAt: null,
  discountApplied: false,
  discountActive: false,
  hasActiveSubscription: false,
  referrals: [],
}

afterEach(() => {
  cleanup()
  state.status = null
  state.error = null
  state.isLoading = false
  state.reload.mockReset()
  vi.useRealTimers()
})

describe('ReferralDashboard', () => {
  it('renders the headline and the share link for the current code', () => {
    state.status = baseStatus
    render(<ReferralDashboard />)
    expect(screen.getByText(/50% off for life/i)).toBeTruthy()
    const input = screen.getByDisplayValue(
      /\/\?ref=ABCD2345$/,
    ) as HTMLInputElement
    expect(input.value).toContain('ref=ABCD2345')
  })

  it('shows remaining-to-unlock guidance while locked', () => {
    state.status = { ...baseStatus, qualifiedCount: 1, remaining: 1 }
    render(<ReferralDashboard />)
    expect(screen.getByText(/1 \/ 2 paid/)).toBeTruthy()
    expect(screen.getByText(/Invite 1 more paying subscriber/i)).toBeTruthy()
  })

  it('celebrates an active lifetime discount when unlocked', () => {
    state.status = {
      ...baseStatus,
      qualifiedCount: 2,
      remaining: 0,
      unlocked: true,
      discountApplied: true,
      discountActive: true,
      hasActiveSubscription: true,
    }
    render(<ReferralDashboard />)
    expect(
      screen.getByText(/Unlocked!.*50% lifetime discount is active/i),
    ).toBeTruthy()
  })

  it('lists referrals with masked emails and status labels', () => {
    state.status = {
      ...baseStatus,
      qualifiedCount: 1,
      pendingCount: 1,
      remaining: 1,
      referrals: [
        {
          status: 'qualified',
          email: 'jo****@gmail.com',
          createdAt: 2,
          paidAt: 3,
        },
        {
          status: 'pending',
          email: 'sa***@acme.co',
          createdAt: 1,
          paidAt: null,
        },
      ],
    }
    render(<ReferralDashboard />)
    expect(screen.getByText('jo****@gmail.com')).toBeTruthy()
    expect(screen.getByText('Paid')).toBeTruthy()
    expect(screen.getByText('Signed up')).toBeTruthy()
  })

  it('surfaces a load error message', () => {
    state.error = 'Unable to load referrals.'
    render(<ReferralDashboard />)
    expect(screen.getByText('Unable to load referrals.')).toBeTruthy()
  })

  it('does not expose refresh as an active no-op while loading', () => {
    state.status = null
    state.isLoading = true

    render(<ReferralDashboard />)
    const refresh = screen.getByRole('button', { name: 'Refresh referrals' })

    expect(refresh.hasAttribute('disabled')).toBe(true)
    fireEvent.click(refresh)
    expect(state.reload).not.toHaveBeenCalled()
  })
})
