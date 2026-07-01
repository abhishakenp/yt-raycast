/**
 * Normalize a Lakebed catalog/query result to an array of records.
 *
 * Lakebed can return DB-shaped record collections — objects mapping record IDs
 * to record objects — instead of arrays. Malformed rows (null / undefined /
 * non-object entries) are filtered out so downstream `.map()` calls don't
 * throw. Genuine scalar primitive fields (strings, numbers, booleans) on the
 * top-level value indicate a scalar record rather than a collection, so the
 * value is treated as empty in that case.
 */
export function normalizeRecords<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is T => isRecord(item))
  }
  if (!value || typeof value !== 'object') return []
  if (!isDbRecordCollection(value)) return []
  return Object.values(value).filter((item): item is T => isRecord(item))
}

function isRecord(value: unknown): boolean {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isDbRecordCollection(value: object): boolean {
  const entries = Object.entries(value)
  if (!entries.length) return false
  // A DB-shaped record collection maps record IDs to record objects. Tolerate
  // malformed rows (null / undefined / non-object entries) by ignoring them,
  // but reject values that contain genuine scalar primitive fields (strings,
  // numbers, booleans) or arrays — those indicate a scalar record, not a
  // collection. At least one entry must be a record object.
  let hasRecord = false
  for (const [, v] of entries) {
    if (v == null) continue
    if (typeof v === 'object' && !Array.isArray(v)) {
      hasRecord = true
      continue
    }
    return false
  }
  return hasRecord
}
