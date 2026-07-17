import type { Id, TableNames } from '../_generated/dataModel'
import type { SystemTableNames } from 'convex/server'

/**
 * Create a typed Convex ID from a string. Intended for test fixtures only.
 * The runtime value is the string itself; the type assertion is unavoidable
 * for Convex's branded Id type.
 */
export function makeId<TableName extends TableNames | SystemTableNames>(
  value: string,
): Id<TableName> {
  return value as Id<TableName>
}

/**
 * Cast a partial mock object to a target type for test setup.
 * Intended for test fixtures only — the mock intentionally does not
 * fully conform to the real type.
 */
export function mockAs<T>(value: unknown): T {
  return value as unknown as T
}
