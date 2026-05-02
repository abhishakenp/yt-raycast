import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { isSanityConfigured } from '../config.js'
import { fetchSiteSettings } from '../sanity/client.js'
import { mergeSanitySiteSettingsIntoSiteSpec } from '../sanity/cms-sync.js'
import {
  ensureCompatibleSiteSpec,
  loadSiteSpec,
  saveSiteSpec,
  SUPPORTED_EXPORT_TARGETS,
} from '@ship-fast/engine/spec/index.js'
import { renderProject, renderPreviewToWorkspace, writeRenderedFiles } from '@ship-fast/engine/renderers/index.js'
import { routeToHtmlFile } from '@ship-fast/engine/renderers/shared.js'
import { createZipBuffer } from './zip.js'
import { applyThemeOverrideToSiteSpec } from './theme.js'

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

function getExactCloneStatus(workspace, siteSpec) {
  if (!siteSpec?.pages?.length) {
    return {
      ready: false,
      degradedPages: [],
      reason:
        'The exact-clone export is not ready because no pages were found in the canonical site spec.',
    }
  }

  const missingHtmlFiles = []
  const missingBlueprints = []

  for (const page of siteSpec.pages) {
    const filename = routeToHtmlFile(page.route)
    const filePath = join(workspace, filename)
    if (!existsSync(filePath)) {
      missingHtmlFiles.push(filename)
      continue
    }

    if (!page?.renderBlueprint?.bodyHtml || !page?.renderBlueprint?.originalHtmlDocument) {
      missingBlueprints.push(filename)
    }
  }

  // Homepage must be ready
  const homeFilename = 'index.html'
  const homeFileMissing = missingHtmlFiles.includes(homeFilename)
  const homeBlueprintMissing = missingBlueprints.includes(homeFilename)

  if (homeFileMissing || homeBlueprintMissing) {
    return {
      ready: false,
      degradedPages: [],
      reason: `Exact-clone export is waiting for the homepage to be generated.`,
    }
  }

  // Other pages missing = degraded but not blocking
  const degradedPages = [
    ...missingHtmlFiles.filter((f) => f !== homeFilename),
    ...missingBlueprints.filter((f) => f !== homeFilename),
  ]

  if (degradedPages.length > 0) {
    return {
      ready: true,
      degradedPages,
      reason: `Export ready. ${degradedPages.length} page(s) will use section-based layout: ${degradedPages.join(', ')}.`,
    }
  }

  return {
    ready: true,
    degradedPages: [],
    reason: 'All generated UI pages are captured and ready for exact-clone export.',
  }
}

function hashSiteSpec(siteSpec) {
  return createHash('sha1').update(JSON.stringify(siteSpec)).digest('hex')
}

export function getSessionExportTargets(session) {
  const rawSiteSpec = loadSiteSpec(session.workspace)
  const siteSpec = rawSiteSpec
    ? applyThemeOverrideToSiteSpec(
        ensureCompatibleSiteSpec(session.workspace),
        session.themeOverride,
      )
    : null
  const metadata = readExportMetadata(session.workspace)
  const currentSourceHash = siteSpec ? hashSiteSpec(siteSpec) : null
  const exactCloneStatus = siteSpec
    ? getExactCloneStatus(session.workspace, siteSpec)
    : {
        ready: false,
        reason: 'Build once to create the canonical site spec and exact-clone capture.',
      }
  const supported = [...SUPPORTED_EXPORT_TARGETS]

  return supported.map((target) => {
    const targetMeta = metadata.targets?.[target] || {}
    const bundleExists = Boolean(
      targetMeta.bundlePath && existsSync(join(session.workspace, targetMeta.bundlePath)),
    )
    const sourceMatches =
      !siteSpec || (targetMeta.sourceHash && targetMeta.sourceHash === currentSourceHash)
    const ready = bundleExists && sourceMatches && (!siteSpec || exactCloneStatus.ready)
    return {
      target,
      ready,
      buildReady: siteSpec ? exactCloneStatus.ready : true,
      buildReason: siteSpec ? exactCloneStatus.reason : null,
      degradedPages: siteSpec ? exactCloneStatus.degradedPages || [] : [],
      generatedAt: targetMeta.generatedAt || null,
      fileCount: targetMeta.fileCount || 0,
      downloadPath: ready ? `/api/sessions/${session.id}/download/${target}` : null,
      specVersion: currentSourceHash,
    }
  })
}

export function generateSessionExport(session, target) {
  const siteSpec = applyThemeOverrideToSiteSpec(
    ensureCompatibleSiteSpec(session.workspace),
    session.themeOverride,
  )
  session.siteSpecReady = Boolean(siteSpec)
  if (!siteSpec) throw new Error('Unable to build a canonical site spec for this session')
  if (!SUPPORTED_EXPORT_TARGETS.includes(target))
    throw new Error(`Unsupported export target: ${target}`)
  const exactCloneStatus = getExactCloneStatus(session.workspace, siteSpec)
  if (!exactCloneStatus.ready) throw new Error(exactCloneStatus.reason)
  const sourceHash = hashSiteSpec(siteSpec)

  const metadata = readExportMetadata(session.workspace)
  const cachedTarget = metadata.targets?.[target]
  if (
    cachedTarget?.sourceHash === sourceHash &&
    cachedTarget.bundlePath &&
    existsSync(join(session.workspace, cachedTarget.bundlePath))
  ) {
    return {
      target,
      generatedAt: cachedTarget.generatedAt,
      fileCount: cachedTarget.fileCount,
      downloadPath: `/api/sessions/${session.id}/download/${target}`,
      siteSpecReady: session.siteSpecReady,
    }
  }

  const { files } = renderProject(siteSpec, target, session)
  const exportsDir = join(session.workspace, 'exports')
  const outputDir = join(exportsDir, target)
  mkdirSync(outputDir, { recursive: true })
  writeRenderedFiles(outputDir, files)

  const bundleBuffer = createZipBuffer(files)
  const bundleRelativePath = join('exports', `${target}.zip`)
  const bundlePath = join(session.workspace, bundleRelativePath)
  writeFileSync(bundlePath, bundleBuffer)

  metadata.targets = metadata.targets || {}
  metadata.targets[target] = {
    bundlePath: bundleRelativePath,
    generatedAt: new Date().toISOString(),
    fileCount: Object.keys(files).length,
    size: bundleBuffer.length,
    sourceHash,
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
  const rawSiteSpec = loadSiteSpec(session.workspace)
  if (rawSiteSpec) {
    const siteSpec = applyThemeOverrideToSiteSpec(
      ensureCompatibleSiteSpec(session.workspace),
      session.themeOverride,
    )
    const exactCloneStatus = getExactCloneStatus(session.workspace, siteSpec)
    if (!exactCloneStatus.ready) return null
    const currentSourceHash = hashSiteSpec(siteSpec)
    if (!targetMeta.sourceHash || targetMeta.sourceHash !== currentSourceHash) return null
  }

  return {
    path: bundlePath,
    generatedAt: targetMeta.generatedAt,
    size: targetMeta.size || null,
  }
}

export function rerenderPreviewFromSiteSpec(session) {
  const siteSpec = applyThemeOverrideToSiteSpec(
    ensureCompatibleSiteSpec(session.workspace),
    session.themeOverride,
  )
  session.siteSpecReady = Boolean(siteSpec)
  if (!siteSpec) throw new Error('Unable to build a canonical site spec for this session')
  const exactCloneStatus = getExactCloneStatus(session.workspace, siteSpec)
  if (!exactCloneStatus.ready) throw new Error(exactCloneStatus.reason)
  return renderPreviewToWorkspace(siteSpec, session.workspace)
}

export async function syncSessionPreviewFromSanity(session) {
  if (!session?.workspace) throw new Error('Invalid session')
  const sanityConfig = session.sanityConfig || undefined
  if (!sanityConfig && !isSanityConfigured()) {
    throw new Error('Sanity is not configured (SANITY_PROJECT_ID / dataset)')
  }
  const siteSettings = await fetchSiteSettings(sanityConfig)
  if (!siteSettings) throw new Error('Could not load site settings from Sanity')
  const siteSpec = applyThemeOverrideToSiteSpec(
    ensureCompatibleSiteSpec(session.workspace),
    session.themeOverride,
  )
  if (!siteSpec) throw new Error('No site spec for this session')
  const merged = mergeSanitySiteSettingsIntoSiteSpec(siteSpec, siteSettings)
  saveSiteSpec(session.workspace, merged)
  session.siteSpecReady = true
  return renderPreviewToWorkspace(merged, session.workspace, session)
}
