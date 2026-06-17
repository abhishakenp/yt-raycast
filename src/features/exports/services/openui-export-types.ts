export type ExportTarget = 'html' | 'react' | 'next'

export type OpenUIExportInput = {
  source: string
  siteSpecJson?: string
  previewHtml?: string
  sessionId: string
  target: ExportTarget
  themeName?: string
  isDark?: boolean
  includeBadge?: boolean
}

export type BuiltExport = {
  body: string | Uint8Array
  contentType: string
  filename: string
  fileCount: number
}
