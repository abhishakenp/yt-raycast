import { strFromU8, unzipSync } from 'fflate'

import { isUnsafePublicPreviewHtml } from '../../../../convex/lib/openui_error_html'
import {
  createHtmlExportFiles,
  extractExportMetadata,
} from './html-export-files'
import type { BuiltExport, OpenUIExportInput } from './openui-export-types'
import { createZipBuffer } from './zip-builder'

type PublicExportMetadata = {
  publicRoutes: string[]
  siteUrl?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function publicRouteFromLabel(label: string, index: number): string {
  if (index === 0) return '/'
  const slug = label
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase('en-US')
    .replace(/\s+/g, '-')
  return slug ? `/${slug}` : `/page-${index + 1}`
}

function publicRoutesFromHtml(html: string): string[] {
  const labels = [
    ...html.matchAll(
      /\sdata-(?:sf-)?export-page=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
    ),
  ].map((match) => match[1] ?? match[2] ?? match[3] ?? '')
  return labels.length > 0 ? labels.map(publicRouteFromLabel) : ['/']
}

function readPublicExportMetadata(
  siteSpecJson: string | undefined,
  html: string,
): PublicExportMetadata {
  let parsed: unknown
  try {
    parsed = siteSpecJson ? JSON.parse(siteSpecJson) : null
  } catch {
    parsed = null
  }
  if (!isRecord(parsed)) {
    return { publicRoutes: publicRoutesFromHtml(html) }
  }

  const seo = isRecord(parsed.seo) ? parsed.seo : null
  const siteUrl = typeof seo?.siteUrl === 'string' ? seo.siteUrl : undefined
  const pages = Array.isArray(parsed.pages) ? parsed.pages : []
  const publicRoutes = pages.flatMap((page, index) => {
    if (!isRecord(page)) return []
    const pageSeo = isRecord(page.seo) ? page.seo : null
    if (pageSeo?.noIndex === true) return []
    if (typeof page.route === 'string' && page.route.trim()) {
      return [page.route]
    }
    const label =
      typeof page.title === 'string'
        ? page.title
        : typeof page.name === 'string'
          ? page.name
          : `Page ${index + 1}`
    return [publicRouteFromLabel(label, index)]
  })

  return {
    publicRoutes: pages.length > 0 ? publicRoutes : publicRoutesFromHtml(html),
    siteUrl,
  }
}

function withGenUIExportMetadata(
  files: Record<string, string>,
): Record<string, string> {
  return files
}

function unzipTextFiles(body: Uint8Array) {
  return Object.fromEntries(
    Object.entries(unzipSync(body)).map(([path, value]) => [
      path,
      strFromU8(value),
    ]),
  )
}

export async function buildOpenUIArtifactFiles(input: OpenUIExportInput) {
  if (input.target === 'html') {
    const {
      buildOpenUIHtmlExport,
      isUsablePreviewHtml,
      neutralizeGeneratedHtmlRuntimeMarkers,
    } = await import('./openui-html-export-builder')
    await input.onProgress?.('loading-generator')
    const download = await buildOpenUIHtmlExport({
      ...input,
      includeBadge: input.includeBadge ?? false,
    })
    if (typeof download?.body === 'string') {
      const artifactBody = isUsablePreviewHtml(input.previewHtml)
        ? download.body
        : neutralizeGeneratedHtmlRuntimeMarkers(download.body)
      const artifactDownload = { ...download, body: artifactBody }
      const publicMetadata = readPublicExportMetadata(
        input.siteSpecJson,
        artifactBody,
      )
      const files = createHtmlExportFiles(
        input.sessionId,
        'html',
        artifactBody,
        {
          includeBadge: input.includeBadge ?? false,
          publicRoutes: publicMetadata.publicRoutes,
          siteUrl: publicMetadata.siteUrl,
        },
      )
      files['README.md'] = `# Static website

Open \`index.html\` in a browser or serve this directory with any static file server.
`
      return {
        files: withGenUIExportMetadata(files),
        download: artifactDownload,
      }
    }
    throw new Error('HTML export did not produce an HTML document')
  }

  if (input.target === 'lakebed') {
    const { buildOpenUILakebedProjectFiles } =
      await import('./openui-lakebed-export-builder')
    await input.onProgress?.('loading-generator')
    const project = await buildOpenUILakebedProjectFiles(input, {
      useEnvironmentSyncSecret: true,
    })
    return { files: withGenUIExportMetadata(project.files) }
  }

  const { buildOpenUIExport } = await import('./openui-export-builder')
  await input.onProgress?.('loading-generator')
  const download = await buildOpenUIExport(input)
  if (typeof download.body === 'string') {
    throw new Error(`${input.target} export did not produce a ZIP artifact`)
  }

  return {
    files: withGenUIExportMetadata(unzipTextFiles(download.body)),
    download,
  }
}

export async function buildDownloadFromArtifactFiles(
  input: OpenUIExportInput,
  files: Record<string, string>,
  prebuiltDownload?: BuiltExport,
) {
  if (prebuiltDownload !== undefined) return prebuiltDownload

  if (input.target === 'html') {
    // Never fall back to a handoff/error preview document.
    const safePreviewHtml =
      input.previewHtml !== undefined &&
      !isUnsafePublicPreviewHtml(input.previewHtml)
        ? input.previewHtml
        : undefined
    return {
      body: files['index.html'] ?? safePreviewHtml ?? input.source,
      contentType: 'text/html; charset=utf-8',
      filename: 'index.html',
      fileCount: 1,
    }
  }

  const slugSource =
    input.target === 'lakebed'
      ? input.sessionId
      : extractExportMetadata(input.previewHtml ?? input.source).title
  const slug =
    slugSource
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'website'

  return {
    body: createZipBuffer(files),
    contentType: 'application/zip',
    filename: `${slug}-${input.target}.zip`,
    fileCount: Object.keys(files).length,
  }
}
