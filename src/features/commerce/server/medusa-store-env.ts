export type MedusaEnv = Record<string, string | undefined>

function runtimeEnv(): MedusaEnv {
  return typeof process === 'undefined' ? {} : process.env
}

function viteEnv(): MedusaEnv {
  return {
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
  }
}

function configured(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export function readMedusaEnv(
  keys: Array<string>,
  env: MedusaEnv = runtimeEnv(),
  metaEnv: MedusaEnv = viteEnv(),
): string | undefined {
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

export function getConfiguredMedusaBackendUrl(
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): string | undefined {
  return readMedusaEnv(medusaBackendUrlKeys, env, metaEnv)
}

export function getConfiguredMedusaAdminUrl(
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): string | undefined {
  return readMedusaEnv(medusaAdminUrlKeys, env, metaEnv)
}

export function getConfiguredMedusaStorefrontUrl(
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): string | undefined {
  return readMedusaEnv(medusaStorefrontUrlKeys, env, metaEnv)
}

export function hasConfiguredMedusaBackendUrl(
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): boolean {
  return getConfiguredMedusaBackendUrl(env, metaEnv) !== undefined
}

export function getMedusaBackendUrl(
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): string {
  return getConfiguredMedusaBackendUrl(env, metaEnv) ?? 'http://localhost:9000'
}

export function getMedusaAdminUrl(
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): string {
  return getConfiguredMedusaAdminUrl(env, metaEnv) ?? 'http://localhost:7001'
}

export function getMedusaAdminEmail(
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): string | undefined {
  return readMedusaEnv(['MEDUSA_ADMIN_EMAIL'], env, metaEnv)
}

export function getMedusaAdminPassword(
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): string | undefined {
  return readMedusaEnv(['MEDUSA_ADMIN_PASSWORD'], env, metaEnv)
}

export function getMedusaAdminApiToken(
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): string | undefined {
  return readMedusaEnv(['MEDUSA_ADMIN_API_TOKEN'], env, metaEnv)
}

export function getMedusaStorefrontUrl(
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): string {
  return (
    getConfiguredMedusaStorefrontUrl(env, metaEnv) ??
    getMedusaBackendUrl(env, metaEnv)
  )
}

export function getMedusaPublishableKey(
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
): string {
  return (
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
  )
}
