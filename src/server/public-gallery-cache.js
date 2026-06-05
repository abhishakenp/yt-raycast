import { getAllSessions } from './sessions.js'

const DEFAULT_TTL_MS = 30_000
let cache = { expiresAt: 0, list: [] }

export const getPublicGalleryList = (ttlMs = DEFAULT_TTL_MS) => {
  const now = Date.now()
  if (cache.list.length && cache.expiresAt > now) return cache.list

  const list = getAllSessions()
    .filter((s) => s.isPrivate !== true)
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
