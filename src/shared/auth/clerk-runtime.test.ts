import { describe, expect, it } from 'vitest'

import {
  getClerkPublishableKey,
  isClerkClientEnabled,
  isClerkDisabled,
} from './clerk-runtime'

describe('clerk runtime config', () => {
  it('treats VITE_DISABLE_CLERK=true as a hard client-side Clerk disable', () => {
    expect(
      isClerkDisabled({
        VITE_DISABLE_CLERK: 'true',
        VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
      }),
    ).toBe(true)
    expect(
      getClerkPublishableKey({
        VITE_DISABLE_CLERK: 'true',
        VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
      }),
    ).toBeUndefined()
    expect(
      isClerkClientEnabled({
        VITE_DISABLE_CLERK: 'true',
        VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
      }),
    ).toBe(false)
  })

  it('uses the Vite public Clerk key when Clerk is not disabled', () => {
    expect(
      getClerkPublishableKey({
        VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_public',
        CLERK_PUBLISHABLE_KEY: 'pk_test_server',
      }),
    ).toBe('pk_test_public')
    expect(
      isClerkClientEnabled({
        VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_public',
      }),
    ).toBe(true)
  })
})
