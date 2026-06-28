import { describe, expect, it } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import {
  loadSessionApiResponse,
  serializeSessionApiResponse,
} from './session_api_response_helpers'

type SessionApiCtx = Pick<QueryCtx, 'db'>
type TableName =
  | 'sessions'
  | 'tasks'
  | 'exports'
  | 'deployments'
  | 'generatedModules'
  | 'previews'
  | 'siteSpecs'
type Row =
  | Doc<'sessions'>
  | Doc<'tasks'>
  | Doc<'exports'>
  | Doc<'deployments'>
  | Doc<'generatedModules'>
  | Doc<'previews'>
  | Doc<'siteSpecs'>

const sessionId = 'session_api_response' as Id<'sessions'>

const sessionDoc = (overrides: Partial<Doc<'sessions'>> = {}) =>
  ({
    _id: sessionId,
    _creationTime: 1,
    prompt: 'Build a session API response',
    workspace: 'default',
    status: 'streaming',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    createdAt: 100,
    updatedAt: 120,
    ...overrides,
  }) as Doc<'sessions'>

const taskDoc = (
  id: string,
  status: Doc<'tasks'>['status'],
  order: number | undefined,
  title: string,
  errorMessage?: string,
): Doc<'tasks'> =>
  ({
    _id: id as Id<'tasks'>,
    _creationTime: 1,
    sessionId,
    taskKey: id,
    title,
    status,
    order,
    errorMessage,
    createdAt: 1,
    updatedAt: 1,
  }) as Doc<'tasks'>

const exportDoc = (
  id: string,
  target: Doc<'exports'>['target'],
): Doc<'exports'> =>
  ({
    _id: id as Id<'exports'>,
    _creationTime: 1,
    sessionId,
    target,
    status: 'ready',
    createdAt: 1,
    updatedAt: 1,
  }) as Doc<'exports'>

const deploymentDoc = (
  overrides: Partial<Doc<'deployments'>> = {},
): Doc<'deployments'> =>
  ({
    _id: 'deployment_api_response' as Id<'deployments'>,
    _creationTime: 1,
    sessionId,
    slug: 'deployed-site',
    url: 'https://deployed-site.example.test',
    status: 'ready',
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  }) as Doc<'deployments'>

const generatedModuleDoc = (
  overrides: Partial<Doc<'generatedModules'>> = {},
): Doc<'generatedModules'> =>
  ({
    _id: 'generated_module_api_response' as Id<'generatedModules'>,
    _creationTime: 1,
    sessionId,
    moduleKey: 'home',
    source: '$page = "Home"\nroot = Text("Ready preview")',
    status: 'succeeded',
    createdAt: 1,
    updatedAt: 200,
    ...overrides,
  }) as Doc<'generatedModules'>

const previewDoc = (
  overrides: Partial<Doc<'previews'>> = {},
): Doc<'previews'> =>
  ({
    _id: 'preview_api_response' as Id<'previews'>,
    _creationTime: 1,
    sessionId,
    version: 1,
    html: '<main><h1>Ready preview</h1></main>',
    openUiSource: '$page = "Home"',
    siteSpecJson: '{"projectName":"Ready"}',
    createdAt: 210,
    source: 'generation',
    ...overrides,
  }) as Doc<'previews'>

const siteSpecDoc = (
  overrides: Partial<Doc<'siteSpecs'>> = {},
): Doc<'siteSpecs'> =>
  ({
    _id: 'site_spec_api_response' as Id<'siteSpecs'>,
    _creationTime: 1,
    sessionId,
    specJson: '{"projectName":"Ready"}',
    createdAt: 205,
    updatedAt: 206,
    ...overrides,
  }) as Doc<'siteSpecs'>

const ctxFor = (input: Partial<Record<TableName, Row[]>>): SessionApiCtx => {
  const tables: Record<TableName, Row[]> = {
    sessions: [...(input.sessions ?? [])],
    tasks: [...(input.tasks ?? [])],
    exports: [...(input.exports ?? [])],
    deployments: [...(input.deployments ?? [])],
    generatedModules: [...(input.generatedModules ?? [])],
    previews: [...(input.previews ?? [])],
    siteSpecs: [...(input.siteSpecs ?? [])],
  }

  const rowsFor = (table: TableName) => tables[table]

  const db = {
    normalizeId: (table: TableName, value: string) =>
      rowsFor(table).some((row) => row._id === value) ? value : null,
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
            const leftTime = (left as { updatedAt?: number }).updatedAt ?? 0
            const rightTime = (right as { updatedAt?: number }).updatedAt ?? 0
            return direction === 'desc'
              ? rightTime - leftTime
              : leftTime - rightTime
          })

          return builder
        },
        first: async () => rows[0] ?? null,
        take: async (limit: number) => rows.slice(0, limit),
      }

      return builder
    },
  } as unknown as SessionApiCtx['db']

  return { db }
}

describe('session API response helpers', () => {
  it('serializes sorted tasks, completion counts, exports, and integration flags', () => {
    const response = serializeSessionApiResponse(
      sessionDoc({
        status: undefined,
        genuiStatus: 'done',
        updatedAt: undefined,
        themeOverride: 'noir',
        medusaConfig: { baseUrl: 'https://medusa.example.test' },
        homepageReady: true,
        siteSpecReady: false,
        openuiReady: true,
        elapsed: 1200,
        cost: 0.24,
      }),
      {
        tasks: [
          taskDoc('task_second', 'running', 2, 'Second'),
          taskDoc('task_failed', 'failed', 1, 'Failed', 'Broken'),
          taskDoc('task_default', 'succeeded', undefined, 'Default'),
        ],
        exports: [
          exportDoc('export_html', 'html'),
          exportDoc('export_next', 'next'),
        ],
        deployment: deploymentDoc({ status: 'failed' }),
        homeModule: generatedModuleDoc(),
        latestPreview: previewDoc({ version: 3 }),
        siteSpec: siteSpecDoc(),
      },
    )

    expect(response).toMatchObject({
      id: sessionId,
      sessionId,
      status: 'preview_ready',
      updatedAt: 100,
      homepageReady: true,
      siteSpecReady: false,
      themeOverride: 'noir',
      previewVersion: 0,
      homeModule: {
        moduleKey: 'home',
        source: '$page = "Home"\nroot = Text("Ready preview")',
        status: 'succeeded',
        updatedAt: 200,
      },
      preview: {
        version: 3,
        html: '<main><h1>Ready preview</h1></main>',
        openUiSource: '$page = "Home"',
        siteSpecJson: '{"projectName":"Ready"}',
      },
      siteSpec: {
        specJson: '{"projectName":"Ready"}',
        updatedAt: 206,
      },
      exportTargets: ['html', 'next'],
      taskCount: 3,
      done: 2,
      ecommerce: true,
      openuiReady: true,
      elapsed: 1200,
      cost: 0.24,
      deployment: {
        slug: 'deployed-site',
        url: 'https://deployed-site.example.test',
        status: 'failed',
      },
      integrations: {
        medusa: {
          enabled: true,
          config: { baseUrl: 'https://medusa.example.test' },
        },
      },
      medusaAdminEmbed: {
        show: false,
        url: null,
      },
    })
    expect(response.tasks).toEqual([
      expect.objectContaining({
        id: 'task_default',
        title: 'Default',
        status: 'succeeded',
        order: 0,
        errorMessage: null,
      }),
      expect.objectContaining({
        id: 'task_failed',
        title: 'Failed',
        status: 'failed',
        order: 1,
        errorMessage: 'Broken',
      }),
      expect.objectContaining({
        id: 'task_second',
        title: 'Second',
        status: 'running',
        order: 2,
        errorMessage: null,
      }),
    ])
  })

  it('uses legacy deployment fields when no deployment record exists', () => {
    const response = serializeSessionApiResponse(
      sessionDoc({
        deploymentSlug: 'legacy-slug',
        deploymentUrl: 'https://legacy.example.test',
      }),
      {
        tasks: [],
        exports: [],
        deployment: null,
        homeModule: null,
        latestPreview: null,
        siteSpec: null,
      },
    )

    expect(response.deployment).toEqual({
      slug: 'legacy-slug',
      url: 'https://legacy.example.test',
      status: 'ready',
    })
  })

  it('loads a session API response from Convex rows', async () => {
    const response = await loadSessionApiResponse(
      ctxFor({
        sessions: [sessionDoc({ userId: 'user_123' })],
        tasks: [taskDoc('task_home', 'succeeded', 0, 'Homepage')],
        exports: [exportDoc('export_react', 'react')],
        deployments: [deploymentDoc()],
        generatedModules: [generatedModuleDoc()],
        previews: [previewDoc({ version: 2 })],
        siteSpecs: [siteSpecDoc()],
      }),
      sessionId,
    )

    expect(response).toMatchObject({
      sessionId,
      isAnonymous: false,
      exportTargets: ['react'],
      taskCount: 1,
      done: 1,
      homeModule: {
        source: '$page = "Home"\nroot = Text("Ready preview")',
      },
      preview: {
        version: 2,
      },
      siteSpec: {
        specJson: '{"projectName":"Ready"}',
      },
      deployment: {
        slug: 'deployed-site',
      },
    })
  })

  it('returns null for invalid lookups and deleted sessions', async () => {
    await expect(
      loadSessionApiResponse(ctxFor({}), 'missing'),
    ).resolves.toBeNull()

    await expect(
      loadSessionApiResponse(
        ctxFor({
          sessions: [sessionDoc()],
        }),
        'deleted_session',
      ),
    ).resolves.toBeNull()
  })
})
