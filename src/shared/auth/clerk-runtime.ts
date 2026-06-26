type ClerkRuntimeEnv = {
  readonly [key: string]: string | boolean | undefined
  CLERK_PUBLISHABLE_KEY?: string | boolean
  VITE_CLERK_PUBLISHABLE_KEY?: string | boolean
  VITE_DISABLE_CLERK?: string | boolean
}

const configuredString = (value: string | boolean | undefined) =>
  typeof value === 'string' && value.trim().length > 0 ? value : undefined

export const isClerkDisabled = (
  env: ClerkRuntimeEnv = import.meta.env,
): boolean => {
  const value = env.VITE_DISABLE_CLERK
  if (typeof value === 'boolean') return value
  return /^(1|true|yes)$/i.test(value?.trim() ?? '')
}

export const getClerkPublishableKey = (
  env: ClerkRuntimeEnv = import.meta.env,
): string | undefined => {
  if (isClerkDisabled(env)) return undefined
  return (
    configuredString(env.VITE_CLERK_PUBLISHABLE_KEY) ??
    configuredString(env.CLERK_PUBLISHABLE_KEY)
  )
}

export const isClerkClientEnabled = (
  env: ClerkRuntimeEnv = import.meta.env,
): boolean => getClerkPublishableKey(env) !== undefined
