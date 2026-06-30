import { convexTest } from 'convex-test'
import { describe, expect, it, vi } from 'vitest'
import { api } from './_generated/api'
import { startGeneration } from './generation'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const generationMocks = vi.hoisted(() => {
  const selectedV3Engine = vi.fn()
  return {
    getSelectedEngine: vi.fn((version: string) =>
      version === 'v3' ? selectedV3Engine : vi.fn(),
    ),
    runEngineGeneration: vi.fn(),
    selectedV3Engine,
  }
})

vi.mock('../src/features/generation/server/engine-selector', () => ({
  getSelectedEngine: generationMocks.getSelectedEngine,
}))

vi.mock('../src/features/generation/server/generation-runner', () => ({
  runEngineGeneration: generationMocks.runEngineGeneration,
}))

describe('convex generation action', () => {
  it('runs v3 sessions through the v3 engine and records the v3 provider', async () => {
    const originalGroqApiKey = process.env.GROQ_API_KEY
    process.env.GROQ_API_KEY = 'test-groq-key'
    const session = {
      _id: 'session-v3',
      _creationTime: 1,
      status: 'queued',
      prompt: 'Build with the v3 engine',
      preferredLanguage: 'en',
      engineVersion: 'v3',
      previewVersion: 0,
    }
    const mutations: Array<{ args: Record<string, unknown> }> = []
    const queries: Array<Record<string, unknown>> = []
    generationMocks.getSelectedEngine.mockClear()
    generationMocks.runEngineGeneration.mockImplementationOnce(
      async (input: {
        runAll: unknown
        persistence: {
          completeGeneration: (value: {
            html: string
            siteSpecJson: string
            openUiSource: string
            tasks: unknown[]
          }) => Promise<unknown>
        }
      }) => {
        expect(input.runAll).toBe(generationMocks.selectedV3Engine)
        await input.persistence.completeGeneration({
          html: '<!doctype html><h1>V3</h1>',
          siteSpecJson: '{"brand":"V3"}',
          openUiSource: 'root = Page("V3")',
          tasks: [{ id: 'home', label: 'Home', status: 'DONE' }],
        })
        return { status: 'completed', previewVersion: 1 }
      },
    )

    const ctx = {
      runQuery: vi.fn(async (_ref: unknown, args: Record<string, unknown>) => {
        queries.push(args)
        return session
      }),
      runMutation: vi.fn(
        async (_ref: unknown, args: Record<string, unknown>) => {
          mutations.push({ args })
          if ('eventType' in args) return null
          if ('html' in args) return null
          return { started: true }
        },
      ),
    }

    try {
      await expect(
        (
          startGeneration as unknown as {
            _handler: (
              ctx: Record<string, unknown>,
              args: { sessionId: string; anonymousOwnerSecret?: string },
            ) => Promise<unknown>
          }
        )._handler(ctx, {
          sessionId: 'session-v3',
          anonymousOwnerSecret: 'owner-secret',
        }),
      ).resolves.toEqual({ status: 'completed' })
    } finally {
      if (originalGroqApiKey === undefined) {
        delete process.env.GROQ_API_KEY
      } else {
        process.env.GROQ_API_KEY = originalGroqApiKey
      }
    }

    expect(generationMocks.getSelectedEngine).toHaveBeenCalledWith('v3')
    expect(generationMocks.runEngineGeneration).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: 'session-v3',
        prompt: 'Build with the v3 engine',
        preferredLanguage: 'en',
        anonymousOwnerSecret: 'owner-secret',
        runAll: generationMocks.selectedV3Engine,
      }),
    )
    expect(mutations.map((call) => call.args)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventType: 'status',
          message: 'Running Ship Fast engine v3',
        }),
        expect.objectContaining({
          html: '<!doctype html><h1>V3</h1>',
          siteSpecJson: '{"brand":"V3"}',
          openUiSource: 'root = Page("V3")',
          provider: 'ship-fast-engine-v3',
          anonymousOwnerSecret: 'owner-secret',
        }),
        expect.objectContaining({
          eventType: 'completed',
          message: 'Generation complete',
        }),
      ]),
    )
    expect(queries).toEqual(
      expect.arrayContaining([
        { sessionId: 'session-v3' },
        { sessionId: 'session-v3' },
      ]),
    )
  })

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
})
