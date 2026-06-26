// Public entry point for the clone module
export type {
  SectionKind,
  ClonedSection,
  ClonedPage,
  PageGraphNode,
  PageGraph,
  CapturedPage,
  ExtractedTokens,
  CloneProgressEvent,
  CloneOptions,
  CloneResult,
} from './types.ts'

export { cloneSite } from './job.ts'
export { crawlSite, normalizeUrl } from './crawler.ts'
export { assertPublicUrl, isAllowedScheme } from './security.ts'
export { capturePage, capturePages } from './capture.ts'
export { segmentPage, extractSectionText } from './segment.ts'
export {
  hashSection,
  sectionsSimilar,
  dedupSections,
  applyDedup,
  type DedupResult,
} from './dedup.ts'
export { extractTokens, tokensToThemeVars } from './tokens.ts'
export { convertSection, convertSections } from './convert.ts'
export {
  downloadAsset,
  downloadPageAssets,
  rewriteAssetUrls,
} from './assets.ts'
export { findFallbackBlock, generateFallbackSection } from './fallback.ts'

/**
 * Main entry point: clone a site to OpenUI
 *
 * @param url - The root URL to clone
 * @param options - Configuration options including workspace, depth, concurrency, etc.
 * @returns CloneResult with pages, theme, assets, graph, and errors
 *
 * Example:
 * ```ts
 * import { cloneSiteToOpenUI } from "@ship-fast/engine/clone"
 *
 * const result = await cloneSiteToOpenUI("https://example.com", {
 *   workspace: "/path/to/session",
 *   maxDepth: 3,
 *   maxPages: 20,
 *   concurrency: 4,
 *   onEvent: (event) => console.log(event),
 * })
 *
 * if (result.success) {
 *   console.log(`Cloned ${result.pages.length} pages`)
 *   console.log(`Theme:`, result.theme)
 * }
 * ```
 */
import { cloneSite as _cloneSite } from './job.ts'

export async function cloneSiteToOpenUI(
  url: string,
  options: import('./types.ts').CloneOptions,
): Promise<import('./types.ts').CloneResult> {
  return _cloneSite(url, options)
}
