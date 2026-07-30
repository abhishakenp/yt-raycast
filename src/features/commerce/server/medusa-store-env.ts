import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export type MedusaEnv = Record<string, string | undefined>

const localMedusaEnvKeys = new Set([
  'MEDUSA_ADMIN_URL',
  'MEDUSA_ADMIN_EMAIL',
  'MEDUSA_ADMIN_PASSWORD',
  'MEDUSA_ADMIN_API_TOKEN',
  'MEDUSA_BACKEND_URL',
  'MEDUSA_PUBLISHABLE_API_KEY',
  'MEDUSA_PUBLISHABLE_KEY',
  'MEDUSA_STOREFRONT_URL',
  'NEXT_PUBLIC_MEDUSA_ADMIN_URL',
  'NEXT_PUBLIC_MEDUSA_BACKEND_URL',
  'NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_MEDUSA_STOREFRONT_URL',
  'VITE_MEDUSA_ADMIN_URL',
  'VITE_MEDUSA_BACKEND_URL',
  'VITE_MEDUSA_PUBLISHABLE_KEY',
  'VITE_MEDUSA_STOREFRONT_URL',
])

let cachedLocalEnv: MedusaEnv | undefined

function runtimeEnv(): MedusaEnv {
  return typeof process === 'undefined' ? {} : process.env
}

function viteEnv(): MedusaEnv {
  // Only expose PUBLIC vars via import.meta.env.
  // Sensitive credentials (ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_API_TOKEN) are
  // read exclusively from process.env / local .env — never from the client
  // bundle — to prevent accidental leakage if this module is ever imported
  // client-side.
  return {
    MEDUSA_ADMIN_URL: import.meta.env.MEDUSA_ADMIN_URL,
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

function unquoteDotenvValue(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length < 2) return trimmed

  const quote = trimmed.at(0)
  if ((quote !== '"' && quote !== "'") || trimmed.at(-1) !== quote) {
    return trimmed
  }

  return trimmed.slice(1, -1)
}

function parseLocalDotenv(source: string): MedusaEnv {
  const parsed: MedusaEnv = {}

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const normalized = line.startsWith('export ') ? line.slice(7).trim() : line
    const separator = normalized.indexOf('=')
    if (separator <= 0) continue

    const key = normalized.slice(0, separator).trim()
    if (!localMedusaEnvKeys.has(key)) continue

    parsed[key] = unquoteDotenvValue(normalized.slice(separator + 1))
  }

  return parsed
}

function readLocalDotenvEnv(): MedusaEnv {
  if (cachedLocalEnv !== undefined) return cachedLocalEnv

  const localEnv: MedusaEnv = {}

  if (typeof process === 'undefined') {
    cachedLocalEnv = localEnv
    return localEnv
  }

  for (const filename of ['.env', '.env.local']) {
    const filePath = resolve(process.cwd(), filename)
    if (!existsSync(filePath)) continue
    Object.assign(localEnv, parseLocalDotenv(readFileSync(filePath, 'utf8')))
  }

  cachedLocalEnv = localEnv
  return localEnv
}

export function readMedusaEnv(
  keys: Array<string>,
  env?: MedusaEnv,
  metaEnv?: MedusaEnv,
  localEnv?: MedusaEnv,
): string | undefined {
  const runtime = env ?? runtimeEnv()
  const meta = metaEnv ?? viteEnv()
  const local =
    localEnv ??
    (env === undefined && metaEnv === undefined ? readLocalDotenvEnv() : {})

  for (const key of keys) {
    const value =
      configured(runtime[key]) ??
      configured(meta[key]) ??
      configured(local[key])
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
