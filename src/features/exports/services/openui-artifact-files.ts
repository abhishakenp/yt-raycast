import { strFromU8, unzipSync } from 'fflate'

import {
  createHtmlExportFiles,
  extractExportMetadata,
} from './html-export-files'
import { buildOpenUIExport } from './openui-export-builder'
import { buildOpenUIHtmlExport } from './openui-html-export-builder'
import { buildOpenUILakebedProjectFiles } from './openui-lakebed-export-builder'
import type { BuiltExport, OpenUIExportInput } from './openui-export-types'

const unzipTextFiles = (body: Uint8Array) =>
  Object.fromEntries(
    Object.entries(unzipSync(body)).map(([path, value]) => [
      path,
      strFromU8(value),
    ]),
  )

export async function buildOpenUIArtifactFiles(input: OpenUIExportInput) {
  if (input.target === 'html') {
    const download = await buildOpenUIHtmlExport(input)
    if (typeof download?.body === 'string') {
      const files = createHtmlExportFiles(
        input.sessionId,
        'html',
        download.body,
        {
          includeBadge: input.includeBadge,
        },
      )
      return { files, download }
    }
    throw new Error('HTML export did not produce an HTML document')
  }

  if (input.target === 'lakebed') {
    const project = await buildOpenUILakebedProjectFiles(input)
    return { files: project.files }
  }

  const download = await buildOpenUIExport(input)
  if (typeof download.body === 'string') {
    throw new Error(`${input.target} export did not produce a ZIP artifact`)
  }

  return {
    files: unzipTextFiles(download.body),
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
    return {
      body: files['index.html'] ?? input.previewHtml ?? input.source,
      contentType: 'text/html; charset=utf-8',
      filename: 'index.html',
      fileCount: 1,
    }
  }

  const { zipSync, strToU8 } = await import('fflate')
  const slug =
    input.target === 'lakebed'
      ? `ship-fast-${input.sessionId}`
      : extractExportMetadata(input.previewHtml ?? input.source)
          .title.trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 60) || 'ship-fast-export'

  return {
    body: zipSync(
      Object.fromEntries(
        Object.entries(files).map(([path, source]) => [path, strToU8(source)]),
      ),
    ),
    contentType: 'application/zip',
    filename: `${slug}-${input.target}.zip`,
    fileCount: Object.keys(files).length,
  }
}
