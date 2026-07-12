type ClerkRuntimeEnv = {
  readonly [key: string]: string | boolean | undefined
  CLERK_PUBLISHABLE_KEY?: string | boolean
  VITE_CLERK_PUBLISHABLE_KEY?: string | boolean
  VITE_DISABLE_CLERK?: string | boolean
}

function configuredString(value: string | boolean | undefined) {
  return typeof value === 'string' && value.trim().length > 0
    ? value
    : undefined
}

export function isClerkDisabled(
  env: ClerkRuntimeEnv = import.meta.env,
): boolean {
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
