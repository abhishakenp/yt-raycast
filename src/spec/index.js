import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildFallbackSiteSpec, SITE_SPEC_VERSION, SUPPORTED_EXPORT_TARGETS } from './defaults.js'
import { normalizeSiteSpec } from './normalize.js'
import { validateSiteSpec } from './validate.js'

export {
  buildFallbackSiteSpec,
  normalizeSiteSpec,
  validateSiteSpec,
  SITE_SPEC_VERSION,
  SUPPORTED_EXPORT_TARGETS,
}
export {
  enrichSiteSpecWithWorkspaceBlueprints,
  extractRenderBlueprintFromHtml,
  stripSiteSpecBlueprints,
} from './blueprints.js'
export { ensureCompatibleSiteSpec } from './compatibility.js'

export function loadSiteSpec(workspace) {
  const filePath = join(workspace, 'site-spec.json')
  if (!existsSync(filePath)) return null
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch {
    return null
  }
}

export function saveSiteSpec(workspace, spec) {
  const filePath = join(workspace, 'site-spec.json')
  writeFileSync(filePath, JSON.stringify(spec, null, 2))
}
