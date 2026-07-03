import { allCapsules } from '@ship-fast/blocks'

import type {
  CapsuleSchemaRegistry,
  LakebedSessionSchema,
  LakebedTableSchema,
} from './lakebed-admin-model'

type CapsuleWithLakebed = {
  name: string
  lakebed?: {
    dataKey?: string
    schema?: unknown
  }
}

const isTableSchema = (value: unknown): value is LakebedTableSchema =>
  Boolean(value) &&
  typeof value === 'object' &&
  (value as { kind?: unknown }).kind === 'table' &&
  typeof (value as { fields?: unknown }).fields === 'object'

const extractSchema = (schema: unknown): LakebedSessionSchema => {
  if (!schema || typeof schema !== 'object') return {}
  const result: LakebedSessionSchema = {}
  for (const [tableName, tableDef] of Object.entries(
    schema as Record<string, unknown>,
  )) {
    if (isTableSchema(tableDef)) {
      result[tableName] = tableDef
    }
  }
  return result
}

let cachedRegistry: CapsuleSchemaRegistry | null = null

export function buildCapsuleSchemaRegistry(): CapsuleSchemaRegistry {
  if (cachedRegistry) return cachedRegistry

  const registry: CapsuleSchemaRegistry = {}

  for (const capsule of allCapsules) {
    const entry = capsule as unknown as CapsuleWithLakebed
    if (!entry.lakebed?.schema) continue
    const schema = extractSchema(entry.lakebed.schema)
    if (Object.keys(schema).length === 0) continue

    // Key only by dataKey. Lakebed table data is stored under the dataKey
    // (e.g. 'Restaurant'); section prop data is stored under component names
    // (e.g. 'RestaurantStory:story_story') and must NOT produce admin tables.
    // Keying by component name caused false matches on prop docs.
    if (entry.lakebed.dataKey) {
      registry[entry.lakebed.dataKey] = schema
    }
  }

  cachedRegistry = registry
  return registry
}
