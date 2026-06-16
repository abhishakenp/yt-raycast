const readEnvBool = (name: string): boolean =>
  typeof process !== 'undefined' &&
  (process.env?.[name] ?? '').trim().toLowerCase() === 'true'

const isDevEnv = (): boolean =>
  typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'

const isProductionEnv = (): boolean =>
  typeof process !== 'undefined' && process.env?.NODE_ENV === 'production'

const guardProductionOverride = (flagName: string, value: boolean): boolean => {
  if (value && isProductionEnv()) {
    console.error(
      `[dev-flags] BLOCKED: ${flagName} is set to true in production. ` +
        'This flag is only allowed in development. Ignoring.',
    )
    return false
  }
  return value
}

export const devFlags = {
  get disableGenerationLimits(): boolean {
    return guardProductionOverride(
      'DISABLE_LIMIT',
      readEnvBool('DISABLE_LIMIT') || readEnvBool('IS_DEV'),
    )
  },
  get disablePaywall(): boolean {
    return guardProductionOverride(
      'DISABLE_PAYWALL',
      readEnvBool('DISABLE_PAYWALL') || isDevEnv(),
    )
  },
} as const

export type DevFlags = typeof devFlags
