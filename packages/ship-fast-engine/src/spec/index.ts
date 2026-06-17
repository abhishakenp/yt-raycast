import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const SUPPORTED_EXPORT_TARGETS = ['html', 'react', 'nextjs']

export interface SiteSpecProject extends Record<string, unknown> {
  brand?: string
  projectName?: string
  tagline?: string
  theme?: string | Record<string, unknown>
  locale?: string
  skeleton?: string
  modules?: Record<string, string>
  pages?: Array<Record<string, unknown>>
  siteType?: string
  userPrompt?: string
}

export function loadSiteSpec(workspace: string): SiteSpecProject | null {
  const filePath = join(workspace, 'site-spec.json')
  if (!existsSync(filePath)) return null
  try {
    const parsed = JSON.parse(readFileSync(filePath, 'utf-8'))
    if (
      parsed &&
      typeof parsed === 'object' &&
      (typeof parsed.brand === 'string' ||
        typeof parsed.projectName === 'string')
    ) {
      return parsed as SiteSpecProject
    }
    return null
  } catch {
    return null
  }
}

export function saveSiteSpec(
  workspace: string,
  project: SiteSpecProject,
): void {
  const filePath = join(workspace, 'site-spec.json')
  writeFileSync(filePath, JSON.stringify(project, null, 2))
}

export function ensureCompatibleSiteSpec(
  workspace: string,
): SiteSpecProject | null {
  return loadSiteSpec(workspace)
}

// @ts-ignore -- legacy JS module lacks TypeScript declarations.
export { supplementSiteSpecPages } from './supplement-pages.js'
// @ts-ignore -- legacy JS module lacks TypeScript declarations.
export { buildFallbackSiteSpec, SITE_SPEC_VERSION } from './defaults.js'
// @ts-ignore -- legacy JS module lacks TypeScript declarations.
export { normalizeSiteSpec } from './normalize.js'
// @ts-ignore -- legacy JS module lacks TypeScript declarations.
export { validateSiteSpec } from './validate.js'
// @ts-ignore -- legacy JS module lacks TypeScript declarations.
export {
  enrichSiteSpecWithWorkspaceBlueprints,
  extractRenderBlueprintFromHtml,
  stripSiteSpecBlueprints,
} from './blueprints.js'
