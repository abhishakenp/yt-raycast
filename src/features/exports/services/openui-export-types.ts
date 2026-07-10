export type ExportTarget = 'html' | 'react' | 'next' | 'lakebed'

export type BrandLogoSelection = {
  name: string
  domain?: string | null
  brandId?: string | null
  icon?: string | null
  logo?: string | null
}

export type OpenUIExportInput = {
  source: string
  siteSpecJson?: string
  previewHtml?: string
  sessionId: string
  prompt?: string
  target: ExportTarget
  themeName?: string
  isDark?: boolean
  locale?: string
  includeBadge?: boolean
  selectedBrandLogo?: BrandLogoSelection | null
  /**
   * Real catalog rows to seed the deployed Lakebed DB with, keyed by table name
   * (e.g. `{ tenders: [...], directory: [...] }`). Sourced from the session's
   * Lakebed store so a deploy shows the SAME full data as the live preview
   * instead of the small sample baked into page props. Falls back to
   * props/default seeding for any table not present here.
   */
  lakebedSeedData?: Record<string, Array<Record<string, unknown>>>
  /**
   * Per-deploy secret for the authorized data-sync endpoint. When set, the
   * Lakebed server bakes a `POST /__lakebed/sync` endpoint that only accepts
   * `Authorization: Bearer <syncSecret>` and bulk-replaces catalog tables from
   * the posted payload. Our platform holds the secret and pushes data (initial
   * seed + future admin inline-edits) — the deployed app never calls out.
   */
  syncSecret?: string
}

export type BuiltExport = {
  body: string | Uint8Array
  contentType: string
  filename: string
  fileCount: number
}
