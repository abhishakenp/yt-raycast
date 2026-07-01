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
  sourceCapsule?: string
  sourceField?: string
  value: unknown
  cells: JsonRecord
}

export type LakebedAdminTable = {
  id: string
  name: string
  capsule: string
  sourceCapsules: string[]
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
const capsuleComponentName = (capsule: string): string =>
  capsule.split(':', 1)[0] ?? capsule

const isStructuralChromeCapsule = (capsule: string): boolean =>
  /(Navbar|Footer|Header|Topbar|Sidebar)$/.test(capsuleComponentName(capsule))

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
  source?: { capsule: string; field: string },
): LakebedAdminRow => {
  const fallbackId = key ?? String(index + 1)
  const id = rowIdFromValue(value, fallbackId)
  return {
    cells: { _id: id, ...toCells(value) },
    id,
    index,
    key,
    sourceCapsule: source?.capsule,
    sourceField: source?.field,
    value,
  }
}

export function createLakebedAdminTables(
  docs: LakebedSessionDataDoc[] | undefined,
): LakebedAdminTable[] {
  if (!docs) return []

  const contentDocs = docs.filter(
    (doc) => !isStructuralChromeCapsule(doc.capsule),
  )
  const tables: LakebedAdminTable[] = []

  for (const doc of contentDocs) {
    for (const [field, value] of Object.entries(doc.data)) {
      if (Array.isArray(value)) {
        const rows = value.map((item, index) =>
          rowFromValue(item, index, undefined, {
            capsule: doc.capsule,
            field,
          }),
        )
        tables.push({
          capsule: doc.capsule,
          columns: uniqueColumns(rows),
          field,
          id: tableId(doc.capsule, field),
          name: field,
          rows,
          sourceCapsules: [doc.capsule],
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
            { capsule: doc.capsule, field },
          ),
        )
        tables.push({
          capsule: doc.capsule,
          columns: uniqueColumns(rows),
          field,
          id: tableId(doc.capsule, field),
          name: field,
          rows,
          sourceCapsules: [doc.capsule],
          storage: 'map',
          updatedAt: doc.updatedAt,
        })
        continue
      }

      const rows = [
        rowFromValue(value, 0, undefined, { capsule: doc.capsule, field }),
      ]
      tables.push({
        capsule: doc.capsule,
        columns: uniqueColumns(rows),
        field,
        id: tableId(doc.capsule, field),
        name: field,
        rows,
        sourceCapsules: [doc.capsule],
        storage: 'value',
        updatedAt: doc.updatedAt,
      })
    }
  }

  return mergeCompatibleTables(tables).sort((a, b) =>
    a.name.localeCompare(b.name),
  )
}

const mergeCompatibleTables = (
  tables: LakebedAdminTable[],
): LakebedAdminTable[] => {
  const grouped = new Map<string, LakebedAdminTable[]>()

  for (const table of tables) {
    const key = `${table.storage}:${table.field}`
    grouped.set(key, [...(grouped.get(key) ?? []), table])
  }

  const merged: LakebedAdminTable[] = []
  for (const group of grouped.values()) {
    const sourceCapsules = [...new Set(group.map((table) => table.capsule))]
    if (group.length === 1) {
      merged.push({ ...group[0], name: group[0].field, sourceCapsules })
      continue
    }

    const rows = group.flatMap((table) =>
      table.rows.map((row) => ({
        ...row,
        id: `${table.capsule}:${table.field}:${row.id}`,
        sourceCapsule: row.sourceCapsule ?? table.capsule,
        sourceField: row.sourceField ?? table.field,
      })),
    )
    merged.push({
      capsule: group[0].capsule,
      columns: uniqueColumns(rows),
      field: group[0].field,
      id: `${group[0].storage}:${group[0].field}`,
      name: group[0].field,
      rows,
      sourceCapsules,
      storage: group[0].storage,
      updatedAt: Math.max(...group.map((table) => table.updatedAt)),
    })
  }

  return merged
}

export const canAddRowsToTable = (table: LakebedAdminTable): boolean =>
  table.storage !== 'value' && table.sourceCapsules.length === 1

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
