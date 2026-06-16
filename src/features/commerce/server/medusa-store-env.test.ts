import { describe, expect, it } from 'vitest'

import {
  getMedusaBackendUrl,
  getMedusaPublishableKey,
  getMedusaStorefrontUrl,
  hasConfiguredMedusaBackendUrl,
  readMedusaEnv,
} from './medusa-store-env'

describe('medusa store env', () => {
  it('reads runtime env with bracket access', () => {
    expect(
      getMedusaBackendUrl({
        MEDUSA_BACKEND_URL: 'https://commerce.example.test',
      }),
    ).toBe('https://commerce.example.test')
  })

  it('falls back through public and vite-compatible names', () => {
    expect(
      getMedusaBackendUrl(
        {},
        { VITE_MEDUSA_BACKEND_URL: 'https://vite.example.test' },
      ),
    ).toBe('https://vite.example.test')
    expect(
      getMedusaPublishableKey(
        {},
        { NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: 'pk_test' },
      ),
    ).toBe('pk_test')
    expect(
      getMedusaStorefrontUrl(
        {},
        { NEXT_PUBLIC_MEDUSA_STOREFRONT_URL: 'https://store.example.test' },
      ),
    ).toBe('https://store.example.test')
  })

  it('ignores empty values', () => {
    expect(readMedusaEnv(['A', 'B'], { A: '   ', B: 'ready' }, {})).toBe(
      'ready',
    )
  })

  it('distinguishes fallback localhost defaults from configured backend urls', () => {
    expect(hasConfiguredMedusaBackendUrl({}, {})).toBe(false)
    expect(
      hasConfiguredMedusaBackendUrl(
        { MEDUSA_BACKEND_URL: 'http://localhost:9000' },
        {},
      ),
    ).toBe(true)
  })
})
