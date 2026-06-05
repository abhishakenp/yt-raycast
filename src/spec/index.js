import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  enrichSiteSpecWithWorkspaceBlueprints,
  extractRenderBlueprintFromHtml,
  stripSiteSpecBlueprints,
} from '@ship-fast/engine/spec/blueprints.js'
import { SUPPORTED_EXPORT_TARGETS } from './defaults.js'

export {
  enrichSiteSpecWithWorkspaceBlueprints,
  extractRenderBlueprintFromHtml,
  stripSiteSpecBlueprints,
  SUPPORTED_EXPORT_TARGETS,
}

export function loadSiteSpec(workspace) {
  const filePath = join(workspace, 'site-spec.json')
  if (!existsSync(filePath)) return null
  try {
    const parsed = JSON.parse(readFileSync(filePath, 'utf-8'))
    if (parsed && typeof parsed === 'object' && typeof parsed.brand === 'string') {
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
