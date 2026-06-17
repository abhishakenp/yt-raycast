export type JsonRecord = Record<string, unknown>

export type LakebedSessionDataDoc = {
  capsule: string
  createdAt: number
  data: JsonRecord
  updatedAt: number
}

export type LakebedAdminRow = {
  id: string
  index: number
  key?: string
  value: unknown
  cells: JsonRecord
}

export type LakebedAdminTable = {
  id: string
  name: string
  capsule: string
  field: string
  storage: 'array' | 'map' | 'value'
  columns: string[]
  rows: LakebedAdminRow[]
  updatedAt: number
}

const isJsonRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const toCells = (value: unknown): JsonRecord =>
  isJsonRecord(value) ? value : { value }

const tableId = (capsule: string, field: string) => `${capsule}:${field}`

const uniqueColumns = (rows: LakebedAdminRow[]): string[] => {
  const columns = new Set<string>()
  for (const row of rows) {
    for (const key of Object.keys(row.cells)) {
      if (key !== '_id') columns.add(key)
    }
  }
  return ['_id', ...columns]
}

const rowIdFromValue = (value: unknown, fallback: string) => {
  if (isJsonRecord(value)) {
    const id = value._id ?? value.id
    if (typeof id === 'string' && id.trim()) return id
  }
  return fallback
}

const rowFromValue = (
  value: unknown,
  index: number,
  key?: string,
): LakebedAdminRow => {
  const fallbackId = key ?? String(index + 1)
  const id = rowIdFromValue(value, fallbackId)
  return {
    cells: { _id: id, ...toCells(value) },
    id: fallbackId,
    index,
    key,
    value,
  }
}

const tableNameFor = (
  capsule: string,
  field: string,
  collisions: Map<string, number>,
) => (collisions.get(field) === 1 ? field : `${capsule}.${field}`)

export function createLakebedAdminTables(
  docs: LakebedSessionDataDoc[] | undefined,
): LakebedAdminTable[] {
  if (!docs) return []

  const fields = docs.flatMap((doc) => Object.keys(doc.data))
  const collisions = fields.reduce((counts, field) => {
    counts.set(field, (counts.get(field) ?? 0) + 1)
    return counts
  }, new Map<string, number>())

  const tables: LakebedAdminTable[] = []

  for (const doc of docs) {
    for (const [field, value] of Object.entries(doc.data)) {
      if (Array.isArray(value)) {
        const rows = value.map((item, index) => rowFromValue(item, index))
        tables.push({
          capsule: doc.capsule,
          columns: uniqueColumns(rows),
          field,
          id: tableId(doc.capsule, field),
          name: tableNameFor(doc.capsule, field, collisions),
          rows,
          storage: 'array',
          updatedAt: doc.updatedAt,
        })
        continue
      }

      if (isJsonRecord(value) && Object.values(value).every(isJsonRecord)) {
        const rows = Object.entries(value).map(([key, item], index) =>
          rowFromValue(
            { _key: key, ...(isJsonRecord(item) ? item : {}) },
            index,
            key,
          ),
        )
        tables.push({
          capsule: doc.capsule,
          columns: uniqueColumns(rows),
          field,
          id: tableId(doc.capsule, field),
          name: tableNameFor(doc.capsule, field, collisions),
          rows,
          storage: 'map',
          updatedAt: doc.updatedAt,
        })
        continue
      }

      const rows = [rowFromValue(value, 0)]
      tables.push({
        capsule: doc.capsule,
        columns: uniqueColumns(rows),
        field,
        id: tableId(doc.capsule, field),
        name: tableNameFor(doc.capsule, field, collisions),
        rows,
        storage: 'value',
        updatedAt: doc.updatedAt,
      })
    }
  }

  return tables.sort((a, b) => a.name.localeCompare(b.name))
}

export function previewAdminValue(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value)
  if (value === null) return 'null'
  if (value === undefined) return ''

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export function parseAdminValue(value: string): unknown {
  const trimmed = value.trim()
  if (!trimmed) return ''

  try {
    return JSON.parse(trimmed) as unknown
  } catch {
    return value
  }
}
