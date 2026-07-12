import { convexTest } from 'convex-test'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from './_generated/api'
import { startGeneration } from './generation'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const generationMocks = vi.hoisted(() => {
  const selectedV2Engine = vi.fn()
  const selectedV3Engine = vi.fn()
  return {
    getSelectedEngine: vi.fn((version: string) => {
      if (version === 'v2') return selectedV2Engine
      if (version === 'v3') return selectedV3Engine
      return vi.fn()
    }),
    renderOpenUIToHTMLWithTheme: vi.fn(
      (source: string, _theme: object | undefined, language?: string) => ({
        html: `<main data-lang="${language ?? 'en'}">${source}</main>`,
      }),
    ),
    runEngineGeneration: vi.fn(),
    runHomepageOrchestrator: vi.fn(),
    selectedV2Engine,
    selectedV3Engine,
  }
})

vi.mock('../src/features/generation/server/engine-selector', () => ({
  getSelectedEngine: generationMocks.getSelectedEngine,
}))

vi.mock('../src/features/generation/server/generation-runner', () => ({
  runEngineGeneration: generationMocks.runEngineGeneration,
}))

vi.mock('../packages/ship-fast-engine/src/genui/run.ts', () => ({
  runHomepageOrchestrator: generationMocks.runHomepageOrchestrator,
}))

vi.mock('@ship-fast/engine/openui-ssr.js', () => ({
  renderOpenUIToHTMLWithTheme: generationMocks.renderOpenUIToHTMLWithTheme,
}))

const DB_OBSERVED_GENERATION = {
  brand: 'Craft Beer Brewery',
  menuItem: 'Pineapple Saison',
  preferredLanguage: 'lt',
  prompt:
    'a craft beer brewery with taproom tours and seasonal releases in portland',
  source:
    'home_menu = RestaurantMenu("Our Brew Selection", "Explore rotating seasonal ales, lagers, and specialty brews crafted on-site.", [{"name":"Seasonal Releases","items":[{"name":"Pineapple Saison","description":"Tropical notes with a crisp finish","price":"$7","tag":"Limited"}]}])\nroot = PageSwitch(["Home"], [home_menu], "", {"Home":"home"})',
}

const dbObservedOpenUiHandoffHtml = `<!doctype html>
<html lang="en">
<body>
  <main id="openui-root" data-openui-ready="source">
    <section>
      <p>Generated OpenUI source is ready.</p>
      <h1>Craft Beer Brewery</h1>
      <p>The interactive source is available for export and deployment.</p>
    </section>
  </main>
  <script type="application/json" id="ship-fast-openui-source">"home_menu = RestaurantMenu()"</script>
</body>
</html>`

const withGroqApiKey = async (run: () => Promise<void>) => {
  const originalGroqApiKey = process.env.GROQ_API_KEY
  process.env.GROQ_API_KEY = 'test-groq-key'

  try {
    await run()
  } finally {
    if (originalGroqApiKey === undefined) {
      delete process.env.GROQ_API_KEY
    } else {
      process.env.GROQ_API_KEY = originalGroqApiKey
    }
  }
}

describe('convex generation action', () => {
  afterEach(() => {
    generationMocks.getSelectedEngine.mockClear()
    generationMocks.renderOpenUIToHTMLWithTheme.mockClear()
    generationMocks.runEngineGeneration.mockReset()
    generationMocks.runHomepageOrchestrator.mockReset()
  })

  it('runs v2 sessions through the v2 engine and records the v2 provider', async () => {
    const session = {
      _id: 'session-v2',
      _creationTime: 1,
      status: 'queued',
      prompt: DB_OBSERVED_GENERATION.prompt,
      preferredLanguage: DB_OBSERVED_GENERATION.preferredLanguage,
      engineVersion: 'v2',
      previewVersion: 0,
    }
    const mutations: Array<{ args: Record<string, unknown> }> = []
    const queries: Array<Record<string, unknown>> = []

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
        expect(input.runAll).toBe(generationMocks.selectedV2Engine)
        await input.persistence.completeGeneration({
          html: `<!doctype html><h1>${DB_OBSERVED_GENERATION.brand}</h1>`,
          siteSpecJson: JSON.stringify({
            brand: DB_OBSERVED_GENERATION.brand,
          }),
          openUiSource: DB_OBSERVED_GENERATION.source,
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

    await withGroqApiKey(async () => {
      await expect(
        (
          startGeneration as unknown as {
            _handler: (
              ctx: Record<string, unknown>,
              args: { sessionId: string; anonymousOwnerSecret?: string },
            ) => Promise<unknown>
          }
        )._handler(ctx, {
          sessionId: 'session-v2',
          anonymousOwnerSecret: 'owner-secret',
        }),
      ).resolves.toEqual({ status: 'completed' })
    })

    expect(generationMocks.getSelectedEngine).toHaveBeenCalledWith('v2')
    expect(generationMocks.runEngineGeneration).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: 'session-v2',
        prompt: DB_OBSERVED_GENERATION.prompt,
        preferredLanguage: DB_OBSERVED_GENERATION.preferredLanguage,
        anonymousOwnerSecret: 'owner-secret',
        runAll: generationMocks.selectedV2Engine,
      }),
    )
    expect(mutations.map((call) => call.args)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventType: 'status',
          message: 'Running Ship Fast engine v2',
        }),
        expect.objectContaining({
          html: expect.stringContaining(DB_OBSERVED_GENERATION.menuItem),
          siteSpecJson: JSON.stringify({
            brand: DB_OBSERVED_GENERATION.brand,
          }),
          openUiSource: DB_OBSERVED_GENERATION.source,
          provider: 'ship-fast-engine-v2',
          anonymousOwnerSecret: 'owner-secret',
        }),
        expect.objectContaining({
          eventType: 'completed',
          message: 'Generation complete',
        }),
      ]),
    )
    expect(generationMocks.renderOpenUIToHTMLWithTheme).toHaveBeenCalledWith(
      DB_OBSERVED_GENERATION.source,
      undefined,
      DB_OBSERVED_GENERATION.preferredLanguage,
      undefined,
    )
    expect(JSON.stringify(mutations)).not.toContain('ship-fast-openui-source')
    expect(queries).toEqual(
      expect.arrayContaining([
        { sessionId: 'session-v2' },
        { sessionId: 'session-v2' },
      ]),
    )
  })

  it('runs v3 sessions through the v3 engine and records the v3 provider', async () => {
    const session = {
      _id: 'session-v3',
      _creationTime: 1,
      status: 'queued',
      prompt: DB_OBSERVED_GENERATION.prompt,
      preferredLanguage: DB_OBSERVED_GENERATION.preferredLanguage,
      engineVersion: 'v3',
      previewVersion: 0,
    }
    const mutations: Array<{ args: Record<string, unknown> }> = []
    const queries: Array<Record<string, unknown>> = []

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
          html: `<!doctype html><h1>${DB_OBSERVED_GENERATION.brand}</h1>`,
          siteSpecJson: JSON.stringify({
            brand: DB_OBSERVED_GENERATION.brand,
          }),
          openUiSource: DB_OBSERVED_GENERATION.source,
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

    await withGroqApiKey(async () => {
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
    })

    expect(generationMocks.getSelectedEngine).toHaveBeenCalledWith('v3')
    expect(generationMocks.runEngineGeneration).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: 'session-v3',
        prompt: DB_OBSERVED_GENERATION.prompt,
        preferredLanguage: DB_OBSERVED_GENERATION.preferredLanguage,
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
          html: expect.stringContaining(DB_OBSERVED_GENERATION.menuItem),
          siteSpecJson: JSON.stringify({
            brand: DB_OBSERVED_GENERATION.brand,
          }),
          openUiSource: DB_OBSERVED_GENERATION.source,
          provider: 'ship-fast-engine-v3',
          anonymousOwnerSecret: 'owner-secret',
        }),
        expect.objectContaining({
          eventType: 'completed',
          message: 'Generation complete',
        }),
      ]),
    )
    expect(generationMocks.renderOpenUIToHTMLWithTheme).toHaveBeenCalledWith(
      DB_OBSERVED_GENERATION.source,
      undefined,
      DB_OBSERVED_GENERATION.preferredLanguage,
      undefined,
    )
    expect(JSON.stringify(mutations)).not.toContain('ship-fast-openui-source')
    expect(queries).toEqual(
      expect.arrayContaining([
        { sessionId: 'session-v3' },
        { sessionId: 'session-v3' },
      ]),
    )
  })

  it('renders v3 OpenUI handoff HTML before completing generation', async () => {
    const session = {
      _id: 'session-v3-handoff',
      _creationTime: 1,
      status: 'queued',
      prompt: DB_OBSERVED_GENERATION.prompt,
      preferredLanguage: DB_OBSERVED_GENERATION.preferredLanguage,
      engineVersion: 'v3',
      previewVersion: 0,
    }
    const mutations: Array<{ args: Record<string, unknown> }> = []

    generationMocks.renderOpenUIToHTMLWithTheme.mockReturnValueOnce({
      html: `<main data-lang="${DB_OBSERVED_GENERATION.preferredLanguage}"><h1>${DB_OBSERVED_GENERATION.brand}</h1><p>${DB_OBSERVED_GENERATION.menuItem}</p></main>`,
    })
    generationMocks.runEngineGeneration.mockImplementationOnce(
      async (input: {
        persistence: {
          completeGeneration: (value: {
            html: string
            siteSpecJson: string
            openUiSource: string
            tasks: unknown[]
          }) => Promise<unknown>
        }
      }) => {
        await input.persistence.completeGeneration({
          html: dbObservedOpenUiHandoffHtml,
          siteSpecJson: JSON.stringify({
            brand: DB_OBSERVED_GENERATION.brand,
          }),
          openUiSource: DB_OBSERVED_GENERATION.source,
          tasks: [{ id: 'home', label: 'Home', status: 'DONE' }],
        })
        return { status: 'completed', previewVersion: 1 }
      },
    )

    const ctx = {
      runQuery: vi.fn(async () => session),
      runMutation: vi.fn(
        async (_ref: unknown, args: Record<string, unknown>) => {
          mutations.push({ args })
          if (
            typeof args.html === 'string' &&
            args.html.includes('ship-fast-openui-source')
          ) {
            throw new Error('Preview HTML is not renderable')
          }
          if ('eventType' in args) return null
          if ('html' in args) return null
          return { started: true }
        },
      ),
    }

    await withGroqApiKey(async () => {
      await expect(
        (
          startGeneration as unknown as {
            _handler: (
              ctx: Record<string, unknown>,
              args: { sessionId: string; anonymousOwnerSecret?: string },
            ) => Promise<unknown>
          }
        )._handler(ctx, {
          sessionId: 'session-v3-handoff',
          anonymousOwnerSecret: 'owner-secret',
        }),
      ).resolves.toEqual({ status: 'completed' })
    })

    expect(generationMocks.renderOpenUIToHTMLWithTheme).toHaveBeenCalledWith(
      DB_OBSERVED_GENERATION.source,
      undefined,
      DB_OBSERVED_GENERATION.preferredLanguage,
      undefined,
    )
    expect(mutations.map((call) => call.args)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          html: expect.stringContaining(DB_OBSERVED_GENERATION.menuItem),
          openUiSource: DB_OBSERVED_GENERATION.source,
          provider: 'ship-fast-engine-v3',
        }),
      ]),
    )
    expect(JSON.stringify(mutations)).not.toContain('ship-fast-openui-source')
  })

  it('runs legacy sessions through the OpenUI orchestrator and persists DB-shaped generated content', async () => {
    const session = {
      _id: 'session-v1',
      _creationTime: 1,
      status: 'queued',
      prompt: DB_OBSERVED_GENERATION.prompt,
      preferredLanguage: DB_OBSERVED_GENERATION.preferredLanguage,
      engineVersion: 'v1',
      previewVersion: 0,
    }
    const mutations: Array<{ args: Record<string, unknown> }> = []

    generationMocks.runHomepageOrchestrator.mockImplementationOnce(
      async (input: {
        prompt: string
        preferredLanguage?: string
        onSource?: (source: string) => void
        onEvent?: (event: { type: 'status'; message: string }) => void
      }) => {
        expect(input.prompt).toBe(DB_OBSERVED_GENERATION.prompt)
        expect(input.preferredLanguage).toBe(
          DB_OBSERVED_GENERATION.preferredLanguage,
        )
        input.onEvent?.({
          type: 'status',
          message: `Drafting ${DB_OBSERVED_GENERATION.brand}`,
        })
        input.onSource?.(DB_OBSERVED_GENERATION.source)

        return {
          artifacts: [
            {
              key: 'openui-manifest',
              contentJson: JSON.stringify({
                pages: ['home'],
                brand: DB_OBSERVED_GENERATION.brand,
              }),
            },
          ],
          brand: DB_OBSERVED_GENERATION.brand,
          category: 'restaurant',
          locale: DB_OBSERVED_GENERATION.preferredLanguage,
          source: DB_OBSERVED_GENERATION.source,
          theme: 't3-chat',
        }
      },
    )

    const ctx = {
      runQuery: vi.fn(async () => session),
      runMutation: vi.fn(
        async (_ref: unknown, args: Record<string, unknown>) => {
          mutations.push({ args })
          if ('eventType' in args) return null
          if ('html' in args) return null
          return { started: true }
        },
      ),
    }

    await withGroqApiKey(async () => {
      await expect(
        (
          startGeneration as unknown as {
            _handler: (
              ctx: Record<string, unknown>,
              args: { sessionId: string; anonymousOwnerSecret?: string },
            ) => Promise<unknown>
          }
        )._handler(ctx, {
          sessionId: 'session-v1',
          anonymousOwnerSecret: 'owner-secret',
        }),
      ).resolves.toEqual({ status: 'completed' })
    })

    expect(generationMocks.runHomepageOrchestrator).toHaveBeenCalledTimes(1)
    expect(mutations.map((call) => call.args)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          task: expect.objectContaining({
            id: 'homepage',
            status: 'IN_PROGRESS',
          }),
        }),
        expect.objectContaining({
          moduleKey: 'home',
          source: DB_OBSERVED_GENERATION.source,
          status: 'running',
        }),
        expect.objectContaining({
          html: expect.stringContaining(DB_OBSERVED_GENERATION.menuItem),
          openUiSource: DB_OBSERVED_GENERATION.source,
          provider: 'genui-orchestrator',
          siteSpecJson: expect.stringContaining(
            DB_OBSERVED_GENERATION.menuItem,
          ),
        }),
        expect.objectContaining({
          eventType: 'completed',
          message: 'Generation complete',
        }),
      ]),
    )
    expect(generationMocks.renderOpenUIToHTMLWithTheme).toHaveBeenCalledWith(
      DB_OBSERVED_GENERATION.source,
      undefined,
      DB_OBSERVED_GENERATION.preferredLanguage,
      undefined,
    )
    expect(JSON.stringify(mutations)).not.toContain('ship-fast-openui-source')
  })

  it('threads the AI-decided title into the v1 site spec as projectName', async () => {
    const session = {
      _id: 'session-v1-title',
      _creationTime: 1,
      status: 'queued',
      prompt: DB_OBSERVED_GENERATION.prompt,
      preferredLanguage: DB_OBSERVED_GENERATION.preferredLanguage,
      engineVersion: 'v1',
      previewVersion: 0,
    }
    const mutations: Array<{ args: Record<string, unknown> }> = []
    const aiTitle = `${DB_OBSERVED_GENERATION.brand} — Boutique Classes in San Francisco`

    generationMocks.runHomepageOrchestrator.mockImplementationOnce(
      async (input: {
        prompt: string
        preferredLanguage?: string
        onSource?: (source: string) => void
        onEvent?: (event: { type: 'status'; message: string }) => void
      }) => {
        input.onEvent?.({
          type: 'status',
          message: `Drafting ${DB_OBSERVED_GENERATION.brand}`,
        })
        input.onSource?.(DB_OBSERVED_GENERATION.source)

        return {
          artifacts: [],
          brand: DB_OBSERVED_GENERATION.brand,
          title: aiTitle,
          category: 'yogastudio',
          locale: DB_OBSERVED_GENERATION.preferredLanguage,
          source: DB_OBSERVED_GENERATION.source,
          theme: 'solar-dusk',
        }
      },
    )

    const ctx = {
      runQuery: vi.fn(async () => session),
      runMutation: vi.fn(
        async (_ref: unknown, args: Record<string, unknown>) => {
          mutations.push({ args })
          if ('eventType' in args) return null
          if ('html' in args) return null
          return { started: true }
        },
      ),
    }

    await withGroqApiKey(async () => {
      await expect(
        (
          startGeneration as unknown as {
            _handler: (
              ctx: Record<string, unknown>,
              args: { sessionId: string; anonymousOwnerSecret?: string },
            ) => Promise<unknown>
          }
        )._handler(ctx, {
          sessionId: 'session-v1-title',
          anonymousOwnerSecret: 'owner-secret',
        }),
      ).resolves.toEqual({ status: 'completed' })
    })

    const persistedSiteSpecJson = mutations
      .map((call) => call.args)
      .find(
        (args): args is { siteSpecJson: string } =>
          typeof args.siteSpecJson === 'string',
      )?.siteSpecJson

    expect(persistedSiteSpecJson).toBeDefined()
    const persistedSpec = JSON.parse(persistedSiteSpecJson as string)
    expect(persistedSpec.projectName).toBe(aiTitle)
    expect(persistedSpec.brand).toBe(DB_OBSERVED_GENERATION.brand)
  })

  it('fails legacy sessions when the orchestrator produces no OpenUI source', async () => {
    const session = {
      _id: 'session-v1-empty',
      _creationTime: 1,
      status: 'queued',
      prompt: DB_OBSERVED_GENERATION.prompt,
      preferredLanguage: DB_OBSERVED_GENERATION.preferredLanguage,
      engineVersion: 'v1',
      previewVersion: 0,
    }
    const mutations: Array<{ args: Record<string, unknown> }> = []

    generationMocks.runHomepageOrchestrator.mockImplementationOnce(
      async () => ({
        brand: DB_OBSERVED_GENERATION.brand,
        category: 'restaurant',
        locale: DB_OBSERVED_GENERATION.preferredLanguage,
        source: '',
        theme: 't3-chat',
      }),
    )

    const ctx = {
      runQuery: vi.fn(async () => session),
      runMutation: vi.fn(
        async (_ref: unknown, args: Record<string, unknown>) => {
          mutations.push({ args })
          if ('eventType' in args) return null
          if ('html' in args) return null
          return { started: true }
        },
      ),
    }

    await withGroqApiKey(async () => {
      await expect(
        (
          startGeneration as unknown as {
            _handler: (
              ctx: Record<string, unknown>,
              args: { sessionId: string; anonymousOwnerSecret?: string },
            ) => Promise<unknown>
          }
        )._handler(ctx, {
          sessionId: 'session-v1-empty',
          anonymousOwnerSecret: 'owner-secret',
        }),
      ).resolves.toEqual({ status: 'failed', message: expect.any(String) })
    })

    expect(mutations).not.toContain(
      expect.objectContaining({
        args: expect.objectContaining({ html: '' }),
      }),
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
