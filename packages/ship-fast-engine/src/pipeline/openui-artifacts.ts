import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  HOME_OPENUI_FILE,
  OPENUI_MANIFEST_FILE,
  OPENUI_PAGES_DIR,
} from './openui-constants.js'
import { slug, writeFile } from './workspace.js'

export function routeToOpenUIFile(route = '/') {
  const clean = String(route || '/').trim()
  const stripped = clean.replace(/^\/+|\/+$/g, '')
  if (!stripped) return HOME_OPENUI_FILE
  const parts = stripped
    .split('/')
    .filter(Boolean)
    .map((part) => slug(part) || 'page')
  return join(OPENUI_PAGES_DIR, `${parts.join('__') || 'page'}.openui`)
}

interface SiteSpecPage {
  route?: string
  name?: string
  title?: string
}

interface SiteSpec {
  pages?: SiteSpecPage[]
}

interface OpenUIManifestEntry {
  route: string
  title?: string
  file: string
  ready: boolean
}

interface OpenUIManifest {
  version: number
  generatedAt: string
  home: string
  pages: OpenUIManifestEntry[]
}

export function buildOpenUIManifest(
  siteSpec: SiteSpec | null,
  entries: OpenUIManifestEntry[] = [],
): OpenUIManifest {
  const byRoute = new Map(entries.map((entry) => [entry.route || '/', entry]))
  const pages: OpenUIManifestEntry[] = (siteSpec?.pages || []).map(
    (page, index) => {
      const route =
        page.route ||
        (index === 0
          ? '/'
          : `/${slug(page.name || page.title || `page-${index}`)}`)
      const file = routeToOpenUIFile(route)
      const entry: Partial<OpenUIManifestEntry> = byRoute.get(route) || {}
      return {
        route,
        title:
          page.title ||
          page.name ||
          (route === '/' ? 'Home' : route.replace(/^\/+/, '')),
        file: entry.file || file,
        ready: Boolean(entry.ready),
      }
    },
  )
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    home: HOME_OPENUI_FILE,
    pages,
  }
}

export function readOpenUIManifest(workspace: string): OpenUIManifest | null {
  const path = join(workspace, OPENUI_MANIFEST_FILE)
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return null
  }
}

export function writeOpenUIManifest(
  workspace: string,
  manifest: OpenUIManifest,
): void {
  writeFile(workspace, OPENUI_MANIFEST_FILE, JSON.stringify(manifest, null, 2))
}

export function upsertOpenUIManifestEntry(
  workspace: string,
  siteSpec: SiteSpec | null,
  entry: Partial<OpenUIManifestEntry> & { route?: string },
): OpenUIManifest {
  const current = readOpenUIManifest(workspace)
  const existing: OpenUIManifestEntry[] = Array.isArray(current?.pages)
    ? current!.pages
    : []
  const route = entry.route || '/'
  const nextEntries: OpenUIManifestEntry[] = [
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

export function readOpenUIFileForRoute(
  workspace: string,
  route = '/',
): string | null {
  const manifest = readOpenUIManifest(workspace)
  const normalizedRoute = String(route || '/').trim() || '/'
  const pages: OpenUIManifestEntry[] = Array.isArray(manifest?.pages)
    ? manifest!.pages
    : []
  const manifestEntry = pages.find((page) => page.route === normalizedRoute)
  const rel = manifestEntry?.file || routeToOpenUIFile(normalizedRoute)
  const path = join(workspace, rel)
  if (!existsSync(path)) return null
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return null
  }
}

export function openUIArtifactsReady(
  workspace: string,
  siteSpec: SiteSpec | null,
): boolean {
  if (!existsSync(join(workspace, HOME_OPENUI_FILE))) return false
  const manifest = readOpenUIManifest(workspace)
  if (!manifest) return true
  if (!Array.isArray(manifest.pages)) return false
  const requiredRoutes = new Set(
    (siteSpec?.pages || []).map((page) => page.route || '/'),
  )
  for (const route of requiredRoutes) {
    const entry = manifest.pages.find((page) => page.route === route)
    if (!entry?.ready || !existsSync(join(workspace, entry.file))) return false
  }
  return true
}
