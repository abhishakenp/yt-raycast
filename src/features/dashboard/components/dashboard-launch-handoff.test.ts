// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'

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
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

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

  it('renders the intro loader without starting launch audio when playSound is disabled', () => {
    const audioPlay = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal(
      'Audio',
      vi.fn().mockImplementation(() => ({
        play: audioPlay,
        volume: 0,
      })),
    )

    render(createElement(IntroLoader, { playSound: false, progress: 0.4 }))

    const loader = screen.getByRole('status')
    expect(loader.getAttribute('aria-busy')).toBe('true')
    expect(loader.style.getPropertyValue('--intro-progress')).toBe('0.4')
    expect(screen.getByAltText('Ship Fast Logo')).toBeTruthy()
    expect(audioPlay).not.toHaveBeenCalled()
  })
})
