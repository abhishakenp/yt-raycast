export const RETRY_BASE_DELAY_MS = 250
export const RETRY_MAX_DELAY_MS = 30_000
export const RETRY_MAX_ATTEMPTS = 5

export const calculateFullJitterDelayMs = (
  attemptCount: number,
  random: () => number = Math.random,
): number => {
  if (!Number.isInteger(attemptCount) || attemptCount < 1) {
    throw new RangeError('attemptCount must be a positive integer')
  }

  const cap = Math.min(
    RETRY_MAX_DELAY_MS,
    RETRY_BASE_DELAY_MS * 2 ** (attemptCount - 1),
  )
  return Math.floor(random() * cap)
}

export const getRetryDelayMs = (
  attemptCount: number,
  random: () => number = Math.random,
): number | null =>
  attemptCount >= RETRY_MAX_ATTEMPTS
    ? null
    : calculateFullJitterDelayMs(attemptCount, random)
