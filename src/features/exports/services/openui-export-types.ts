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
}

export type BuiltExport = {
  body: string | Uint8Array
  contentType: string
  filename: string
  fileCount: number
}
