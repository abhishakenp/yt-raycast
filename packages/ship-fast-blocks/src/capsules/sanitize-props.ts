/**
 * Schema-driven prop sanitizer.
 *
 * Generated OpenUI programs are produced by LLMs and are frequently *almost*
 * right: a model may emit `blocks: null`, omit a required nested array, or hand
 * back a number where a string was expected. Capsule components render those
 * shapes with thousands of unguarded `.map()` / `.charAt()` calls, so a single
 * malformed nested value throws inside React and — because element error
 * boundaries do NOT recover during server `renderToString` — takes down the
 * entire page (the dreaded `openui-error` panel) in EVERY language.
 *
 * Rather than guard ~4.5k call sites across ~375 capsules, we coerce a
 * capsule's evaluated props against its own Zod schema once, centrally, in
 * `defineCapsule`. The contract is "best-effort repair, never throw":
 *
 *   - optional/default fields that can't be coerced are dropped, so the
 *     component's own rich defaults take over;
 *   - array items that fail their element schema are filtered out, so a single
 *     bad row never kills the whole list;
 *   - scalars are gently coerced (number/boolean -> string for string fields)
 *     to preserve content instead of discarding it;
 *   - anything the sanitizer doesn't understand passes through untouched.
 *
 * This is intentionally generic: it keys off the declared schema shape, never
 * off a component name, vertical, or brief.
 */

type ZodDef = {
  type?: string
  innerType?: { _zod?: { def?: ZodDef } }
  element?: { _zod?: { def?: ZodDef } }
  shape?: Record<string, { _zod?: { def?: ZodDef } }>
  options?: Array<{ _zod?: { def?: ZodDef } }>
  defaultValue?: unknown
  values?: unknown
}

type ZodLike = { _zod?: { def?: ZodDef }; parse?: (v: unknown) => unknown }

const defOf = (schema: unknown): ZodDef | undefined =>
  (schema as ZodLike | undefined)?._zod?.def

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

type Coerced = { ok: boolean; value: unknown }
const OK = (value: unknown): Coerced => ({ ok: true, value })
const FAIL: Coerced = { ok: false, value: undefined }

/** Keys whose schema is optional or has a default may be dropped safely. */
function isDroppableKey(schema: unknown): boolean {
  const def = defOf(schema)
  return def?.type === 'optional' || def?.type === 'default'
}

/**
 * Coerce `value` to satisfy `schema`. Returns `{ ok: false }` when the value is
 * unrepairable for a *required* slot, so the caller (array/object) can drop it.
 * Never throws.
 */
function coerce(value: unknown, schema: unknown, depth: number): Coerced {
  if (depth > 12) return OK(value)
  const def = defOf(schema)
  if (!def?.type) return OK(value)

  switch (def.type) {
    case 'optional': {
      if (value === undefined || value === null) return OK(undefined)
      const inner = coerce(value, def.innerType, depth + 1)
      return inner.ok ? inner : OK(undefined)
    }
    case 'nullable': {
      if (value === null) return OK(null)
      if (value === undefined) return OK(null)
      const inner = coerce(value, def.innerType, depth + 1)
      return inner.ok ? inner : OK(null)
    }
    case 'default': {
      if (value === undefined) return OK(undefined) // let zod/component apply default
      const inner = coerce(value, def.innerType, depth + 1)
      return inner.ok ? inner : OK(undefined)
    }
    case 'catch':
    case 'readonly':
    case 'lazy':
      return coerce(value, def.innerType, depth + 1)

    case 'array': {
      if (value === undefined || value === null) return OK([])
      if (!Array.isArray(value)) return FAIL
      const out: unknown[] = []
      for (const item of value) {
        const res = coerce(item, def.element, depth + 1)
        if (res.ok && res.value !== undefined) out.push(res.value)
      }
      return OK(out)
    }

    case 'object': {
      if (!isPlainObject(value)) return FAIL
      const shape = def.shape ?? {}
      const out: Record<string, unknown> = { ...value }
      for (const [key, childSchema] of Object.entries(shape)) {
        const res = coerce(value[key], childSchema, depth + 1)
        if (res.ok) {
          if (res.value === undefined) delete out[key]
          else out[key] = res.value
        } else if (isDroppableKey(childSchema)) {
          delete out[key]
        } else {
          // A required field is missing or unrepairable -> this object is
          // structurally broken; let the parent drop it (or, at the top level,
          // fall back to the original props in sanitizeProps).
          return FAIL
        }
      }
      return OK(out)
    }

    case 'string': {
      if (typeof value === 'string') return OK(value)
      if (typeof value === 'number' && Number.isFinite(value))
        return OK(String(value))
      if (typeof value === 'boolean') return OK(String(value))
      return FAIL
    }
    case 'number': {
      if (typeof value === 'number' && Number.isFinite(value)) return OK(value)
      if (typeof value === 'string' && value.trim() !== '') {
        const n = Number(value)
        if (Number.isFinite(n)) return OK(n)
      }
      return FAIL
    }
    case 'boolean':
      return typeof value === 'boolean' ? OK(value) : FAIL

    case 'union': {
      for (const option of def.options ?? []) {
        const res = coerce(value, option, depth + 1)
        if (res.ok) return res
      }
      return FAIL
    }

    case 'enum':
    case 'literal': {
      // Membership is hard to introspect reliably across zod builds; keep the
      // value as-is rather than risk dropping valid content.
      return OK(value)
    }

    default:
      // record, tuple, any, unknown, custom, etc. — pass through untouched.
      return OK(value)
  }
}

/**
 * Sanitize a capsule's evaluated props against its Zod schema. Always returns a
 * usable props object; on any unexpected failure it returns the original props
 * so behaviour is never worse than before.
 */
export function sanitizeProps<T>(props: T, schema: unknown): T {
  try {
    if (!isPlainObject(props)) return props
    const res = coerce(props, schema, 0)
    if (res.ok && isPlainObject(res.value)) return res.value as T
    return props
  } catch {
    return props
  }
}
