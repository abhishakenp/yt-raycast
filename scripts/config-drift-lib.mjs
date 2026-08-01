const REQUIRED_WEB_ENV = [
  'APP_BASE_URL',
  'CONVEX_URL',
  'VITE_CONVEX_URL',
  'CLERK_SECRET_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
  'BILLING_WEBHOOK_MUTATION_SECRET',
  'GITHUB_WEBHOOK_SECRET',
  'GITHUB_WEBHOOK_MUTATION_SECRET',
  'SHIP_FAST_IP_HASH_SALT',
]
const STRIPE_ENV = new Set(['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'])
const PROVIDER_MANAGED_SECRETS = new Set([
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
])

const REQUIRED_CONVEX_ENV = [
  'BILLING_WEBHOOK_MUTATION_SECRET',
  'GALLERY_PREVIEW_MUTATION_SECRET',
  'CONTENT_MODERATION_MUTATION_SECRET',
  'GITHUB_WEBHOOK_MUTATION_SECRET',
]

const BOOLEAN_ENV = [
  'DISABLE_PAYWALL',
  'DISABLE_LIMIT',
  'DISABLE_MODEL_SPEND',
  'STRIPE_ENABLED',
]
const SECRET_ENV = REQUIRED_WEB_ENV.filter(
  (name) => /(SECRET|SALT)$/i.test(name) && !PROVIDER_MANAGED_SECRETS.has(name),
)
const REQUIRED_LIVE_CREDENTIAL_PREFIXES = {
  CLERK_SECRET_KEY: 'sk_live_',
  RAZORPAY_KEY_ID: 'rzp_live_',
  STRIPE_SECRET_KEY: 'sk_live_',
  VITE_CLERK_PUBLISHABLE_KEY: 'pk_live_',
}

const value = (env, name) => String(env[name] ?? '').trim()
const isStripeDisabled = (env) => value(env, 'STRIPE_ENABLED') === 'false'
const isValidIpHashSalt = (salt) => {
  if (/^[0-9a-f]{64}$/i.test(salt)) return true
  if (!/^[A-Za-z0-9+/_-]{43}=?$/.test(salt)) return false
  const normalized = salt.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(normalized.padEnd(44, '='), 'base64').length === 32
}

export const parseConvexEnvironmentNames = (output) =>
  new Set(
    output
      .split(/\r?\n/)
      .map((line) => line.slice(0, line.indexOf('=')).trim())
      .filter(Boolean),
  )

export const validateProductionConfig = ({ env, convexEnvNames }) => {
  const errors = []
  for (const name of REQUIRED_WEB_ENV) {
    if (isStripeDisabled(env) && STRIPE_ENV.has(name)) continue
    if (!value(env, name)) errors.push(`missing web env: ${name}`)
  }
  for (const name of SECRET_ENV) {
    if (isStripeDisabled(env) && STRIPE_ENV.has(name)) continue
    if (value(env, name).length > 0 && value(env, name).length < 32) {
      errors.push(`secret too short: ${name}`)
    }
  }
  for (const name of BOOLEAN_ENV) {
    const configured = value(env, name)
    if (configured && configured !== 'true' && configured !== 'false') {
      errors.push(`invalid boolean: ${name}`)
    }
  }
  if (
    value(env, 'SHIP_FAST_IP_HASH_SALT') &&
    !isValidIpHashSalt(value(env, 'SHIP_FAST_IP_HASH_SALT'))
  ) {
    errors.push('SHIP_FAST_IP_HASH_SALT must encode exactly 32 bytes')
  }
  for (const [name, prefix] of Object.entries(
    REQUIRED_LIVE_CREDENTIAL_PREFIXES,
  )) {
    if (isStripeDisabled(env) && name === 'STRIPE_SECRET_KEY') continue
    if (!value(env, name).startsWith(prefix)) {
      errors.push(`production credential is not live: ${name}`)
    }
  }
  if (convexEnvNames) {
    for (const name of REQUIRED_CONVEX_ENV) {
      if (!convexEnvNames.has(name)) errors.push(`missing Convex env: ${name}`)
    }
  }
  return { ok: errors.length === 0, errors }
}

export {
  REQUIRED_CONVEX_ENV,
  REQUIRED_LIVE_CREDENTIAL_PREFIXES,
  REQUIRED_WEB_ENV,
}
