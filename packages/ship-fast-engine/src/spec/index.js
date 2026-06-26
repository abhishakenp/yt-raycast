import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const SUPPORTED_EXPORT_TARGETS = ['html', 'react', 'nextjs']

export function loadSiteSpec(workspace) {
  const filePath = join(workspace, 'site-spec.json')
  if (!existsSync(filePath)) return null
  try {
    const parsed = JSON.parse(readFileSync(filePath, 'utf-8'))
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.brand === 'string'
    ) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

export function saveSiteSpec(workspace, project) {
  const filePath = join(workspace, 'site-spec.json')
  writeFileSync(filePath, JSON.stringify(project, null, 2))
}

export function ensureCompatibleSiteSpec(workspace) {
  return loadSiteSpec(workspace)
}

export { supplementSiteSpecPages } from './supplement-pages.js'
export { buildFallbackSiteSpec, SITE_SPEC_VERSION } from './defaults.js'
export { normalizeSiteSpec } from './normalize.js'
export { validateSiteSpec } from './validate.js'
export {
  enrichSiteSpecWithWorkspaceBlueprints,
  extractRenderBlueprintFromHtml,
  stripSiteSpecBlueprints,
} from './blueprints.js'
