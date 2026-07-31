import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  PROMPT_SESSION_CACHE_KEY,
  PROMPT_SESSION_CACHE_TTL_MS,
  clearPromptSessionCache,
  isExpired,
  readPromptSessionCache,
  updatePromptInCache,
  updateSessionInCache,
  writePromptSessionCache,
} from './prompt-session-cache'

const NOW = 1_000_000

function makeStorage(): Storage {
  const map = new Map<string, string>()
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value)
    },
    removeItem: (key: string) => {
      map.delete(key)
    },
    clear: () => map.clear(),
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    get length() {
      return map.size
    },
  } as Storage
}

describe('prompt-session-cache', () => {
  let storage: Storage

  beforeEach(() => {
    storage = makeStorage()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns null when no cache exists', () => {
    expect(readPromptSessionCache(storage, NOW)).toBeNull()
  })

  it('round-trips a full cache entry', () => {
    writePromptSessionCache(storage, {
      prompt: 'A cozy coffee shop',
      fingerprint: 'fp-123',
      preferredLanguage: 'en',
      sessionId: 'session-abc',
      anonymousOwnerSecret: 'secret-xyz',
      workspace: 'workspace-001',
      createdAt: NOW,
    })
    const cache = readPromptSessionCache(storage, NOW)
    expect(cache).not.toBeNull()
    expect(cache!.prompt).toBe('A cozy coffee shop')
    expect(cache!.sessionId).toBe('session-abc')
    expect(cache!.fingerprint).toBe('fp-123')
  })

  it('returns null and removes entry when expired', () => {
    writePromptSessionCache(storage, {
      prompt: 'old prompt',
      fingerprint: 'fp-old',
      preferredLanguage: 'en',
      createdAt: NOW - PROMPT_SESSION_CACHE_TTL_MS - 1,
    })
    expect(readPromptSessionCache(storage, NOW)).toBeNull()
    expect(storage.getItem(PROMPT_SESSION_CACHE_KEY)).toBeNull()
  })

  it('isExpired returns true past TTL', () => {
    const cache = {
      prompt: 'test',
      fingerprint: 'fp',
      preferredLanguage: 'en',
      createdAt: NOW,
    }
    expect(isExpired(cache, NOW + PROMPT_SESSION_CACHE_TTL_MS + 1)).toBe(true)
    expect(isExpired(cache, NOW + 1000)).toBe(false)
  })

  it('updatePromptInCache creates a new entry if none exists', () => {
    updatePromptInCache(storage, 'hello world', NOW)
    const cache = readPromptSessionCache(storage, NOW)
    expect(cache).not.toBeNull()
    expect(cache!.prompt).toBe('hello world')
    expect(cache!.sessionId).toBeUndefined()
  })

  it('updatePromptInCache preserves session fields when updating prompt', () => {
    writePromptSessionCache(storage, {
      prompt: 'old prompt',
      fingerprint: 'fp-123',
      preferredLanguage: 'en',
      sessionId: 'session-abc',
      anonymousOwnerSecret: 'secret-xyz',
      workspace: 'workspace-001',
      createdAt: NOW,
    })
    updatePromptInCache(storage, 'new prompt', NOW)
    const cache = readPromptSessionCache(storage, NOW)
    expect(cache).not.toBeNull()
    expect(cache!.prompt).toBe('new prompt')
    expect(cache!.sessionId).toBe('session-abc')
    expect(cache!.anonymousOwnerSecret).toBe('secret-xyz')
  })

  it('updatePromptInCache is a no-op when prompt is unchanged', () => {
    writePromptSessionCache(storage, {
      prompt: 'same prompt',
      fingerprint: 'fp',
      preferredLanguage: 'en',
      createdAt: NOW,
    })
    const before = storage.getItem(PROMPT_SESSION_CACHE_KEY)
    updatePromptInCache(storage, 'same prompt', NOW)
    expect(storage.getItem(PROMPT_SESSION_CACHE_KEY)).toBe(before)
  })

  it('updateSessionInCache fills session fields and preserves prompt', () => {
    updatePromptInCache(storage, 'my prompt', NOW)
    updateSessionInCache(
      storage,
      {
        sessionId: 'session-xyz',
        anonymousOwnerSecret: 'secret-abc',
        workspace: 'workspace-002',
        fingerprint: 'fp-456',
        preferredLanguage: 'en',
      },
      NOW,
    )
    const cache = readPromptSessionCache(storage, NOW)
    expect(cache).not.toBeNull()
    expect(cache!.prompt).toBe('my prompt')
    expect(cache!.sessionId).toBe('session-xyz')
    expect(cache!.workspace).toBe('workspace-002')
    expect(cache!.fingerprint).toBe('fp-456')
  })

  it('updateSessionInCache works even with no prior cache', () => {
    updateSessionInCache(
      storage,
      {
        sessionId: 'session-xyz',
        anonymousOwnerSecret: 'secret-abc',
        workspace: 'workspace-002',
        fingerprint: 'fp-456',
        preferredLanguage: 'en',
      },
      NOW,
    )
    const cache = readPromptSessionCache(storage, NOW)
    expect(cache).not.toBeNull()
    expect(cache!.sessionId).toBe('session-xyz')
    expect(cache!.prompt).toBe('')
  })

  it('clearPromptSessionCache removes the entry', () => {
    writePromptSessionCache(storage, {
      prompt: 'test',
      fingerprint: 'fp',
      preferredLanguage: 'en',
      createdAt: NOW,
    })
    clearPromptSessionCache(storage)
    expect(storage.getItem(PROMPT_SESSION_CACHE_KEY)).toBeNull()
  })

  it('returns null for corrupted JSON', () => {
    storage.setItem(PROMPT_SESSION_CACHE_KEY, '{not valid json')
    expect(readPromptSessionCache(storage, NOW)).toBeNull()
  })

  it('returns null and removes entry with invalid shape', () => {
    storage.setItem(
      PROMPT_SESSION_CACHE_KEY,
      JSON.stringify({ prompt: 123, createdAt: 'bad' }),
    )
    expect(readPromptSessionCache(storage, NOW)).toBeNull()
    expect(storage.getItem(PROMPT_SESSION_CACHE_KEY)).toBeNull()
  })
})
