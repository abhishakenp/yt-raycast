import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { ActionCtx } from '../_generated/server'
import {
  completeGenerationAction,
  type CompleteGenerationActionInput,
  type CompleteGenerationActionReferences,
} from './session_generation_action_helpers'

type SessionRecord = Doc<'sessions'>

const sessionId = 'session_generation_action' as Id<'sessions'>
const getGenerationSessionRef =
  'sessions.getGenerationSession' as unknown as Parameters<
    ActionCtx['runQuery']
  >[0]
const completeGenerationInternalRef =
  'sessions.completeGenerationInternal' as unknown as Parameters<
    ActionCtx['runMutation']
  >[0]

function sessionDoc(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    _id: sessionId,
    _creationTime: 1,
    prompt: 'Build a homepage',
    workspace: 'default',
    status: 'streaming',
    preferredLanguage: 'fr',
    createdAt: 1,
    ...overrides,
  } as SessionRecord
}

function actionInput(
  overrides: Partial<CompleteGenerationActionInput> = {},
): CompleteGenerationActionInput {
  return {
    sessionId,
    html: '<html><body><main>handoff</main></body></html>',
    siteSpecJson: '{"title":"Handoff"}',
    openUiSource: '$page = "Home"',
    tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
    elapsed: 123,
    cost: 0.5,
    provider: 'groq',
    ...overrides,
  }
}

const dbObservedBreweryGeneration = {
  brand: 'Craft Beer Brewery',
  menuItem: 'Pineapple Saison',
  preferredLanguage: 'lt',
  prompt:
    'a craft beer brewery with taproom tours and seasonal releases in portland',
  siteSpecJson: JSON.stringify({
    brand: 'Craft Beer Brewery',
    theme: 'darkmatter',
  }),
  source:
    'home_menu = RestaurantMenu("Our Brew Selection", "Explore rotating seasonal ales, lagers, and specialty brews crafted on-site.", [{"name":"categories[Seasonal Releases","items":[{"name":"Pineapple Saison","description":"Tropical notes with a crisp finish","price":"$7","tag":"Limited"}]}])\nroot = PageSwitch(["Home"], [home_menu], "", {"Home":"home"})',
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
</body>
</html>`

function ctxFor(session: SessionRecord | null) {
  const queryCalls: Array<{ ref: unknown; args: unknown }> = []
  const mutationCalls: Array<{ ref: unknown; args: Record<string, unknown> }> =
    []

  const ctx = {
    runQuery: async (ref: unknown, args: unknown) => {
      queryCalls.push({ ref, args })
      return session
    },
    runMutation: async (ref: unknown, args: Record<string, unknown>) => {
      mutationCalls.push({ ref, args })
    },
  } as unknown as Pick<ActionCtx, 'runMutation' | 'runQuery'>

  return { ctx, queryCalls, mutationCalls }
}

function referencesFor(
  overrides: Partial<CompleteGenerationActionReferences> = {},
): CompleteGenerationActionReferences {
  return {
    getGenerationSession: getGenerationSessionRef,
    completeGenerationInternal: completeGenerationInternalRef,
    loadOpenUISSR: async () => ({
      renderOpenUIToHTMLWithTheme: async (source, _theme, language) => ({
        html: `<main data-lang="${language}">${source}</main>`,
        cssVars: '',
      }),
    }),
    ...overrides,
  }
}

describe('completeGenerationAction', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects when the session does not exist', async () => {
    const { ctx } = ctxFor(null)

    await expect(
      completeGenerationAction(ctx, actionInput(), referencesFor()),
    ).rejects.toMatchObject({
      data: {
        code: 'NOT_FOUND',
        message: 'Session not found',
      },
    })
  })

  it('skips late completions when a preview already exists', async () => {
    const { ctx, mutationCalls } = ctxFor(sessionDoc({ previewVersion: 4 }))

    await expect(
      completeGenerationAction(ctx, actionInput(), referencesFor()),
    ).resolves.toEqual({
      sessionId,
      previewVersion: 4,
      skipped: true,
      reason: 'preview_already_exists',
    })
    expect(mutationCalls).toEqual([])
  })

  it('renders OpenUI source before completing generation', async () => {
    const { ctx, mutationCalls } = ctxFor(sessionDoc({ previewVersion: 0 }))

    await expect(
      completeGenerationAction(ctx, actionInput(), referencesFor()),
    ).resolves.toEqual({ sessionId, previewVersion: 1 })

    expect(mutationCalls).toEqual([
      {
        ref: completeGenerationInternalRef,
        args: expect.objectContaining({
          sessionId,
          html: '<main data-lang="fr">$page = "Home"</main>',
          siteSpecJson: '{"title":"Handoff"}',
          openUiSource: '$page = "Home"',
          elapsed: 123,
          cost: 0.5,
          provider: 'groq',
        }),
      },
    ])
  })

  it('renders DB-observed OpenUI output with the session language and resolved theme before completing generation', async () => {
    const renderCalls: unknown[][] = []
    const { ctx, mutationCalls } = ctxFor(
      sessionDoc({
        preferredLanguage: dbObservedBreweryGeneration.preferredLanguage,
        previewVersion: 0,
      }),
    )

    await expect(
      completeGenerationAction(
        ctx,
        actionInput({
          html: dbObservedOpenUiHandoffHtml,
          siteSpecJson: dbObservedBreweryGeneration.siteSpecJson,
          openUiSource: dbObservedBreweryGeneration.source,
          provider: 'ship-fast-engine-v3',
        }),
        referencesFor({
          loadOpenUISSR: async () => ({
            renderOpenUIToHTMLWithTheme: async (...args) => {
              renderCalls.push(args)
              return {
                html: `<main data-lang="${args[2]}"><h1>${dbObservedBreweryGeneration.brand}</h1><p>${dbObservedBreweryGeneration.menuItem}</p></main>`,
                cssVars: '',
              }
            },
          }),
        }),
      ),
    ).resolves.toEqual({ sessionId, previewVersion: 1 })

    expect(renderCalls).toHaveLength(1)
    const [sourceArg, themeArg, languageArg, integrationsArg] =
      renderCalls[0] ?? []
    expect(sourceArg).toBe(dbObservedBreweryGeneration.source)
    expect(themeArg).toEqual(expect.objectContaining({}))
    expect(languageArg).toBe(dbObservedBreweryGeneration.preferredLanguage)
    expect(integrationsArg).toBeUndefined()
    expect(mutationCalls[0].args).toMatchObject({
      html: expect.stringContaining(dbObservedBreweryGeneration.menuItem),
      openUiSource: dbObservedBreweryGeneration.source,
      provider: 'ship-fast-engine-v3',
      siteSpecJson: dbObservedBreweryGeneration.siteSpecJson,
    })
    expect(String(mutationCalls[0].args.html)).not.toContain(
      'Generated OpenUI source is ready',
    )
  })

  it('falls back to client-renderable shell when SSR throws and source is available', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { ctx, mutationCalls } = ctxFor(sessionDoc())

    await expect(
      completeGenerationAction(
        ctx,
        actionInput({
          html: dbObservedOpenUiHandoffHtml,
          openUiSource: dbObservedBreweryGeneration.source,
        }),
        referencesFor({
          loadOpenUISSR: async () => ({
            renderOpenUIToHTMLWithTheme: () => {
              throw new Error('fe is not a function')
            },
          }),
        }),
      ),
    ).resolves.toEqual({ sessionId, previewVersion: 1 })

    expect(consoleError).toHaveBeenCalledWith(
      '[completeGeneration] Failed to render OpenUI to HTML',
      expect.objectContaining({
        sessionId,
        error: 'fe is not a function',
      }),
    )
    expect(mutationCalls).toHaveLength(1)
    expect(mutationCalls[0].args.html).toContain('openui-client-source')
    expect(mutationCalls[0].args.html).not.toContain('data-openui-ready')
    expect(mutationCalls[0].args.html).not.toContain('ship-fast-openui-source')
    expect(mutationCalls[0].args.html).not.toContain('openui-error')
  })

  it('falls back to client-renderable shell when SSR returns error HTML and source is available', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { ctx, mutationCalls } = ctxFor(sessionDoc())

    await expect(
      completeGenerationAction(
        ctx,
        actionInput({
          html: dbObservedOpenUiHandoffHtml,
          openUiSource: dbObservedBreweryGeneration.source,
        }),
        referencesFor({
          loadOpenUISSR: async () => ({
            renderOpenUIToHTMLWithTheme: async () => ({
              html: '<div class="openui-error">Failed to render</div>',
              cssVars: '',
            }),
          }),
        }),
      ),
    ).resolves.toEqual({ sessionId, previewVersion: 1 })

    expect(consoleError).toHaveBeenCalledWith(
      '[completeGeneration] Failed to render OpenUI to HTML',
      expect.objectContaining({
        sessionId,
        error: 'OpenUI renderer returned error HTML',
      }),
    )
    expect(mutationCalls).toHaveLength(1)
    expect(mutationCalls[0].args.html).toContain('openui-client-source')
    expect(mutationCalls[0].args.html).not.toContain('openui-error')
  })

  it('rejects with PREVIEW_NOT_READY when openUiSource is empty and html is handoff placeholder', async () => {
    const { ctx, mutationCalls } = ctxFor(sessionDoc())

    await expect(
      completeGenerationAction(
        ctx,
        actionInput({
          html: dbObservedOpenUiHandoffHtml,
          openUiSource: '',
        }),
        referencesFor(),
      ),
    ).rejects.toMatchObject({
      data: {
        code: 'PREVIEW_NOT_READY',
        message: 'Preview HTML is not renderable',
      },
    })

    expect(mutationCalls).toEqual([])
  })

  it('rejects with PREVIEW_NOT_READY when SSR fails and no source is available', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { ctx, mutationCalls } = ctxFor(sessionDoc())

    await expect(
      completeGenerationAction(
        ctx,
        actionInput({
          html: '',
          openUiSource: '',
        }),
        referencesFor({
          loadOpenUISSR: async () => ({
            renderOpenUIToHTMLWithTheme: () => {
              throw new Error('render_failed')
            },
          }),
        }),
      ),
    ).rejects.toMatchObject({
      data: {
        code: 'PREVIEW_NOT_READY',
        message: 'Preview HTML is not renderable',
      },
    })

    expect(mutationCalls).toEqual([])
  })
})
