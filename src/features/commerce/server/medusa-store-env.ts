export type MedusaEnv = Record<string, string | undefined>

const runtimeEnv = (): MedusaEnv =>
  typeof process === 'undefined' ? {} : process.env

const viteEnv = (): MedusaEnv => ({
  MEDUSA_ADMIN_URL: import.meta.env.MEDUSA_ADMIN_URL,
  MEDUSA_ADMIN_EMAIL: import.meta.env.MEDUSA_ADMIN_EMAIL,
  MEDUSA_ADMIN_PASSWORD: import.meta.env.MEDUSA_ADMIN_PASSWORD,
  MEDUSA_ADMIN_API_TOKEN: import.meta.env.MEDUSA_ADMIN_API_TOKEN,
  MEDUSA_BACKEND_URL: import.meta.env.MEDUSA_BACKEND_URL,
  MEDUSA_PUBLISHABLE_API_KEY: import.meta.env.MEDUSA_PUBLISHABLE_API_KEY,
  MEDUSA_PUBLISHABLE_KEY: import.meta.env.MEDUSA_PUBLISHABLE_KEY,
  MEDUSA_STOREFRONT_URL: import.meta.env.MEDUSA_STOREFRONT_URL,
  NEXT_PUBLIC_MEDUSA_ADMIN_URL: import.meta.env.NEXT_PUBLIC_MEDUSA_ADMIN_URL,
  NEXT_PUBLIC_MEDUSA_BACKEND_URL: import.meta.env
    .NEXT_PUBLIC_MEDUSA_BACKEND_URL,
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: import.meta.env
    .NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  NEXT_PUBLIC_MEDUSA_STOREFRONT_URL: import.meta.env
    .NEXT_PUBLIC_MEDUSA_STOREFRONT_URL,
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

const medusaBackendUrlKeys = [
  'MEDUSA_BACKEND_URL',
  'VITE_MEDUSA_BACKEND_URL',
  'NEXT_PUBLIC_MEDUSA_BACKEND_URL',
]

const medusaAdminUrlKeys = [
  'MEDUSA_ADMIN_URL',
  'VITE_MEDUSA_ADMIN_URL',
  'NEXT_PUBLIC_MEDUSA_ADMIN_URL',
]

const medusaStorefrontUrlKeys = [
  'MEDUSA_STOREFRONT_URL',
  'VITE_MEDUSA_STOREFRONT_URL',
  'NEXT_PUBLIC_MEDUSA_STOREFRONT_URL',
]

export const getConfiguredMedusaBackendUrl = (
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): string | undefined => readMedusaEnv(medusaBackendUrlKeys, env, metaEnv)

export const getConfiguredMedusaAdminUrl = (
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): string | undefined => readMedusaEnv(medusaAdminUrlKeys, env, metaEnv)

export const getConfiguredMedusaStorefrontUrl = (
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): string | undefined => readMedusaEnv(medusaStorefrontUrlKeys, env, metaEnv)

export const hasConfiguredMedusaBackendUrl = (
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): boolean => getConfiguredMedusaBackendUrl(env, metaEnv) !== undefined

export const getMedusaBackendUrl = (
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): string =>
  getConfiguredMedusaBackendUrl(env, metaEnv) ?? 'http://localhost:9000'

export const getMedusaAdminUrl = (
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): string =>
  getConfiguredMedusaAdminUrl(env, metaEnv) ?? 'http://localhost:7001'

export const getMedusaAdminEmail = (
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): string | undefined => readMedusaEnv(['MEDUSA_ADMIN_EMAIL'], env, metaEnv)

export const getMedusaAdminPassword = (
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): string | undefined => readMedusaEnv(['MEDUSA_ADMIN_PASSWORD'], env, metaEnv)

export const getMedusaAdminApiToken = (
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): string | undefined => readMedusaEnv(['MEDUSA_ADMIN_API_TOKEN'], env, metaEnv)

export const getMedusaStorefrontUrl = (
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): string =>
  getConfiguredMedusaStorefrontUrl(env, metaEnv) ??
  getMedusaBackendUrl(env, metaEnv)

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
