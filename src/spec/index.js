import {
  enrichSiteSpecWithWorkspaceBlueprints,
  extractRenderBlueprintFromHtml,
  stripSiteSpecBlueprints,
  loadSiteSpec,
  saveSiteSpec,
  SUPPORTED_EXPORT_TARGETS,
} from '@ship-fast/engine'

export {
  enrichSiteSpecWithWorkspaceBlueprints,
  extractRenderBlueprintFromHtml,
  stripSiteSpecBlueprints,
  loadSiteSpec,
  saveSiteSpec,
  SUPPORTED_EXPORT_TARGETS,
}

export function ensureCompatibleSiteSpec(workspace) {
  return loadSiteSpec(workspace)
}
