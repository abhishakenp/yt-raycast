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
import { renderProject, renderPreviewToWorkspace, writeRenderedFiles } from '../renderers/index.js'
import { createZipBuffer } from './zip.js'
import { applyThemeOverrideToSiteSpec } from './theme.js'

const EXPORT_META_FILE = '.exports.json'
const SHIP_FAST_BADGE_MARKER = 'data-ship-fast-export-badge="1"'
const SHIP_FAST_BADGE_RE = /\s*<a\b[^>]*data-ship-fast-export-badge="1"[\s\S]*?<\/a>/i
const SHIP_FAST_BADGE_LOGO_SVG =
  '<svg viewBox="0 0 52 52" width="16" height="16" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><path d="M26 4 8 20l6 2 12-12 12 12 6-2L26 4Z" fill="#7c3aed"/><path d="M14 22v18l8-4V24l-8-2Z" fill="#6d28d9"/><path d="M38 22v18l-8-4V24l8-2Z" fill="#6d28d9"/><path d="M22 24v12l4 2 4-2V24l-4-4-4 4Z" fill="#a78bfa"/><path d="m22 38 4 10 4-10-4 2-4-2Z" fill="#c4b5fd"/></svg>'

function injectShipFastBadge(html) {
  const clean = String(html || '').replace(SHIP_FAST_BADGE_RE, '')
  const badge = `<a ${SHIP_FAST_BADGE_MARKER} href="https://ship-fast.io" target="_blank" rel="noopener noreferrer" style="position:fixed;right:16px;bottom:16px;z-index:2147483000;display:inline-flex;align-items:center;gap:6px;padding:8px 10px;border-radius:999px;background:rgba(8,10,18,.86);color:#fff;font:600 12px/1.1 Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;text-decoration:none;box-shadow:0 10px 30px rgba(0,0,0,.22);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)"><span style="display:inline-grid;width:16px;height:16px;place-items:center;border-radius:50%;background:#fff;color:#0b0d12">${SHIP_FAST_BADGE_LOGO_SVG}</span><span>Built with Ship Fast</span></a>`
  if (/<\/body>/i.test(clean)) return clean.replace(/<\/body>/i, `${badge}</body>`)
  return `${clean}${badge}`
}

export function decorateExportFiles(files, { includeBadge = true } = {}) {
  if (!includeBadge || !files?.['index.html']) return files
  return {
    ...files,
    'index.html': injectShipFastBadge(files['index.html']),
  }
}

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
  return {
    ready: true,
    degradedPages: [],
    reason: 'Project generated successfully and ready for export.',
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

export function generateSessionExport(session, target, { includeBadge = true } = {}) {
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
  const badgeMode = includeBadge ? 'free' : 'paid'
  if (
    cachedTarget?.sourceHash === sourceHash &&
    cachedTarget?.badgeMode === badgeMode &&
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

  const { files: rawFiles } = renderProject(siteSpec, target, session)
  const files = decorateExportFiles(rawFiles, { includeBadge })
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
    badgeMode,
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
  return renderPreviewToWorkspace(siteSpec, session.workspace, session)
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
