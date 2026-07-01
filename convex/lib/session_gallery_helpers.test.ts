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
type PreviewRecord = Doc<'previews'>
type SessionRecord = Doc<'sessions'>
type SiteSpecRecord = Doc<'siteSpecs'>

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

const sessionDoc = (overrides: Partial<SessionRecord> = {}): SessionRecord =>
  ({
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
  }) as SessionRecord

const previewDoc = (overrides: Partial<PreviewRecord> = {}): PreviewRecord =>
  ({
    _id: 'preview_gallery' as Id<'previews'>,
    _creationTime: 1,
    sessionId,
    version: 3,
    html: '<main>Gallery preview</main>',
    source: 'generation',
    createdAt: 100,
    ...overrides,
  }) as PreviewRecord

const generatedModuleDoc = (
  overrides: Partial<GeneratedModuleRecord> = {},
): GeneratedModuleRecord =>
  ({
    _id: 'module_gallery' as Id<'generatedModules'>,
    _creationTime: 1,
    sessionId,
    moduleKey: 'home',
    source: '$page = "Home"',
    status: 'succeeded',
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  }) as GeneratedModuleRecord

const siteSpecDoc = (overrides: Partial<SiteSpecRecord> = {}): SiteSpecRecord =>
  ({
    _id: 'site_spec_gallery' as Id<'siteSpecs'>,
    _creationTime: 1,
    sessionId,
    specJson: '{"brand":"Gallery"}',
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  }) as SiteSpecRecord

const ctxFor = (input: {
  sessions?: SessionRecord[]
  previews?: PreviewRecord[]
  generatedModules?: GeneratedModuleRecord[]
  siteSpecs?: SiteSpecRecord[]
  userId?: string | null
}) => {
  const sessions = [...(input.sessions ?? [])]
  const previews = [...(input.previews ?? [])]
  const generatedModules = [...(input.generatedModules ?? [])]
  const siteSpecs = [...(input.siteSpecs ?? [])]

  const rowsFor = (table: string): Array<Record<string, unknown>> => {
    switch (table) {
      case 'sessions':
        return sessions as unknown as Array<Record<string, unknown>>
      case 'previews':
        return previews as unknown as Array<Record<string, unknown>>
      case 'generatedModules':
        return generatedModules as unknown as Array<Record<string, unknown>>
      case 'siteSpecs':
        return siteSpecs as unknown as Array<Record<string, unknown>>
      default:
        throw new Error(`Unhandled table ${table}`)
    }
  }

  const db = {
    normalizeId: (table: string, value: string) =>
      table === 'sessions' && sessions.some((row) => row._id === value)
        ? (value as Id<'sessions'>)
        : null,
    get: async (id: string) =>
      [...sessions, ...previews, ...generatedModules, ...siteSpecs].find(
        (row) => row._id === id,
      ) ?? null,
    query: (
      table: 'sessions' | 'previews' | 'generatedModules' | 'siteSpecs',
    ) => {
      const query = {
        withIndex: (
          _indexName:
            | 'by_public_createdAt'
            | 'by_sessionId_version'
            | 'by_sessionId_moduleKey'
            | 'by_sessionId',
          applyIndex: (index: {
            eq: (field: string, value: unknown) => typeof index
          }) => unknown,
        ) => {
          const filters = new Map<string, unknown>()
          const index = {
            eq: (field: string, value: unknown) => {
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
            order: (_direction: 'asc' | 'desc') => queryResult,
            first: async () => rows()[0] ?? null,
            take: async (limit: number) => rows().slice(0, limit),
            collect: async () => rows(),
          }

          return queryResult
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
  }
}

describe('loadPublicGalleryArtifacts', () => {
  it('loads the latest preview, home module, and site spec for a session', async () => {
    const ctx = ctxFor({
      previews: [previewDoc()],
      generatedModules: [generatedModuleDoc()],
      siteSpecs: [siteSpecDoc()],
    })

    await expect(loadPublicGalleryArtifacts(ctx, sessionId)).resolves.toEqual({
      preview: expect.objectContaining({
        html: '<main>Gallery preview</main>',
      }),
      homeModule: expect.objectContaining({ source: '$page = "Home"' }),
      siteSpec: expect.objectContaining({ specJson: '{"brand":"Gallery"}' }),
    })
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

  it('does not expose DB-observed OpenUI handoff preview HTML in public gallery lists', async () => {
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

    expect(result.items).toEqual([])
    expect(result.total).toBe(0)
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
      html: '<main>Gallery preview</main>',
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
    }) as QueryCtx

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
})
