import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const here = dirname(fileURLToPath(import.meta.url))

const modules = import.meta.glob('./**/*.ts')

describe('convex generation action', () => {
  it('persists the requested preferred language on the created session', async () => {
    const t = convexTest(schema, modules)

    const { sessionId } = await t.mutation(api.sessions.create, {
      prompt: 'Build a multilingual marketing homepage',
      preferredLanguage: 'fr',
      preferredExportTarget: 'html',
      isPrivate: false,
      workspace: 'workspace_preferred_language_fr',
    })

    const session = await t.query(api.sessions.getSessionApiResponse, {
      lookup: sessionId,
    })

    expect(session?.preferredLanguage).toBe('fr')
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

  it('threads v1 owner email, session seed, and generated artifacts into site metadata', () => {
    const source = readFileSync(join(here, 'generation.ts'), 'utf8')

    expect(source).toContain('ownerEmail: session.ownerEmail')
    expect(source).toContain('sessionSeed: String(args.sessionId)')
    expect(source).toContain('const artifactsByKey =')
    expect(source).toContain('artifacts: generatedArtifacts ?? {}')
    expect(source).toContain("generatedArtifacts?.['admin-policy']")
    expect(source).toContain("generatedArtifacts?.['fullstack-manifest']")
    expect(source).toContain("generatedArtifacts?.['openui-manifest']")
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
    const v1ProviderIndex = source.indexOf(
      "provider: 'genui-orchestrator'",
      runtimeIndex,
    )

    expect(handlerIndex).toBeGreaterThan(-1)
    expect(runtimeIndex).toBeGreaterThan(-1)
    expect(v1ProviderIndex).toBeGreaterThan(runtimeIndex)
    expect(source).not.toContain('buildFastPreviewArtifacts')
    expect(source).not.toContain("provider: 'fast-preview'")
    expect(source).toContain("provider: 'genui-orchestrator'")
    expect(source).toContain('buildRenderedOpenUiPreviewHtml')
  })

  it('completes generated previews inside the node action runtime', () => {
    const source = readFileSync(join(here, 'generation.ts'), 'utf8')

    expect(source).toContain('completeGenerationFromNode')
    expect(source).toContain(
      'internalFunctions.sessions.completeGenerationInternal',
    )
    expect(source).toContain(
      "import { buildOpenUiHandoffHtml } from './lib/openui_handoff_html'",
    )
    expect(source).not.toContain(
      "import('../packages/ship-fast-engine/src/openui-ssr.js')",
    )
    expect(source).not.toContain('renderOpenUIToHTMLWithTheme')
    expect(source).not.toMatch(
      /internalFunctions\.sessions\.completeGeneration(?!Internal)/,
    )
  })

  it('persists partial OpenUI source as a running home module for instant preview', () => {
    const source = readFileSync(join(here, 'generation.ts'), 'utf8')
    const onSourceIndex = source.indexOf('onSource: (source) => {')
    const onEventIndex = source.indexOf('onEvent: (event)', onSourceIndex)
    const onSourceBlock = source.slice(onSourceIndex, onEventIndex)

    expect(onSourceIndex).toBeGreaterThan(-1)
    expect(onSourceBlock).toContain('latestOpenUiSource = source')
    expect(onSourceBlock).toContain(
      'internalFunctions.sessions.upsertGeneratedModule',
    )
    expect(onSourceBlock).toContain("moduleKey: 'home'")
    expect(onSourceBlock).toContain("status: 'running'")
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

  it('fails fast when the configured homepage model is missing its API key', () => {
    const source = readFileSync(join(here, 'generation.ts'), 'utf8')
    const configSource = readFileSync(join(here, 'generationConfig.ts'), 'utf8')
    const handlerIndex = source.indexOf('handler: async (ctx, args) => {')
    const preflightIndex = source.indexOf(
      'getModelConfigurationFailure()',
      handlerIndex,
    )
    const runtimeIndex = source.indexOf('runHomepageOrchestrator', handlerIndex)

    expect(source).toContain(
      "import { getModelConfigurationFailure } from './generationConfig'",
    )
    expect(configSource).toContain(
      'export const getModelConfigurationFailure =',
    )
    expect(configSource).toContain('GROQ_API_KEY')
    expect(configSource).toContain('GEMINI_API_KEY')
    expect(preflightIndex).toBeGreaterThan(handlerIndex)
    expect(runtimeIndex).toBeGreaterThan(preflightIndex)
    expect(source).toContain('throw new Error(modelConfigurationFailure)')
  })

  it('passes a timeout-backed abort signal to the homepage orchestrator', () => {
    const source = readFileSync(join(here, 'generation.ts'), 'utf8')

    expect(source).toContain('const createGenerationTimeoutController =')
    expect(source).toContain('SHIP_FAST_GENERATION_TIMEOUT_MS')
    expect(source).toContain('controller.abort(\n      new Error(')
    expect(source).toContain('Generation timed out. Please try again')
    expect(source).toContain(
      'const generationTimeout = createGenerationTimeoutController()',
    )
    expect(source).toContain('signal: generationTimeout.controller.signal')
    expect(source).toContain('generationTimeout.clear()')
    expect(source).not.toContain('signal: new AbortController().signal')
  })
})
