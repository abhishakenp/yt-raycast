import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import {
  createDefaultDeploymentSlug,
  createDeploymentUrl,
  loadDeploymentBySlug,
  loadDeploymentStatus,
  normalizeDeploymentSlug,
  publishSessionPreview,
} from './session_deployment_helpers'

type TableName = 'sessions' | 'deployments' | 'previews' | 'generationEvents'
type Row =
  | Doc<'sessions'>
  | Doc<'deployments'>
  | Doc<'previews'>
  | Doc<'generationEvents'>

const sessionId = 'session_deployment' as Id<'sessions'>

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
    previews: [...(input.previews ?? [])],
    generationEvents: [...(input.generationEvents ?? [])],
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
        first: async () => rows[0] ?? null,
      }

      return builder
    },
  } as unknown as Pick<QueryCtx, 'db'>['db']

  return { db }
}

const mutationCtxFor = (input: Partial<Record<TableName, Row[]>>) => {
  const tables: Record<TableName, Row[]> = {
    sessions: [...(input.sessions ?? [])],
    deployments: [...(input.deployments ?? [])],
    previews: [...(input.previews ?? [])],
    generationEvents: [...(input.generationEvents ?? [])],
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

  it('rejects private, not-ready, missing-preview, and conflicting-slug publishes', async () => {
    await expect(
      publishSessionPreview(
        mutationCtxFor({
          sessions: [sessionDoc({ userId: 'user_1', isPrivate: true })],
          previews: [previewDoc()],
        }).ctx,
        { sessionId },
      ),
    ).rejects.toMatchObject({
      data: { code: 'PRIVATE_SESSION' },
    })

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

  it('keeps the public publishPreview mutation delegated to deployment helpers', () => {
    const sessionsSource = readFileSync('convex/sessions.ts', 'utf8')

    expect(sessionsSource).toContain('publishSessionPreview,')
    expect(sessionsSource).toContain(
      'handler: (ctx, args) => publishSessionPreview(ctx, args),',
    )
    expect(sessionsSource).not.toContain(
      "message: 'Private sessions cannot be published'",
    )
  })
})
