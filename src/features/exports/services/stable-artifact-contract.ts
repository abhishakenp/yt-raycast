/**
 * Stable Engine→Artifact Contract
 *
 * This contract defines the stable interface between the engine and exports/deployments.
 * The engine produces artifacts in this format, and exports/deployments consume them.
 * This decouples exports/deployments from engine internals (capsules, intermediate artifacts).
 *
 * When the engine changes its internal implementation, it must continue to produce
 * artifacts that conform to this contract. Exports and deployments should only depend
 * on this contract, not on engine internals.
 */

/**
 * Stable artifact produced by the engine
 */
export type StableEngineArtifact = {
  /**
   * Final rendered HTML - the complete, ready-to-use HTML document
   * This is the primary artifact that exports/deployments work with
   */
  html: string

  /**
   * Site specification as structured JSON
   * Contains metadata about the site structure, pages, SEO settings, etc.
   */
  siteSpec?: SiteSpec

  /**
   * SEO metadata for the site
   */
  seo?: SiteSeoMetadata

  /**
   * Route/page structure
   */
  routes?: RouteInfo[]

  /**
   * Lakebed-specific data (for deployments)
   */
  lakebedData?: LakebedArtifactData
}

/**
 * Site specification metadata
 */
export type SiteSpec = {
  projectName?: string
  brand?: string
  themeName?: string
  pages?: PageSpec[]
  seo?: SeoSpec
}

/**
 * Page specification
 */
export type PageSpec = {
  title?: string
  name?: string
  route?: string
  seo?: {
    noIndex?: boolean
    description?: string
  }
}

/**
 * SEO specification
 */
export type SeoSpec = {
  siteName?: string
  siteUrl?: string
  description?: string
}

/**
 * Site SEO metadata
 */
export type SiteSeoMetadata = {
  title?: string
  description?: string
  siteUrl?: string
  llmsTxtContent?: string // For llms.txt generation
}

/**
 * Route information
 */
export type RouteInfo = {
  path: string
  label: string
  componentName?: string
}

/**
 * Lakebed-specific artifact data
 */
export type LakebedArtifactData = {
  /**
   * Lakebed seed data keyed by table name
   */
  seedData?: Record<string, Array<Record<string, unknown>>>

  /**
   * Data sync secret for authorized endpoint
   */
  syncSecret?: string
}

/**
 * Theme information
 */
export type ThemeInfo = {
  name?: string
  isDark?: boolean
  locale?: string
}

/**
 * Brand logo selection
 */
export type BrandLogoSelection = {
  name: string
  domain?: string | null
  brandId?: string | null
  icon?: string | null
  logo?: string | null
}

/**
 * Complete export input based on stable artifact
 * This replaces OpenUIExportInput for decoupled exports
 */
export type StableExportInput = {
  /**
   * The stable artifact from the engine
   */
  artifact: StableEngineArtifact

  /**
   * Session identifier
   */
  sessionId: string

  /**
   * Export target
   */
  target: 'html' | 'react' | 'next' | 'lakebed'

  /**
   * Theme information
   */
  theme?: ThemeInfo

  /**
   * Brand logo selection
   */
  selectedBrandLogo?: BrandLogoSelection | null

  /**
   * Whether to include export badge
   */
  includeBadge?: boolean

  /**
   * Original prompt (for metadata)
   */
  prompt?: string

  /**
   * Format cache for file formatting
   */
  formatCache?: import('./format-export-files').FormatFileCache

  /**
   * Progress callback
   */
  onProgress?: (stageKey: string) => void | Promise<void>
}

/**
 * Validation result for stable artifact
 */
export type ArtifactValidationResult = {
  valid: boolean
  errors?: string[]
}

/**
 * Validate that an artifact conforms to the stable contract
 */
export function validateStableArtifact(
  artifact: unknown,
): ArtifactValidationResult {
  if (typeof artifact !== 'object' || artifact === null) {
    return { valid: false, errors: ['Artifact must be an object'] }
  }

  const a = artifact as Partial<StableEngineArtifact>

  if (typeof a.html !== 'string' || a.html.length === 0) {
    return {
      valid: false,
      errors: ['Artifact must have a non-empty html string'],
    }
  }

  return { valid: true }
}
