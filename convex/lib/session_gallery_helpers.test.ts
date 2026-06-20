import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import {
  listPublicGallerySessions,
  loadPublicGalleryArtifacts,
  loadPublicGallerySession,
  serializePublicGallerySession,
} from './session_gallery_helpers'

type GeneratedModuleRecord = Doc<'generatedModules'>
type PreviewRecord = Doc<'previews'>
type SessionRecord = Doc<'sessions'>
type SiteSpecRecord = Doc<'siteSpecs'>

const sessionId = 'session_gallery_helpers' as Id<'sessions'>

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
      table === 'sessions' && value.startsWith('session_')
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
          }

          return queryResult
        },
      }
      return query
    },
  } as unknown as Pick<QueryCtx, 'db'>['db']

  return { db }
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
})

describe('public gallery query delegation', () => {
  it('keeps list/detail gallery query orchestration out of convex/sessions.ts', () => {
    const source = readFileSync(
      join(process.cwd(), 'convex/sessions.ts'),
      'utf8',
    )

    expect(source).toContain('listPublicGallerySessions')
    expect(source).toContain('loadPublicGallerySession')
    expect(source).not.toContain('by_public_createdAt')
    const listHandler = source.slice(
      source.indexOf('export const listPublicSessions'),
      source.indexOf('export const getPublicGallerySession'),
    )
    const detailHandler = source.slice(
      source.indexOf('export const getPublicGallerySession'),
      source.indexOf('export const getDeploymentBySlug'),
    )
    expect(listHandler).not.toContain('normalizeId')
    expect(detailHandler).not.toContain('normalizeId')
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
})
