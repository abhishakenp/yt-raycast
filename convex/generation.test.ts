import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))

describe('convex generation action', () => {
  it('passes the session preferred language to the homepage orchestrator', () => {
    const source = readFileSync(join(here, 'generation.ts'), 'utf8')
    const orchestratorSource = readFileSync(
      join(here, '../packages/ship-fast-engine/src/genui/run.ts'),
      'utf8',
    )

    expect(source).toContain('preferredLanguage: session.preferredLanguage')
    expect(source).toContain("completeWhen: 'home'")
    expect(source).toContain('buildPreviewSeoHead')
    expect(source).toContain('renderStaticPreviewHtml(')
    expect(orchestratorSource).toContain('detectLanguage(p.prompt')
    expect(orchestratorSource).toContain('withLanguageEnforcementBlock')
    expect(orchestratorSource).toMatch(/generateUI\(\s*generationPrompt/)
    expect(orchestratorSource).toContain('forcedLocale')
  })

  it('threads design reference context into generation artifacts', () => {
    const source = readFileSync(join(here, 'generation.ts'), 'utf8')

    expect(source).toContain('const buildGenerationPrompt =')
    expect(source).toContain('Design reference URLs:')
    expect(source).toContain('Clone/reference URL:')
    expect(source).toContain('prompt: buildGenerationPrompt(session)')
    expect(source).toContain(
      'designReferenceFingerprint: session.designReferenceFingerprint',
    )
  })

  it('keeps heavyweight generation runtime imports inside the caught action path', () => {
    const source = readFileSync(join(here, 'generation.ts'), 'utf8')

    expect(source).not.toContain(
      "import { runHomepageOrchestrator } from '../packages/ship-fast-engine/src/genui/run.ts'",
    )
    expect(source).toContain(
      "import('../packages/ship-fast-engine/src/genui/run.ts')",
    )
    expect(source).toContain(
      "import('../packages/ship-fast-engine/src/openui-ssr.js')",
    )
    expect(source).toContain(
      "import('../packages/ship-fast-aeo/src/metadata/build-preview-head.ts')",
    )
  })

  it('persists a fast preview before loading the heavyweight generation runtime', () => {
    const source = readFileSync(join(here, 'generation.ts'), 'utf8')
    const handlerIndex = source.indexOf('handler: async (ctx, args) => {')
    const fastPreviewIndex = source.indexOf(
      'buildFastPreviewArtifacts(session)',
      handlerIndex,
    )
    const completeIndex = source.indexOf(
      'internalFunctions.sessions.completeGeneration',
      handlerIndex,
    )
    const runtimeIndex = source.indexOf('loadGenerationRuntime', handlerIndex)

    expect(handlerIndex).toBeGreaterThan(-1)
    expect(fastPreviewIndex).toBeGreaterThan(-1)
    expect(completeIndex).toBeGreaterThan(fastPreviewIndex)
    expect(runtimeIndex).toBeGreaterThan(completeIndex)
  })

  it('has a separate refinement mutation for model-generated preview upgrades', () => {
    const generationSource = readFileSync(join(here, 'generation.ts'), 'utf8')
    const sessionsSource = readFileSync(join(here, 'sessions.ts'), 'utf8')

    expect(generationSource).toContain(
      'internalFunctions.sessions.replaceGeneratedPreview',
    )
    expect(sessionsSource).toContain('export const replaceGeneratedPreview')
  })

  it('wraps session lookup in the failure handler', () => {
    const source = readFileSync(join(here, 'generation.ts'), 'utf8')
    const handlerIndex = source.indexOf('handler: async (ctx, args) => {')
    const tryIndex = source.indexOf('try {', handlerIndex)
    const queryIndex = source.indexOf('getGenerationSession', handlerIndex)
    const catchIndex = source.indexOf('} catch (error) {', handlerIndex)

    expect(handlerIndex).toBeGreaterThan(-1)
    expect(tryIndex).toBeGreaterThan(-1)
    expect(queryIndex).toBeGreaterThan(tryIndex)
    expect(catchIndex).toBeGreaterThan(queryIndex)
    expect(source).toContain('internalFunctions.sessions.failGeneration')
  })
})
