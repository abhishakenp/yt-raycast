import { describe, expect, it } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import {
  createDefaultDeploymentSlug,
  createDeploymentUrl,
  loadDeploymentBySlug,
  loadDeploymentStatus,
  normalizeDeploymentSlug,
  prepareLakebedSessionDeployment,
  publishSessionPreview,
  recordLakebedSessionDeploymentSuccess,
} from './session_deployment_helpers'

type TableName =
  | 'sessions'
  | 'deployments'
  | 'exports'
  | 'previews'
  | 'generationEvents'
  | 'generatedModules'
type Row =
  | Doc<'sessions'>
  | Doc<'deployments'>
  | Doc<'exports'>
  | Doc<'previews'>
  | Doc<'generationEvents'>
  | Doc<'generatedModules'>

const sessionId = 'session_deployment' as Id<'sessions'>
const realConvexRendererErrorPreview = {
  previewId: 'ns70q8624bp2dk2qvehc0dc8jd89mdvb',
  sessionId: 'k57fkjjt99avgnxyzq7w3xy46589nmy3',
  title: 'Nyx',
  html: '<!doctype html><html lang="en"><head><title>Nyx</title></head><body><div id="openui-root"><div class="openui-error">Failed to render: te is not a function</div></div></body></html>',
  openUiSource: '$page = "Home"\nroot = Text("Nyx")',
  version: 1,
} as const

const sessionDoc = (overrides: Partial<Doc<'sessions'>> = {}) =>
  ({
    _id: sessionId,
    _creationTime: 1,
    prompt: 'Build a deployable site',
    workspace: 'default',
    status: 'preview_ready',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    createdAt: 100,
    updatedAt: 140,
    ...overrides,
  }) as Doc<'sessions'>

const deploymentDoc = (
  overrides: Partial<Doc<'deployments'>> = {},
): Doc<'deployments'> =>
  ({
    _id: 'deployment_read' as Id<'deployments'>,
    _creationTime: 1,
    sessionId,
    slug: 'deployable-site',
    url: 'https://deployable-site.example.test',
    status: 'ready',
    previewVersion: 3,
    createdAt: 120,
    updatedAt: 150,
    ...overrides,
  }) as Doc<'deployments'>

const previewDoc = (
  overrides: Partial<Doc<'previews'>> = {},
): Doc<'previews'> =>
  ({
    _id: 'preview_deployment' as Id<'previews'>,
    _creationTime: 1,
    sessionId,
    version: 3,
    html: '<html><body><h1>Ready</h1></body></html>',
    createdAt: 110,
    ...overrides,
  }) as Doc<'previews'>

const ctxFor = (input: Partial<Record<TableName, Row[]>>) => {
  const tables: Record<TableName, Row[]> = {
    sessions: [...(input.sessions ?? [])],
    deployments: [...(input.deployments ?? [])],
    exports: [...(input.exports ?? [])],
    previews: [...(input.previews ?? [])],
    generationEvents: [...(input.generationEvents ?? [])],
    generatedModules: [...(input.generatedModules ?? [])],
  }

  const rowsFor = (table: TableName) => tables[table]

  const db = {
    get: async (id: string) =>
      Object.values(tables)
        .flat()
        .find((row) => row._id === id) ?? null,
    query: (table: TableName) => {
      let rows = [...rowsFor(table)]

      const builder = {
        withIndex: (
          _indexName: string,
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
          rows = rows.filter((row) =>
            Array.from(filters.entries()).every(
              ([field, value]) =>
                (row as Record<string, unknown>)[field] === value,
            ),
          )

          return builder
        },
        order: (direction: 'asc' | 'desc') => {
          rows = [...rows].sort((left, right) => {
            const leftVersion =
              typeof (left as Record<string, unknown>).version === 'number'
                ? ((left as Record<string, unknown>).version as number)
                : 0
            const rightVersion =
              typeof (right as Record<string, unknown>).version === 'number'
                ? ((right as Record<string, unknown>).version as number)
                : 0
            return direction === 'desc'
              ? rightVersion - leftVersion
              : leftVersion - rightVersion
          })
          return builder
        },
        first: async () => rows[0] ?? null,
      }

      return builder
    },
  } as unknown as Pick<QueryCtx, 'db'>['db']

  return {
    db,
    auth: {
      getUserIdentity: async () => ({
        tokenIdentifier: 'user_1',
        subject: 'user_1',
      }),
    },
  }
}

const mutationCtxFor = (input: Partial<Record<TableName, Row[]>>) => {
  const tables: Record<TableName, Row[]> = {
    sessions: [...(input.sessions ?? [])],
    deployments: [...(input.deployments ?? [])],
    exports: [...(input.exports ?? [])],
    previews: [...(input.previews ?? [])],
    generationEvents: [...(input.generationEvents ?? [])],
    generatedModules: [...(input.generatedModules ?? [])],
  }
  const patches: Array<{ id: string; patch: Record<string, unknown> }> = []
  const inserted: Array<{ table: TableName; value: Record<string, unknown> }> =
    []

  const db = {
    get: async (id: string) =>
      Object.values(tables)
        .flat()
        .find((row) => row._id === id) ?? null,
    query: (table: TableName) => {
      let rows = [...tables[table]]

      const builder = {
        withIndex: (
          _indexName: string,
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
          rows = rows.filter((row) =>
            Array.from(filters.entries()).every(
              ([field, value]) =>
                (row as Record<string, unknown>)[field] === value,
            ),
          )

          return builder
        },
        order: (direction: 'asc' | 'desc') => {
          rows = [...rows].sort((a, b) => {
            const left =
              'version' in a && typeof a.version === 'number'
                ? a.version
                : a._creationTime
            const right =
              'version' in b && typeof b.version === 'number'
                ? b.version
                : b._creationTime
            return direction === 'desc' ? right - left : left - right
          })

          return builder
        },
        first: async () => rows[0] ?? null,
      }

      return builder
    },
    insert: async (table: TableName, value: Record<string, unknown>) => {
      inserted.push({ table, value })
      const id = `${table}_${inserted.length}` as Id<
        'deployments' | 'generationEvents'
      >
      tables[table].push({
        _id: id,
        _creationTime: inserted.length,
        ...value,
      } as Row)
      return id
    },
    patch: async (id: string, patch: Record<string, unknown>) => {
      patches.push({ id, patch })
      const row = Object.values(tables)
        .flat()
        .find((next) => next._id === id)
      if (row !== undefined) Object.assign(row, patch)
    },
  } as unknown as MutationCtx['db']

  const ctx = {
    db,
    auth: {
      getUserIdentity: async () => ({
        tokenIdentifier: 'user_1',
        subject: 'user_1',
      }),
    },
  } as unknown as MutationCtx

  return { ctx, inserted, patches, tables }
}

describe('session deployment helpers', () => {
  it('normalizes deployment slugs for DNS-safe subdomains', () => {
    expect(normalizeDeploymentSlug('  My Fancy Site!!!  ')).toBe(
      'my-fancy-site',
    )
    expect(normalizeDeploymentSlug('---Alpha__Beta@@Gamma---')).toBe(
      'alpha-beta-gamma',
    )
    expect(normalizeDeploymentSlug('x'.repeat(80))).toHaveLength(63)
  })

  it('builds default slugs from the first four prompt tokens', () => {
    expect(
      createDefaultDeploymentSlug(
        'Create a luxury hotel booking website for Zurich',
        'abc123',
      ),
    ).toBe('create-a-luxury-hotel')
  })

  it('falls back to session id and final generated-site slug', () => {
    expect(createDefaultDeploymentSlug('!!!', 'Session ID 123')).toBe(
      'session-id-123',
    )
    expect(createDefaultDeploymentSlug('!!!', '---')).toBe('generated-site')
  })

  it('creates public deployment URLs from slugs', () => {
    expect(createDeploymentUrl('my-fancy-site')).toBe(
      'https://my-fancy-site.ship-fast.io',
    )
  })

  it('loads deployment records by slug with session metadata', async () => {
    await expect(
      loadDeploymentBySlug(
        ctxFor({
          sessions: [sessionDoc()],
          deployments: [deploymentDoc()],
        }),
        'deployable-site',
      ),
    ).resolves.toEqual({
      slug: 'deployable-site',
      url: 'https://deployable-site.example.test',
      status: 'ready',
      previewVersion: 3,
      sessionId,
      session: {
        id: sessionId,
        prompt: 'Build a deployable site',
        createdAt: 100,
        updatedAt: 140,
        status: 'preview_ready',
      },
    })
  })

  it('returns null for missing deployment slug or deleted sessions', async () => {
    await expect(
      loadDeploymentBySlug(ctxFor({}), 'missing'),
    ).resolves.toBeNull()
    await expect(
      loadDeploymentBySlug(
        ctxFor({
          deployments: [deploymentDoc()],
        }),
        'deployable-site',
      ),
    ).resolves.toBeNull()
  })

  it('loads deployment status by session id', async () => {
    await expect(
      loadDeploymentStatus(
        ctxFor({
          deployments: [deploymentDoc()],
        }),
        sessionId,
      ),
    ).resolves.toEqual({
      slug: 'deployable-site',
      url: 'https://deployable-site.example.test',
      status: 'ready',
      previewVersion: 3,
      createdAt: 120,
      updatedAt: 150,
    })
    await expect(
      loadDeploymentStatus(ctxFor({}), sessionId),
    ).resolves.toBeNull()
  })

  it('rejects Lakebed deployments when only static HTML is available', async () => {
    const ctx = ctxFor({
      sessions: [
        sessionDoc({
          openuiReady: false,
          preferredExportTarget: 'html',
          userId: 'user_1',
        }),
      ],
      previews: [
        previewDoc({
          html: '<!doctype html><html><body><h1>Static Preview</h1></body></html>',
          openUiSource: undefined,
          siteSpecJson: '{"themeName":"vintage-paper"}',
          version: 9,
        }),
      ],
      generatedModules: [
        {
          _id: 'generated_module_home' as Id<'generatedModules'>,
          _creationTime: 1,
          sessionId,
          moduleKey: 'home',
          source: 'root = ShouldNotUseForHtmlSession()',
          status: 'succeeded',
          createdAt: 100,
          updatedAt: 110,
        } as Doc<'generatedModules'>,
      ],
    }) as QueryCtx

    await expect(
      prepareLakebedSessionDeployment(ctx, { sessionId }),
    ).rejects.toMatchObject({
      data: {
        code: 'FULLSTACK_SOURCE_NOT_READY',
        message:
          'Lakebed deploys require generated fullstack source. Regenerate this site before publishing to Lakebed.',
      },
    })
  })

  it('prepares OpenUI Lakebed deployments from preview source when session readiness is stale', async () => {
    const openUiSource = '$page = "Home"\nroot = Text("OpenUI deploy")'
    const ctx = ctxFor({
      sessions: [
        sessionDoc({
          openuiReady: false,
          preferredExportTarget: 'html',
          userId: 'user_1',
        }),
      ],
      previews: [
        previewDoc({
          html: '<!doctype html><html><body><h1>Rendered Preview</h1></body></html>',
          openUiSource,
          version: 10,
        }),
      ],
      generatedModules: [
        {
          _id: 'generated_module_home' as Id<'generatedModules'>,
          _creationTime: 1,
          sessionId,
          moduleKey: 'home',
          source: openUiSource,
          status: 'succeeded',
          createdAt: 100,
          updatedAt: 110,
        } as Doc<'generatedModules'>,
      ],
    }) as QueryCtx

    await expect(
      prepareLakebedSessionDeployment(ctx, { sessionId }),
    ).resolves.toMatchObject({
      source: openUiSource,
      sourceKind: 'openui',
      previewHtml:
        '<!doctype html><html><body><h1>Rendered Preview</h1></body></html>',
      previewVersion: 10,
    })
  })

  it('never prepares Lakebed deployment payloads with stored OpenUI renderer error HTML', async () => {
    const ctx = ctxFor({
      sessions: [
        sessionDoc({
          _id: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
          prompt: realConvexRendererErrorPreview.title,
          openuiReady: false,
          preferredExportTarget: 'html',
          userId: 'user_1',
          previewVersion: realConvexRendererErrorPreview.version,
        }),
      ],
      previews: [
        previewDoc({
          _id: realConvexRendererErrorPreview.previewId as Id<'previews'>,
          sessionId: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
          html: realConvexRendererErrorPreview.html,
          openUiSource: undefined,
          version: realConvexRendererErrorPreview.version,
        }),
      ],
      generatedModules: [
        {
          _id: 'generated_module_home' as Id<'generatedModules'>,
          _creationTime: 1,
          sessionId: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
          moduleKey: 'home',
          source: realConvexRendererErrorPreview.openUiSource,
          status: 'succeeded',
          createdAt: 100,
          updatedAt: 110,
        } as Doc<'generatedModules'>,
      ],
    }) as QueryCtx

    const result = await prepareLakebedSessionDeployment(ctx, {
      sessionId: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
    })

    expect(result).toMatchObject({
      source: realConvexRendererErrorPreview.openUiSource,
      sourceKind: 'openui',
      previewVersion: realConvexRendererErrorPreview.version,
    })
    expect(result.previewHtml.toLowerCase()).not.toContain('openui-error')
    expect(result.previewHtml.toLowerCase()).not.toContain('failed to render')
  })

  it('records Lakebed deployment metadata without using the local build folder', async () => {
    const { ctx, inserted } = mutationCtxFor({
      sessions: [sessionDoc({ userId: 'user_1' })],
    })

    await expect(
      recordLakebedSessionDeploymentSuccess(ctx, {
        sessionId,
        requestedSlug: 'Lakebed Launch',
        previewVersion: 7,
        url: 'https://lakebed-launch.lakebed.app',
        deployId: 'dep_lakebed',
        claimUrl: 'https://lakebed.app/claim/dep_lakebed/token',
        artifactHash: 'sha256:artifact',
        clientBundleHash: 'sha256:client',
        clientBundleBytes: 1234,
        requestBodyBytes: 4567,
        serverBundleBytes: 321,
        sourceFileCount: 9,
        expiresAt: '2026-06-25T00:00:00.000Z',
      }),
    ).resolves.toMatchObject({
      provider: 'lakebed',
      slug: 'lakebed-launch',
      url: 'https://lakebed-launch.lakebed.app',
      deployId: 'dep_lakebed',
    })

    expect(inserted).toEqual([
      {
        table: 'deployments',
        value: expect.objectContaining({
          provider: 'lakebed',
          slug: 'lakebed-launch',
          url: 'https://lakebed-launch.lakebed.app',
          lakebedDeployId: 'dep_lakebed',
          lakebedClientBundleBytes: 1234,
          lakebedRequestBodyBytes: 4567,
          lakebedServerBundleBytes: 321,
          lakebedSourceFileCount: 9,
        }),
      },
      {
        table: 'exports',
        value: expect.objectContaining({
          sessionId,
          target: 'lakebed',
          status: 'ready',
          previewVersion: 7,
          downloadUrl: '/api/sessions/session_deployment/download/lakebed',
          deployedUrl: 'https://lakebed-launch.lakebed.app',
          fileCount: 12,
          requiresPayment: false,
        }),
      },
      {
        table: 'generationEvents',
        value: expect.objectContaining({
          sessionId,
          eventType: 'published',
          message:
            'Published Lakebed app to https://lakebed-launch.lakebed.app',
          previewVersion: 7,
        }),
      },
    ])

    await expect(loadDeploymentStatus(ctx, sessionId)).resolves.toMatchObject({
      provider: 'lakebed',
      lakebedDeployId: 'dep_lakebed',
      lakebedClientBundleBytes: 1234,
      lakebedRequestBodyBytes: 4567,
      lakebedServerBundleBytes: 321,
      lakebedSourceFileCount: 9,
    })
  })

  it('publishes the latest ready public preview and records lifecycle events', async () => {
    const { ctx, inserted } = mutationCtxFor({
      sessions: [sessionDoc({ userId: 'user_1' })],
      previews: [
        previewDoc({ _id: 'preview_old' as Id<'previews'>, version: 1 }),
        previewDoc({ _id: 'preview_latest' as Id<'previews'>, version: 4 }),
      ],
    })

    await expect(
      publishSessionPreview(ctx, {
        sessionId,
        requestedSlug: 'Launch Site!',
      }),
    ).resolves.toEqual({
      sessionId,
      slug: 'launch-site',
      url: 'https://launch-site.ship-fast.io',
      status: 'ready',
    })

    expect(inserted).toEqual([
      {
        table: 'generationEvents',
        value: expect.objectContaining({
          sessionId,
          eventType: 'log',
          message: 'Persisting generated homepage',
        }),
      },
      {
        table: 'deployments',
        value: expect.objectContaining({
          sessionId,
          slug: 'launch-site',
          url: 'https://launch-site.ship-fast.io',
          status: 'ready',
          previewVersion: 4,
        }),
      },
      {
        table: 'generationEvents',
        value: expect.objectContaining({
          sessionId,
          eventType: 'published',
          message: 'Published preview to https://launch-site.ship-fast.io',
          previewVersion: 4,
        }),
      },
    ])
  })

  it('reuses existing deployment slugs and patches the published preview version', async () => {
    const existingDeployment = deploymentDoc({
      _id: 'deployment_existing' as Id<'deployments'>,
      slug: 'existing-site',
      previewVersion: 1,
    })
    const { ctx, patches } = mutationCtxFor({
      sessions: [sessionDoc({ userId: 'user_1' })],
      previews: [previewDoc({ version: 5 })],
      deployments: [existingDeployment],
    })

    await expect(
      publishSessionPreview(ctx, { sessionId }),
    ).resolves.toMatchObject({
      slug: 'existing-site',
      url: 'https://existing-site.ship-fast.io',
    })

    expect(patches).toEqual([
      {
        id: existingDeployment._id,
        patch: expect.objectContaining({
          slug: 'existing-site',
          url: 'https://existing-site.ship-fast.io',
          status: 'ready',
          previewVersion: 5,
          errorMessage: undefined,
        }),
      },
    ])
  })

  it('publishes confirmed private sessions and rejects not-ready, missing-preview, and conflicting-slug publishes', async () => {
    const privatePublish = mutationCtxFor({
      sessions: [sessionDoc({ userId: 'user_1', isPrivate: true })],
      previews: [previewDoc()],
    })

    await expect(
      publishSessionPreview(privatePublish.ctx, { sessionId }),
    ).resolves.toMatchObject({
      slug: 'build-a-deployable-site',
      status: 'ready',
      url: 'https://build-a-deployable-site.ship-fast.io',
    })
    expect(privatePublish.patches).toEqual(
      expect.arrayContaining([
        {
          id: sessionId,
          patch: expect.objectContaining({ isPrivate: false }),
        },
      ]),
    )

    await expect(
      publishSessionPreview(
        mutationCtxFor({
          sessions: [sessionDoc({ userId: 'user_1', status: 'queued' })],
          previews: [previewDoc()],
        }).ctx,
        { sessionId },
      ),
    ).rejects.toMatchObject({
      data: { code: 'PREVIEW_NOT_READY' },
    })

    await expect(
      publishSessionPreview(
        mutationCtxFor({
          sessions: [sessionDoc({ userId: 'user_1' })],
        }).ctx,
        { sessionId },
      ),
    ).rejects.toMatchObject({
      data: { code: 'PREVIEW_NOT_READY' },
    })

    await expect(
      publishSessionPreview(
        mutationCtxFor({
          sessions: [sessionDoc({ userId: 'user_1' })],
          previews: [previewDoc()],
          deployments: [
            deploymentDoc({
              _id: 'deployment_other' as Id<'deployments'>,
              sessionId: 'session_other' as Id<'sessions'>,
              slug: 'taken-site',
            }),
          ],
        }).ctx,
        { sessionId, requestedSlug: 'taken-site' },
      ),
    ).rejects.toMatchObject({
      data: { code: 'SLUG_TAKEN' },
    })
  })

  it('rejects publishing an empty latest preview as a ready public deployment', async () => {
    const { ctx, inserted } = mutationCtxFor({
      sessions: [sessionDoc({ userId: 'user_1' })],
      previews: [previewDoc({ html: '', version: 11 })],
    })

    await expect(
      publishSessionPreview(ctx, {
        sessionId,
        requestedSlug: 'empty-preview-site',
      }),
    ).rejects.toMatchObject({
      data: { code: 'PREVIEW_NOT_READY' },
    })

    expect(
      inserted.some(
        (row) =>
          row.table === 'deployments' &&
          row.value.status === 'ready' &&
          row.value.previewVersion === 11,
      ),
    ).toBe(false)
  })

  it('rejects publishing stored OpenUI renderer-error HTML as a ready public deployment', async () => {
    const { ctx, inserted } = mutationCtxFor({
      sessions: [
        sessionDoc({
          _id: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
          userId: 'user_1',
          prompt: realConvexRendererErrorPreview.title,
          previewVersion: realConvexRendererErrorPreview.version,
        }),
      ],
      previews: [
        previewDoc({
          _id: realConvexRendererErrorPreview.previewId as Id<'previews'>,
          sessionId: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
          html: realConvexRendererErrorPreview.html,
          version: realConvexRendererErrorPreview.version,
        }),
      ],
    })

    await expect(
      publishSessionPreview(ctx, {
        sessionId: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
        requestedSlug: 'renderer-error-site',
      }),
    ).rejects.toMatchObject({
      data: { code: 'PREVIEW_NOT_READY' },
    })

    expect(
      inserted.some(
        (row) =>
          row.table === 'deployments' &&
          row.value.status === 'ready' &&
          row.value.previewVersion === realConvexRendererErrorPreview.version,
      ),
    ).toBe(false)
  })
})
