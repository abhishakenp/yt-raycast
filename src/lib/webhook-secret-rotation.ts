const DAY_MS = 24 * 60 * 60 * 1000

export const WEBHOOK_SECRET_ROTATION_INTERVAL_MS = 90 * DAY_MS
export const WEBHOOK_SECRET_OVERLAP_MS = 7 * DAY_MS

type WebhookRotationEnv = Record<string, string | undefined>

const normalized = (value: string | undefined) => value?.trim() ?? ''

/**
 * Returns the active secret plus an optional, explicitly time-bounded previous
 * secret. Keeping the expiry alongside the previous value makes a forgotten
 * rotation fail closed instead of accepting an old credential indefinitely.
 */
export const getWebhookVerificationSecrets = (
  env: WebhookRotationEnv,
  secretName: string,
  now = Date.now(),
) => {
  const active = normalized(env[secretName])
  const previous = normalized(env[`${secretName}_PREVIOUS`])
  const previousExpiresAt = Number(env[`${secretName}_PREVIOUS_EXPIRES_AT`])

  if (!active) return []
  if (!previous) return [active]
  if (!Number.isFinite(previousExpiresAt) || previousExpiresAt <= now) {
    return [active]
  }
  return [active, previous]
}

export const validateWebhookRotationWindow = (
  env: WebhookRotationEnv,
  secretName: string,
  now = Date.now(),
) => {
  const previous = normalized(env[`${secretName}_PREVIOUS`])
  if (!previous) return { valid: true as const }

  const expiresAt = Number(env[`${secretName}_PREVIOUS_EXPIRES_AT`])
  if (!Number.isFinite(expiresAt) || expiresAt <= now) {
    return {
      valid: false as const,
      error: `${secretName}_PREVIOUS requires a future ${secretName}_PREVIOUS_EXPIRES_AT`,
    }
  }
  if (expiresAt - now > WEBHOOK_SECRET_OVERLAP_MS) {
    return {
      valid: false as const,
      error: `${secretName}_PREVIOUS_EXPIRES_AT exceeds the 7-day overlap window`,
    }
  }
  return { valid: true as const }
}
