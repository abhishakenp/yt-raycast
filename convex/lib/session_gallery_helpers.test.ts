import { describe, expect, it, vi } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import {
  listOwnedGallerySessions,
  listPublicGallerySessions,
  loadPublicGalleryArtifacts,
  loadPublicGallerySession,
  serializePublicGallerySession,
} from './session_gallery_helpers'

type QueryHandler<Args> = (ctx: QueryCtx, args: Args) => Promise<unknown>

type PublicGallerySessionsArgs = {
  limit?: number
  page?: number
  search?: string
  category?: string
}

type PublicGallerySessionArgs = {
  sessionId: string
}

type GeneratedModuleRecord = Doc<'generatedModules'>
type EditRecord = Doc<'edits'>
type PreviewRecord = Doc<'previews'>
type SessionRecord = Doc<'sessions'>
type SiteSpecRecord = Doc<'siteSpecs'>
type TranslationCacheRecord = Doc<'translationCache'>

const sessionId = 'session_gallery_helpers' as Id<'sessions'>
const realConvexRendererErrorGalleryPreview = {
  previewId: 'ns70q8624bp2dk2qvehc0dc8jd89mdvb',
  sessionId: 'k57fkjjt99avgnxyzq7w3xy46589nmy3',
  prompt:
    'This app is going to be an image generation studio using various AI models to turn a prompt into images. Design a polished interactive product experience. It should be dark mode. Focus on making it beautiful.',
  html: '<!doctype html><html lang="en"><head><title>Nyx</title></head><body><div id="openui-root"><div class="openui-error">Failed to render: te is not a function</div></div></body></html>',
  previewVersion: 1,
} as const

const realConvexOpenUiHandoffGalleryPreview = {
  previewId: 'ns79pp36cdnxp2znd343t2tjw589n4yq',
  sessionId: 'k57eyt2na1n9pzn5x7rh4sdbah89mh9e',
  prompt:
    'a boutique coffee roastery with subscription delivery and tasting events',
  html: '<!DOCTYPE html><html lang="en"><head><title>Boutique Coffee Roastery - Preview</title></head><body><main id="openui-root" data-openui-ready="source"><section><p>Generated OpenUI source is ready.</p><h1>Boutique Coffee Roastery</h1><p>The interactive source is available for export and deployment.</p></section></main><script type="application/json" id="ship-fast-openui-source">"home_hero = EcommerceHero(\\"Boutique Coffee Roastery\\")"</script></body></html>',
  moduleSource:
    'home_hero = EcommerceHero("Boutique Coffee Roastery", "Crafted for Connoisseurs", "Subscribe for fresh beans delivered to your door")\nroot = PageSwitch(["Home"], [home_hero], "", {"Home":"home"})',
  previewVersion: 1,
} as const

function sessionDoc(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    _id: sessionId,
    _creationTime: 1,
    prompt: 'SaaS analytics dashboard for product teams',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    workspace: 'gallery-workspace',
    isPrivate: false,
    status: 'preview_ready',
    previewVersion: 2,
    createdAt: 100,
    updatedAt: 200,
    elapsed: 123,
    cost: 0,
    ...overrides,
  } as SessionRecord
}

function previewDoc(overrides: Partial<PreviewRecord> = {}): PreviewRecord {
  return {
    _id: 'preview_gallery' as Id<'previews'>,
    _creationTime: 1,
    sessionId,
    version: 3,
    html: '<main>Gallery preview</main>',
    source: 'generation',
    createdAt: 100,
    ...overrides,
  } as PreviewRecord
}

function generatedModuleDoc(
  overrides: Partial<GeneratedModuleRecord> = {},
): GeneratedModuleRecord {
  return {
    _id: 'module_gallery' as Id<'generatedModules'>,
    _creationTime: 1,
    sessionId,
    moduleKey: 'home',
    source: '$page = "Home"',
    status: 'succeeded',
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  } as GeneratedModuleRecord
}

function editDoc(overrides: Partial<EditRecord> = {}): EditRecord {
  return {
    _id: 'edit_gallery' as Id<'edits'>,
    _creationTime: 1,
    sessionId,
    previewVersion: 1,
    editType: 'text',
    beforeText: 'Original headline',
    afterText: 'Edited gallery headline',
    createdAt: 100,
    ...overrides,
  } as EditRecord
}

function siteSpecDoc(overrides: Partial<SiteSpecRecord> = {}): SiteSpecRecord {
  return {
    _id: 'site_spec_gallery' as Id<'siteSpecs'>,
    _creationTime: 1,
    sessionId,
    specJson: '{"brand":"Gallery"}',
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  } as SiteSpecRecord
}

function ctxFor(input: {
  sessions?: SessionRecord[]
  previews?: PreviewRecord[]
  generatedModules?: GeneratedModuleRecord[]
  siteSpecs?: SiteSpecRecord[]
  edits?: EditRecord[]
  translationCache?: TranslationCacheRecord[]
  userId?: string | null
}) {
  const sessions = [...(input.sessions ?? [])]
  const previews = [...(input.previews ?? [])]
  const generatedModules = [...(input.generatedModules ?? [])]
  const siteSpecs = [...(input.siteSpecs ?? [])]
  const edits = [...(input.edits ?? [])]
  const translationCache = [...(input.translationCache ?? [])]
  const queriedTables: string[] = []
  const takeLimits: number[] = []

  const rowsFor = (table) => {
    switch (table) {
      case 'sessions':
        return sessions as unknown as Array<Record<string, unknown>>
      case 'previews':
        return previews as unknown as Array<Record<string, unknown>>
      case 'generatedModules':
        return generatedModules as unknown as Array<Record<string, unknown>>
      case 'siteSpecs':
        return siteSpecs as unknown as Array<Record<string, unknown>>
      case 'edits':
        return edits as unknown as Array<Record<string, unknown>>
      case 'translationCache':
        return translationCache as unknown as Array<Record<string, unknown>>
      default:
        throw new Error(`Unhandled table ${table}`)
    }
  }

  const db = {
    normalizeId: (table, value) =>
      table === 'sessions' && sessions.some((row) => row._id === value)
        ? (value as Id<'sessions'>)
        : null,
    get: async (id) =>
      [...sessions, ...previews, ...generatedModules, ...siteSpecs].find(
        (row) => row._id === id,
      ) ?? null,
    query: (table) => {
      queriedTables.push(table)
      const query = {
        withIndex: (_indexName, applyIndex) => {
          const filters = new Map<string, unknown>()
          const index = {
            eq: (field, value) => {
              filters.set(field, value)
              return index
            },
          }

          applyIndex(index)

          const rows = () => {
            const filteredRows = rowsFor(table).filter((row) =>
              Array.from(filters.entries()).every(
                ([field, value]) => row[field] === value,
              ),
            )
            return table === 'sessions'
              ? filteredRows.sort(
                  (left, right) =>
                    Number(right.createdAt ?? right._creationTime ?? 0) -
                    Number(left.createdAt ?? left._creationTime ?? 0),
                )
              : filteredRows.sort(
                  (left, right) =>
                    Number(right.version ?? right._creationTime ?? 0) -
                    Number(left.version ?? left._creationTime ?? 0),
                )
          }

          const queryResult = {
            order: (_direction) => queryResult,
            first: async () => rows()[0] ?? null,
            take: async (limit) => {
              takeLimits.push(limit)
              return rows().slice(0, limit)
            },
            collect: async () => rows(),
          }

          // Convex query builders are single-use: once ANY terminal operator
          // (.take / .collect / .first) runs, ALL subsequent terminal calls on
          // the same builder throw. Simulate that so tests catch accidental
          // query reuse regressions (e.g. calling .take then .collect on the
          // same builder reference).
          let builderUsed = false
          const singleUse =
            (terminal) =>
            async (...args) => {
              if (builderUsed) {
                throw new Error(
                  "This query has been chained with another operator and can't be reused.",
                )
              }
              builderUsed = true
              return terminal(...args)
            }

          const guardedResult = {
            order: (_direction) => guardedResult,
            first: singleUse(queryResult.first),
            take: singleUse(queryResult.take),
            collect: singleUse(queryResult.collect),
          }

          return guardedResult
        },
      }
      return query
    },
  } as unknown as Pick<QueryCtx, 'db'>['db']

  return {
    auth: {
      getUserIdentity: async () =>
        input.userId === undefined || input.userId === null
          ? null
          : {
              tokenIdentifier: input.userId,
              subject: input.userId,
            },
    },
    db,
    queriedTables,
    takeLimits,
  }
}

describe('loadPublicGalleryArtifacts', () => {
  it('loads source artifacts without reading preview HTML when OpenUI source is available', async () => {
    const ctx = ctxFor({
      previews: [previewDoc()],
      generatedModules: [generatedModuleDoc()],
      siteSpecs: [siteSpecDoc()],
    })

    await expect(loadPublicGalleryArtifacts(ctx, sessionId)).resolves.toEqual({
      preview: null,
      homeModule: expect.objectContaining({ source: '$page = "Home"' }),
      siteSpec: expect.objectContaining({ specJson: '{"brand":"Gallery"}' }),
    })
    expect(ctx.queriedTables).not.toContain('previews')
  })

  it('loads preview HTML when no OpenUI source artifact exists', async () => {
    const ctx = ctxFor({
      previews: [previewDoc()],
      siteSpecs: [siteSpecDoc()],
    })

    await expect(loadPublicGalleryArtifacts(ctx, sessionId)).resolves.toEqual({
      preview: expect.objectContaining({
        html: '<main>Gallery preview</main>',
      }),
      homeModule: null,
      siteSpec: expect.objectContaining({ specJson: '{"brand":"Gallery"}' }),
    })
  })
})

describe('serializePublicGallerySession', () => {
  it('serializes edited OpenUI source with language, theme, and selected brand logo metadata', () => {
    const selectedBrandLogo = {
      name: 'The Beer Store',
      domain: 'thebeerstore.ca',
      brandId: 'idwTkaYgXe',
      icon: 'https://cdn.brandfetch.io/idwTkaYgXe/icon.webp',
      logo: 'https://cdn.brandfetch.io/idwTkaYgXe/logo.svg',
    }

    const result = serializePublicGallerySession(
      sessionDoc({
        preferredLanguage: 'lt',
        themeOverride: 'darkmatter',
        themeMode: 'dark',
        selectedBrandLogo,
      }),
      {
        preview: previewDoc({
          html: '<main><h1>Stale brewery preview</h1></main>',
          openUiSource: 'root = Text("Original brewery headline")',
        }),
        homeModule: generatedModuleDoc({
          source: 'root = Text("Ignored module headline")',
        }),
        siteSpec: siteSpecDoc(),
        edits: [
          editDoc({
            beforeText: 'Original brewery headline',
            afterText: 'Redaguotas aludario meniu',
          }),
        ],
        translations: [
          {
            sourceText: 'Redaguotas aludario meniu',
            translation: 'సవరించిన బ్రూవరీ మెనూ',
          },
        ],
      },
    )

    expect(result).toMatchObject({
      preferredLanguage: 'lt',
      themeOverride: 'darkmatter',
      themeMode: 'dark',
      selectedBrandLogo,
      moduleSource: 'root = Text("సవరించిన బ్రూవరీ మెనూ")',
    })
    expect(result.moduleSource).not.toContain('Original brewery headline')
    expect(result.moduleSource).not.toContain('Redaguotas aludario meniu')
  })
})

describe('listPublicGallerySessions', () => {
  it('lists visible public sessions with pagination, categories, and artifact serialization', async () => {
    const analyticsSessionId = 'session_analytics' as Id<'sessions'>
    const blogSessionId = 'session_blog' as Id<'sessions'>
    const serviceSessionId = 'session_service' as Id<'sessions'>
    const privateSessionId = 'session_private' as Id<'sessions'>
    const invisibleSessionId = 'session_invisible' as Id<'sessions'>
    const ctx = ctxFor({
      sessions: [
        sessionDoc({
          _id: privateSessionId,
          prompt: 'Commerce store checkout',
          isPrivate: true,
          createdAt: 500,
        }),
        sessionDoc({
          _id: analyticsSessionId,
          prompt: 'SaaS analytics dashboard',
          createdAt: 400,
        }),
        sessionDoc({
          _id: blogSessionId,
          prompt: 'Blog publication about design',
          createdAt: 300,
        }),
        sessionDoc({
          _id: invisibleSessionId,
          prompt: 'Queued app with no preview',
          status: 'queued',
          previewVersion: 0,
          createdAt: 200,
        }),
        sessionDoc({
          _id: serviceSessionId,
          prompt: 'Local restaurant booking service',
          status: 'streaming',
          previewVersion: 1,
          createdAt: 100,
        }),
      ],
      previews: [
        previewDoc({
          _id: 'preview_analytics' as Id<'previews'>,
          sessionId: analyticsSessionId,
          html: '<main>Analytics</main>',
        }),
        previewDoc({
          _id: 'preview_blog' as Id<'previews'>,
          sessionId: blogSessionId,
          html: '<main>Blog</main>',
        }),
        previewDoc({
          _id: 'preview_service' as Id<'previews'>,
          sessionId: serviceSessionId,
          html: '<main>Service</main>',
        }),
      ],
    })

    const result = await listPublicGallerySessions(ctx, {
      limit: 2,
      page: 1,
    })

    expect(result).toMatchObject({
      page: 1,
      limit: 2,
      total: 3,
      totalPages: 2,
      hasNext: true,
      hasPrev: false,
    })
    expect(result.items.map((item) => item.sessionId)).toEqual([
      analyticsSessionId,
      blogSessionId,
    ])
    expect(result.items[0]).toMatchObject({
      html: '<main>Analytics</main>',
      readiness: { previewReady: true },
    })
    expect(
      result.availableCategories.map((category) => category.value),
    ).toEqual(expect.arrayContaining(['saas', 'blog', 'service']))
  })

  it('falls back to collect without reusing the query builder when public sessions exceed scanLimit', async () => {
    // scanLimit = max(page * limit * 2, limit) = max(1 * 1 * 2, 1) = 2.
    // With 3 public sessions, take(2) returns 2 rows (>= scanLimit), so the
    // code must rebuild the query and call .collect() on a fresh builder.
    // Reusing the same builder throws in real Convex (and in this mock).
    const firstSessionId = 'session_collect_1' as Id<'sessions'>
    const secondSessionId = 'session_collect_2' as Id<'sessions'>
    const thirdSessionId = 'session_collect_3' as Id<'sessions'>
    const ctx = ctxFor({
      sessions: [
        sessionDoc({
          _id: firstSessionId,
          prompt: 'SaaS analytics',
          createdAt: 300,
        }),
        sessionDoc({
          _id: secondSessionId,
          prompt: 'Blog publication',
          createdAt: 200,
        }),
        sessionDoc({
          _id: thirdSessionId,
          prompt: 'Local service',
          createdAt: 100,
        }),
      ],
      previews: [
        previewDoc({
          _id: 'preview_collect_1' as Id<'previews'>,
          sessionId: firstSessionId,
        }),
        previewDoc({
          _id: 'preview_collect_2' as Id<'previews'>,
          sessionId: secondSessionId,
        }),
        previewDoc({
          _id: 'preview_collect_3' as Id<'previews'>,
          sessionId: thirdSessionId,
        }),
      ],
    })

    const result = await listPublicGallerySessions(ctx, { limit: 1, page: 1 })

    expect(result.total).toBe(3)
    expect(result.totalPages).toBe(3)
    expect(result.items.map((item) => item.sessionId)).toEqual([firstSessionId])
  })

  it('reuses batch-loaded artifacts for paginated items instead of re-fetching from DB', async () => {
    // The renderability check loads base artifacts for every session.
    // The paginated items should reuse those artifacts and only fetch
    // translations, not re-query generatedModules/siteSpecs/previews/edits.
    const sessions: Doc<'sessions'>[] = []
    const previews: Doc<'previews'>[] = []
    for (let i = 0; i < 10; i++) {
      const sid = `session_batch_${i}` as Id<'sessions'>
      sessions.push(
        sessionDoc({
          _id: sid,
          prompt: `Batch test session ${i}`,
          createdAt: 1000 - i,
        }),
      )
      previews.push(
        previewDoc({
          _id: `preview_batch_${i}` as Id<'previews'>,
          sessionId: sid,
        }),
      )
    }
    const ctx = ctxFor({ sessions, previews })

    await listPublicGallerySessions(ctx, { limit: 12, page: 1 })

    // The batch load queries each artifact table once per session (10×).
    // Without artifact reuse, pagination would re-query them AGAIN for the
    // 10 paginated items (another 10×), totaling 20× per table.
    // With reuse, each table is queried exactly 10 times, NOT 20.
    const moduleQueries = ctx.queriedTables.filter(
      (t) => t === 'generatedModules',
    ).length
    const siteSpecQueries = ctx.queriedTables.filter(
      (t) => t === 'siteSpecs',
    ).length

    expect(moduleQueries).toBe(10)
    expect(siteSpecQueries).toBe(10)
    // If pagination re-fetched, these would be 20
    expect(moduleQueries).not.toBe(20)
    expect(siteSpecQueries).not.toBe(20)
  })

  it('filters gallery lists by search before reporting category options and clamps requested pages', async () => {
    const analyticsSessionId = 'session_analytics' as Id<'sessions'>
    const dashboardSessionId = 'session_dashboard' as Id<'sessions'>
    const blogSessionId = 'session_blog' as Id<'sessions'>
    const ctx = ctxFor({
      sessions: [
        sessionDoc({
          _id: analyticsSessionId,
          prompt: 'SaaS analytics platform',
          createdAt: 300,
        }),
        sessionDoc({
          _id: dashboardSessionId,
          prompt: 'AI dashboard software',
          createdAt: 200,
        }),
        sessionDoc({
          _id: blogSessionId,
          prompt: 'Blog publication',
          createdAt: 100,
        }),
      ],
      previews: [
        previewDoc({ sessionId: analyticsSessionId }),
        previewDoc({
          _id: 'preview_dashboard' as Id<'previews'>,
          sessionId: dashboardSessionId,
        }),
        previewDoc({
          _id: 'preview_blog' as Id<'previews'>,
          sessionId: blogSessionId,
        }),
      ],
    })

    const result = await listPublicGallerySessions(ctx, {
      limit: 1,
      page: 9,
      search: 'dashboard',
      category: 'saas',
    })

    expect(result).toMatchObject({
      page: 1,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    })
    expect(result.items.map((item) => item.sessionId)).toEqual([
      dashboardSessionId,
    ])
    expect(
      result.availableCategories.map((category) => category.value),
    ).toEqual(['saas'])
  })

  it('applies cached translations only after pagination so large translated galleries stay within query limits', async () => {
    const sessions = Array.from({ length: 13 }, (_, index) => {
      const id = `session_translated_${index}` as Id<'sessions'>
      return sessionDoc({
        _id: id,
        prompt: `Translated launch ${index}`,
        preferredLanguage: 'lt',
        createdAt: 1_000 - index,
      })
    })
    const previews = sessions.map((session, index) =>
      previewDoc({
        _id: `preview_translated_${index}` as Id<'previews'>,
        sessionId: session._id,
        html: '<main>Stale English preview</main>',
        openUiSource: 'root = Text("Launch headline")',
      }),
    )
    const ctx = ctxFor({
      sessions,
      previews,
      translationCache: [
        {
          _id: 'translation_cache_gallery' as Id<'translationCache'>,
          _creationTime: 1,
          cacheKey: 'lt\nLaunch headline',
          locale: 'lt',
          sourceText: 'Launch headline',
          translation: 'Paleidimo antraštė',
          createdAt: 100,
          updatedAt: 100,
        } as TranslationCacheRecord,
      ],
    })

    const result = await listPublicGallerySessions(ctx, {
      limit: 12,
      page: 1,
    })

    expect(ctx.takeLimits[0]).toBe(24)
    expect(result.total).toBe(13)
    expect(result.items).toHaveLength(12)
    expect(result.items[0]).toMatchObject({
      sessionId: sessions[0]._id,
      moduleSource: 'root = Text("Paleidimo antraštė")',
    })
    expect(
      ctx.queriedTables.filter((table) => table === 'translationCache'),
    ).toHaveLength(12)
  })

  it('keeps a gallery row renderable when OpenUI source only exists in the site spec', async () => {
    const siteSpecOnlySessionId = 'session_site_spec_source' as Id<'sessions'>
    const ctx = ctxFor({
      sessions: [
        sessionDoc({
          _id: siteSpecOnlySessionId,
          preferredLanguage: 'lt',
          prompt: 'Launch page with source stored in site spec',
        }),
      ],
      siteSpecs: [
        siteSpecDoc({
          sessionId: siteSpecOnlySessionId,
          specJson: JSON.stringify({
            pages: {
              home: 'root = Text("Launch headline")',
            },
          }),
        }),
      ],
      translationCache: [
        {
          _id: 'translation_cache_site_spec_gallery' as Id<'translationCache'>,
          _creationTime: 1,
          cacheKey: 'lt\nLaunch headline',
          locale: 'lt',
          sourceText: 'Launch headline',
          translation: 'Paleidimo antraštė',
          createdAt: 100,
          updatedAt: 100,
        } as TranslationCacheRecord,
      ],
    })

    const result = await listPublicGallerySessions(ctx, {
      limit: 12,
      page: 1,
    })

    expect(result.items).toHaveLength(1)
    expect(result.total).toBe(1)
    expect(result.items[0]).toMatchObject({
      sessionId: siteSpecOnlySessionId,
      html: null,
      moduleSource: 'root = Text("Paleidimo antraštė")',
    })
    expect(ctx.queriedTables).not.toContain('previews')
  })

  it('does not expose real renderer-error preview HTML in public gallery lists', async () => {
    const brokenSessionId =
      realConvexRendererErrorGalleryPreview.sessionId as Id<'sessions'>
    const ctx = ctxFor({
      sessions: [
        sessionDoc({
          _id: brokenSessionId,
          prompt: realConvexRendererErrorGalleryPreview.prompt,
          status: 'preview_ready',
          previewVersion: realConvexRendererErrorGalleryPreview.previewVersion,
          isPrivate: false,
          createdAt: 1782821638453,
          updatedAt: 1782821638453,
        }),
      ],
      previews: [
        previewDoc({
          _id: realConvexRendererErrorGalleryPreview.previewId as Id<'previews'>,
          sessionId: brokenSessionId,
          version: realConvexRendererErrorGalleryPreview.previewVersion,
          html: realConvexRendererErrorGalleryPreview.html,
        }),
      ],
    })

    const result = await listPublicGallerySessions(ctx, {
      limit: 12,
      page: 1,
    })

    expect(result.items).toEqual([])
    expect(result.total).toBe(0)
    expect(result.totalPages).toBe(1)
    expect(JSON.stringify(result).toLowerCase()).not.toContain('openui-error')
    expect(JSON.stringify(result).toLowerCase()).not.toContain(
      'failed to render',
    )
  })

  it('keeps DB-observed OpenUI rows renderable for the web server without exposing handoff preview HTML', async () => {
    const handoffSessionId =
      realConvexOpenUiHandoffGalleryPreview.sessionId as Id<'sessions'>
    const ctx = ctxFor({
      sessions: [
        sessionDoc({
          _id: handoffSessionId,
          prompt: realConvexOpenUiHandoffGalleryPreview.prompt,
          status: 'preview_ready',
          previewVersion: realConvexOpenUiHandoffGalleryPreview.previewVersion,
          isPrivate: false,
          createdAt: 1782812237869,
          updatedAt: 1782812244731,
        }),
      ],
      previews: [
        previewDoc({
          _id: realConvexOpenUiHandoffGalleryPreview.previewId as Id<'previews'>,
          sessionId: handoffSessionId,
          version: realConvexOpenUiHandoffGalleryPreview.previewVersion,
          html: realConvexOpenUiHandoffGalleryPreview.html,
        }),
      ],
      generatedModules: [
        generatedModuleDoc({
          sessionId: handoffSessionId,
          source: realConvexOpenUiHandoffGalleryPreview.moduleSource,
        }),
      ],
    })

    const result = await listPublicGallerySessions(ctx, {
      limit: 12,
      page: 1,
    })

    expect(ctx.takeLimits).toEqual([24])
    expect(result.items).toHaveLength(1)
    expect(result.total).toBe(1)
    expect(result.items[0]).toMatchObject({
      sessionId: handoffSessionId,
      html: null,
      moduleSource: realConvexOpenUiHandoffGalleryPreview.moduleSource,
      readiness: {
        openuiReady: null,
        previewReady: true,
      },
    })
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('Generated OpenUI source is ready')
    expect(serialized).not.toContain('ship-fast-openui-source')
    expect(serialized).not.toContain('Boutique Coffee Roastery - Preview')
  })
})

describe('loadPublicGallerySession', () => {
  it('loads a visible public gallery detail session', async () => {
    const ctx = ctxFor({
      sessions: [sessionDoc()],
      previews: [previewDoc()],
      generatedModules: [generatedModuleDoc()],
      siteSpecs: [siteSpecDoc()],
    })

    await expect(
      loadPublicGallerySession(ctx, sessionId),
    ).resolves.toMatchObject({
      sessionId,
      html: null,
      moduleSource: '$page = "Home"',
      siteSpecJson: '{"brand":"Gallery"}',
    })
  })

  it('returns null for invalid, private, missing, or invisible sessions', async () => {
    const privateSessionId = 'session_private' as Id<'sessions'>
    const invisibleSessionId = 'session_invisible' as Id<'sessions'>
    const missingSessionId = 'session_missing' as Id<'sessions'>
    const ctx = ctxFor({
      sessions: [
        sessionDoc({ _id: privateSessionId, isPrivate: true }),
        sessionDoc({
          _id: invisibleSessionId,
          status: 'queued',
          previewVersion: 0,
        }),
      ],
    })

    await expect(loadPublicGallerySession(ctx, 'not-a-session')).resolves.toBe(
      null,
    )
    await expect(loadPublicGallerySession(ctx, missingSessionId)).resolves.toBe(
      null,
    )
    await expect(loadPublicGallerySession(ctx, privateSessionId)).resolves.toBe(
      null,
    )
    await expect(
      loadPublicGallerySession(ctx, invisibleSessionId),
    ).resolves.toBe(null)
  })

  it('returns null for a direct public gallery detail lookup backed by renderer-error preview HTML', async () => {
    const brokenSessionId =
      realConvexRendererErrorGalleryPreview.sessionId as Id<'sessions'>
    const ctx = ctxFor({
      sessions: [
        sessionDoc({
          _id: brokenSessionId,
          prompt: realConvexRendererErrorGalleryPreview.prompt,
          status: 'preview_ready',
          previewVersion: realConvexRendererErrorGalleryPreview.previewVersion,
          isPrivate: false,
        }),
      ],
      previews: [
        previewDoc({
          _id: realConvexRendererErrorGalleryPreview.previewId as Id<'previews'>,
          sessionId: brokenSessionId,
          version: realConvexRendererErrorGalleryPreview.previewVersion,
          html: realConvexRendererErrorGalleryPreview.html,
        }),
      ],
    })

    await expect(
      loadPublicGallerySession(
        ctx,
        realConvexRendererErrorGalleryPreview.sessionId,
      ),
    ).resolves.toBe(null)
  })
})

describe('listOwnedGallerySessions', () => {
  it('does not count or expose owned sessions whose preview was suppressed as renderer-error HTML', async () => {
    const brokenSessionId =
      realConvexRendererErrorGalleryPreview.sessionId as Id<'sessions'>
    const goodSessionId = 'session_owned_good' as Id<'sessions'>
    const ctx = ctxFor({
      userId: 'user_gallery',
      sessions: [
        sessionDoc({
          _id: brokenSessionId,
          userId: 'user_gallery',
          prompt: realConvexRendererErrorGalleryPreview.prompt,
          status: 'preview_ready',
          previewVersion: realConvexRendererErrorGalleryPreview.previewVersion,
          createdAt: 300,
        }),
        sessionDoc({
          _id: goodSessionId,
          userId: 'user_gallery',
          prompt: 'A cozy coffee shop with online ordering',
          status: 'preview_ready',
          previewVersion: 1,
          createdAt: 200,
        }),
      ],
      previews: [
        previewDoc({
          _id: realConvexRendererErrorGalleryPreview.previewId as Id<'previews'>,
          sessionId: brokenSessionId,
          version: realConvexRendererErrorGalleryPreview.previewVersion,
          html: realConvexRendererErrorGalleryPreview.html,
        }),
        previewDoc({
          _id: 'preview_owned_good' as Id<'previews'>,
          sessionId: goodSessionId,
          version: 1,
          html: '<main>Coffee shop</main>',
        }),
      ],
    }) as unknown as QueryCtx

    const result = await listOwnedGallerySessions(ctx, {
      limit: 12,
      page: 1,
    })

    expect(result.items.map((item) => item.sessionId)).toEqual([goodSessionId])
    expect(result.total).toBe(1)
    expect(result.totalPages).toBe(1)
    expect(JSON.stringify(result).toLowerCase()).not.toContain('openui-error')
    expect(JSON.stringify(result).toLowerCase()).not.toContain(
      'failed to render',
    )
  })
})

describe('public gallery query delegation', () => {
  it('listPublicSessions handler delegates to listPublicGallerySessions helper', async () => {
    vi.resetModules()
    vi.doMock('./session_gallery_helpers', () => ({
      listPublicGallerySessions: vi.fn(async () => []),
      loadPublicGallerySession: vi.fn(async () => null),
    }))
    try {
      const { listPublicSessions } = await import('../sessions')
      const mockedModule = await import('./session_gallery_helpers')
      const mockedListPublicGallerySessions = vi.mocked(
        mockedModule.listPublicGallerySessions,
      )
      const ctx = { db: {} } as unknown as QueryCtx
      const args: PublicGallerySessionsArgs = {
        limit: 10,
        page: 1,
      }
      const handler =
        listPublicSessions as unknown as QueryHandler<PublicGallerySessionsArgs>
      await handler(ctx, args)
      expect(mockedListPublicGallerySessions).toHaveBeenCalledWith(ctx, args)
    } finally {
      vi.doUnmock('./session_gallery_helpers')
      vi.resetModules()
    }
  })

  it('getPublicGallerySession handler delegates to loadPublicGallerySession helper with sessionId', async () => {
    vi.resetModules()
    vi.doMock('./session_gallery_helpers', () => ({
      listPublicGallerySessions: vi.fn(async () => []),
      loadPublicGallerySession: vi.fn(async () => null),
    }))
    try {
      const { getPublicGallerySession } = await import('../sessions')
      const mockedModule = await import('./session_gallery_helpers')
      const mockedLoadPublicGallerySession = vi.mocked(
        mockedModule.loadPublicGallerySession,
      )
      const ctx = { db: {} } as unknown as QueryCtx
      const args: PublicGallerySessionArgs = {
        sessionId: 's1',
      }
      const handler =
        getPublicGallerySession as unknown as QueryHandler<PublicGallerySessionArgs>
      await handler(ctx, args)
      expect(mockedLoadPublicGallerySession).toHaveBeenCalledWith(
        ctx,
        args.sessionId,
      )
    } finally {
      vi.doUnmock('./session_gallery_helpers')
      vi.resetModules()
    }
  })
})

describe('serializePublicGallerySession', () => {
  it('serializes list gallery fields with legacy site spec and stored-preview readiness fallback', () => {
    const result = serializePublicGallerySession(
      sessionDoc({
        status: 'streaming',
        previewVersion: 1,
        updatedAt: undefined,
      }),
      {
        preview: previewDoc({ version: 4 }),
        homeModule: generatedModuleDoc(),
        siteSpec: siteSpecDoc({
          specJson: undefined,
          spec: '{"legacy":"Gallery"}',
        } as Partial<SiteSpecRecord>),
      },
      {
        legacySiteSpecFallback: true,
        previewReadyFromStoredPreview: true,
      },
    )

    expect(result).toMatchObject({
      id: sessionId,
      sessionId,
      prompt: 'SaaS analytics dashboard for product teams',
      preferredLanguage: 'en',
      status: 'streaming',
      previewVersion: 4,
      createdAt: 100,
      updatedAt: 100,
      elapsed: 123,
      cost: 0,
      html: '<main>Gallery preview</main>',
      moduleSource: '$page = "Home"',
      siteSpecJson: '{"legacy":"Gallery"}',
      readiness: {
        homepageReady: null,
        siteSpecReady: null,
        openuiReady: null,
        previewReady: true,
      },
    })
    expect(result.categories).toContain('saas')
  })

  it('serializes detail gallery fields without legacy site spec fallback or stored-preview readiness fallback', () => {
    const result = serializePublicGallerySession(
      sessionDoc({ status: 'streaming', previewVersion: 1 }),
      {
        preview: previewDoc({ version: 4 }),
        homeModule: generatedModuleDoc(),
        siteSpec: siteSpecDoc({
          specJson: undefined,
          spec: '{"legacy":"Gallery"}',
        } as Partial<SiteSpecRecord>),
      },
    )

    expect(result).toMatchObject({
      previewVersion: 4,
      siteSpecJson: null,
      readiness: {
        previewReady: false,
      },
    })
  })

  it('does not serialize DB-observed OpenUI handoff HTML as gallery preview content', () => {
    const result = serializePublicGallerySession(
      sessionDoc({
        _id: realConvexOpenUiHandoffGalleryPreview.sessionId as Id<'sessions'>,
        prompt: realConvexOpenUiHandoffGalleryPreview.prompt,
        status: 'preview_ready',
        previewVersion: realConvexOpenUiHandoffGalleryPreview.previewVersion,
      }),
      {
        preview: previewDoc({
          _id: realConvexOpenUiHandoffGalleryPreview.previewId as Id<'previews'>,
          sessionId:
            realConvexOpenUiHandoffGalleryPreview.sessionId as Id<'sessions'>,
          version: realConvexOpenUiHandoffGalleryPreview.previewVersion,
          html: realConvexOpenUiHandoffGalleryPreview.html,
        }),
        homeModule: generatedModuleDoc({
          sessionId:
            realConvexOpenUiHandoffGalleryPreview.sessionId as Id<'sessions'>,
          source: realConvexOpenUiHandoffGalleryPreview.moduleSource,
        }),
        siteSpec: siteSpecDoc({
          sessionId:
            realConvexOpenUiHandoffGalleryPreview.sessionId as Id<'sessions'>,
          specJson: '{"brand":"Boutique Coffee Roastery"}',
        }),
      },
    )

    expect(result.html).toBeNull()
    expect(result.moduleSource).toBe(
      realConvexOpenUiHandoffGalleryPreview.moduleSource,
    )
    expect(JSON.stringify(result)).not.toContain(
      'Generated OpenUI source is ready',
    )
    expect(JSON.stringify(result)).not.toContain('ship-fast-openui-source')
  })

  it('serializes editor changes into the OpenUI source returned to the gallery API', async () => {
    const editedSessionId = 'k574ms14ma9f94keq30r7dq24x89n1k2' as Id<'sessions'>
    const source =
      'home_menu = RestaurantMenu("Our Brew Selection", "Explore rotating seasonal ales, lagers, and specialty brews crafted on-site.", [{"name":"Seasonal Releases","items":[{"name":"Pineapple Saison","description":"Tropical notes with a crisp finish","price":"$7","tag":"Limited"}]}])\nroot = PageSwitch(["Home"], [home_menu], "", {"Home":"home"})'
    const ctx = ctxFor({
      sessions: [
        sessionDoc({
          _id: editedSessionId,
          prompt:
            'a craft beer brewery with taproom tours and seasonal releases in portland',
          preferredLanguage: 'lt',
          themeMode: 'dark',
          themeOverride: 'darkmatter',
          status: 'preview_ready',
          previewVersion: 1,
          isPrivate: false,
        }),
      ],
      previews: [
        previewDoc({
          sessionId: editedSessionId,
          version: 1,
          html: '<main><h1>Stale preview before edits</h1></main>',
          openUiSource: source,
        }),
      ],
      generatedModules: [
        generatedModuleDoc({
          sessionId: editedSessionId,
          source,
        }),
      ],
      edits: [
        editDoc({
          sessionId: editedSessionId,
          previewVersion: 1,
          editType: 'text',
          beforeText: 'Our Brew Selection',
          afterText: 'Edited Taproom Releases',
          createdAt: 1782896344035,
        }),
      ],
    })

    const result = await listPublicGallerySessions(ctx, {
      limit: 12,
      page: 1,
    })

    expect(result.items).toHaveLength(1)
    expect(result.items[0]).toMatchObject({
      sessionId: editedSessionId,
      preferredLanguage: 'lt',
      themeMode: 'dark',
      themeOverride: 'darkmatter',
    })
    expect(result.items[0].moduleSource).toContain('Edited Taproom Releases')
    expect(result.items[0].moduleSource).toContain('Pineapple Saison')
    expect(result.items[0].moduleSource).not.toContain('Our Brew Selection')
  })
})
