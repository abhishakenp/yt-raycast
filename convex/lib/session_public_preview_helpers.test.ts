import { describe, expect, it } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import { loadPublicPreview } from './session_public_preview_helpers'

type TableName = 'sessions' | 'deployments' | 'previews'
type Row = Doc<'sessions'> | Doc<'deployments'> | Doc<'previews'>

const sessionId = 'session_public_preview' as Id<'sessions'>

const sessionDoc = (overrides: Partial<Doc<'sessions'>> = {}) =>
  ({
    _id: sessionId,
    _creationTime: 1,
    prompt: 'Build a public preview',
    workspace: 'default',
    status: 'preview_ready',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    previewVersion: 2,
    createdAt: 100,
    updatedAt: 120,
    ...overrides,
  }) as Doc<'sessions'>

const deploymentDoc = (
  overrides: Partial<Doc<'deployments'>> = {},
): Doc<'deployments'> =>
  ({
    _id: 'deployment_public_preview' as Id<'deployments'>,
    _creationTime: 1,
    sessionId,
    slug: 'public-preview',
    url: 'https://public-preview.example.test',
    status: 'ready',
    previewVersion: 1,
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  }) as Doc<'deployments'>

const previewDoc = (
  id: string,
  version: number,
  overrides: Partial<Doc<'previews'>> = {},
): Doc<'previews'> =>
  ({
    _id: id as Id<'previews'>,
    _creationTime: version,
    sessionId,
    version,
    html: `<main>Preview ${version}</main>`,
    createdAt: version,
    source: 'generation',
    ...overrides,
  }) as Doc<'previews'>

const realConvexPreviewWithRendererError = {
  previewId: 'ns70q8624bp2dk2qvehc0dc8jd89mdvb',
  sessionId: 'k57fkjjt99avgnxyzq7w3xy46589nmy3',
  status: 'preview_ready',
  previewVersion: 1,
  title: 'Nyx',
  html: '<!doctype html><html lang="en"><head><title>Nyx</title></head><body><div id="openui-root"><div class="openui-error">Failed to render: te is not a function</div></div></body></html>',
} as const

const ctxFor = (input: Partial<Record<TableName, Row[]>>) => {
  const tables: Record<TableName, Row[]> = {
    sessions: [...(input.sessions ?? [])],
    deployments: [...(input.deployments ?? [])],
    previews: [...(input.previews ?? [])],
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
            const leftVersion = (left as { version?: number }).version ?? 0
            const rightVersion = (right as { version?: number }).version ?? 0
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

  return { db }
}

describe('session public preview helpers', () => {
  it('loads the latest preview for direct public session lookup', async () => {
    const result = await loadPublicPreview(
      ctxFor({
        sessions: [sessionDoc()],
        previews: [previewDoc('preview_v1', 1), previewDoc('preview_v2', 2)],
      }),
      sessionId,
    )

    expect(result).toEqual({
      sessionId,
      slug: undefined,
      status: 'preview_ready',
      previewVersion: 2,
      html: '<main>Preview 2</main>',
    })
  })

  it('uses the deployment preview version for slug lookup', async () => {
    const result = await loadPublicPreview(
      ctxFor({
        sessions: [sessionDoc()],
        deployments: [deploymentDoc({ previewVersion: 1 })],
        previews: [previewDoc('preview_v1', 1), previewDoc('preview_v2', 2)],
      }),
      'public-preview',
    )

    expect(result).toEqual({
      sessionId,
      slug: 'public-preview',
      status: 'preview_ready',
      previewVersion: 1,
      html: '<main>Preview 1</main>',
    })
  })

  it('returns null for private or missing sessions', async () => {
    await expect(
      loadPublicPreview(
        ctxFor({
          sessions: [sessionDoc({ isPrivate: true })],
        }),
        sessionId,
      ),
    ).resolves.toBeNull()
    await expect(loadPublicPreview(ctxFor({}), 'missing')).resolves.toBeNull()
  })

  it('returns session metadata when no preview exists yet', async () => {
    await expect(
      loadPublicPreview(
        ctxFor({
          sessions: [sessionDoc({ status: 'streaming', previewVersion: 0 })],
        }),
        sessionId,
      ),
    ).resolves.toEqual({
      sessionId,
      slug: undefined,
      status: 'streaming',
      previewVersion: 0,
      html: undefined,
    })
  })

  it('never exposes a preview_ready stored preview that contains OpenUI renderer error HTML', async () => {
    const result = await loadPublicPreview(
      ctxFor({
        sessions: [
          sessionDoc({
            _id: realConvexPreviewWithRendererError.sessionId as Id<'sessions'>,
            status: realConvexPreviewWithRendererError.status,
            previewVersion: realConvexPreviewWithRendererError.previewVersion,
          }),
        ],
        previews: [
          previewDoc(
            realConvexPreviewWithRendererError.previewId,
            realConvexPreviewWithRendererError.previewVersion,
            {
              sessionId:
                realConvexPreviewWithRendererError.sessionId as Id<'sessions'>,
              html: realConvexPreviewWithRendererError.html,
            },
          ),
        ],
      }),
      realConvexPreviewWithRendererError.sessionId,
    )

    expect(result).not.toBeNull()
    expect(result?.status).toBe('preview_ready')
    expect(result?.html?.toLowerCase()).not.toContain('openui-error')
    expect(result?.html?.toLowerCase()).not.toContain('failed to render')
  })
})
