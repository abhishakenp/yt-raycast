import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { HOME_OPENUI_FILE, OPENUI_MANIFEST_FILE, OPENUI_PAGES_DIR } from './openui-constants.js'
import { slug, writeFile } from '@ship-fast/engine/pipeline/workspace.js'
import { isTranslatableLocale } from '../config/languages.js'

export function routeToOpenUIFile(route = '/') {
  const clean = String(route || '/').trim()
  if (!clean || clean === '/') return HOME_OPENUI_FILE
  const parts = clean
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean)
    .map((part) => slug(part) || 'page')
  return join(OPENUI_PAGES_DIR, `${parts.join('__') || 'page'}.openui`)
}

export function buildOpenUIManifest(siteSpec, entries = []) {
  const byRoute = new Map(entries.map((entry) => [entry.route || '/', entry]))
  const pages = (siteSpec?.pages || []).map((page, index) => {
    const route = page.route || (index === 0 ? '/' : `/${slug(page.name || page.title || `page-${index}`)}`)
    const file = routeToOpenUIFile(route)
    const entry = byRoute.get(route) || {}
    return {
      route,
      title: page.title || page.name || (route === '/' ? 'Home' : route.replace(/^\/+/, '')),
      file: entry.file || file,
      ready: Boolean(entry.ready),
    }
  })
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    home: HOME_OPENUI_FILE,
    pages,
  }
}

export function readOpenUIManifest(workspace) {
  const path = join(workspace, OPENUI_MANIFEST_FILE)
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return null
  }
}

export function writeOpenUIManifest(workspace, manifest) {
  writeFile(workspace, OPENUI_MANIFEST_FILE, JSON.stringify(manifest, null, 2))
}

export function upsertOpenUIManifestEntry(workspace, siteSpec, entry) {
  const current = readOpenUIManifest(workspace)
  const existing = Array.isArray(current?.pages) ? current.pages : []
  const route = entry.route || '/'
  const nextEntries = [
    ...existing.filter((page) => page.route !== route),
    {
      route,
      title: entry.title || route,
      file: entry.file || routeToOpenUIFile(route),
      ready: entry.ready !== false,
    },
  ]
  const manifest = buildOpenUIManifest(siteSpec, nextEntries)
  writeOpenUIManifest(workspace, manifest)
  return manifest
}

export function readOpenUIFileForRoute(workspace, route = '/') {
  const manifest = readOpenUIManifest(workspace)
  const normalizedRoute = String(route || '/').trim() || '/'
  const manifestEntry = manifest?.pages?.find((page) => page.route === normalizedRoute)
  const rel = manifestEntry?.file || routeToOpenUIFile(normalizedRoute)
  const path = join(workspace, rel)
  if (!existsSync(path)) return null
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return null
  }
}

/** Theme colors from `site-spec.json` for OpenUI preview (client Renderer/CSS vars). */
export function readSiteSpecThemeColors(workspace) {
  const siteSpecPath = join(workspace, 'site-spec.json')
  if (!existsSync(siteSpecPath)) return {}
  try {
    const siteSpec = JSON.parse(readFileSync(siteSpecPath, 'utf8'))
    return siteSpec?.theme?.colors && typeof siteSpec.theme.colors === 'object'
      ? siteSpec.theme.colors
      : {}
  } catch {
    return {}
  }
}

/** Locale (ISO 639-1 code) from `site-spec.json`, defaults to "en". */
export function readSiteSpecLocale(workspace) {
  const siteSpecPath = join(workspace, 'site-spec.json')
  if (!existsSync(siteSpecPath)) return 'en'
  try {
    const siteSpec = JSON.parse(readFileSync(siteSpecPath, 'utf8'))
    return typeof siteSpec?.locale === 'string' && isTranslatableLocale(siteSpec.locale)
      ? siteSpec.locale.trim().toLowerCase()
      : 'en'
  } catch {
    return 'en'
  }
}

export function openUIArtifactsReady(workspace, siteSpec) {
  if (!existsSync(join(workspace, HOME_OPENUI_FILE))) return false
  const manifest = readOpenUIManifest(workspace)
  if (!manifest) return true
  const requiredRoutes = new Set((siteSpec?.pages || []).map((page) => page.route || '/'))
  for (const route of requiredRoutes) {
    const entry = manifest.pages?.find((page) => page.route === route)
    if (!entry?.ready || !existsSync(join(workspace, entry.file))) return false
  }
  return true
}

