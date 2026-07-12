import { describe, expect, it } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import { loadPublicPreview } from './session_public_preview_helpers'

type TableName = 'sessions' | 'deployments' | 'previews'
type Row = Doc<'sessions'> | Doc<'deployments'> | Doc<'previews'>

const sessionId = 'session_public_preview' as Id<'sessions'>

function sessionDoc(overrides: Partial<Doc<'sessions'>> = {}) {
  return {
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
  } as Doc<'sessions'>
}

function deploymentDoc(
  overrides: Partial<Doc<'deployments'>> = {},
): Doc<'deployments'> {
  return {
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
  } as Doc<'deployments'>
}

function previewDoc(
  id: string,
  version: number,
  overrides: Partial<Doc<'previews'>> = {},
): Doc<'previews'> {
  return {
    _id: id as Id<'previews'>,
    _creationTime: version,
    sessionId,
    version,
    html: `<main>Preview ${version}</main>`,
    createdAt: version,
    source: 'generation',
    ...overrides,
  } as Doc<'previews'>
}

const realConvexPreviewWithRendererError = {
  previewId: 'ns70q8624bp2dk2qvehc0dc8jd89mdvb',
  sessionId: 'k57fkjjt99avgnxyzq7w3xy46589nmy3',
  status: 'preview_ready',
  previewVersion: 1,
  title: 'Nyx',
  html: '<!doctype html><html lang="en"><head><title>Nyx</title></head><body><div id="openui-root"><div class="openui-error">Failed to render: te is not a function</div></div></body></html>',
} as const

const realConvexPreviewWithOpenUiHandoff = {
  previewId: 'ns79pp36cdnxp2znd343t2tjw589n4yq',
  sessionId: 'k57eyt2na1n9pzn5x7rh4sdbah89mh9e',
  prompt:
    'a boutique coffee roastery with subscription delivery and tasting events',
  status: 'preview_ready',
  previewVersion: 1,
  html: '<!DOCTYPE html><html lang="en"><head><title>Boutique Coffee Roastery - Preview</title></head><body><main id="openui-root" data-openui-ready="source"><section><p>Generated OpenUI source is ready.</p><h1>Boutique Coffee Roastery</h1><p>The interactive source is available for export and deployment.</p></section></main><script type="application/json" id="ship-fast-openui-source">"home_hero = EcommerceHero(\\"Boutique Coffee Roastery\\")"</script></body></html>',
} as const

function ctxFor(input: Partial<Record<TableName, Row[]>>) {
  const tables: Record<TableName, Row[]> = {
    sessions: [...(input.sessions ?? [])],
    deployments: [...(input.deployments ?? [])],
    previews: [...(input.previews ?? [])],
  }

  const rowsFor = (table) => tables[table]

  const db = {
    normalizeId: (table, value) =>
      rowsFor(table).some((row) => row._id === value) ? value : null,
    get: async (id) =>
      Object.values(tables)
        .flat()
        .find((row) => row._id === id) ?? null,
    query: (table) => {
      let rows = [...rowsFor(table)]

      const builder = {
        withIndex: (_indexName, applyIndex) => {
          const filters = new Map<string, unknown>()
          const index = {
            eq: (field, value) => {
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
        order: (direction) => {
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

  it('never exposes a preview_ready stored preview that contains DB-observed OpenUI handoff HTML', async () => {
    const result = await loadPublicPreview(
      ctxFor({
        sessions: [
          sessionDoc({
            _id: realConvexPreviewWithOpenUiHandoff.sessionId as Id<'sessions'>,
            prompt: realConvexPreviewWithOpenUiHandoff.prompt,
            status: realConvexPreviewWithOpenUiHandoff.status,
            previewVersion: realConvexPreviewWithOpenUiHandoff.previewVersion,
          }),
        ],
        previews: [
          previewDoc(
            realConvexPreviewWithOpenUiHandoff.previewId,
            realConvexPreviewWithOpenUiHandoff.previewVersion,
            {
              sessionId:
                realConvexPreviewWithOpenUiHandoff.sessionId as Id<'sessions'>,
              html: realConvexPreviewWithOpenUiHandoff.html,
            },
          ),
        ],
      }),
      realConvexPreviewWithOpenUiHandoff.sessionId,
    )

    expect(result).not.toBeNull()
    expect(result?.status).toBe('preview_ready')
    const html = result?.html ?? ''
    expect(html).not.toContain('Generated OpenUI source is ready')
    expect(html).not.toContain('ship-fast-openui-source')
    expect(html).not.toContain('Boutique Coffee Roastery')
  })
})
