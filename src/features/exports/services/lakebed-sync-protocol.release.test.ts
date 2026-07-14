import { describe, expect, it } from 'vitest'

import { injectSyncEndpoint } from './openui-lakebed-export-builder'

type StoredRow = Record<string, unknown> & { id: string }

type SyncResponse = {
  body: unknown
  status: number
}

type SyncRequest = {
  headers: { get: (name: string) => string | null }
  json: () => Promise<unknown>
  text: () => Promise<string>
}

type SyncContext = {
  db: Record<string, ReturnType<typeof makeTable>['api']>
}

type Change = {
  data?: Record<string, unknown>
  deletedAt?: string
  key: string
  operation: 'create' | 'update' | 'delete'
  table: string
  version: number
}

type Callable = (...args: unknown[]) => unknown

function isCallable(value: unknown): value is Callable {
  return typeof value === 'function'
}

function makeTable(
  initial: StoredRow[] = [],
  options: { rejectInsert?: boolean } = {},
) {
  let rows = initial.map((row) => ({ ...row }))
  let counter = 0
  const operations: Array<{ operation: string; value: unknown }> = []

  function all() {
    return rows.map((row) => ({ ...row }))
  }

  function deleteRow(id: string) {
    operations.push({ operation: 'delete', value: id })
    rows = rows.filter((row) => row.id !== id)
  }

  function get(id: string) {
    return rows.find((row) => row.id === id) ?? null
  }

  function insert(value: Record<string, unknown>) {
    operations.push({ operation: 'insert', value })
    if (options.rejectInsert) throw new Error('storage unavailable')
    counter += 1
    const row = { ...value, id: `generated-${counter}` }
    rows.push(row)
    return row
  }

  function update(id: string, patch: Record<string, unknown>) {
    operations.push({ operation: 'update', value: { id, patch } })
    rows = rows.map((row) => (row.id === id ? { ...row, ...patch, id } : row))
  }

  function currentOperations() {
    return [...operations]
  }

  function currentRows() {
    return rows.map((row) => ({ ...row }))
  }

  return {
    api: {
      all,
      delete: deleteRow,
      get,
      insert,
      update,
    },
    operations: currentOperations,
    rows: currentRows,
  }
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

function buildHandler(secret = 'release-sync-secret') {
  const routes: Array<{ method: string; path: string }> = []
  const source = injectSyncEndpoint(
    '{\n}',
    new Map([['products', ['key', 'label', 'price']]]),
    secret,
  )
  const factory = new Function(
    'endpoint',
    'json',
    `return (${source}).__lakebedSync`,
  )

  function endpoint(
    route: { method: string; path: string },
    endpointHandler: unknown,
  ) {
    routes.push(route)
    return endpointHandler
  }

  function json(body: unknown, options?: { status?: number }): SyncResponse {
    return { body, status: options?.status ?? 200 }
  }

  const candidate: unknown = factory(endpoint, json)
  if (!isCallable(candidate)) {
    throw new Error('generated sync endpoint is not callable')
  }
  const callable = candidate

  async function handler(ctx: SyncContext, req: SyncRequest) {
    return parseSyncResponse(await callable(ctx, req))
  }

  return { handler, routes }
}

function request(
  payload: unknown,
  options: { authorization?: string; rawBody?: string } = {},
): SyncRequest {
  const body = options.rawBody ?? JSON.stringify(payload)

  function get(name: string) {
    return name.toLowerCase() === 'authorization'
      ? (options.authorization ?? null)
      : null
  }

  async function json() {
    const parsed: unknown = JSON.parse(body)
    return parsed
  }

  async function text() {
    return body
  }

  return {
    headers: { get },
    json,
    text,
  }
}

function envelope(input: {
  batchId: string
  changes: Change[]
  origin?: string
  tables: Record<string, Array<Record<string, unknown>>>
  target?: string
  version: number
}) {
  return {
    schemaVersion: 1,
    idempotencyKey: input.batchId,
    origin: input.origin ?? 'dashboard-primary',
    target: input.target ?? 'deployment-release',
    version: input.version,
    changes: input.changes,
    tables: input.tables,
  }
}

const authorized = { authorization: 'Bearer release-sync-secret' }

describe('generated neutral data sync protocol', () => {
  it('registers only a neutral POST endpoint and requires bearer auth', async () => {
    const { handler, routes } = buildHandler()
    const products = makeTable()

    expect(routes).toEqual([{ method: 'POST', path: '/api/__sync' }])
    expect(JSON.stringify(routes).toLowerCase()).not.toContain('ship-fast')

    const response = await handler(
      { db: { products: products.api } },
      request({ tables: {} }),
    )
    expect(response.status).toBe(401)
    expect(products.rows()).toEqual([])
  })

  it('rejects malformed JSON without touching local data', async () => {
    const { handler } = buildHandler()
    const products = makeTable([{ id: 'existing', key: 'p1', label: 'Keep' }])

    const response = await handler(
      { db: { products: products.api } },
      request(null, { ...authorized, rawBody: '{not-json' }),
    )

    expect(response.status).toBe(400)
    expect(products.rows()).toEqual([
      { id: 'existing', key: 'p1', label: 'Keep' },
    ])
  })

  it('rejects legacy or incomplete payloads atomically', async () => {
    const { handler } = buildHandler()
    const products = makeTable([{ id: 'existing', key: 'p1', label: 'Keep' }])

    const response = await handler(
      { db: { products: products.api } },
      request(
        { tables: { products: [{ key: 'p2', label: 'Replace' }] } },
        authorized,
      ),
    )

    expect([400, 422]).toContain(response.status)
    expect(products.rows()).toEqual([
      { id: 'existing', key: 'p1', label: 'Keep' },
    ])
  })

  it('deduplicates a retried idempotency key without rewriting rows', async () => {
    const { handler } = buildHandler()
    const products = makeTable()
    const payload = envelope({
      batchId: 'batch-create-p1',
      version: 1,
      changes: [
        {
          table: 'products',
          key: 'p1',
          operation: 'create',
          version: 1,
          data: { key: 'p1', label: 'Original', price: '10' },
        },
      ],
      tables: {
        products: [{ key: 'p1', label: 'Original', price: '10' }],
      },
    })

    const first = await handler(
      { db: { products: products.api } },
      request(payload, authorized),
    )
    const firstRows = products.rows()
    const second = await handler(
      { db: { products: products.api } },
      request(payload, authorized),
    )

    expect([200, 202]).toContain(first.status)
    expect([200, 202]).toContain(second.status)
    expect(products.rows()).toEqual(firstRows)
    expect(second.body).toMatchObject({ duplicate: true })
  })

  it('keeps the newest version when an older batch arrives later', async () => {
    const { handler } = buildHandler()
    const products = makeTable()
    function change(version: number, label: string) {
      return envelope({
        batchId: `batch-p1-v${version}`,
        version,
        changes: [
          {
            table: 'products',
            key: 'p1',
            operation: version === 1 ? 'create' : 'update',
            version,
            data: { key: 'p1', label, price: '10' },
          },
        ],
        tables: { products: [{ key: 'p1', label, price: '10' }] },
      })
    }

    await handler(
      { db: { products: products.api } },
      request(change(2, 'Newest'), authorized),
    )
    const stale = await handler(
      { db: { products: products.api } },
      request(change(1, 'Stale'), authorized),
    )

    expect(products.rows()).toEqual([
      expect.objectContaining({ key: 'p1', label: 'Newest' }),
    ])
    expect(stale.body).toMatchObject({ stale: true })
  })

  it('retains delete tombstones so stale updates cannot resurrect rows', async () => {
    const { handler } = buildHandler()
    const products = makeTable([{ id: 'p1', key: 'p1', label: 'Existing' }])
    const deletion = envelope({
      batchId: 'batch-delete-p1-v3',
      version: 3,
      changes: [
        {
          table: 'products',
          key: 'p1',
          operation: 'delete',
          version: 3,
          deletedAt: '2026-07-13T00:00:00.000Z',
        },
      ],
      tables: { products: [] },
    })
    const staleUpdate = envelope({
      batchId: 'batch-update-p1-v2',
      version: 2,
      changes: [
        {
          table: 'products',
          key: 'p1',
          operation: 'update',
          version: 2,
          data: { key: 'p1', label: 'Stale resurrection' },
        },
      ],
      tables: { products: [{ key: 'p1', label: 'Stale resurrection' }] },
    })

    await handler(
      { db: { products: products.api } },
      request(deletion, authorized),
    )
    await handler(
      { db: { products: products.api } },
      request(staleUpdate, authorized),
    )

    expect(products.rows()).toEqual([])
  })

  it('suppresses batches whose origin matches the target deployment', async () => {
    const { handler } = buildHandler()
    const products = makeTable([{ id: 'p1', key: 'p1', label: 'Local' }])
    const payload = envelope({
      batchId: 'batch-loop',
      version: 4,
      origin: 'deployment-release',
      target: 'deployment-release',
      changes: [
        {
          table: 'products',
          key: 'p1',
          operation: 'update',
          version: 4,
          data: { key: 'p1', label: 'Echoed' },
        },
      ],
      tables: { products: [{ key: 'p1', label: 'Echoed' }] },
    })

    const response = await handler(
      { db: { products: products.api } },
      request(payload, authorized),
    )

    expect(response.body).toMatchObject({ ignored: true })
    expect(products.rows()).toEqual([{ id: 'p1', key: 'p1', label: 'Local' }])
  })

  it('rejects invalid row field types without partially replacing a table', async () => {
    const { handler } = buildHandler()
    const products = makeTable([{ id: 'p1', key: 'p1', label: 'Keep' }])
    const payload = envelope({
      batchId: 'batch-invalid-row',
      version: 5,
      changes: [
        {
          table: 'products',
          key: 'p2',
          operation: 'create',
          version: 5,
          data: { key: 'p2', label: { nested: 'invalid' } },
        },
      ],
      tables: { products: [{ key: 'p2', label: { nested: 'invalid' } }] },
    })

    const response = await handler(
      { db: { products: products.api } },
      request(payload, authorized),
    )

    expect([400, 422]).toContain(response.status)
    expect(products.rows()).toEqual([{ id: 'p1', key: 'p1', label: 'Keep' }])
  })

  it('applies create, update, and delete without replacing stable row identity', async () => {
    const { handler } = buildHandler()
    const products = makeTable()
    async function send(
      batchId: string,
      version: number,
      change: Change,
      rows: Array<Record<string, unknown>>,
    ) {
      return await handler(
        { db: { products: products.api } },
        request(
          envelope({
            batchId,
            version,
            changes: [change],
            tables: { products: rows },
          }),
          authorized,
        ),
      )
    }

    await send(
      'create-p1',
      1,
      {
        table: 'products',
        key: 'p1',
        operation: 'create',
        version: 1,
        data: { key: 'p1', label: 'Created' },
      },
      [{ key: 'p1', label: 'Created' }],
    )
    const createdId = products.rows()[0]?.id
    await send(
      'update-p1',
      2,
      {
        table: 'products',
        key: 'p1',
        operation: 'update',
        version: 2,
        data: { key: 'p1', label: 'Updated' },
      },
      [{ key: 'p1', label: 'Updated' }],
    )

    expect(products.rows()).toEqual([
      expect.objectContaining({ id: createdId, key: 'p1', label: 'Updated' }),
    ])

    await send(
      'delete-p1',
      3,
      {
        table: 'products',
        key: 'p1',
        operation: 'delete',
        version: 3,
        deletedAt: '2026-07-13T00:00:00.000Z',
      },
      [],
    )
    expect(products.rows()).toEqual([])
  })

  it('preserves existing rows when storage fails during a sync attempt', async () => {
    const { handler } = buildHandler()
    const products = makeTable(
      [{ id: 'p1', key: 'p1', label: 'Local write survives' }],
      { rejectInsert: true },
    )
    const payload = envelope({
      batchId: 'batch-storage-failure',
      version: 6,
      changes: [
        {
          table: 'products',
          key: 'p2',
          operation: 'create',
          version: 6,
          data: { key: 'p2', label: 'Remote' },
        },
      ],
      tables: { products: [{ key: 'p2', label: 'Remote' }] },
    })

    const response = await handler(
      { db: { products: products.api } },
      request(payload, authorized),
    )

    expect(response.status).toBeGreaterThanOrEqual(500)
    expect(products.rows()).toEqual([
      { id: 'p1', key: 'p1', label: 'Local write survives' },
    ])
  })
})
