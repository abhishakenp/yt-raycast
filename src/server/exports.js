import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ensureCompatibleSiteSpec, loadSiteSpec, SUPPORTED_EXPORT_TARGETS } from '../spec/index.js'
import { renderProject, renderPreviewToWorkspace, writeRenderedFiles } from '../renderers/index.js'
import { createZipBuffer } from './zip.js'

const EXPORT_META_FILE = '.exports.json'

export function readExportMetadata(workspace) {
  const metaPath = join(workspace, EXPORT_META_FILE)
  if (!existsSync(metaPath)) return { targets: {} }
  try {
    return JSON.parse(readFileSync(metaPath, 'utf-8'))
  } catch {
    return { targets: {} }
  }
}

export function writeExportMetadata(workspace, metadata) {
  writeFileSync(join(workspace, EXPORT_META_FILE), JSON.stringify(metadata, null, 2))
}

export function getSessionExportTargets(session) {
  const siteSpec = loadSiteSpec(session.workspace)
  const metadata = readExportMetadata(session.workspace)
  const supported = siteSpec?.exportableFrameworks?.length
    ? siteSpec.exportableFrameworks.filter((target) => SUPPORTED_EXPORT_TARGETS.includes(target))
    : [...SUPPORTED_EXPORT_TARGETS]

  return supported.map((target) => {
    const targetMeta = metadata.targets?.[target] || {}
    return {
      target,
      ready: Boolean(targetMeta.bundlePath && existsSync(join(session.workspace, targetMeta.bundlePath))),
      generatedAt: targetMeta.generatedAt || null,
      fileCount: targetMeta.fileCount || 0,
      downloadPath: targetMeta.bundlePath ? `/api/sessions/${session.id}/download/${target}` : null,
    }
  })
}

export function generateSessionExport(session, target) {
  const siteSpec = ensureCompatibleSiteSpec(session.workspace)
  session.siteSpecReady = Boolean(siteSpec)
  if (!siteSpec) throw new Error('Unable to build a canonical site spec for this session')
  if (!SUPPORTED_EXPORT_TARGETS.includes(target)) throw new Error(`Unsupported export target: ${target}`)

  const { files } = renderProject(siteSpec, target)
  const exportsDir = join(session.workspace, 'exports')
  const outputDir = join(exportsDir, target)
  mkdirSync(outputDir, { recursive: true })
  writeRenderedFiles(outputDir, files)

  const bundleBuffer = createZipBuffer(files)
  const bundleRelativePath = join('exports', `${target}.zip`)
  const bundlePath = join(session.workspace, bundleRelativePath)
  writeFileSync(bundlePath, bundleBuffer)

  const metadata = readExportMetadata(session.workspace)
  metadata.targets = metadata.targets || {}
  metadata.targets[target] = {
    bundlePath: bundleRelativePath,
    generatedAt: new Date().toISOString(),
    fileCount: Object.keys(files).length,
    size: bundleBuffer.length,
  }
  writeExportMetadata(session.workspace, metadata)

  return {
    target,
    generatedAt: metadata.targets[target].generatedAt,
    fileCount: metadata.targets[target].fileCount,
    downloadPath: `/api/sessions/${session.id}/download/${target}`,
    siteSpecReady: session.siteSpecReady,
  }
}

export function getSessionExportBundle(session, target) {
  const metadata = readExportMetadata(session.workspace)
  const targetMeta = metadata.targets?.[target]
  if (!targetMeta?.bundlePath) return null
  const bundlePath = join(session.workspace, targetMeta.bundlePath)
  if (!existsSync(bundlePath)) return null

  return {
    path: bundlePath,
    generatedAt: targetMeta.generatedAt,
    size: targetMeta.size || null,
  }
}

export function rerenderPreviewFromSiteSpec(session) {
  const siteSpec = ensureCompatibleSiteSpec(session.workspace)
  session.siteSpecReady = Boolean(siteSpec)
  if (!siteSpec) throw new Error('Unable to build a canonical site spec for this session')
  return renderPreviewToWorkspace(siteSpec, session.workspace)
}
