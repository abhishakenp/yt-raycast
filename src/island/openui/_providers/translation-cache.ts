// Persistent translation cache backed by IndexedDB (via idb-keyval) with an
// in-memory L1 layer.
//
// localStorage was the original store, but translations are large and numerous
// — they blow past the ~5MB localStorage quota quickly. IndexedDB has a far
// larger budget, so it is the correct home for `sf-translation:` entries.
//
// Reads are async (IndexedDB is async). Writes are fire-and-forget: the L1
// memory cache is updated synchronously and the IndexedDB write runs in the
// background, swallowing any quota/access errors so translation never breaks
// when persistence is unavailable.

import { clear, createStore, del, get, set } from 'idb-keyval'

const translationStore = createStore('sf-translation', 'cache')

const memoryTranslationCache = new Map<string, string>()

export function translationCacheKey(locale: string, text: string): string {
  return `${locale.trim().toLowerCase()}\n${text.trim()}`
}

/**
 * Read a cached translation. Checks the in-memory L1 cache first, then falls
 * back to IndexedDB. IndexedDB hits are promoted into L1 so subsequent reads
 * stay synchronous-fast. Returns `null` when nothing usable is cached.
 */
export async function getCachedTranslation(
  locale: string,
  text: string,
): Promise<string | null> {
  const key = translationCacheKey(locale, text)
  const memory = memoryTranslationCache.get(key)
  if (memory !== undefined) {
    if (memory.trim()) return memory
    memoryTranslationCache.delete(key)
  }
  if (typeof window === 'undefined') return null
  try {
    const stored = (await get<string>(key, translationStore)) ?? null
    if (typeof stored === 'string' && stored.trim()) {
      memoryTranslationCache.set(key, stored)
      return stored
    }
    if (stored !== null && stored !== undefined) {
      // Malformed/empty entry — purge it so it can't poison future reads.
      await del(key, translationStore).catch(() => undefined)
    }
  } catch {
    return null
  }
  return null
}

/**
 * Write a translation into both cache tiers. The L1 memory cache is updated
 * synchronously; the IndexedDB write is fire-and-forget and never throws —
 * persistence failures are logged away so translation rendering is unaffected.
 */
export function setCachedTranslation(
  locale: string,
  text: string,
  translation: string,
): void {
  const key = translationCacheKey(locale, text)
  memoryTranslationCache.set(key, translation)
  if (typeof window === 'undefined') return
  // idb-keyval throws synchronously when IndexedDB is unavailable (SSR,
  // jsdom), so guard the call — a sync throw here would otherwise escape the
  // fire-and-forget `.catch()` (which only handles promise rejections) and
  // abort the caller. The memory cache is already populated above.
  try {
    void set(key, translation, translationStore).catch(() => undefined)
  } catch {
    // IndexedDB unavailable; memory cache is still populated.
  }
}

/**
 * Wipe both cache tiers. Intended for tests and locale resets.
 */
export async function clearTranslationCache(): Promise<void> {
  memoryTranslationCache.clear()
  if (typeof window === 'undefined') return
  try {
    await clear(translationStore).catch(() => undefined)
  } catch {
    // IndexedDB unavailable; memory cache is already cleared.
  }
}
