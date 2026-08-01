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

const REQUIRED_CONVEX_ENV = [
  'BILLING_WEBHOOK_MUTATION_SECRET',
  'GALLERY_PREVIEW_MUTATION_SECRET',
  'CONTENT_MODERATION_MUTATION_SECRET',
  'GITHUB_WEBHOOK_MUTATION_SECRET',
]

const BOOLEAN_ENV = ['DISABLE_PAYWALL', 'DISABLE_LIMIT', 'DISABLE_MODEL_SPEND']
const SECRET_ENV = REQUIRED_WEB_ENV.filter((name) =>
  /(SECRET|SALT)$/i.test(name),
)
const REQUIRED_LIVE_CREDENTIAL_PREFIXES = {
  CLERK_SECRET_KEY: 'sk_live_',
  RAZORPAY_KEY_ID: 'rzp_live_',
  STRIPE_SECRET_KEY: 'sk_live_',
  VITE_CLERK_PUBLISHABLE_KEY: 'pk_live_',
}

const value = (env, name) => String(env[name] ?? '').trim()

export const validateProductionConfig = ({ env, convexEnvNames }) => {
  const errors = []
  for (const name of REQUIRED_WEB_ENV) {
    if (!value(env, name)) errors.push(`missing web env: ${name}`)
  }
  for (const name of SECRET_ENV) {
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
    !/^[0-9a-f]{64}$/i.test(value(env, 'SHIP_FAST_IP_HASH_SALT'))
  ) {
    errors.push('SHIP_FAST_IP_HASH_SALT must be a 32-byte hex value')
  }
  for (const [name, prefix] of Object.entries(
    REQUIRED_LIVE_CREDENTIAL_PREFIXES,
  )) {
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
