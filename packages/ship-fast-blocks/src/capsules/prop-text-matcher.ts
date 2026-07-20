import type { JsonRecord } from '@ship-fast/lakebed/server'

// ─── Types ──────────────────────────────────────────────────────────────────

export type CapsulePropContext = {
  /** Lakebed key: `${capsuleName}:${statementId}` */
  lakebedKey: string
  capsuleName: string
  statementId: string
  /** Which prop is being edited */
  propKey: string
  /** For collection items: the index + field within the item */
  index?: number
  fieldKey?: string
  kind: 'scalar' | 'collection'
}

// ─── Schema lookup ──────────────────────────────────────────────────────────

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v)
}

/** Keys that are infrastructure, not user-editable content. */
const RESERVED_KEYS = new Set([
  'className',
  'shipFastGeneratedProps',
  '_id',
  '_key',
  'id',
  'createdAt',
  'updatedAt',
])

/** All string prop keys from merged props, excluding reserved/infrastructure keys. */
function stringPropKeys(mergedProps: JsonRecord): string[] {
  return Object.entries(mergedProps)
    .filter(
      ([key, value]) =>
        !RESERVED_KEYS.has(key) && typeof value === 'string' && value.trim(),
    )
    .map(([key]) => key)
}

function collectionPropEntries(mergedProps: JsonRecord) {
  return Object.entries(mergedProps).filter(
    ([key, value]) => !RESERVED_KEYS.has(key) && Array.isArray(value),
  ) as Array<[string, unknown[]]>
}

// ─── Matching ───────────────────────────────────────────────────────────────

function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}

/**
 * Match a clicked element's text content to a specific capsule prop.
 *
 * Strategy:
 * 1. Scalar string props: exact text match (element.textContent === prop value)
 * 2. Collection item fields: exact text match against item field values
 *
 * Falls back to null when no match is found (caller should use text override path).
 */
export function matchElementToProp(
  element: HTMLElement,
  capsuleName: string,
  statementId: string,
  mergedProps: JsonRecord,
): CapsulePropContext | null {
  const text = normalizeText(element.textContent || '')
  if (!text) return null

  const lakebedKey = `${capsuleName}:${statementId}`
  // 1. Scalar string props — check ALL string props in merged data,
  //    not just schema scalars (heading/subheading are excluded from
  //    schema scalars but are valid inline edit targets).
  for (const key of stringPropKeys(mergedProps)) {
    const value = mergedProps[key]
    if (typeof value !== 'string') continue
    if (normalizeText(value) === text) {
      return {
        lakebedKey,
        capsuleName,
        statementId,
        propKey: key,
        kind: 'scalar',
      }
    }
  }

  // 2. Collection item fields
  for (const [propKey, items] of collectionPropEntries(mergedProps)) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (!isPlainObject(item)) continue

      for (const [fieldKey, fieldValue] of Object.entries(item)) {
        if (RESERVED_KEYS.has(fieldKey) || typeof fieldValue !== 'string') {
          continue
        }
        if (normalizeText(fieldValue) === text) {
          return {
            lakebedKey,
            capsuleName,
            statementId,
            propKey,
            index: i,
            fieldKey,
            kind: 'collection',
          }
        }
      }
    }
  }

  return null
}

// ─── Patch builder ──────────────────────────────────────────────────────────

/**
 * Build a Lakebed merge patch for a capsule prop edit.
 *
 * For scalars: `{ [propKey]: newValue }`
 * For collection items: `{ [propKey]: itemsWithEditedItem }`
 *
 * The caller must provide the current items array for collection edits
 * so we can patch the specific item + field without clobbering siblings.
 */
export function buildPropPatch(
  context: CapsulePropContext,
  newValue: string,
  currentData: JsonRecord,
): Partial<JsonRecord> {
  if (context.kind === 'scalar') {
    return { [context.propKey]: newValue }
  }

  // Collection item field edit
  const { propKey, index, fieldKey } = context
  if (index === undefined || !fieldKey) return {}

  const items = currentData[propKey]
  if (!Array.isArray(items)) return {}

  const patched = items.map((item, i) => {
    if (i !== index) return item
    if (!isPlainObject(item)) return item
    return { ...item, [fieldKey]: newValue }
  })

  return { [propKey]: patched }
}
