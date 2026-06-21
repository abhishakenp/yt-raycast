// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ReferralDashboard } from './ReferralDashboard'
import type { ReferralStatus } from '../hooks/useReferralStatus'

const state = vi.hoisted(() => ({
  status: null as ReferralStatus | null,
  isLoading: false,
  error: null as string | null,
}))

vi.mock('../hooks/useReferralStatus', () => ({
  useReferralStatus: () => ({
    status: state.status,
    isLoading: state.isLoading,
    error: state.error,
    reload: vi.fn(),
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
})

describe('ReferralDashboard', () => {
  it('renders the headline and the share link for the current code', () => {
    state.status = baseStatus
    render(<ReferralDashboard />)
    expect(screen.getByText(/50% off for life/i)).toBeTruthy()
    const input = screen.getByDisplayValue(/\/\?ref=ABCD2345$/) as HTMLInputElement
    expect(input.value).toContain('ref=ABCD2345')
  })

  it('shows remaining-to-unlock guidance while locked', () => {
    state.status = { ...baseStatus, qualifiedCount: 1, remaining: 1 }
    render(<ReferralDashboard />)
    expect(screen.getByText(/1 \/ 2 paid/)).toBeTruthy()
    expect(
      screen.getByText(/Invite 1 more paying subscriber/i),
    ).toBeTruthy()
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
    expect(screen.getByText(/Unlocked!.*50% lifetime discount is active/i)).toBeTruthy()
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
        { status: 'pending', email: 'sa***@acme.co', createdAt: 1, paidAt: null },
      ],
    }
    render(<ReferralDashboard />)
    expect(screen.getByText('jo****@gmail.com')).toBeTruthy()
    expect(screen.getByText('Paid ✓')).toBeTruthy()
    expect(screen.getByText('Signed up')).toBeTruthy()
  })

  it('surfaces an error message', () => {
    state.error = 'Sign in to see your referral rewards.'
    render(<ReferralDashboard />)
    expect(
      screen.getByText('Sign in to see your referral rewards.'),
    ).toBeTruthy()
  })
})
