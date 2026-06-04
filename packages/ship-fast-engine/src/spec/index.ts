import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const SUPPORTED_EXPORT_TARGETS = ['html', 'react', 'nextjs']

export interface SiteSpecProject {
  brand: string
  tagline: string
  theme: string
  locale?: string
  skeleton: string
  modules: Record<string, string>
}

export function loadSiteSpec(workspace: string): SiteSpecProject | null {
  const filePath = join(workspace, 'site-spec.json')
  if (!existsSync(filePath)) return null
  try {
    const parsed = JSON.parse(readFileSync(filePath, 'utf-8'))
    if (parsed && typeof parsed === 'object' && typeof parsed.brand === 'string') {
      return parsed as SiteSpecProject
    }
    return null
  } catch {
    return null
  }
}

export function saveSiteSpec(workspace: string, project: SiteSpecProject): void {
  const filePath = join(workspace, 'site-spec.json')
  writeFileSync(filePath, JSON.stringify(project, null, 2))
}

export function ensureCompatibleSiteSpec(workspace: string): SiteSpecProject | null {
  return loadSiteSpec(workspace)
}

// @ts-ignore
export { supplementSiteSpecPages } from './supplement-pages.js'
// @ts-ignore
export { buildFallbackSiteSpec, SITE_SPEC_VERSION } from './defaults.js'
// @ts-ignore
export { normalizeSiteSpec } from './normalize.js'
// @ts-ignore
export { validateSiteSpec } from './validate.js'
// @ts-ignore
export { enrichSiteSpecWithWorkspaceBlueprints, extractRenderBlueprintFromHtml, stripSiteSpecBlueprints } from './blueprints.js'
