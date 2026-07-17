// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useAcquisitionCapture } from './useAcquisitionCapture'

const captureMocks = vi.hoisted(() => ({
  dub: vi.fn(),
  native: vi.fn(),
}))

vi.mock('@/features/referrals/hooks/useReferralCapture', () => ({
  useReferralCapture: captureMocks.native,
}))

vi.mock('@/features/partners/hooks/useDubAttributionCapture', () => ({
  useDubAttributionCapture: captureMocks.dub,
}))

describe('useAcquisitionCapture', () => {
  afterEach(() => {
    cleanup()
    captureMocks.native.mockReset()
    captureMocks.dub.mockReset()
  })

  it('mounts native and Dub acquisition capture once', () => {
    renderHook(() => useAcquisitionCapture())

    expect(captureMocks.native).toHaveBeenCalledTimes(1)
    expect(captureMocks.dub).toHaveBeenCalledTimes(1)
  })
})
