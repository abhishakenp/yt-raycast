/**
 * Stable Deployment Adapter
 *
 * This adapter allows deployments to work with stable artifacts instead of
 * depending on engine internals through the export builders.
 */

import type {
  LakebedDeployInput,
  LakebedDeployResult,
} from '../server/lakebed-deploy-service'
import { deployLakebedProjectFiles } from '../server/lakebed-deploy-service'
import { buildStableLakebedProjectFiles } from '@/features/exports/services/stable-lakebed-export-builder'
import type {
  StableEngineArtifact,
  StableExportInput,
} from '@/features/exports/services/stable-artifact-contract'

/**
 * Deploy a stable artifact to Lakebed
 * This is the decoupled version that doesn't depend on engine internals
 */
export async function deployStableArtifactToLakebed(
  artifact: StableEngineArtifact,
  options: {
    sessionId: string
    themeName?: string
    isDark?: boolean
    locale?: string
    lakebedSeedData?: Record<string, Array<Record<string, unknown>>>
    syncSecret?: string
    api?: string
    existingDeployment?: {
      claimUrl?: string
      deployId?: string
      url?: string
    }
    fetchImpl?: typeof fetch
    inspectPolicy?: 'public'
    log?: (message: string, details?: Record<string, unknown>) => void
    onProgress?: (stageKey: string) => void | Promise<void>
  },
): Promise<LakebedDeployResult> {
  // Convert stable artifact to export input
  const exportInput: StableExportInput = {
    sessionId: options.sessionId,
    target: 'lakebed',
    theme: {
      name: options.themeName,
      isDark: options.isDark,
      locale: options.locale,
    },
    artifact: {
      ...artifact,
      lakebedData: {
        ...artifact.lakebedData,
        ...(options.lakebedSeedData === undefined
          ? {}
          : { seedData: options.lakebedSeedData }),
        ...(options.syncSecret === undefined
          ? {}
          : { syncSecret: options.syncSecret }),
      },
    },
    onProgress: options.onProgress,
  }

  // Build Lakebed project files from stable artifact
  await options.onProgress?.('building-project')
  const { files } = await buildStableLakebedProjectFiles(exportInput, {
    useEnvironmentSyncSecret: true,
  })

  // Deploy to Lakebed
  const deployInput: LakebedDeployInput = {
    files,
    api: options.api,
    existingDeployment: options.existingDeployment,
    fetchImpl: options.fetchImpl,
    inspectPolicy: options.inspectPolicy,
    log: options.log,
    onProgress: options.onProgress,
  }

  await options.onProgress?.('deploying')
  const result = await deployLakebedProjectFiles(deployInput)

  return result
}

/**
 * Convert legacy export files to stable artifact format
 * This allows gradual migration by creating stable artifacts from legacy exports
 */
export function createStableArtifactFromExportFiles(
  files: Record<string, string>,
): StableEngineArtifact {
  // Extract HTML from index.html if available
  const html = files['index.html'] || files['client/index.html'] || ''

  // Try to extract site spec from any metadata files
  let siteSpec: StableEngineArtifact['siteSpec'] = undefined
  if (files['site-spec.json']) {
    try {
      siteSpec = JSON.parse(files['site-spec.json'])
    } catch {
      // Ignore parse errors
    }
  }

  return {
    html,
    siteSpec,
  }
}
