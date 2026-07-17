import type { Field, LogContext, TableDefinition } from 'lakebed/server'

import type { JsonRecord, LakebedSessionSchema } from './server.ts'

type LakebedBaseRow = {
  id: string
  createdAt: string
  updatedAt: string
}

type LakebedRowFields<TRow> = Omit<TRow, keyof LakebedBaseRow>

export type LakebedObjectQueryBuilder<TRow extends LakebedBaseRow> = {
  where(
    field: keyof TRow & string,
    value: unknown,
  ): LakebedObjectQueryBuilder<TRow>
  orderBy(
    field: keyof TRow & string,
    direction?: 'asc' | 'desc',
  ): LakebedObjectQueryBuilder<TRow>
  limit(count: number): LakebedObjectQueryBuilder<TRow>
  all(): TRow[]
}

export type LakebedObjectTableApi<TRow extends LakebedBaseRow> =
  LakebedObjectQueryBuilder<TRow> & {
    get(id: string): TRow | null
    insert(value: LakebedRowFields<TRow>): TRow
    update(id: string, patch: Partial<LakebedRowFields<TRow>>): void
    delete(id: string): void
  }

export type LakebedDbFromData<TData extends JsonRecord> = {
  [TName in Extract<keyof TData, string> as TData[TName] extends Array<unknown>
    ? TName
    : never]: TData[TName] extends Array<infer TRow>
    ? TRow extends LakebedBaseRow
      ? LakebedObjectTableApi<TRow>
      : never
    : never
}

type Filter = {
  field: string
  value: unknown
}

type Sort = {
  direction: 'asc' | 'desc'
  field: string
}

type StateCell = {
  changedTables: Set<string>
  readonly schema?: LakebedSessionSchema
  readonly tables: Map<string, Map<string, JsonRecord>>
  readonly writable: boolean
}

const metadataFields = new Set(['id', 'createdAt', 'updatedAt'])

const now = () => new Date().toISOString()

function compareValues(left: unknown, right: unknown) {
  if (left === right) return 0
  if (typeof left === 'number' && typeof right === 'number') {
    return left > right ? 1 : -1
  }

  return String(left) > String(right) ? 1 : -1
}

function cloneRow<TRow extends Record<string, unknown>>(row: TRow): TRow {
  return { ...row }
}

function fieldDefault(field: Field<unknown> | undefined) {
  if (!field || !Object.prototype.hasOwnProperty.call(field, 'defaultValue')) {
    return undefined
  }

  return typeof field.defaultValue === 'function'
    ? field.defaultValue()
    : field.defaultValue
}

function assertFieldValue(
  tableName: string,
  fieldName: string,
  field: Field<unknown> | undefined,
  value: unknown,
) {
  if (value === undefined) {
    throw new Error(`Missing value for ${tableName}.${fieldName}`)
  }

  if (field?.kind === 'string' && typeof value !== 'string') {
    throw new Error(`Expected ${tableName}.${fieldName} to be a string.`)
  }

  if (field?.kind === 'boolean' && typeof value !== 'boolean') {
    throw new Error(`Expected ${tableName}.${fieldName} to be a boolean.`)
  }

  if (field?.kind === 'number') {
    if (typeof value !== 'number') {
      throw new Error(`Expected ${tableName}.${fieldName} to be a number.`)
    }
    if (!Number.isFinite(value)) {
      throw new Error(
        `Expected ${tableName}.${fieldName} to be a finite number.`,
      )
    }
  }
}

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return Math.random().toString(36).slice(2)
}

class ObjectQueryBuilder<TRow extends LakebedBaseRow & JsonRecord> {
  constructor(
    protected readonly table: string,
    protected readonly rows: Map<string, JsonRecord>,
    protected readonly filters: Filter[] = [],
    protected readonly sort: Sort | null = null,
    protected readonly max: number | null = null,
  ) {}

  where(field: keyof TRow & string, value: unknown) {
    return new ObjectQueryBuilder<TRow>(
      this.table,
      this.rows,
      [...this.filters, { field, value }],
      this.sort,
      this.max,
    )
  }

  orderBy(field: keyof TRow & string, direction: 'asc' | 'desc' = 'asc') {
    return new ObjectQueryBuilder<TRow>(
      this.table,
      this.rows,
      this.filters,
      { direction, field },
      this.max,
    )
  }

  limit(count: number) {
    if (!Number.isSafeInteger(count) || count < 0) {
      throw new Error('Lakebed query limit must be a non-negative integer.')
    }

    return new ObjectQueryBuilder<TRow>(
      this.table,
      this.rows,
      this.filters,
      this.sort,
      count,
    )
  }

  all() {
    let results = Array.from(this.rows.values())

    for (const filter of this.filters) {
      results = results.filter((row) => row[filter.field] === filter.value)
    }

    if (this.sort) {
      const { direction, field } = this.sort
      const multiplier = direction === 'desc' ? -1 : 1

      results = [...results].sort(
        (left, right) => compareValues(left[field], right[field]) * multiplier,
      )
    }

    if (typeof this.max === 'number') {
      results = results.slice(0, this.max)
    }

    return results.map((row) => cloneRow(row)) as TRow[]
  }
}

class ObjectTableApi<
  TRow extends LakebedBaseRow & JsonRecord,
> extends ObjectQueryBuilder<TRow> {
  private readonly definition: TableDefinition | undefined

  constructor(
    private readonly stateCell: StateCell,
    private readonly name: string,
  ) {
    super(name, stateCell.tables.get(name) ?? new Map())
    this.definition = stateCell.schema?.[name]
  }

  private assertWritable() {
    if (!this.stateCell.writable) {
      throw new Error(
        `Lakebed table "${this.name}" cannot be changed from a query.`,
      )
    }
  }

  private validateInsert(value: LakebedRowFields<TRow>) {
    const fields = this.definition?.fields ?? {}
    const row: JsonRecord = {}

    for (const key of Object.keys(value)) {
      if (!fields[key] && !metadataFields.has(key)) {
        throw new Error(`Unknown field for ${this.name}: ${key}`)
      }
      if (metadataFields.has(key)) {
        throw new Error(
          `Lakebed manages ${this.name}.${key}; app code cannot set it directly.`,
        )
      }
    }

    for (const [fieldName, field] of Object.entries(fields)) {
      const suppliedValue = value[fieldName]
      const valueOrDefault =
        suppliedValue === undefined ? fieldDefault(field) : suppliedValue
      assertFieldValue(this.name, fieldName, field, valueOrDefault)
      row[fieldName] = valueOrDefault
    }

    return row
  }

  private validatePatch(patch: Partial<LakebedRowFields<TRow>>) {
    const fields = this.definition?.fields ?? {}
    const cleanPatch: JsonRecord = {}

    for (const [key, value] of Object.entries(patch)) {
      if (!fields[key] && !metadataFields.has(key)) {
        throw new Error(`Unknown field for ${this.name}: ${key}`)
      }
      if (metadataFields.has(key)) {
        throw new Error(
          `Lakebed manages ${this.name}.${key}; app code cannot update it directly.`,
        )
      }
      assertFieldValue(this.name, key, fields[key], value)
      cleanPatch[key] = value
    }

    return cleanPatch
  }

  get(id: string) {
    const row = this.rows.get(id)
    return row ? (cloneRow(row) as TRow) : null
  }

  insert(value: LakebedRowFields<TRow>) {
    this.assertWritable()

    const timestamp = now()
    const row = {
      ...this.validateInsert(value),
      createdAt: timestamp,
      id: createId(),
      updatedAt: timestamp,
    }

    this.rows.set(row.id, row)
    this.stateCell.changedTables.add(this.name)

    return cloneRow(row) as TRow
  }

  update(id: string, patch: Partial<LakebedRowFields<TRow>>) {
    this.assertWritable()

    const row = this.rows.get(id)
    if (!row) return

    const cleanPatch = this.validatePatch(patch)
    const changesRow = Object.entries(cleanPatch).some(
      ([key, value]) => !Object.is(row[key], value),
    )
    if (!changesRow) return

    this.rows.set(id, {
      ...row,
      ...cleanPatch,
      id,
      updatedAt: now(),
    })
    this.stateCell.changedTables.add(this.name)
  }

  delete(id: string) {
    this.assertWritable()

    if (this.rows.delete(id)) {
      this.stateCell.changedTables.add(this.name)
    }
  }
}

function normalizeTables(
  data: JsonRecord,
  schema: LakebedSessionSchema | undefined,
) {
  const tableNames = new Set<string>(Object.keys(schema ?? {}))

  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) tableNames.add(key)
  }

  const tables = new Map<string, Map<string, JsonRecord>>()

  for (const tableName of tableNames) {
    const rows = Array.isArray(data[tableName]) ? data[tableName] : []
    tables.set(
      tableName,
      new Map(
        rows
          .filter((row): row is JsonRecord => {
            return (
              typeof row === 'object' &&
              row !== null &&
              typeof (row as JsonRecord).id === 'string'
            )
          })
          .map((row) => [row.id as string, cloneRow(row)]),
      ),
    )
  }

  return tables
}

export const noopLog: LogContext = {
  error() {},
  info() {},
  warn() {},
}

export function createLakebedObjectRuntime<TData extends JsonRecord>({
  data,
  schema,
  writable = false,
}: {
  data: TData
  schema?: LakebedSessionSchema
  writable?: boolean
}) {
  const stateCell: StateCell = {
    changedTables: new Set(),
    schema,
    tables: normalizeTables(data, schema),
    writable,
  }

  const db = Object.fromEntries(
    Array.from(stateCell.tables.keys()).map((tableName) => [
      tableName,
      new ObjectTableApi(stateCell, tableName),
    ]),
  ) as unknown as LakebedDbFromData<TData>

  const getPatch = () => {
    const patch: JsonRecord = {}

    for (const tableName of stateCell.changedTables) {
      patch[tableName] = Array.from(
        stateCell.tables.get(tableName)?.values() ?? [],
      ).map((row) => cloneRow(row))
    }

    return patch as TData
  }

  return { db, getPatch }
}
