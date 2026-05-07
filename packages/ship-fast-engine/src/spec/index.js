import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildFallbackSiteSpec, SITE_SPEC_VERSION, SUPPORTED_EXPORT_TARGETS } from './defaults.js'
import { normalizeSiteSpec } from './normalize.js'
import { validateSiteSpec } from './validate.js'
import { sanitizeSiteSpec } from '../contracts/contracts.js'

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
    const parsed = JSON.parse(readFileSync(filePath, 'utf-8'))
    const parsedSpec = sanitizeSiteSpec(
      parsed,
      { projectName: 'Project' },
      { fallbackOnInvalid: false },
    )
    if (!parsedSpec.valid || !parsedSpec.spec) return null
    return parsedSpec.spec
  } catch {
    return null
  }
}

export function saveSiteSpec(workspace, spec) {
  const filePath = join(workspace, 'site-spec.json')
  const sanitized = sanitizeSiteSpec(spec, { projectName: 'Project' }, { fallbackOnInvalid: false })
  if (!sanitized.valid || !sanitized.spec) {
    const fallback = sanitizeSiteSpec(
      buildFallbackSiteSpec({ prompt: 'Generated Project', ctx: {} }),
      { projectName: 'Project' },
      {
        fallbackOnInvalid: false,
      },
    ).spec
    const specToPersist = sanitized.fallbackApplied && sanitized.spec ? sanitized.spec : fallback
    writeFileSync(filePath, JSON.stringify(specToPersist, null, 2))
    return
  }
  writeFileSync(filePath, JSON.stringify(sanitized.spec, null, 2))
}
