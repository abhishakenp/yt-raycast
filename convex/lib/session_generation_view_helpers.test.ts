import { describe, expect, it } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import {
  loadGenerationView,
  resolveGenerationViewSessionId,
} from './session_generation_view_helpers'

type TableName =
  | 'sessions'
  | 'exports'
  | 'deployments'
  | 'tasks'
  | 'generationEvents'
  | 'generatedModules'
  | 'siteSpecs'
  | 'previews'

type Row =
  | Doc<'sessions'>
  | Doc<'exports'>
  | Doc<'deployments'>
  | Doc<'tasks'>
  | Doc<'generationEvents'>
  | Doc<'generatedModules'>
  | Doc<'siteSpecs'>
  | Doc<'previews'>

const sessionId = 'session_generation_view' as Id<'sessions'>

const realConvexOpenUiHandoffGenerationView = {
  previewId: 'ns79pp36cdnxp2znd343t2tjw589n4yq',
  sessionId: 'k57eyt2na1n9pzn5x7rh4sdbah89mh9e',
  prompt:
    'a boutique coffee roastery with subscription delivery and tasting events',
  html: '<!DOCTYPE html><html lang="en"><head><title>Boutique Coffee Roastery - Preview</title></head><body><main id="openui-root" data-openui-ready="source"><section><p>Generated OpenUI source is ready.</p><h1>Boutique Coffee Roastery</h1><p>The interactive source is available for export and deployment.</p></section></main><script type="application/json" id="ship-fast-openui-source">"home_hero = EcommerceHero(\\"Boutique Coffee Roastery\\")"</script></body></html>',
  source:
    'home_hero = EcommerceHero("Boutique Coffee Roastery", "Crafted for Connoisseurs", "Subscribe for fresh beans delivered to your door")\nroot = PageSwitch(["Home"], [home_hero], "", {"Home":"home"})',
  version: 1,
} as const

const sessionDoc = (overrides: Partial<Doc<'sessions'>> = {}) =>
  ({
    _id: sessionId,
    _creationTime: 1,
    prompt: 'Build a generation view',
    workspace: 'default',
    status: 'streaming',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    previewVersion: 1,
    createdAt: 100,
    updatedAt: 120,
    ...overrides,
  }) as Doc<'sessions'>

const taskDoc = (
  id: string,
  order: number | undefined,
  title: string,
): Doc<'tasks'> =>
  ({
    _id: id as Id<'tasks'>,
    _creationTime: 1,
    sessionId,
    taskKey: id,
    title,
    status: 'running',
    order,
    createdAt: 1,
    updatedAt: 1,
  }) as Doc<'tasks'>

const eventDoc = (
  id: string,
  createdAt: number,
  message: string,
): Doc<'generationEvents'> =>
  ({
    _id: id as Id<'generationEvents'>,
    _creationTime: createdAt,
    sessionId,
    eventType: 'status',
    message,
    createdAt,
  }) as Doc<'generationEvents'>

const ctxFor = (input: Partial<Record<TableName, Row[]>>) => {
  const tables: Record<TableName, Row[]> = {
    sessions: [...(input.sessions ?? [])],
    exports: [...(input.exports ?? [])],
    deployments: [...(input.deployments ?? [])],
    tasks: [...(input.tasks ?? [])],
    generationEvents: [...(input.generationEvents ?? [])],
    generatedModules: [...(input.generatedModules ?? [])],
    siteSpecs: [...(input.siteSpecs ?? [])],
    previews: [...(input.previews ?? [])],
  }

  const rowsFor = (table: TableName) => tables[table]
  const findById = (id: string) =>
    Object.values(tables)
      .flat()
      .find((row) => row._id === id) ?? null

  const db = {
    normalizeId: (table: TableName, value: string) =>
      rowsFor(table).some((row) => row._id === value) ? value : null,
    get: async (id: string) => findById(id),
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
            const leftValue =
              'version' in left
                ? left.version
                : ((left as { createdAt?: number }).createdAt ?? 0)
            const rightValue =
              'version' in right
                ? right.version
                : ((right as { createdAt?: number }).createdAt ?? 0)
            return direction === 'desc'
              ? rightValue - leftValue
              : leftValue - rightValue
          })

          return builder
        },
        first: async () => rows[0] ?? null,
        take: async (limit: number) => rows.slice(0, limit),
      }

      return builder
    },
  } as unknown as Pick<QueryCtx, 'db'>['db']

  return { db }
}

describe('session generation view helpers', () => {
  it('resolves session ids directly, through exports, and through deployment slugs', async () => {
    const exportId = 'export_generation_view' as Id<'exports'>
    const ctx = ctxFor({
      sessions: [sessionDoc()],
      exports: [
        {
          _id: exportId,
          _creationTime: 1,
          sessionId,
          target: 'html',
          status: 'ready',
          createdAt: 1,
          updatedAt: 1,
        } as Doc<'exports'>,
      ],
      deployments: [
        {
          _id: 'deployment_generation_view' as Id<'deployments'>,
          _creationTime: 1,
          sessionId,
          slug: 'generation-view-slug',
          url: 'https://example.test',
          status: 'ready',
          createdAt: 1,
          updatedAt: 1,
        } as Doc<'deployments'>,
      ],
    })

    await expect(
      resolveGenerationViewSessionId(ctx, { lookup: sessionId }),
    ).resolves.toBe(sessionId)
    await expect(
      resolveGenerationViewSessionId(ctx, { lookup: exportId }),
    ).resolves.toBe(sessionId)
    await expect(
      resolveGenerationViewSessionId(ctx, { lookup: 'generation-view-slug' }),
    ).resolves.toBe(sessionId)
    await expect(resolveGenerationViewSessionId(ctx, {})).resolves.toBeNull()
  })

  it('loads a serialized generation view with stable task and event ordering', async () => {
    const ctx = ctxFor({
      sessions: [sessionDoc({ themeOverride: 'ocean' })],
      tasks: [
        taskDoc('task_second', 2, 'Second'),
        taskDoc('task_first', 1, 'First'),
        taskDoc('task_default', undefined, 'Default'),
      ],
      generationEvents: [
        eventDoc('event_oldest', 10, 'Oldest'),
        eventDoc('event_newest', 30, 'Newest'),
        eventDoc('event_middle', 20, 'Middle'),
      ],
      generatedModules: [
        {
          _id: 'module_home' as Id<'generatedModules'>,
          _creationTime: 1,
          sessionId,
          moduleKey: 'home',
          source: '<main>Home</main>',
          status: 'succeeded',
          createdAt: 1,
          updatedAt: 1,
        } as Doc<'generatedModules'>,
      ],
      siteSpecs: [
        {
          _id: 'site_spec_generation_view' as Id<'siteSpecs'>,
          _creationTime: 1,
          sessionId,
          specJson: '{"projectName":"Generation View"}',
          createdAt: 1,
          updatedAt: 1,
        } as Doc<'siteSpecs'>,
      ],
      previews: [
        {
          _id: 'preview_old' as Id<'previews'>,
          _creationTime: 1,
          sessionId,
          version: 1,
          html: '<main>Old</main>',
          createdAt: 1,
        } as Doc<'previews'>,
        {
          _id: 'preview_latest' as Id<'previews'>,
          _creationTime: 2,
          sessionId,
          version: 2,
          html: '<main>Latest</main>',
          createdAt: 2,
        } as Doc<'previews'>,
      ],
    })

    const view = await loadGenerationView(ctx, { lookup: sessionId })

    expect(view?.session).toMatchObject({
      sessionId,
      status: 'streaming',
      themeOverride: 'ocean',
    })
    expect(view?.tasks.map((task) => task.title)).toEqual([
      'Default',
      'First',
      'Second',
    ])
    expect(view?.events.map((event) => event.message)).toEqual([
      'Oldest',
      'Middle',
      'Newest',
    ])
    expect(view?.homeModule?.source).toBe('<main>Home</main>')
    expect(view?.siteSpec?.specJson).toContain('Generation View')
    expect(view?.latestPreview?.html).toBe('<main>Latest</main>')
  })

  it('does not expose DB-observed OpenUI handoff HTML in the generation view payload', async () => {
    const handoffSessionId =
      realConvexOpenUiHandoffGenerationView.sessionId as Id<'sessions'>
    const view = await loadGenerationView(
      ctxFor({
        sessions: [
          sessionDoc({
            _id: handoffSessionId,
            prompt: realConvexOpenUiHandoffGenerationView.prompt,
            status: 'preview_ready',
            openuiReady: true,
            previewVersion: realConvexOpenUiHandoffGenerationView.version,
          }),
        ],
        generatedModules: [
          {
            _id: 'module_handoff_home' as Id<'generatedModules'>,
            _creationTime: 1,
            sessionId: handoffSessionId,
            moduleKey: 'home',
            source: realConvexOpenUiHandoffGenerationView.source,
            status: 'succeeded',
            createdAt: 1,
            updatedAt: 1,
          } as Doc<'generatedModules'>,
        ],
        previews: [
          {
            _id: realConvexOpenUiHandoffGenerationView.previewId as Id<'previews'>,
            _creationTime: 1,
            sessionId: handoffSessionId,
            version: realConvexOpenUiHandoffGenerationView.version,
            html: realConvexOpenUiHandoffGenerationView.html,
            openUiSource: realConvexOpenUiHandoffGenerationView.source,
            createdAt: 1,
          } as Doc<'previews'>,
        ],
      }),
      { lookup: realConvexOpenUiHandoffGenerationView.sessionId },
    )

    expect(view).not.toBeNull()
    const serialized = JSON.stringify(view)
    expect(serialized).not.toContain('Generated OpenUI source is ready')
    expect(serialized).not.toContain('ship-fast-openui-source')
  })

  it('returns null when lookup resolution or session loading fails', async () => {
    await expect(
      loadGenerationView(ctxFor({}), { lookup: 'missing' }),
    ).resolves.toBeNull()

    const ctx = ctxFor({
      exports: [
        {
          _id: 'export_orphan' as Id<'exports'>,
          _creationTime: 1,
          sessionId,
          target: 'html',
          status: 'ready',
          createdAt: 1,
          updatedAt: 1,
        } as Doc<'exports'>,
      ],
    })

    await expect(
      loadGenerationView(ctx, { lookup: 'export_orphan' }),
    ).resolves.toBeNull()
  })
})
