type ClerkRuntimeEnv = {
  readonly [key: string]: string | boolean | undefined
  CLERK_PUBLISHABLE_KEY?: string | boolean
  VITE_CLERK_PUBLISHABLE_KEY?: string | boolean
  VITE_DISABLE_CLERK?: string | boolean
  MODE?: string | boolean
  PROD?: string | boolean
}

function configuredString(value: string | boolean | undefined) {
  return typeof value === 'string' && value.trim().length > 0
    ? value
    : undefined
}

/**
 * `VITE_DISABLE_CLERK` treats every visitor as a signed-in super admin. That
 * is a development convenience only: honouring it in a production build turns
 * the whole app into an open admin console, so the flag is ignored there no
 * matter what the deployment sets.
 */
export function isClerkDisabled(
  env: ClerkRuntimeEnv = import.meta.env,
): boolean {
  if (env.PROD === true || env.MODE === 'production') return false
  const value = env.VITE_DISABLE_CLERK
  if (typeof value === 'boolean') return value
  return /^(1|true|yes)$/i.test(value?.trim() ?? '')
}

export function getClerkPublishableKey(
  env: ClerkRuntimeEnv = import.meta.env,
): string | undefined {
  if (isClerkDisabled(env)) return undefined
  return (
    configuredString(env.VITE_CLERK_PUBLISHABLE_KEY) ??
    configuredString(env.CLERK_PUBLISHABLE_KEY)
  )
}

export function isClerkClientEnabled(
  env: ClerkRuntimeEnv = import.meta.env,
): boolean {
  return getClerkPublishableKey(env) !== undefined
}
