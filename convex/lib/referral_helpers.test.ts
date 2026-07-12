import { describe, expect, it } from 'vitest'

import {
  REFERRAL_THRESHOLD,
  computeRewardState,
  generateReferralCode,
  isRewardUnlocked,
  normalizeReferralCode,
  referralsRemaining,
} from './referral_helpers'

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const AMBIGUOUS_CHARS = ['0', 'O', '1', 'I', 'L']

describe('generateReferralCode', () => {
  it('produces an 8-character code', () => {
    const code = generateReferralCode()
    expect(code).toHaveLength(8)
  })

  it('uses only characters from the unambiguous alphabet', () => {
    // Run many iterations to exercise the full RNG space.
    for (let i = 0; i < 500; i += 1) {
      const code = generateReferralCode()
      for (const char of code) {
        expect(CODE_ALPHABET).toContain(char)
      }
    }
  })

  it('never emits ambiguous characters (0/O/1/I/L)', () => {
    for (let i = 0; i < 500; i += 1) {
      const code = generateReferralCode()
      for (const ambiguous of AMBIGUOUS_CHARS) {
        expect(code).not.toContain(ambiguous)
      }
    }
  })

  it('is deterministic when given a seeded RNG', () => {
    // A linear congruential generator for deterministic pseudo-randomness.
    let seed = 12345
    const rng = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const first = generateReferralCode(rng)

    seed = 12345
    const rng2 = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const second = generateReferralCode(rng2)

    expect(second).toBe(first)
  })

  it('produces different codes with different RNG seeds', () => {
    let seedA = 1
    const rngA = () => {
      seedA = (seedA * 1103515245 + 12345) & 0x7fffffff
      return seedA / 0x7fffffff
    }
    let seedB = 99999
    const rngB = () => {
      seedB = (seedB * 1103515245 + 12345) & 0x7fffffff
      return seedB / 0x7fffffff
    }
    expect(generateReferralCode(rngA)).not.toBe(generateReferralCode(rngB))
  })
})

describe('normalizeReferralCode', () => {
  it('trims surrounding whitespace', () => {
    expect(normalizeReferralCode('  ABCD1234  ')).toBe('ABCD1234')
  })

  it('uppercases lowercase input', () => {
    expect(normalizeReferralCode('abcd1234')).toBe('ABCD1234')
  })

  it('strips non-alphanumeric characters', () => {
    expect(normalizeReferralCode('ab-cd_12!34')).toBe('ABCD1234')
  })

  it('caps output at 8 characters', () => {
    expect(normalizeReferralCode('ABCDEFGH12345678')).toBe('ABCDEFGH')
  })

  it('handles null input', () => {
    expect(normalizeReferralCode(null)).toBe('')
  })

  it('handles undefined input', () => {
    expect(normalizeReferralCode(undefined)).toBe('')
  })

  it('handles empty string input', () => {
    expect(normalizeReferralCode('')).toBe('')
  })

  it('handles non-string input (number)', () => {
    expect(normalizeReferralCode(1234)).toBe('1234')
  })

  it('handles input with only non-alphanumeric characters', () => {
    expect(normalizeReferralCode('---___!!!')).toBe('')
  })

  it('preserves characters from the unambiguous alphabet', () => {
    expect(normalizeReferralCode('abcdefgh')).toBe('ABCDEFGH')
  })
})

describe('isRewardUnlocked', () => {
  it('returns false below the threshold', () => {
    expect(isRewardUnlocked(0)).toBe(false)
    expect(isRewardUnlocked(1)).toBe(false)
  })

  it('returns true at the threshold', () => {
    expect(isRewardUnlocked(REFERRAL_THRESHOLD)).toBe(true)
  })

  it('returns true above the threshold', () => {
    expect(isRewardUnlocked(REFERRAL_THRESHOLD + 1)).toBe(true)
    expect(isRewardUnlocked(100)).toBe(true)
  })
})

describe('referralsRemaining', () => {
  it('returns the full threshold at zero', () => {
    expect(referralsRemaining(0)).toBe(REFERRAL_THRESHOLD)
  })

  it('returns 1 when one below the threshold', () => {
    expect(referralsRemaining(REFERRAL_THRESHOLD - 1)).toBe(1)
  })

  it('returns 0 at the threshold', () => {
    expect(referralsRemaining(REFERRAL_THRESHOLD)).toBe(0)
  })

  it('returns 0 above the threshold', () => {
    expect(referralsRemaining(REFERRAL_THRESHOLD + 5)).toBe(0)
  })

  it('never returns a negative number', () => {
    expect(referralsRemaining(-1)).toBeGreaterThanOrEqual(0)
    expect(referralsRemaining(-100)).toBeGreaterThanOrEqual(0)
  })
})

describe('computeRewardState', () => {
  it('is locked and not justUnlocked at count 0', () => {
    expect(computeRewardState(0, false)).toEqual({
      unlocked: false,
      justUnlocked: false,
    })
  })

  it('is locked and not justUnlocked at count 1', () => {
    expect(computeRewardState(1, false)).toEqual({
      unlocked: false,
      justUnlocked: false,
    })
  })

  it('unlocks and fires justUnlocked exactly at the threshold', () => {
    expect(computeRewardState(REFERRAL_THRESHOLD, false)).toEqual({
      unlocked: true,
      justUnlocked: true,
    })
  })

  it('unlocks and fires justUnlocked above the threshold', () => {
    expect(computeRewardState(REFERRAL_THRESHOLD + 1, false)).toEqual({
      unlocked: true,
      justUnlocked: true,
    })
  })

  it('stays unlocked but does not re-fire justUnlocked when already unlocked', () => {
    expect(computeRewardState(REFERRAL_THRESHOLD, true)).toEqual({
      unlocked: true,
      justUnlocked: false,
    })
  })

  it('stays unlocked even when count drops below threshold (monotonic)', () => {
    expect(computeRewardState(0, true)).toEqual({
      unlocked: true,
      justUnlocked: false,
    })
  })

  it('stays unlocked at count 3 when already unlocked', () => {
    expect(computeRewardState(3, true)).toEqual({
      unlocked: true,
      justUnlocked: false,
    })
  })
})
