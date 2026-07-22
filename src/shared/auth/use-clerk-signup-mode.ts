import { useEffect, useState } from 'react'

import { isClerkClientEnabled } from './clerk-runtime'

/**
 * Clerk sign-up modes as exposed by the Frontend API environment.
 * - `'public'` — open sign-ups (waitlist OFF)
 * - `'restricted'` — invitation-only
 * - `'waitlist'` — waitlist mode ON (dashboard toggle)
 */
export type ClerkSignUpMode = 'public' | 'restricted' | 'waitlist'

/**
 * Minimal shape of `window.Clerk.__internal_environment` that we read.
 * The full `EnvironmentResource` is internal/undocumented in Clerk's SDK;
 * we only need the sign-up mode field.
 */
type ClerkEnvironmentShape = {
  userSettings?: {
    signUp?: {
      mode?: ClerkSignUpMode
    }
  }
}

type ClerkWithEnvironment = {
  __internal_environment?: ClerkEnvironmentShape | null
  addListener?: (listener: () => void) => (() => void) | void
}

type ClerkWindow = Window & {
  Clerk?: ClerkWithEnvironment
}

const isClerkConfigured = isClerkClientEnabled()

function readSignUpMode(): ClerkSignUpMode | undefined {
  if (typeof window === 'undefined') return undefined
  const clerk = (window as ClerkWindow).Clerk
  return clerk?.__internal_environment?.userSettings?.signUp?.mode
}

/**
 * Reads Clerk's live sign-up mode from the Frontend API environment
 * (`window.Clerk.__internal_environment.userSettings.signUp.mode`).
 *
 * This reflects the dashboard "Enable waitlist" toggle in real time —
 * no redeploy needed to turn the waitlist UI on/off.
 *
 * Returns `undefined` during SSR and until Clerk finishes loading
 * (the environment is fetched asynchronously during `clerk.load()`).
 * Consumers should treat `undefined` as "unknown — show a loading state".
 *
 * SSR-safety: `useState` initialiser guards on `typeof window === 'undefined'`;
 * `useEffect` (client-only) polls until the environment is available.
 */
export function useClerkSignUpMode(): ClerkSignUpMode | undefined {
  const [mode, setMode] = useState<ClerkSignUpMode | undefined>(readSignUpMode)

  useEffect(() => {
    if (!isClerkConfigured || typeof window === 'undefined') return

    let cancelled = false
    const timers: number[] = []

    const sync = () => {
      if (cancelled) return
      const next = readSignUpMode()
      if (next && next !== mode) {
        setMode(next)
      }
    }

    // Clerk loads asynchronously — poll until the environment is available.
    // The environment doesn't change at runtime after initial load, so we
    // stop once we have a value (timers after that are no-ops via `cancelled`).
    for (const delay of [0, 50, 250, 750, 1500, 3000]) {
      timers.push(window.setTimeout(sync, delay))
    }

    // Also listen for Clerk state changes (fires when Clerk finishes loading).
    const clerk = (window as ClerkWindow).Clerk
    const unsubscribe = clerk?.addListener?.(sync)

    return () => {
      cancelled = true
      if (typeof unsubscribe === 'function') unsubscribe()
      for (const t of timers) window.clearTimeout(t)
    }
  }, [mode])

  return mode
}
