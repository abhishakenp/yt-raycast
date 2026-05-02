/**
 * OpenUI generation for Ship Fast sessions: Groq + validated openui-lang via engine pipeline.
 */
import { loadSiteSpec } from '@ship-fast/engine/spec/index.js'
import { generateAndWriteOpenUIHome } from '@ship-fast/engine/pipeline/phase-openui-home.js'

/**
 * @param {object} opts
 * @param {string} opts.prompt
 * @param {string} opts.workspace
 * @param {ReturnType<import('../server/sessions.js').makeSessionState>} opts.sessionCtx
 * @param {string} [opts.preferredLanguage]
 * @param {object} [opts.integrations]
 * @param {string} [opts.variationSeed] defaults to session id when passed from server
 */
export async function runOpenUIEnhancedGeneration({
  prompt,
  workspace,
  sessionCtx,
  preferredLanguage,
  integrations,
  variationSeed = null,
}) {
  const siteSpec = loadSiteSpec(workspace) ?? null

  try {
    await generateAndWriteOpenUIHome({
      workspace,
      siteSpec,
      prompt,
      log: (msg) => console.log(msg),
      sessionCtx,
      variationSeed,
    })
    sessionCtx.signalOpenuiReady?.()
    return { success: true }
  } catch (err) {
    console.error('OpenUI generation failed:', err?.message ?? err)
    sessionCtx.broadcast?.({
      type: 'openui-error',
      error: err?.message ?? 'OpenUI generation failed',
    })

    const { runAll } = await import('@ship-fast/engine')
    return runAll({
      prompt,
      workspace,
      sessionCtx,
      preferredLanguage,
      integrations,
    })
  }
}
