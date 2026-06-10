import { describe, expect, it } from 'vitest'

import {
  createAnonymousOwnerSecret,
  forgetAnonymousOwnerSecret,
  persistAnonymousOwnerSecret,
  readAnonymousOwnerSecret,
} from '@/features/session/services/anonymous-owner-secret'

class MemoryOwnerSecretStore {
  private readonly values = new Map<string, string>()

  getItem = (key: string): string | null => this.values.get(key) ?? null

  setItem = (key: string, value: string): void => {
    this.values.set(key, value)
  }

  removeItem = (key: string): void => {
    this.values.delete(key)
  }
}

describe('anonymous owner secret', () => {
  it('creates a 32 byte hex secret', () => {
    const secret = createAnonymousOwnerSecret((bytes) => {
      bytes.fill(15)
      return bytes
    })

    expect(secret).toHaveLength(64)
    expect(secret).toBe('0f'.repeat(32))
  })

  it('stores, reads, and forgets session owner secrets', () => {
    const store = new MemoryOwnerSecretStore()

    persistAnonymousOwnerSecret(store, 'session_1', 'secret_1')

    expect(readAnonymousOwnerSecret(store, 'session_1')).toBe('secret_1')

    forgetAnonymousOwnerSecret(store, 'session_1')

    expect(readAnonymousOwnerSecret(store, 'session_1')).toBeUndefined()
  })
})
