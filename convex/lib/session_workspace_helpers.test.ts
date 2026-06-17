import { describe, expect, it } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import { loadSessionWorkspace } from './session_workspace_helpers'

type TableName =
  | 'sessions'
  | 'tasks'
  | 'previews'
  | 'deployments'
  | 'generationEvents'

type Row =
  | Doc<'sessions'>
  | Doc<'tasks'>
  | Doc<'previews'>
  | Doc<'deployments'>
  | Doc<'generationEvents'>

const sessionId = 'session_workspace' as Id<'sessions'>

const sessionDoc = (overrides: Partial<Doc<'sessions'>> = {}) =>
  ({
    _id: sessionId,
    _creationTime: 1,
    prompt: 'Build a workspace',
    workspace: 'default',
    status: 'preview_ready',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    previewVersion: 2,
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
    status: 'succeeded',
    order,
    createdAt: 1,
    updatedAt: 1,
  }) as Doc<'tasks'>

const previewDoc = (id: string, version: number): Doc<'previews'> =>
  ({
    _id: id as Id<'previews'>,
    _creationTime: version,
    sessionId,
    version,
    html: `<main>Preview ${version}</main>`,
    createdAt: version,
  }) as Doc<'previews'>

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

const deploymentDoc = (): Doc<'deployments'> =>
  ({
    _id: 'deployment_workspace' as Id<'deployments'>,
    _creationTime: 1,
    sessionId,
    slug: 'workspace-site',
    url: 'https://workspace.example.test',
    status: 'ready',
    createdAt: 1,
    updatedAt: 1,
  }) as Doc<'deployments'>

const ctxFor = (input: Partial<Record<TableName, Row[]>>) => {
  const tables: Record<TableName, Row[]> = {
    sessions: [...(input.sessions ?? [])],
    tasks: [...(input.tasks ?? [])],
    previews: [...(input.previews ?? [])],
    deployments: [...(input.deployments ?? [])],
    generationEvents: [...(input.generationEvents ?? [])],
  }

  const rowsFor = (table: TableName) => tables[table]
  const findById = (id: string) =>
    Object.values(tables)
      .flat()
      .find((row) => row._id === id) ?? null

  const db = {
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

describe('session workspace helpers', () => {
  it('loads serialized workspace state with stable task and event ordering', async () => {
    const workspace = await loadSessionWorkspace(
      ctxFor({
        sessions: [sessionDoc({ themeOverride: 'mono' })],
        tasks: [
          taskDoc('task_second', 2, 'Second'),
          taskDoc('task_default', undefined, 'Default'),
          taskDoc('task_first', 1, 'First'),
        ],
        previews: [previewDoc('preview_v1', 1), previewDoc('preview_v2', 2)],
        deployments: [deploymentDoc()],
        generationEvents: [
          eventDoc('event_newest', 30, 'Newest'),
          eventDoc('event_oldest', 10, 'Oldest'),
          eventDoc('event_middle', 20, 'Middle'),
        ],
      }),
      sessionId,
    )

    expect(workspace?.session).toMatchObject({
      sessionId,
      status: 'preview_ready',
      themeOverride: 'mono',
    })
    expect(workspace?.tasks.map((task) => task.title)).toEqual([
      'Default',
      'First',
      'Second',
    ])
    expect(workspace?.preview?.html).toBe('<main>Preview 2</main>')
    expect(workspace?.deployment?.slug).toBe('workspace-site')
    expect(workspace?.events.map((event) => event.message)).toEqual([
      'Oldest',
      'Middle',
      'Newest',
    ])
  })

  it('returns null when the session has been deleted', async () => {
    await expect(
      loadSessionWorkspace(ctxFor({}), sessionId),
    ).resolves.toBeNull()
  })
})
