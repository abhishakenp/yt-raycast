import { describe, expect, it } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import { loadSessionReadiness } from './session_readiness_helpers'

type TableName =
  | 'sessions'
  | 'tasks'
  | 'previews'
  | 'siteSpecs'
  | 'generatedModules'

type Row =
  | Doc<'sessions'>
  | Doc<'tasks'>
  | Doc<'previews'>
  | Doc<'siteSpecs'>
  | Doc<'generatedModules'>

const sessionId = 'session_readiness' as Id<'sessions'>

function sessionDoc(overrides: Partial<Doc<'sessions'>> = {}) {
  return {
    _id: sessionId,
    _creationTime: 1,
    prompt: 'Build a readiness page',
    workspace: 'default',
    status: 'streaming',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    createdAt: 100,
    updatedAt: 120,
    ...overrides,
  } as Doc<'sessions'>
}

function taskDoc(
  id: string,
  status: Doc<'tasks'>['status'],
  order: number | undefined,
): Doc<'tasks'> {
  return {
    _id: id as Id<'tasks'>,
    _creationTime: 1,
    sessionId,
    taskKey: id,
    title: id,
    status,
    order,
    createdAt: 1,
    updatedAt: 1,
  } as Doc<'tasks'>
}

function previewDoc(id: string, version: number): Doc<'previews'> {
  return {
    _id: id as Id<'previews'>,
    _creationTime: version,
    sessionId,
    version,
    html: `<main>Preview ${version}</main>`,
    createdAt: version,
    source: 'generation',
  } as Doc<'previews'>
}

function siteSpecDoc(): Doc<'siteSpecs'> {
  return {
    _id: 'site_spec_readiness' as Id<'siteSpecs'>,
    _creationTime: 1,
    sessionId,
    specJson: '{"projectName":"Readiness"}',
    createdAt: 1,
    updatedAt: 1,
  } as Doc<'siteSpecs'>
}

function generatedModuleDoc(
  status: Doc<'generatedModules'>['status'],
): Doc<'generatedModules'> {
  return {
    _id: 'module_readiness' as Id<'generatedModules'>,
    _creationTime: 1,
    sessionId,
    moduleKey: 'home',
    source: '$page = "Home"',
    status,
    createdAt: 1,
    updatedAt: 1,
  } as Doc<'generatedModules'>
}

function ctxFor(input: Partial<Record<TableName, Row[]>>) {
  const tables: Record<TableName, Row[]> = {
    sessions: [...(input.sessions ?? [])],
    tasks: [...(input.tasks ?? [])],
    previews: [...(input.previews ?? [])],
    siteSpecs: [...(input.siteSpecs ?? [])],
    generatedModules: [...(input.generatedModules ?? [])],
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
          }) => void,
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
        take: async (limit: number) => rows.slice(0, limit),
      }

      return builder
    },
  } as unknown as Pick<QueryCtx, 'db'>['db']

  return { db }
}

describe('session readiness helpers', () => {
  it('computes readiness from session status, tasks, preview, site spec, and OpenUI module', async () => {
    const result = await loadSessionReadiness(
      ctxFor({
        sessions: [sessionDoc()],
        tasks: [
          taskDoc('site_spec', 'running', 2),
          taskDoc('homepage', 'succeeded', 1),
          taskDoc('qa', 'succeeded', undefined),
        ],
        previews: [previewDoc('preview_v1', 1), previewDoc('preview_v2', 2)],
        siteSpecs: [siteSpecDoc()],
        generatedModules: [generatedModuleDoc('succeeded')],
      }),
      sessionId,
    )

    expect(result).toMatchObject({
      session: {
        sessionId,
        status: 'streaming',
      },
      readiness: {
        homepageReady: true,
        openuiReady: true,
        siteSpecReady: true,
        done: 2,
        taskCount: 3,
      },
    })
  })

  it('returns null for invalid or deleted sessions', async () => {
    await expect(
      loadSessionReadiness(ctxFor({}), 'not_a_session_id'),
    ).resolves.toBeNull()
    await expect(
      loadSessionReadiness(
        ctxFor({
          sessions: [sessionDoc()],
        }),
        'missing_session' as Id<'sessions'>,
      ),
    ).resolves.toBeNull()
  })
})
