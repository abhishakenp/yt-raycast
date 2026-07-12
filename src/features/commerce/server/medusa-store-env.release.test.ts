import { describe, expect, it } from 'vitest'

import {
  getConfiguredMedusaAdminUrl,
  getConfiguredMedusaBackendUrl,
  getConfiguredMedusaStorefrontUrl,
  getMedusaAdminApiToken,
  getMedusaAdminEmail,
  getMedusaAdminPassword,
  getMedusaAdminUrl,
  getMedusaBackendUrl,
  getMedusaPublishableKey,
  getMedusaStorefrontUrl,
} from './medusa-store-env'

describe('Medusa environment release contracts', () => {
  it('uses stable local defaults when no URLs are configured', () => {
    expect(getMedusaBackendUrl({}, {})).toBe('http://localhost:9000')
    expect(getMedusaAdminUrl({}, {})).toBe('http://localhost:7001')
    expect(getMedusaStorefrontUrl({}, {})).toBe('http://localhost:9000')
    expect(getMedusaPublishableKey({}, {})).toBe('')
  })

  it('trims configured URLs and preserves key priority', () => {
    const runtime = {
      MEDUSA_BACKEND_URL: '  https://backend.example.test  ',
      VITE_MEDUSA_BACKEND_URL: 'https://lower-priority.example.test',
      MEDUSA_ADMIN_URL: ' https://admin.example.test ',
      MEDUSA_STOREFRONT_URL: ' https://store.example.test ',
    }

    expect(getConfiguredMedusaBackendUrl(runtime, {})).toBe(
      'https://backend.example.test',
    )
    expect(getConfiguredMedusaAdminUrl(runtime, {})).toBe(
      'https://admin.example.test',
    )
    expect(getConfiguredMedusaStorefrontUrl(runtime, {})).toBe(
      'https://store.example.test',
    )
  })

  it('uses runtime values before meta values for the same key', () => {
    expect(
      getConfiguredMedusaBackendUrl(
        { MEDUSA_BACKEND_URL: 'https://runtime.example.test' },
        { MEDUSA_BACKEND_URL: 'https://meta.example.test' },
      ),
    ).toBe('https://runtime.example.test')
  })

  it('resolves admin credentials from runtime or Vite meta env', () => {
    expect(
      getMedusaAdminEmail({ MEDUSA_ADMIN_EMAIL: ' admin@example.test ' }, {}),
    ).toBe('admin@example.test')
    expect(
      getMedusaAdminPassword({}, { MEDUSA_ADMIN_PASSWORD: ' meta-password ' }),
    ).toBe('meta-password')
    expect(
      getMedusaAdminApiToken(
        { MEDUSA_ADMIN_API_TOKEN: ' runtime-token ' },
        { MEDUSA_ADMIN_API_TOKEN: 'meta-token' },
      ),
    ).toBe('runtime-token')
  })

  it('falls the storefront URL back to the configured backend URL', () => {
    expect(
      getMedusaStorefrontUrl(
        { MEDUSA_BACKEND_URL: 'https://backend-as-store.example.test' },
        {},
      ),
    ).toBe('https://backend-as-store.example.test')
  })

  it.each([
    ['MEDUSA_PUBLISHABLE_API_KEY', 'pk_api'],
    ['MEDUSA_PUBLISHABLE_KEY', 'pk_server'],
    ['VITE_MEDUSA_PUBLISHABLE_KEY', 'pk_vite'],
    ['NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY', 'pk_next'],
  ] as const)('accepts the %s publishable-key alias', (key, value) => {
    expect(getMedusaPublishableKey({ [key]: value }, {})).toBe(value)
  })
})
