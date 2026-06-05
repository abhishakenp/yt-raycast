import { describe, expect, it } from 'vitest'
import { MAX_FREE_PER_MONTH, MAX_PAID_PER_MONTH } from './constants'

describe('billing limits', () => {
  it('keeps the paid generation quota above the free quota', () => {
    expect(MAX_PAID_PER_MONTH).toBe(30)
    expect(MAX_PAID_PER_MONTH).toBeGreaterThan(MAX_FREE_PER_MONTH)
  })
})
