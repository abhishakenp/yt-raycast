// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ReferralStatus } from '../hooks/useReferralStatus'

interface ReferralHookState {
  error: string | null
  isLoading: boolean
  reload: ReturnType<typeof vi.fn>
  status: ReferralStatus | null
}

const referralState = vi.hoisted<ReferralHookState>(() => ({
  error: null,
  isLoading: false,
  reload: vi.fn(async () => undefined),
  status: null,
}))

vi.mock('../hooks/useReferralStatus', () => ({
  useReferralStatus: () => ({
    error: referralState.error,
    isLoading: referralState.isLoading,
    reload: referralState.reload,
    status: referralState.status,
  }),
}))

import { ReferralDashboard } from './ReferralDashboard'

interface DeferredCopy {
  promise: Promise<void>
  resolve: () => void
}

const baseStatus: ReferralStatus = {
  code: 'RELEASE25',
  discountActive: false,
  discountApplied: false,
  discountPercent: 50,
  hasActiveSubscription: false,
  pendingCount: 0,
  qualifiedCount: 1,
  referrals: [],
  remaining: 1,
  threshold: 2,
  unlocked: false,
  unlockedAt: null,
}

function deferredCopy(): DeferredCopy {
  let resolvePromise = function unresolvedCopy() {}
  const promise = new Promise<void>((resolve) => {
    resolvePromise = function settleCopy() {
      resolve()
    }
  })
  return { promise, resolve: resolvePromise }
}

function resolveClipboardWrite(): Promise<void> {
  return Promise.resolve()
}

const clipboard = {
  writeText: vi.fn(resolveClipboardWrite),
}

const originalClipboard = Object.getOwnPropertyDescriptor(
  window.navigator,
  'clipboard',
)

describe('ReferralDashboard release boundaries', () => {
  beforeEach(() => {
    referralState.error = null
    referralState.isLoading = false
    referralState.reload.mockClear()
    referralState.status = baseStatus
    clipboard.writeText.mockReset()
    clipboard.writeText.mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: clipboard,
    })
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    if (originalClipboard) {
      Object.defineProperty(window.navigator, 'clipboard', originalClipboard)
    } else {
      Reflect.deleteProperty(window.navigator, 'clipboard')
    }
  })

  it('coalesces rapid referral-link copies while clipboard access is pending', async () => {
    const pendingCopy = deferredCopy()
    clipboard.writeText.mockReturnValue(pendingCopy.promise)
    render(<ReferralDashboard />)
    const copyButton = screen.getByRole('button', { name: 'Copy' })

    fireEvent.click(copyButton)
    fireEvent.click(copyButton)
    pendingCopy.resolve()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy(),
    )

    expect(clipboard.writeText).toHaveBeenCalledTimes(1)
  })

  it('announces clipboard permission failures instead of silently doing nothing', async () => {
    clipboard.writeText.mockRejectedValue(new Error('Clipboard denied'))
    render(<ReferralDashboard />)

    fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
    await waitFor(() => expect(clipboard.writeText).toHaveBeenCalledTimes(1))

    expect(screen.getByRole('alert').textContent?.toLowerCase()).toContain(
      'copy',
    )
  })

  it('exposes referral loading failures as alerts', () => {
    referralState.error = 'Unable to load referral rewards.'
    referralState.status = null
    render(<ReferralDashboard />)

    expect(screen.getByRole('alert').textContent).toContain(
      'Unable to load referral rewards.',
    )
  })

  it('publishes referral progress with determinate progressbar semantics', () => {
    render(<ReferralDashboard />)

    const progress = screen.getByRole('progressbar', {
      name: 'Referral progress',
    })
    expect(progress.getAttribute('aria-valuemin')).toBe('0')
    expect(progress.getAttribute('aria-valuemax')).toBe('2')
    expect(progress.getAttribute('aria-valuenow')).toBe('1')
  })
})
