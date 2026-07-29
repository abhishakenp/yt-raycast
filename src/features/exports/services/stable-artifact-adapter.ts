/**
 * Stable Artifact Adapter
 *
 * This adapter converts stable engine artifacts to the format expected by
 * the current export builders. This isolates engine-internal dependencies
 * to this layer, allowing exports/deployments to work with stable artifacts.
 */

import type {
  StableEngineArtifact,
  StableExportInput,
  ThemeInfo,
} from './stable-artifact-contract'
import type { OpenUIExportInput } from './openui-export-types'

/**
 * Convert a stable artifact to the legacy OpenUIExportInput format
 * This is a bridge layer that allows gradual migration
 *
 * @param stableInput - Input based on stable artifact
 * @returns Legacy format expected by current builders
 */
export function adaptStableToLegacyExportInput(
  stableInput: StableExportInput,
): OpenUIExportInput {
  const { artifact, sessionId, target, theme, selectedBrandLogo, includeBadge, prompt, formatCache, onProgress } = stableInput

  // Extract the HTML from the stable artifact
  const html = artifact.html

  // Convert siteSpec to JSON if present
  const siteSpecJson = artifact.siteSpec ? JSON.stringify(artifact.siteSpec) : undefined

  // For the stable contract, we don't have raw OpenUI source
  // We use the HTML as both source and preview
  // This is the key decoupling: exports work with final HTML, not OpenUI source
  const source = html

  return {
    source,
    siteSpecJson,
    previewHtml: html,
    sessionId,
    prompt,
    target,
    includeBadge: includeBadge ?? false,
    themeName: theme?.name,
    isDark: theme?.isDark,
    locale: theme?.locale,
    selectedBrandLogo,
    lakebedSeedData: artifact.lakebedData?.seedData,
    syncSecret: artifact.lakebedData?.syncSecret,
    formatCache,
    onProgress,
  }
}

/**
 * Extract theme info from stable artifact
 */
export function extractThemeFromArtifact(artifact: StableEngineArtifact): ThemeInfo {
  return {
    name: artifact.siteSpec?.themeName,
    // Dark mode and locale would need to be added to the stable artifact
    // For now, these can be passed separately
    isDark: false,
    locale: undefined,
  }
}

/**
 * Create a stable artifact from legacy inputs
 * This is for backwards compatibility during migration
 *
 * @param source - OpenUI source code (legacy)
 * @param previewHtml - Rendered HTML
 * @param siteSpecJson - Site spec as JSON string
 * @returns Stable artifact
 */
export function createStableArtifactFromLegacy(
  _source: string,
  previewHtml: string,
  siteSpecJson?: string,
): StableEngineArtifact {
  let siteSpec: StableEngineArtifact['siteSpec'] = undefined
  if (siteSpecJson) {
    try {
      siteSpec = JSON.parse(siteSpecJson)
    } catch {
      // If parsing fails, leave undefined
    }
  }

  return {
    html: previewHtml,
    siteSpec,
  }
}

/**
 * Check if the input is already a stable artifact format
 */
export function isStableExportInput(
  input: unknown,
): input is StableExportInput {
  return (
    typeof input === 'object' &&
    input !== null &&
    'artifact' in input &&
    typeof (input as StableExportInput).artifact === 'object'
  )
}
