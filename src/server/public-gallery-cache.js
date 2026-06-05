import { getAllSessions } from './sessions.js'

const DEFAULT_TTL_MS = 30_000
let cache = { expiresAt: 0, list: [] }

/**
 * Check if a session is eligible for the public gallery.
 * Public gallery should only include sessions that are public, complete,
 * have a usable preview artifact, and are not zero-cost test entries.
 */
function isPublicGallerySession(session) {
  // Must be homepage-ready
  if (!session.homepageReady) return false

  // Must not be private
  if (session.isPrivate === true) return false

  // Exclude zero-cost local/test runs from unauthenticated public gallery
  // (locally owned anonymous sessions are merged separately on page 1)
  if (Number(session.cost) <= 0) return false

  return true
}

export const getPublicGalleryList = (ttlMs = DEFAULT_TTL_MS) => {
  const now = Date.now()
  if (cache.list.length && cache.expiresAt > now) return cache.list

  const list = getAllSessions()
    .filter(isPublicGallerySession)
    .map((s) => ({
      id: s.id,
      prompt: s.prompt ? s.prompt.substring(0, 100) : '',
      generationTime: s.generationTime,
      elapsed: s.elapsed,
      cost: s.cost,
      createdAt: s.createdAt,
      homepageReady: s.homepageReady,
    }))

  cache = { expiresAt: now + ttlMs, list }
  return list
}

export const invalidatePublicGallery = () => {
  cache = { expiresAt: 0, list: [] }
}
