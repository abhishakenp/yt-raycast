import { describe, expect, it } from 'vitest'

import {
  getGenerationLaunchStorageKey,
  rememberGenerationLaunchHandoff,
  takeGenerationLaunchHandoff,
} from './generation-launch-handoff'

const createStorage = () => {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
  }
}

describe('generation launch handoff', () => {
  it('uses a stable session-scoped storage key', () => {
    expect(getGenerationLaunchStorageKey('session-123')).toBe(
      'ship-fast:generation-launch:session-123',
    )
  })

  it('remembers a fresh generation launch for the dashboard', () => {
    const storage = createStorage()

    rememberGenerationLaunchHandoff(storage, 'new-session')

    expect(storage.getItem(getGenerationLaunchStorageKey('new-session'))).toBe(
      '1',
    )
  })

  it('takes the handoff once and removes it', () => {
    const storage = createStorage()
    rememberGenerationLaunchHandoff(storage, 'new-session')

    expect(takeGenerationLaunchHandoff(storage, 'new-session')).toBe(true)
    expect(takeGenerationLaunchHandoff(storage, 'new-session')).toBe(false)
  })
})
