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

function makeTable(initial: Row[] = []) {
  let rows = [...initial]
  let counter = 0

  function all() {
    return rows
  }

  function deleteRow(id: string) {
    rows = rows.filter((row) => row.id !== id)
  }

  function insert(row: Record<string, unknown>) {
    counter += 1
    const stored = { ...row, id: `id-${counter}` }
    rows.push(stored)
    return stored
  }

  function currentRows() {
    return rows
  }

  return {
    api: {
      all,
      delete: deleteRow,
      insert,
    },
    rows: currentRows,
  }
}

type SyncContext = {
  db: Record<string, ReturnType<typeof makeTable>['api']>
}

type SyncRequest = {
  headers: { get(name: string): string | null }
  json(): Promise<unknown>
  text(): Promise<string>
}

type SyncResponse = {
  body: unknown
  status: number
}

type SyncHandler = (ctx: SyncContext, req: SyncRequest) => Promise<SyncResponse>

type Callable = (...args: unknown[]) => unknown

function isCallable(value: unknown): value is Callable {
  return typeof value === 'function'
}

function parseSyncResponse(value: unknown): SyncResponse {
  if (typeof value !== 'object' || value === null) {
    throw new Error('generated sync handler returned a non-object response')
  }
  const body = Reflect.get(value, 'body')
  const status = Reflect.get(value, 'status')
  if (typeof status !== 'number') {
    throw new Error('generated sync handler response has no numeric status')
  }
  return { body, status }
}

// Evaluate the generated endpoint source into a callable handler, stubbing the
// lakebed `endpoint`/`json` helpers.
function buildHandler(secret?: string): SyncHandler {
  const tableFields = new Map<string, string[]>([
    ['tenders', ['nitNo', 'title', 'date']],
  ])
  const source = injectSyncEndpoint('{\n}', tableFields, secret)
  const factory = new Function(
    'endpoint',
    'json',
    `return (${source}).__lakebedSync`,
  )

  function endpoint(_route: unknown, endpointHandler: unknown) {
    return endpointHandler
  }

  function json(body: unknown, opts?: { status?: number }) {
    return { body, status: opts?.status ?? 200 }
  }

  const candidate: unknown = factory(endpoint, json)
  if (!isCallable(candidate)) {
    throw new Error('generated sync endpoint is not callable')
  }
  const callable = candidate

  async function handler(ctx: SyncContext, req: SyncRequest) {
    return parseSyncResponse(await callable(ctx, req))
  }

  return handler
}

function reqWith(auth: string | null, payload: unknown): SyncRequest {
  function get(name: string) {
    return name === 'authorization' ? auth : null
  }

  async function json() {
    return payload
  }

  async function text() {
    return JSON.stringify(payload)
  }

  return { headers: { get }, json, text }
}

describe('generated /__lakebed/sync endpoint', () => {
  it('is omitted when no syncSecret is provided', () => {
    expect(injectSyncEndpoint('{\n}', new Map(), undefined)).toBe('{\n}')
    expect(injectSyncEndpoint('{\n}', new Map(), 's')).toContain(
      '__lakebedSync',
    )
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
    expect(res.body).toMatchObject({ ok: true })
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
