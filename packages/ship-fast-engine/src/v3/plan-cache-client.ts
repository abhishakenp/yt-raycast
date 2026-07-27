/**
 * Interface for a plan-level prompt cache client used by the v3 engine to
 * skip the expensive LLM plan call when the same prompt+language has already
 * been generated. The cache stores the raw LLM plan output (the site-plan DSL
 * string), so a cache hit skips the main `generateText` call entirely while
 * still allowing a fresh per-session seed to re-randomize theme/layout via
 * `compileSitePlan`.
 *
 * This is the v3 equivalent of the legacy `sectionContentCache` table — the
 * table already exists in Convex (`convex/contentCache.ts`) but was never
 * wired into the v3 engine path. This interface bridges that gap.
 */
export interface PlanCacheClient {
  /** Returns the cached raw plan DSL string for the given key, or null. */
  get: (input: { promptCacheKey: string }) => Promise<string | null>
  /** Stores the raw plan DSL string for the given key. */
  set: (input: { promptCacheKey: string; rawPlan: string }) => Promise<unknown>
}
