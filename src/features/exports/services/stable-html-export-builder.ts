import { isUnsafePublicPreviewHtml } from '../../../../convex/lib/openui_error_html'
import { buildHtmlExport } from './html-export-builder'
import type { BuiltExport } from './openui-export-types'
import type { StableExportInput } from './stable-artifact-contract'

/** Builds a portable HTML document from the finalized engine artifact only. */
export const buildStableHtmlExport = async (
  input: StableExportInput,
): Promise<BuiltExport> => {
  const html = input.artifact.html
  if (isUnsafePublicPreviewHtml(html)) {
    throw new Error('Export preview is not safe. Regenerate the preview before exporting.')
  }

  const projectName = input.artifact.siteSpec?.projectName ?? input.sessionId
  const slug = projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'website'

  return {
    body: buildHtmlExport(html, {
      includeBadge: input.includeBadge ?? false,
      canonicalUrl: input.artifact.seo?.siteUrl,
    }),
    contentType: 'text/html; charset=utf-8',
    filename: `${slug}.html`,
    fileCount: 1,
  }
}

export const isUsableStableHtml = (html: string): boolean => {
  const trimmed = html.trim()
  return Boolean(trimmed) && !isUnsafePublicPreviewHtml(trimmed)
}
