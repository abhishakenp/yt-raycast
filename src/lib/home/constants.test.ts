import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  GENERATION_LIMIT,
  GENERATION_LIMIT_WITH_BONUS,
  GALLERY_PAGE_SIZE,
  MIN_PROMPT_LENGTH,
  SUBMIT_BTN_DEFAULT_LABEL,
  isLocalDevHost,
} from './constants'

describe('home constants', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps generation and prompt UI defaults in a user-safe range', () => {
    expect(GALLERY_PAGE_SIZE).toBe(12)
    expect(GENERATION_LIMIT_WITH_BONUS).toBeGreaterThan(GENERATION_LIMIT)
    expect(MIN_PROMPT_LENGTH).toBeLessThanOrEqual(15)
    expect(SUBMIT_BTN_DEFAULT_LABEL).toBe('Generate')
  })

  it('detects local browser hosts without treating production domains as local', () => {
    vi.stubGlobal('window', { location: { hostname: 'localhost' } })
    expect(isLocalDevHost()).toBe(true)

    vi.stubGlobal('window', { location: { hostname: 'ship-fast.io' } })
    expect(isLocalDevHost()).toBe(false)
  })
})
