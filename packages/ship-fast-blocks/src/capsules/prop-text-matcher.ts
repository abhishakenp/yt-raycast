import { allCapsules } from '../library'
import {
  introspectCapsuleSchema,
  hasContextInfo,
} from './prop-schema-introspect'
import type { CapsuleSchemaInfo } from './prop-schema-introspect'
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

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  Boolean(v) && typeof v === 'object' && !Array.isArray(v)

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

const lookupSchema = (capsuleName: string): CapsuleSchemaInfo | null => {
  const capsule = allCapsules.find((c) => c.client.name === capsuleName)
  if (!capsule) return null
  const propsSchema = capsule.client.props
  if (!propsSchema) return null
  const info = introspectCapsuleSchema(propsSchema)
  return hasContextInfo(info) ? info : null
}

/** All string prop keys from merged props, excluding reserved/infrastructure keys. */
const stringPropKeys = (mergedProps: JsonRecord): string[] =>
  Object.entries(mergedProps)
    .filter(
      ([key, value]) =>
        !RESERVED_KEYS.has(key) && typeof value === 'string' && value.trim(),
    )
    .map(([key]) => key)

// ─── Matching ───────────────────────────────────────────────────────────────

const normalizeText = (text: string): string => text.trim().replace(/\s+/g, ' ')

/**
 * Match a clicked element's text content to a specific capsule prop.
 *
 * Strategy:
 * 1. Scalar string props: exact text match (element.textContent === prop value)
 * 2. Collection item fields: exact text match against item field values
 *
 * Falls back to null when no match is found (caller should use text override path).
 */
export const matchElementToProp = (
  element: HTMLElement,
  capsuleName: string,
  statementId: string,
  mergedProps: JsonRecord,
): CapsulePropContext | null => {
  const text = normalizeText(element.textContent || '')
  if (!text) return null

  const lakebedKey = `${capsuleName}:${statementId}`
  const schema = lookupSchema(capsuleName)

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
  if (schema) {
    for (const collection of schema.collections) {
      const items = mergedProps[collection.key]
      if (!Array.isArray(items)) continue

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (!isPlainObject(item)) continue

        for (const field of collection.itemFields) {
          if (field.type !== 'string') continue
          const fieldValue = item[field.key]
          if (typeof fieldValue !== 'string') continue
          if (normalizeText(fieldValue) === text) {
            return {
              lakebedKey,
              capsuleName,
              statementId,
              propKey: collection.key,
              index: i,
              fieldKey: field.key,
              kind: 'collection',
            }
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
export const buildPropPatch = (
  context: CapsulePropContext,
  newValue: string,
  currentData: JsonRecord,
): Partial<JsonRecord> => {
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
