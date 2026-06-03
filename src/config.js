import './env.js'

export * from '@ship-fast/engine/config.js'

/** RunPod (Hex1) endpoint — used for India-mode LLM routing via src/llm/hex1.js. */
export const RUNPOD_API_URL = (process.env.RUNPOD_API_URL ?? '').trim()
export const RUNPOD_API_KEY = (process.env.RUNPOD_API_KEY ?? '').trim()
export const RUNPOD_MODEL = (process.env.RUNPOD_MODEL ?? '').trim()

/** Vanilla server port. Local product and gallery entrypoint is 7420. */
export const DASHBOARD_PORT = parseInt(process.env.DASHBOARD_PORT ?? '7420', 10)
export const SITE_NAME = 'Ship Fast'
export const SITE_URL = (process.env.SITE_URL ?? 'https://ship-fast.io').replace(/\/+$/, '')
export const BASE_DOMAIN = process.env.BASE_DOMAIN ?? 'ship-fast.io'
export const PLAUSIBLE_DOMAIN = process.env.PLAUSIBLE_DOMAIN ?? new URL(SITE_URL).hostname

export const LEGAL_CONTROLLER_NAME = (process.env.LEGAL_CONTROLLER_NAME ?? 'Livio Gamassia').trim()
export const LEGAL_CONTROLLER_ADDRESS = (process.env.LEGAL_CONTROLLER_ADDRESS ?? '').trim()
export const PRIVACY_CONTACT_EMAIL = (
  process.env.PRIVACY_CONTACT_EMAIL ?? 'hello@ship-fast.io'
).trim()
export const PRIVACY_POLICY_JURISDICTION = (process.env.PRIVACY_POLICY_JURISDICTION ?? '').trim()
export const PRIVACY_POLICY_EFFECTIVE_DATE = (
  process.env.PRIVACY_POLICY_EFFECTIVE_DATE ?? '2026-04-03'
).trim()

export const SANITY_PROJECT_ID = (process.env.SANITY_PROJECT_ID ?? '').trim()
export const SANITY_DATASET = (process.env.SANITY_DATASET ?? 'production').trim()
export const SANITY_API_VERSION = (process.env.SANITY_API_VERSION ?? '2024-01-01').trim()
export const SANITY_READ_TOKEN = (process.env.SANITY_READ_TOKEN ?? '').trim()
export const SANITY_WRITE_TOKEN = (process.env.SANITY_WRITE_TOKEN ?? '').trim()
export const SANITY_MANAGEMENT_TOKEN = (process.env.SANITY_MANAGEMENT_TOKEN ?? '').trim()

export const isSanityConfigured = () => Boolean(SANITY_PROJECT_ID && SANITY_DATASET)

export const isSanityChatWriteConfigured = () => Boolean(isSanityConfigured() && SANITY_WRITE_TOKEN)

export const isOpenUIDisabled = () => process.env.DISABLE_OPENUI === 'true'

export const getMedusaAdminAppUrl = () => {
  const explicit = (process.env.MEDUSA_ADMIN_URL || '').trim()
  if (explicit) {
    try {
      const u = new URL(explicit)
      return u.pathname === '/' || u.pathname === ''
        ? `${u.origin}/app`
        : explicit.replace(/\/+$/, '')
    } catch {
      return ''
    }
  }
  const backend = (process.env.MEDUSA_BACKEND_URL || '').trim()
  if (!backend) return ''
  try {
    const u = new URL(backend)
    return `${u.origin}/app`
  } catch {
    return ''
  }
}

export const resolveMedusaAdminEmbedPayload = (eligible) => {
  if (process.env.SHIP_FAST_MEDUSA_ADMIN_EMBED === '0') {
    return { show: false, url: null }
  }
  const url = getMedusaAdminAppUrl()
  if (!url) return { show: false, url: null }
  if (!eligible) return { show: false, url }
  return { show: true, url }
}
