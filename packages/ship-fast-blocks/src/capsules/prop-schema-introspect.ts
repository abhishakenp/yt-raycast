/**
 * Schema-driven capsule prop introspection.
 *
 * Reads a capsule's zod/v4 props schema and classifies each prop into
 * collections (z.array(z.object(...))), variants (z.enum / z.union of
 * literals / z.boolean), or scalars (string / number). This is the engine
 * that lets the inline editor render capsule-specific controls — add/remove
 * gallery images, switch layout variants, edit pricing tiers — without any
 * per-capsule code.
 *
 * Uses the same `_zod.def` introspection pattern as `sanitize-props.ts`.
 * Generic across every capsule — never name-specific.
 */

// ─── Zod internal shape ─────────────────────────────────────────────────────

type ZodDef = {
  type?: string
  innerType?: ZodLike
  element?: ZodLike
  shape?: Record<string, ZodLike>
  options?: ZodLike[]
  defaultValue?: unknown
  values?: unknown
  entries?: Record<string, unknown>
}

type ZodLike = { _zod?: { def?: ZodDef } }

const defOf = (schema: unknown): ZodDef | undefined =>
  (schema as ZodLike | undefined)?._zod?.def

// ─── Unwrapping ─────────────────────────────────────────────────────────────

/** Follow optional/nullable/default/catch/readonly/lazy innerType chain
 *  to reach the core schema type. */
const unwrap = (schema: unknown): unknown => {
  let current = schema
  let depth = 0
  while (depth < 16) {
    const def = defOf(current)
    if (!def) return current
    switch (def.type) {
      case 'optional':
      case 'nullable':
      case 'default':
      case 'catch':
      case 'readonly':
      case 'lazy':
        current = def.innerType
        if (!current) return current
        break
      default:
        return current
    }
    depth++
  }
  return current
}

/** Get the core zod type string after unwrapping wrappers. */
const coreType = (schema: unknown): string | undefined =>
  defOf(unwrap(schema))?.type

// ─── Literal / enum value extraction ────────────────────────────────────────

/** Extract the literal value from a z.literal schema.
 *  zod/v4 stores literal values as `values: [value]` (an array). */
const literalValue = (
  schema: unknown,
): string | number | boolean | undefined => {
  const def = defOf(schema)
  if (def?.type !== 'literal') return undefined
  const vals = def.values
  // zod/v4: values is an array containing the literal value
  if (Array.isArray(vals) && vals.length > 0) {
    const v = vals[0]
    if (
      typeof v === 'string' ||
      typeof v === 'number' ||
      typeof v === 'boolean'
    )
      return v
  }
  // fallback: direct value
  if (
    typeof vals === 'string' ||
    typeof vals === 'number' ||
    typeof vals === 'boolean'
  )
    return vals
  return undefined
}

/** Extract all option values from a z.enum schema.
 *  zod/v4 stores enum values in `entries` as a Record<string, string>. */
const enumValues = (schema: unknown): (string | number | boolean)[] => {
  const def = defOf(schema)
  if (!def) return []
  if (def.type === 'enum') {
    // zod/v4: values stored in `entries` as { key: value }
    if (def.entries && typeof def.entries === 'object') {
      return Object.values(def.entries) as (string | number | boolean)[]
    }
    // fallback: `values` array
    const vals = def.values
    if (Array.isArray(vals)) return vals as (string | number | boolean)[]
    if (vals && typeof vals === 'object') {
      return Object.values(vals) as (string | number | boolean)[]
    }
  }
  return []
}

/** Check if a union's options are all literals. If so, return their values. */
const unionLiteralValues = (
  schema: unknown,
): (string | number | boolean)[] | null => {
  const def = defOf(schema)
  if (def?.type !== 'union') return null
  const options = def.options ?? []
  if (options.length === 0) return null
  const values: (string | number | boolean)[] = []
  for (const option of options) {
    const unwrapped = unwrap(option)
    const optDef = defOf(unwrapped)
    if (optDef?.type === 'literal') {
      const v = literalValue(unwrapped)
      if (v !== undefined) values.push(v)
      else return null
    } else {
      return null
    }
  }
  return values.length > 0 ? values : null
}

// ─── Public types ───────────────────────────────────────────────────────────

export type CollectionFieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array-string'
  | 'unknown'

export type CollectionField = {
  key: string
  type: CollectionFieldType
  optional: boolean
}

export type CollectionProp = {
  key: string
  itemFields: CollectionField[]
}

export type VariantOption = {
  value: string | number | boolean
  label: string
}

export type VariantProp = {
  key: string
  options: VariantOption[]
}

export type ScalarProp = {
  key: string
  type: 'string' | 'number' | 'boolean'
  optional: boolean
}

export type CapsuleSchemaInfo = {
  collections: CollectionProp[]
  variants: VariantProp[]
  scalars: ScalarProp[]
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Keys that are infrastructure, not user-editable content. */
const EXCLUDED_KEYS = new Set(['className'])

/** Heading-like keys already handled by inline text editing. */
const HEADING_KEYS = new Set(['heading', 'subheading', 'description'])

const isOptional = (schema: unknown): boolean => {
  const def = defOf(schema)
  return def?.type === 'optional' || def?.type === 'default'
}

/** Classify a field inside a collection item object. */
const classifyCollectionField = (
  key: string,
  schema: unknown,
): CollectionField => {
  const optional = isOptional(schema)
  const unwrapped = unwrap(schema)
  const type = coreType(unwrapped)

  if (type === 'string') {
    return { key, type: 'string', optional }
  }
  if (type === 'number') {
    return { key, type: 'number', optional }
  }
  if (type === 'boolean') {
    return { key, type: 'boolean', optional }
  }
  // array of strings (e.g. pricing tier features)
  if (type === 'array') {
    const elementDef = defOf(defOf(unwrapped)?.element)
    const elementType = elementDef?.type
    if (elementType === 'string') {
      return { key, type: 'array-string', optional }
    }
  }
  return { key, type: 'unknown', optional }
}

/** Build a variant option label from a value. */
const optionLabel = (value: string | number | boolean): string => {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

/** Build a variant prop from option values. */
const makeVariant = (
  key: string,
  values: (string | number | boolean)[],
): VariantProp => ({
  key,
  options: values.map((value) => ({
    value,
    label: optionLabel(value),
  })),
})

// ─── Main introspection function ────────────────────────────────────────────

/**
 * Introspect a capsule's zod/v4 props schema and classify each prop.
 *
 * Returns collections (array-of-object props with their item field shapes),
 * variants (enum/union-of-literals/boolean props with option lists), and
 * scalars (string/number props). Excludes `className` and heading-like keys
 * from scalars (those are handled by inline text editing).
 */
export const introspectCapsuleSchema = (
  propsSchema: unknown,
): CapsuleSchemaInfo => {
  const result: CapsuleSchemaInfo = {
    collections: [],
    variants: [],
    scalars: [],
  }

  const def = defOf(propsSchema)
  if (!def || def.type !== 'object' || !def.shape) return result

  for (const [key, fieldSchema] of Object.entries(def.shape)) {
    if (EXCLUDED_KEYS.has(key)) continue

    const unwrapped = unwrap(fieldSchema)
    const type = coreType(unwrapped)

    // Collection: array of objects
    if (type === 'array') {
      const arrayDef = defOf(unwrapped)
      const elementSchema = arrayDef?.element
      const elementType = coreType(elementSchema)
      if (elementType === 'object') {
        const elementDef = defOf(elementSchema)
        const itemShape = elementDef?.shape ?? {}
        const itemFields: CollectionField[] = Object.entries(itemShape)
          .filter(([fieldKey]) => !EXCLUDED_KEYS.has(fieldKey))
          .map(([fieldKey, itemFieldSchema]) =>
            classifyCollectionField(fieldKey, itemFieldSchema),
          )
        result.collections.push({ key, itemFields })
        continue
      }
      // array of strings is not a collection (it's a sub-field of a collection item)
      continue
    }

    // Variant: enum
    if (type === 'enum') {
      const values = enumValues(unwrapped)
      if (values.length > 0) {
        result.variants.push(makeVariant(key, values))
      }
      continue
    }

    // Variant: union of literals
    if (type === 'union') {
      const values = unionLiteralValues(unwrapped)
      if (values) {
        result.variants.push(makeVariant(key, values))
      }
      continue
    }

    // Variant: boolean
    if (type === 'boolean') {
      result.variants.push(makeVariant(key, [true, false]))
      continue
    }

    // Scalar: string
    if (type === 'string') {
      if (!HEADING_KEYS.has(key)) {
        result.scalars.push({
          key,
          type: 'string',
          optional: isOptional(fieldSchema),
        })
      }
      continue
    }

    // Scalar: number
    if (type === 'number') {
      result.scalars.push({
        key,
        type: 'number',
        optional: isOptional(fieldSchema),
      })
      continue
    }
  }

  return result
}

// ─── Default item creation ──────────────────────────────────────────────────

/**
 * Create a default empty item for a collection based on its field types.
 * Strings default to empty string, numbers to 0, booleans to false,
 * array-strings to empty array. Optional fields are included with defaults
 * so the form shows all fields.
 */
export const createDefaultItem = (
  collection: CollectionProp,
): Record<string, unknown> => {
  const item: Record<string, unknown> = {}
  for (const field of collection.itemFields) {
    switch (field.type) {
      case 'string':
        item[field.key] = ''
        break
      case 'number':
        item[field.key] = 0
        break
      case 'boolean':
        item[field.key] = false
        break
      case 'array-string':
        item[field.key] = []
        break
      default:
        // unknown — leave undefined
        break
    }
  }
  return item
}

// ─── Utility ────────────────────────────────────────────────────────────────

/** Returns true if the schema info has any editable content (collections,
 *  variants, or non-heading scalars). */
export const hasContextInfo = (info: CapsuleSchemaInfo): boolean =>
  info.collections.length > 0 ||
  info.variants.length > 0 ||
  info.scalars.length > 0
