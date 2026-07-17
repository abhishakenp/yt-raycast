// Real, event-driven progress for the export-build (and, for lakebed,
// deploy) pipeline. Every stage key here corresponds to an actual pipeline
// step that has to run — nothing here is a timer or a simulated tick. The
// weights are informed by real measured stage durations (parsing, component
// collection, formatting, esbuild bundling, uploading) captured against a
// live session; they set how far the percent bar jumps when a stage
// completes, not how fast it animates.
//
// When a build will also auto-deploy (lakebed, public session), the build
// stages are compressed into the first BUILD_SHARE of the bar and the
// deploy stages fill the remainder, so the bar still reaches exactly 100%
// only once the whole flow — build AND deploy — is done.

export type ProgressStageResult = {
  stage: string
  percent: number
}

type StageDef = {
  key: string
  label: string
  weight: number
}

const BUILD_STAGES: StageDef[] = [
  { key: 'starting', label: 'Starting build', weight: 4 },
  { key: 'loading-generator', label: 'Loading generator', weight: 22 },
  { key: 'parsing', label: 'Parsing source', weight: 12 },
  { key: 'generating', label: 'Generating components', weight: 38 },
  { key: 'resolving-images', label: 'Resolving images', weight: 6 },
  { key: 'formatting', label: 'Formatting files', weight: 10 },
  { key: 'packaging', label: 'Packaging files', weight: 4 },
  { key: 'saving', label: 'Saving artifact', weight: 4 },
]

const DEPLOY_STAGES: StageDef[] = [
  { key: 'bundling-server', label: 'Bundling server runtime', weight: 15 },
  { key: 'bundling-client', label: 'Bundling client app', weight: 40 },
  { key: 'uploading', label: 'Uploading to Lakebed', weight: 35 },
  { key: 'finalizing', label: 'Finalizing deployment', weight: 10 },
]

// Share of the combined bar reserved for the build phase when a deploy will
// follow. The remainder goes to DEPLOY_STAGES.
const BUILD_SHARE_WHEN_DEPLOYING = 0.65

function totalWeight(stages: StageDef[]): number {
  return stages.reduce((sum, stage) => sum + stage.weight, 0)
}

function cumulativeWeightThrough(stages: StageDef[], key: string): number {
  let acc = 0
  for (const stage of stages) {
    acc += stage.weight
    if (stage.key === key) return acc
  }
  return acc
}

/**
 * Resolve the (label, percent) for a given stage key.
 *
 * `willDeploy` must reflect whether THIS build will be followed by a real
 * Lakebed deploy (i.e. target === 'lakebed' && autoDeployPublic) — it
 * changes where 'ready' sits on the bar (65% mid-flow vs 100% terminal) and
 * unlocks the deploy-only stage keys.
 */
export function progressForStage(
  stageKey: string,
  opts: { willDeploy: boolean },
): ProgressStageResult {
  if (stageKey === 'ready') {
    return opts.willDeploy
      ? {
          stage: 'Build ready — starting deploy',
          percent: Math.round(BUILD_SHARE_WHEN_DEPLOYING * 100),
        }
      : { stage: 'Ready', percent: 100 }
  }

  if (stageKey === 'deployed') {
    return { stage: 'Deployed', percent: 100 }
  }

  const buildStage = BUILD_STAGES.find((stage) => stage.key === stageKey)
  if (buildStage !== undefined) {
    const scale = opts.willDeploy ? BUILD_SHARE_WHEN_DEPLOYING : 1
    const fraction =
      cumulativeWeightThrough(BUILD_STAGES, stageKey) /
      totalWeight(BUILD_STAGES)
    return {
      stage: buildStage.label,
      percent: Math.round(fraction * 100 * scale),
    }
  }

  const deployStage = DEPLOY_STAGES.find((stage) => stage.key === stageKey)
  if (deployStage !== undefined) {
    const buildScale = BUILD_SHARE_WHEN_DEPLOYING
    const deployScale = 1 - buildScale
    const fraction =
      cumulativeWeightThrough(DEPLOY_STAGES, stageKey) /
      totalWeight(DEPLOY_STAGES)
    return {
      stage: deployStage.label,
      percent: Math.round(buildScale * 100 + fraction * 100 * deployScale),
    }
  }

  return { stage: stageKey, percent: 0 }
}

export const EXPORT_BUILD_STAGE_KEYS = BUILD_STAGES.map((stage) => stage.key)
export const LAKEBED_DEPLOY_STAGE_KEYS = DEPLOY_STAGES.map((stage) => stage.key)
