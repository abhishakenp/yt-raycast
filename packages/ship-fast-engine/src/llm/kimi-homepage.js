import { GEMINI_API_KEY, GROQ_API_KEY } from '../config.js'

export function kimiEngineAvailable() {
  return Boolean(GROQ_API_KEY && GEMINI_API_KEY)
}

/**
 * Bridge to the Kimi-target homepage compiler while it is still incubating in
 * playground-engine-ui-kimi. Keep this wrapper small so production can select
 * it without pulling playground concerns into the pipeline surface.
 */
export async function generateKimiEngineHomepage(brief, { seed = '' } = {}) {
  if (!kimiEngineAvailable()) throw new Error('Kimi homepage engine requires GROQ_API_KEY and GEMINI_API_KEY')

  const { generateKimiHomepage } = await import('../../../../playground-engine-ui-ship/src/index.js')
  const result = await generateKimiHomepage(brief, {
    seed: seed || `ship-${Date.now()}`,
  })

  return {
    content: result.html,
    inputTokens: 0,
    outputTokens: 0,
    cost: 0,
    engine: 'kimi',
    layoutMode: result.metrics?.pageKind,
    archetype: result.plan?.archetype,
    wall: result.metrics?.wall,
    plan: result.plan,
    route: result.route,
    audits: result.audits,
    kimiScore: result.audits?.kimi?.score ?? result.metrics?.kimiScore,
    richnessScore: result.audits?.richness?.score ?? result.metrics?.richnessScore,
    buildMode: result.metrics?.buildMode,
    qualityMode: result.metrics?.qualityMode,
    metrics: result.metrics,
  }
}
