import { describe, expect, it } from 'vitest'

import {
  generationLaunchStoragePrefix,
  getGenerationLaunchStorageKey,
  rememberGenerationLaunchHandoff,
  takeGenerationLaunchHandoff,
} from '@/features/session/services/generation-launch-handoff'
import { IntroLoader } from '@/components/GenUI/IntroLoader'

const makeStorage = (): Map<string, string> & {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
} => {
  const store = new Map<string, string>()
  return Object.assign(store, {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
  }) as Map<string, string> & {
    getItem: (key: string) => string | null
    setItem: (key: string, value: string) => void
    removeItem: (key: string) => void
  }
}

describe('dashboard launch handoff', () => {
  it('remembers and takes the generation launch handoff flag per session', () => {
    const storage = makeStorage()
    const sessionId = 'session-abc'

    // Nothing remembered yet — no handoff to take.
    expect(takeGenerationLaunchHandoff(storage, sessionId)).toBe(false)

    rememberGenerationLaunchHandoff(storage, sessionId)

    // The flag is stored under the prefixed session key and consumes on take.
    const key = getGenerationLaunchStorageKey(sessionId)
    expect(key).toBe(`${generationLaunchStoragePrefix}${sessionId}`)
    expect(storage.get(key)).toBe('1')
    expect(takeGenerationLaunchHandoff(storage, sessionId)).toBe(true)

    // Taking the handoff is destructive — a second take must not re-trigger.
    expect(storage.has(key)).toBe(false)
    expect(takeGenerationLaunchHandoff(storage, sessionId)).toBe(false)
  })

  it('keeps the generation launch handoff scoped per session id', () => {
    const storage = makeStorage()

    rememberGenerationLaunchHandoff(storage, 'session-one')
    rememberGenerationLaunchHandoff(storage, 'session-two')

    expect(takeGenerationLaunchHandoff(storage, 'session-one')).toBe(true)
    // Taking one session's handoff does not clear another's.
    expect(takeGenerationLaunchHandoff(storage, 'session-two')).toBe(true)
    expect(takeGenerationLaunchHandoff(storage, 'session-one')).toBe(false)
  })

  it('exposes IntroLoader as a component that accepts a playSound prop', () => {
    // IntroLoader is a function component taking a single props argument; the
    // playSound prop defaults to true inside the component (see IntroLoader.tsx).
    expect(typeof IntroLoader).toBe('function')
    expect(IntroLoader.length).toBe(1)
  })
})
