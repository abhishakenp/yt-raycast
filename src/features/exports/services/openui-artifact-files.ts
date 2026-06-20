import { strFromU8, unzipSync } from 'fflate'

import {
  createHtmlExportFiles,
  createNextExportFiles,
  createReactExportFiles,
  extractExportMetadata,
} from './html-export-files'
import { buildOpenUIExport } from './openui-export-builder'
import { buildOpenUILakebedProjectFiles } from './openui-lakebed-export-builder'
import type { BuiltExport, OpenUIExportInput } from './openui-export-types'
import { buildStaticLakebedProjectFiles } from '../../deployments/server/lakebed-static-project-builder'

const unzipTextFiles = (body: Uint8Array) =>
  Object.fromEntries(
    Object.entries(unzipSync(body)).map(([path, value]) => [
      path,
      strFromU8(value),
    ]),
  )

export async function buildOpenUIArtifactFiles(input: OpenUIExportInput) {
  const fallbackHtml = input.previewHtml ?? input.source

  if (input.target === 'html') {
    const files = createHtmlExportFiles(
      input.sessionId,
      'html',
      fallbackHtml,
      { includeBadge: input.includeBadge },
    )
    return { files }
  }

  if (input.target === 'lakebed') {
    const project = await buildOpenUILakebedProjectFiles(input).catch(() =>
      buildStaticLakebedProjectFiles({
        source: input.source,
        siteSpecJson: input.siteSpecJson,
        previewHtml: fallbackHtml,
      }),
    )
    return { files: project.files }
  }

  const download = await buildOpenUIExport(input).catch(() => undefined)
  if (download === undefined) {
    const files =
      input.target === 'react'
        ? createReactExportFiles(input.sessionId, 'react', fallbackHtml, {
            includeBadge: input.includeBadge,
          })
        : createNextExportFiles(input.sessionId, 'next', fallbackHtml, {
            includeBadge: input.includeBadge,
          })
    return { files }
  }

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
