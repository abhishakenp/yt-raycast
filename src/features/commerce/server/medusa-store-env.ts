type MedusaEnv = Record<string, string | undefined>

const runtimeEnv = (): MedusaEnv =>
  typeof process === 'undefined' ? {} : process.env

const viteEnv = (): MedusaEnv => ({
  MEDUSA_ADMIN_URL: import.meta.env.MEDUSA_ADMIN_URL,
  MEDUSA_BACKEND_URL: import.meta.env.MEDUSA_BACKEND_URL,
  MEDUSA_PUBLISHABLE_API_KEY: import.meta.env.MEDUSA_PUBLISHABLE_API_KEY,
  MEDUSA_PUBLISHABLE_KEY: import.meta.env.MEDUSA_PUBLISHABLE_KEY,
  MEDUSA_STOREFRONT_URL: import.meta.env.MEDUSA_STOREFRONT_URL,
  NEXT_PUBLIC_MEDUSA_ADMIN_URL: import.meta.env.NEXT_PUBLIC_MEDUSA_ADMIN_URL,
  NEXT_PUBLIC_MEDUSA_BACKEND_URL: import.meta.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: import.meta.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  NEXT_PUBLIC_MEDUSA_STOREFRONT_URL: import.meta.env.NEXT_PUBLIC_MEDUSA_STOREFRONT_URL,
  VITE_MEDUSA_ADMIN_URL: import.meta.env.VITE_MEDUSA_ADMIN_URL,
  VITE_MEDUSA_BACKEND_URL: import.meta.env.VITE_MEDUSA_BACKEND_URL,
  VITE_MEDUSA_PUBLISHABLE_KEY: import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY,
  VITE_MEDUSA_STOREFRONT_URL: import.meta.env.VITE_MEDUSA_STOREFRONT_URL,
})

const configured = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export const readMedusaEnv = (
  keys: Array<string>,
  env: MedusaEnv = runtimeEnv(),
  metaEnv: MedusaEnv = viteEnv(),
): string | undefined => {
  for (const key of keys) {
    const value = configured(env[key]) ?? configured(metaEnv[key])
    if (value !== undefined) return value
  }
  return undefined
}

export const getMedusaBackendUrl = (
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): string =>
  readMedusaEnv(
    ['MEDUSA_BACKEND_URL', 'VITE_MEDUSA_BACKEND_URL', 'NEXT_PUBLIC_MEDUSA_BACKEND_URL'],
    env,
    metaEnv,
  ) ?? 'http://localhost:9000'

export const getMedusaAdminUrl = (
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): string =>
  readMedusaEnv(
    ['MEDUSA_ADMIN_URL', 'VITE_MEDUSA_ADMIN_URL', 'NEXT_PUBLIC_MEDUSA_ADMIN_URL'],
    env,
    metaEnv,
  ) ?? 'http://localhost:7001'

export const getMedusaPublishableKey = (
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): string =>
  readMedusaEnv(
    [
      'MEDUSA_PUBLISHABLE_API_KEY',
      'MEDUSA_PUBLISHABLE_KEY',
      'VITE_MEDUSA_PUBLISHABLE_KEY',
      'NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY',
    ],
    env,
    metaEnv,
  ) ?? ''
