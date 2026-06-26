import componentSpec from './generated/component-spec.json'

// Pure, dependency-light helpers that read the generated OpenUI component spec
// (signatures + descriptions) and synthesize audit-valid positional calls. This
// lets the generator support arbitrary categories without hand-written fallbacks:
// any component whose signature we can parse can be filled with type-correct,
// non-empty placeholder content that survives the real OpenUI parser audit.
//
// The spec is emitted by `@openuidev/cli generate --json-schema`
// (regenerate via `pnpm genui:spec`). No React deps — safe on the server.

type ComponentSpecEntry = { signature?: string; description?: string }
type ComponentSpec = { components?: Record<string, ComponentSpecEntry> }

const COMPONENTS: Record<string, ComponentSpecEntry> =
  (componentSpec as ComponentSpec).components ?? {}

export type SynthesisContext = {
  brand: string
  nav: string[]
  topic: string
  pageLabel: string
}

/**
 * Raw signature string for a component, or null when the component is absent
 * from the generated spec (e.g. AuthKimiPage).
 */
export function getComponentSignature(name: string): string | null {
  const entry = COMPONENTS[name]
  if (!entry || typeof entry.signature !== 'string') return null
  return entry.signature
}

// ---------------------------------------------------------------------------
// Depth-aware comma splitting
// ---------------------------------------------------------------------------

/**
 * Split `body` on top-level commas only — commas inside (), {}, [] or quoted
 * strings are ignored. Used for both the argument list and object/union fields.
 */
function splitTopLevel(body: string): string[] {
  const parts: string[] = []
  let depthParen = 0
  let depthBrace = 0
  let depthBracket = 0
  let inString = false
  let stringQuote = ''
  let current = ''

  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i]
    if (inString) {
      current += ch
      if (ch === '\\') {
        // copy the escaped char verbatim
        i += 1
        if (i < body.length) current += body[i]
        continue
      }
      if (ch === stringQuote) inString = false
      continue
    }
    if (ch === '"' || ch === "'") {
      inString = true
      stringQuote = ch
      current += ch
      continue
    }
    if (ch === '(') depthParen += 1
    else if (ch === ')') depthParen -= 1
    else if (ch === '{') depthBrace += 1
    else if (ch === '}') depthBrace -= 1
    else if (ch === '[') depthBracket += 1
    else if (ch === ']') depthBracket -= 1

    if (
      ch === ',' &&
      depthParen === 0 &&
      depthBrace === 0 &&
      depthBracket === 0
    ) {
      parts.push(current.trim())
      current = ''
      continue
    }
    current += ch
  }
  if (current.trim().length > 0) parts.push(current.trim())
  return parts
}

/** Extract the parenthesized argument body from a `Name(...)` signature. */
function signatureBody(signature: string): string | null {
  const open = signature.indexOf('(')
  if (open < 0) return null
  // Match the closing paren that balances the first open paren.
  let depth = 0
  for (let i = open; i < signature.length; i += 1) {
    const ch = signature[i]
    if (ch === '(') depth += 1
    else if (ch === ')') {
      depth -= 1
      if (depth === 0) return signature.slice(open + 1, i)
    }
  }
  return signature.slice(open + 1)
}

/** Split a `name?: type` field into `{ name, type }`. */
function splitField(field: string): { name: string; type: string } | null {
  // The colon that separates name from type is the first top-level colon
  // (object literals never appear before it in a field declaration).
  let depthBrace = 0
  let depthBracket = 0
  let depthParen = 0
  let inString = false
  let stringQuote = ''
  for (let i = 0; i < field.length; i += 1) {
    const ch = field[i]
    if (inString) {
      if (ch === '\\') {
        i += 1
        continue
      }
      if (ch === stringQuote) inString = false
      continue
    }
    if (ch === '"' || ch === "'") {
      inString = true
      stringQuote = ch
      continue
    }
    if (ch === '{') depthBrace += 1
    else if (ch === '}') depthBrace -= 1
    else if (ch === '[') depthBracket += 1
    else if (ch === ']') depthBracket -= 1
    else if (ch === '(') depthParen += 1
    else if (ch === ')') depthParen -= 1
    else if (
      ch === ':' &&
      depthBrace === 0 &&
      depthBracket === 0 &&
      depthParen === 0
    ) {
      const rawName = field.slice(0, i).trim().replace(/\?$/, '')
      const type = field.slice(i + 1).trim()
      if (!rawName) return null
      return { name: rawName, type }
    }
  }
  // No type annotation — treat the whole thing as a name with unknown type.
  const bareName = field.trim().replace(/\?$/, '')
  if (!bareName) return null
  return { name: bareName, type: '' }
}

// ---------------------------------------------------------------------------
// Top-level argument names
// ---------------------------------------------------------------------------

/**
 * Ordered top-level argument names parsed from a component signature, with a
 * trailing cosmetic `className` dropped. Returns [] when the signature is
 * absent.
 */
export function topLevelArgNames(name: string): string[] {
  const signature = getComponentSignature(name)
  if (signature === null) return []
  const body = signatureBody(signature)
  if (body === null) return []
  const names = splitTopLevel(body)
    .map((field) => splitField(field)?.name)
    .filter((argName): argName is string => Boolean(argName))
  if (names.length > 0 && names[names.length - 1] === 'className') {
    names.pop()
  }
  return names
}

/** Top-level args as {name, type} pairs (className dropped). */
export function topLevelArgs(name: string): { name: string; type: string }[] {
  const signature = getComponentSignature(name)
  if (signature === null) return []
  const body = signatureBody(signature)
  if (body === null) return []
  const fields = splitTopLevel(body)
    .map((field) => splitField(field))
    .filter((f): f is { name: string; type: string } => Boolean(f))
  if (fields.length > 0 && fields[fields.length - 1].name === 'className') {
    fields.pop()
  }
  return fields
}

/** Top-level field names whose type is an array — the editable "collections". */
export function arrayFieldNames(name: string): string[] {
  return topLevelArgs(name)
    .filter(
      (f) =>
        f.name !== 'brand' && f.name !== 'nav' && /\]\s*$/.test(f.type.trim()),
    )
    .map((f) => f.name)
}

// ---------------------------------------------------------------------------
// Value synthesis
// ---------------------------------------------------------------------------

const MAX_DEPTH = 6

/** A short human phrase derived from ctx, keyed on the field name. */
function phraseFor(fieldName: string, ctx: SynthesisContext): string {
  const lower = fieldName.toLowerCase()
  const subject = ctx.topic || ctx.brand
  if (/headline|heading|title|head/.test(lower)) {
    return `${ctx.brand} — ${ctx.pageLabel}`
  }
  if (
    /sub(heading|head|title)|lead|tagline|blurb|description|body|detail|about|note|paragraph|quote|answer|copy/.test(
      lower,
    )
  ) {
    return `${ctx.brand} brings ${subject} to life with a clear, focused experience for ${ctx.pageLabel}.`
  }
  if (/cta|button|submit|action|link|more|view|signin|sign/.test(lower)) {
    return 'Get started'
  }
  if (/eyebrow|kicker|chip|badge|label|cap|tag|pill/.test(lower)) {
    return ctx.pageLabel
  }
  if (/question/.test(lower)) {
    return `How does ${ctx.brand} work?`
  }
  if (/email/.test(lower)) {
    return 'hello@example.com'
  }
  if (/phone/.test(lower)) {
    return '+1 (555) 010-1234'
  }
  if (/address|location/.test(lower)) {
    return '100 Market Street, Suite 200'
  }
  if (/time|hours|date|cadence|period|when/.test(lower)) {
    return 'Mon–Fri, 9am–6pm'
  }
  if (/price|amount|value|cost/.test(lower)) {
    return '$49'
  }
  if (/name|brand|author|customer|founder/.test(lower)) {
    return ctx.brand
  }
  if (/role|meta|position/.test(lower)) {
    return 'Founder'
  }
  if (/placeholder/.test(lower)) {
    return 'Enter your email'
  }
  if (/alt|image|photo|reel|avatar|map|signature|logo/.test(lower)) {
    return `${ctx.brand} ${ctx.pageLabel} visual`
  }
  if (/icon|emoji/.test(lower)) {
    return '✦'
  }
  // Generic non-empty phrase that mentions the brand and field intent.
  const readable = fieldName.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
  return `${ctx.brand} ${readable}`
}

const ARRAY_PHRASE_VARIANTS = [
  'Strategy',
  'Design',
  'Launch',
  'Support',
  'Growth',
]

/** Parse a union of string literals like `"ai" | "user"` into its members. */
function unionLiterals(type: string): string[] | null {
  const trimmed = type.trim()
  // Must be a top-level union (| at depth 0) of quoted literals only.
  const members = splitTopLevelUnion(trimmed)
  if (members.length === 0) return null
  const literals: string[] = []
  for (const member of members) {
    const m = member.trim()
    const quoted = /^"([^"]*)"$/.exec(m) ?? /^'([^']*)'$/.exec(m)
    if (!quoted) return null
    literals.push(quoted[1])
  }
  return literals.length > 0 ? literals : null
}

/** Split a type on top-level `|`, respecting brackets and strings. */
function splitTopLevelUnion(type: string): string[] {
  const parts: string[] = []
  let depthBrace = 0
  let depthBracket = 0
  let depthParen = 0
  let inString = false
  let stringQuote = ''
  let current = ''
  for (let i = 0; i < type.length; i += 1) {
    const ch = type[i]
    if (inString) {
      current += ch
      if (ch === '\\') {
        i += 1
        if (i < type.length) current += type[i]
        continue
      }
      if (ch === stringQuote) inString = false
      continue
    }
    if (ch === '"' || ch === "'") {
      inString = true
      stringQuote = ch
      current += ch
      continue
    }
    if (ch === '{') depthBrace += 1
    else if (ch === '}') depthBrace -= 1
    else if (ch === '[') depthBracket += 1
    else if (ch === ']') depthBracket -= 1
    else if (ch === '(') depthParen += 1
    else if (ch === ')') depthParen -= 1
    if (
      ch === '|' &&
      depthBrace === 0 &&
      depthBracket === 0 &&
      depthParen === 0
    ) {
      parts.push(current.trim())
      current = ''
      continue
    }
    current += ch
  }
  if (current.trim().length > 0) parts.push(current.trim())
  return parts
}

/**
 * Synthesize a JS value matching `type`, for a field named `fieldName`, in the
 * given context. `depth` caps recursion. Returns a value that JSON.stringify
 * will serialize into valid OpenUI-lang.
 */
function synthesizeValue(
  type: string,
  fieldName: string,
  ctx: SynthesisContext,
  depth: number,
): unknown {
  const trimmed = type.trim()

  // Hard caps: stop recursing past MAX_DEPTH with a benign scalar.
  if (depth > MAX_DEPTH) {
    return phraseFor(fieldName, ctx)
  }

  if (trimmed === '') {
    return phraseFor(fieldName, ctx)
  }

  // Field literally named brand / nav take ctx values regardless of type.
  if (fieldName === 'brand') return ctx.brand
  if (fieldName === 'nav') return ctx.nav

  // Array types: `T[]` or `Array<T>`.
  if (trimmed.endsWith('[]')) {
    const inner = trimmed.slice(0, -2).trim()
    return synthesizeArray(inner, fieldName, ctx, depth)
  }
  const arrayGeneric = /^Array<([\s\S]+)>$/.exec(trimmed)
  if (arrayGeneric) {
    return synthesizeArray(arrayGeneric[1].trim(), fieldName, ctx, depth)
  }

  // Union of string literals: pick the first member.
  const literals = unionLiterals(trimmed)
  if (literals) {
    return literals[0]
  }

  // Object literal: `{ a?: T, b?: U }`.
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return synthesizeObject(trimmed, ctx, depth)
  }

  // Scalars.
  if (trimmed === 'string') return phraseFor(fieldName, ctx)
  if (trimmed === 'number') return 12
  if (trimmed === 'boolean') return true
  if (trimmed === 'string[]') {
    return synthesizeStringArray(fieldName, ctx)
  }

  // Plain top-level union of non-literals (e.g. `string | number`): take the
  // first branch and synthesize it.
  const unionParts = splitTopLevelUnion(trimmed)
  if (unionParts.length > 1) {
    return synthesizeValue(unionParts[0], fieldName, ctx, depth)
  }

  // Unknown/complex type — default to a non-empty phrase.
  return phraseFor(fieldName, ctx)
}

function synthesizeStringArray(
  _fieldName: string,
  ctx: SynthesisContext,
): string[] {
  return ARRAY_PHRASE_VARIANTS.slice(0, 4).map(
    (variant) => `${variant} for ${ctx.brand}`,
  )
}

function synthesizeArray(
  inner: string,
  fieldName: string,
  ctx: SynthesisContext,
  depth: number,
): unknown[] {
  const trimmed = inner.trim()
  // Array of objects → 3 synthesized objects.
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return [0, 1, 2].map(() => synthesizeObject(trimmed, ctx, depth + 1))
  }
  // Array of strings.
  if (trimmed === 'string') {
    return synthesizeStringArray(fieldName, ctx)
  }
  // Array of unions of literals → 3 entries of the first literal.
  const literals = unionLiterals(trimmed)
  if (literals) {
    return [literals[0], literals[0], literals[0]]
  }
  // Array of numbers / booleans / nested arrays → 3 synthesized members.
  return [0, 1, 2].map(() =>
    synthesizeValue(trimmed, fieldName, ctx, depth + 1),
  )
}

function synthesizeObject(
  type: string,
  ctx: SynthesisContext,
  depth: number,
): Record<string, unknown> {
  const inner = type.slice(1, -1).trim()
  const result: Record<string, unknown> = {}
  if (inner === '') return result
  for (const field of splitTopLevel(inner)) {
    const parsed = splitField(field)
    if (!parsed) continue
    result[parsed.name] = synthesizeValue(
      parsed.type,
      parsed.name,
      ctx,
      depth + 1,
    )
  }
  return result
}

// ---------------------------------------------------------------------------
// Whole-call synthesis
// ---------------------------------------------------------------------------

/**
 * Synthesize a positional OpenUI call body `Name(<json>, <json>, ...)` (no
 * `id = ` prefix) whose arguments match the component signature's types. Each
 * arg is a JSON literal, so every string is double-quoted and brackets balance —
 * valid OpenUI-lang. Returns null when the signature is absent.
 */
export function synthesizeComponentCall(
  name: string,
  ctx: SynthesisContext,
): string | null {
  const signature = getComponentSignature(name)
  if (signature === null) return null
  const body = signatureBody(signature)
  if (body === null) return `${name}()`

  const fields = splitTopLevel(body)
    .map((field) => splitField(field))
    .filter((field): field is { name: string; type: string } => Boolean(field))

  // Drop a trailing cosmetic className (matches topLevelArgNames behavior).
  if (fields.length > 0 && fields[fields.length - 1].name === 'className') {
    fields.pop()
  }

  const args = fields.map((field) => {
    if (field.name === 'brand') return JSON.stringify(ctx.brand)
    if (field.name === 'nav') return JSON.stringify(ctx.nav)
    const value = synthesizeValue(field.type, field.name, ctx, 1)
    return JSON.stringify(value)
  })

  return `${name}(${args.join(', ')})`
}

/**
 * Map a model-authored NAMED props object to a POSITIONAL OpenUI component call
 * using the spec signature's argument order. `brand`/`nav` are injected by the
 * engine. Strings/URLs are quoted and brackets balanced by JSON.stringify, so
 * the result is valid OpenUI by construction (no free-form text to mis-parse).
 * Returns null when the component has no signature in the spec.
 */
export function buildComponentCall(input: {
  component: string
  props: Record<string, unknown>
  brand: string
  nav: string[]
}): string | null {
  const order = topLevelArgNames(input.component)
  if (order.length === 0) return null
  const vals = order.map((field) => {
    if (field === 'brand') return JSON.stringify(input.brand)
    if (field === 'nav') return JSON.stringify(input.nav)
    return field in input.props ? JSON.stringify(input.props[field]) : undefined
  })
  // Trailing optional args may be omitted; gaps in the middle become explicit null.
  while (vals.length && vals[vals.length - 1] === undefined) vals.pop()
  const filled = vals.map((v) => (v === undefined ? 'null' : v))
  return `${input.component}(${filled.join(', ')})`
}
