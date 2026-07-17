import { useEffect, useState } from 'react'

/**
 * Ticks a live `Date.now()` value once per `intervalMs` while `active` is
 * true, so elapsed-time/ETA text next to a real progress percent keeps
 * moving between server-pushed stage events. Idle (no interval, no
 * re-renders) whenever nothing is actively building.
 */
export function useProgressTick(active: boolean, intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [active, intervalMs])

  return now
}
