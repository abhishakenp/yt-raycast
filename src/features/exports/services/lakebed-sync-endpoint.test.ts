import { describe, expect, it } from 'vitest'

import { injectSyncEndpoint } from './openui-lakebed-export-builder'

/**
 * The deployed Lakebed app exposes an authorized `POST /__lakebed/sync` endpoint
 * so our platform can push catalog data into its DB — for the initial seed AND
 * future admin inline-edits — without the app ever calling out. Contract
 * (proven end-to-end against a live deploy in ~/test-lakebed):
 *   • rejects requests without the exact `Authorization: Bearer <secret>`
 *   • projects each row to the table's DECLARED fields (lakebed inserts reject
 *     unknown/engine-managed keys like id/createdAt)
 *   • bulk-replaces each posted table (idempotent)
 * These tests evaluate the GENERATED endpoint handler directly.
 */

type Row = Record<string, unknown> & { id: string }

const makeTable = (initial: Row[] = []) => {
  let rows = [...initial]
  let counter = 0
  return {
    api: {
      all: () => rows,
      delete: (id: string) => {
        rows = rows.filter((r) => r.id !== id)
      },
      insert: (row: Record<string, unknown>) => {
        counter += 1
        const stored = { ...row, id: `id-${counter}` }
        rows.push(stored)
        return stored
      },
    },
    rows: () => rows,
  }
}

// Evaluate the generated endpoint source into a callable handler, stubbing the
// lakebed `endpoint`/`json` helpers.
const buildHandler = (secret?: string) => {
  const tableFields = new Map<string, string[]>([
    ['tenders', ['nitNo', 'title', 'date']],
  ])
  const source = injectSyncEndpoint('{\n}', tableFields, secret)
  const factory = new Function(
    'endpoint',
    'json',
    `return (${source}).__lakebedSync`,
  )
  return factory(
    (_route: unknown, handler: unknown) => handler,
    (body: unknown, opts?: { status?: number }) => ({
      body,
      status: opts?.status ?? 200,
    }),
  ) as (
    ctx: { db: Record<string, ReturnType<typeof makeTable>['api']> },
    req: {
      headers: { get(name: string): string | null }
      json(): Promise<unknown>
    },
  ) => Promise<{ body: unknown; status: number }>
}

const reqWith = (auth: string | null, payload: unknown) => ({
  headers: { get: (name: string) => (name === 'authorization' ? auth : null) },
  json: async () => payload,
})

describe('generated /__lakebed/sync endpoint', () => {
  it('is omitted when no syncSecret is provided', () => {
    expect(injectSyncEndpoint('{\n}', new Map(), undefined)).toBe('{\n}')
    expect(injectSyncEndpoint('{\n}', new Map(), 's')).toContain('__lakebedSync')
  })

  it('rejects a request without the correct bearer secret (401)', async () => {
    const handler = buildHandler('sekret')
    const tenders = makeTable()
    const ctx = { db: { tenders: tenders.api } }

    const noAuth = await handler(ctx, reqWith(null, { tables: {} }))
    expect(noAuth.status).toBe(401)

    const wrong = await handler(
      ctx,
      reqWith('Bearer nope', { tables: { tenders: [{ nitNo: 'x' }] } }),
    )
    expect(wrong.status).toBe(401)
    expect(tenders.rows()).toHaveLength(0)
  })

  it('bulk-replaces a table, projecting rows to declared fields only', async () => {
    const handler = buildHandler('sekret')
    const tenders = makeTable([{ id: 'old-1', nitNo: 'OLD', title: 'old' }])
    const ctx = { db: { tenders: tenders.api } }

    const res = await handler(
      ctx,
      reqWith('Bearer sekret', {
        tables: {
          tenders: [
            {
              nitNo: 'NIT/1',
              title: 'Real',
              date: '2025',
              id: 'should-drop',
              createdAt: 'drop',
              bogus: 'drop',
            },
          ],
          notInSchema: [{ x: 1 }], // unknown table ignored
        },
      }),
    )

    expect(res.status).toBe(200)
    expect((res.body as { ok: boolean }).ok).toBe(true)
    // old row replaced; exactly one new row
    const rows = tenders.rows()
    expect(rows).toHaveLength(1)
    // only declared fields survive (plus the mock's generated id)
    expect(rows[0]).toEqual({
      nitNo: 'NIT/1',
      title: 'Real',
      date: '2025',
      id: 'id-1',
    })
  })
})
