import { describe, expect, it } from 'vitest'

import viteConfig from '../vite.config'

const envPrefixes = Array.isArray(viteConfig.envPrefix)
  ? viteConfig.envPrefix
  : [viteConfig.envPrefix ?? 'VITE_']

function exposedByVite(key: string) {
  return envPrefixes.some((prefix) => key.startsWith(prefix))
}

describe('runtime environment release boundary', () => {
  it('does not expose current server-only credentials to browser code', () => {
    const serverOnlyKeys = [
      'BILLING_WEBHOOK_MUTATION_SECRET',
      'CLERK_SECRET_KEY',
      'CONVEX_SELF_HOSTED_ADMIN_KEY',
      'DUB_API_KEY',
      'GEMINI_API_KEY',
      'GROQ_API_KEY',
      'MEDUSA_ADMIN_API_TOKEN',
      'MEDUSA_ADMIN_PASSWORD',
      'RAZORPAY_KEY_SECRET',
      'STRIPE_SECRET_KEY',
    ]

    expect(serverOnlyKeys.filter(exposedByVite)).toEqual([])
  })

  it('does not expose broad backend namespaces that can capture future secrets', () => {
    const serverNamespaceCredentials = [
      'MEDUSA_BACKEND_ADMIN_TOKEN',
      'MEDUSA_BACKEND_DATABASE_PASSWORD',
      'MEDUSA_BACKEND_INTERNAL_SECRET',
    ]

    expect(serverNamespaceCredentials.filter(exposedByVite)).toEqual([])
  })
})
