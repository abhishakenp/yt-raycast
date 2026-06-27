import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createGenerationTimeoutController,
  DEFAULT_GENERATION_TIMEOUT_MS,
} from './generation'

describe('generation timeout controller', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
  })

  it('does not abort immediately after creation', () => {
    const { controller, clear } = createGenerationTimeoutController()
    expect(controller.signal.aborted).toBe(false)
    clear()
  })

  it('aborts after the default timeout when no env override is set', () => {
    vi.stubEnv('SHIP_FAST_GENERATION_TIMEOUT_MS', '')
    const { controller, clear } = createGenerationTimeoutController()
    vi.advanceTimersByTime(DEFAULT_GENERATION_TIMEOUT_MS - 1)
    expect(controller.signal.aborted).toBe(false)
    vi.advanceTimersByTime(2)
    expect(controller.signal.aborted).toBe(true)
    expect(controller.signal.reason).toBeInstanceOf(Error)
    expect((controller.signal.reason as Error).message).toContain('timed out')
    clear()
  })

  it('respects SHIP_FAST_GENERATION_TIMEOUT_MS env override', () => {
    vi.stubEnv('SHIP_FAST_GENERATION_TIMEOUT_MS', '30000')
    const { controller, clear } = createGenerationTimeoutController()
    vi.advanceTimersByTime(29999)
    expect(controller.signal.aborted).toBe(false)
    vi.advanceTimersByTime(2)
    expect(controller.signal.aborted).toBe(true)
    clear()
  })

  it('enforces a 15s minimum floor even if env override is lower', () => {
    vi.stubEnv('SHIP_FAST_GENERATION_TIMEOUT_MS', '1000')
    const { controller, clear } = createGenerationTimeoutController()
    vi.advanceTimersByTime(14999)
    expect(controller.signal.aborted).toBe(false)
    vi.advanceTimersByTime(2)
    expect(controller.signal.aborted).toBe(true)
    clear()
  })

  it('clear() cancels the timeout so the signal never aborts', () => {
    const { controller, clear } = createGenerationTimeoutController()
    clear()
    vi.advanceTimersByTime(DEFAULT_GENERATION_TIMEOUT_MS * 2)
    expect(controller.signal.aborted).toBe(false)
  })
})
