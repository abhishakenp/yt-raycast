/**
 * plan-cache-client.ts — interface for a plan-level prompt cache client.
 *
 * Used by the composition runner to skip the expensive LLM call when the same
 * prompt+language has already been generated. The cache stores the raw LLM
 * composition DSL string, so a cache hit skips the main `generateText` call
 * entirely while still allowing a fresh per-session seed to re-randomize
 * theme/layout via `compileComposition`.
 */
export interface PlanCacheClient {
  /** Returns the cached raw composition DSL string for the given key, or null. */
  get: (input: { promptCacheKey: string }) => Promise<string | null>
  /** Stores the raw composition DSL string for the given key. */
  set: (input: { promptCacheKey: string; rawPlan: string }) => Promise<unknown>
}
