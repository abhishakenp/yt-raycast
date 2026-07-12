/**
 * Pure helpers + constants for the referral / sponsorship program.
 *
 * Dependency-free so it can be unit-tested in isolation and reused by both the
 * Convex backend and (where useful) the frontend.
 */

/** How many qualified (paid, real-email) referrals unlock the reward. */
export const REFERRAL_THRESHOLD = 2

/** The lifetime discount percentage granted once the threshold is met. */
export const REFERRAL_DISCOUNT_PERCENT = 50

/** Characters used for human-friendly, unambiguous referral codes. */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 8

/**
 * Generate a referral code using the provided random source (defaults to
 * Math.random, which Convex seeds deterministically inside a mutation).
 * Injectable RNG keeps this unit-testable.
 */
export function generateReferralCode(
  random: () => number = Math.random,
): string {
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)]
  }
  return code
}

/** Normalize a user-supplied referral code to its canonical stored form. */
export function normalizeReferralCode(code: unknown): string {
  return String(code ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, CODE_LENGTH)
}

/** Whether `qualifiedCount` meets the unlock threshold. */
export function isRewardUnlocked(qualifiedCount: number): boolean {
  return qualifiedCount >= REFERRAL_THRESHOLD
}

/** Referrals still needed before the reward unlocks (never negative). */
export function referralsRemaining(qualifiedCount: number): number {
  return Math.max(0, REFERRAL_THRESHOLD - qualifiedCount)
}

/**
 * Compute the next reward state from the current qualified count.
 * Unlock is monotonic: once `alreadyUnlocked` is true it stays true regardless
 * of the current count (permanent-once-unlocked semantics).
 */
export function computeRewardState(
  qualifiedCount: number,
  alreadyUnlocked: boolean,
): { unlocked: boolean; justUnlocked: boolean } {
  const unlocked = alreadyUnlocked || isRewardUnlocked(qualifiedCount)
  return {
    unlocked,
    justUnlocked: unlocked && !alreadyUnlocked,
  }
}
