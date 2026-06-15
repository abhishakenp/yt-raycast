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
    expect(source).not.toContain('completeWhen')
    expect(source).toContain('buildOpenUiHandoffHtml(')
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

  it('keeps the action entry lightweight and lazy-loads the generation runtime', () => {
    const source = readFileSync(join(here, 'generation.ts'), 'utf8')

    expect(source).not.toContain(
      "import { runHomepageOrchestrator } from '../packages/ship-fast-engine/src/genui/run.ts'",
    )
    expect(source).not.toContain(
      "import { renderOpenUIToHTMLWithTheme } from '../packages/ship-fast-engine/src/openui-ssr.js'",
    )
    expect(source).not.toContain(
      "import { buildPreviewSeoHead } from '../packages/ship-fast-aeo/src/metadata/build-preview-head.ts'",
    )
    expect(source).toContain('loadGenerationRuntime')
    expect(source).not.toContain('loadPreviewRuntime')
  })

  it('runs the heavyweight generation runtime before completing the session', () => {
    const source = readFileSync(join(here, 'generation.ts'), 'utf8')
    const handlerIndex = source.indexOf('handler: async (ctx, args) => {')
    const runtimeIndex = source.indexOf('runHomepageOrchestrator', handlerIndex)
    const v1ProviderIndex = source.indexOf("provider: 'genui-orchestrator'", runtimeIndex)

    expect(handlerIndex).toBeGreaterThan(-1)
    expect(runtimeIndex).toBeGreaterThan(-1)
    expect(v1ProviderIndex).toBeGreaterThan(runtimeIndex)
    expect(source).not.toContain('buildFastPreviewArtifacts')
    expect(source).not.toContain("provider: 'fast-preview'")
    expect(source).toContain("provider: 'genui-orchestrator'")
    expect(source).toContain('buildOpenUiHandoffHtml')
  })

  it('completes generated previews inside the node action runtime', () => {
    const source = readFileSync(join(here, 'generation.ts'), 'utf8')

    expect(source).toContain('completeGenerationFromNode')
    expect(source).toContain('internalFunctions.sessions.completeGenerationInternal')
    expect(source).not.toContain(
      "await import('../packages/ship-fast-engine/src/openui-ssr.js')",
    )
    expect(source).not.toContain('renderOpenUIToHTMLWithTheme')
    expect(source).not.toMatch(
      /internalFunctions\.sessions\.completeGeneration(?!Internal)/,
    )
  })

  it('does not use a separate refinement mutation for initial generation', () => {
    const generationSource = readFileSync(join(here, 'generation.ts'), 'utf8')
    const sessionsSource = readFileSync(join(here, 'sessions.ts'), 'utf8')

    expect(generationSource).not.toContain(
      'internalFunctions.sessions.replaceGeneratedPreview',
    )
    expect(sessionsSource).not.toContain('export const replaceGeneratedPreview')
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
