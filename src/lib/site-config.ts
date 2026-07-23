function trimSlash(u: string) {
  return u.replace(/\/+$/, '')
}

export const SITE_NAME = (
  process.env.NEXT_PUBLIC_SITE_NAME ?? 'Ship Fast'
).trim()
export const SITE_URL = trimSlash(
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ship-fast.ai',
)
export const BASE_DOMAIN = (
  process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'ship-fast.ai'
).trim()
export const PLAUSIBLE_DOMAIN =
  process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? new URL(SITE_URL).hostname

export const LEGAL_CONTROLLER_NAME = (
  process.env.NEXT_PUBLIC_LEGAL_CONTROLLER_NAME ?? 'Livio Gamassia'
).trim()
export const LEGAL_CONTROLLER_ADDRESS = (
  process.env.NEXT_PUBLIC_LEGAL_CONTROLLER_ADDRESS ?? ''
).trim()
export const PRIVACY_CONTACT_EMAIL = (
  process.env.NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL ?? 'hello@ship-fast.ai'
).trim()
export const PRIVACY_POLICY_JURISDICTION = (
  process.env.NEXT_PUBLIC_PRIVACY_POLICY_JURISDICTION ?? ''
).trim()
export const PRIVACY_POLICY_EFFECTIVE_DATE = (
  process.env.NEXT_PUBLIC_PRIVACY_POLICY_EFFECTIVE_DATE ?? '2026-04-03'
).trim()

export const HOME_TITLE = `${SITE_NAME} - AI Website Generator`
export const HOME_DESCRIPTION =
  'Generate a public homepage, review the preview, and export clean HTML, React, or Next.js output.'
export const HOME_KEYWORDS = [
  'ai website generator',
  'ai homepage generator',
  'landing page generator',
  'saas website builder',
  'react website generator',
  'nextjs website generator',
].join(', ')

export const OG_IMAGE_PATH = '/og-image.png'

export const backendOrigin = () =>
  (process.env.SF_BACKEND_ORIGIN ?? 'http://127.0.0.1:7420').replace(/\/+$/, '')
