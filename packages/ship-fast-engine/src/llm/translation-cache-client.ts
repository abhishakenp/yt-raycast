/**
 * Interface for a translation cache client used by the engine to check
 * and populate the shared translation cache (Convex `translationCache` +
 * `sessionTranslationOverrides` tables).
 *
 * This is the single source of truth for all export targets: generation-time
 * translations are saved here, and all export builders (HTML, React, Next,
 * Lakebed) read from the same cache via `loadCachedTranslationsForSource`.
 */
export interface TranslationCacheClient {
  getBatch: (input: {
    locale: string
    texts: string[]
    sessionId?: string
  }) => Promise<Array<string | null>>
  setBatch: (input: {
    locale: string
    entries: Array<{ text: string; translation: string }>
  }) => Promise<unknown>
}
