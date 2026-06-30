// v3 engine — positional DSL parser. Transforms raw text into a structured site-plan.
import type {
  CustomOperation,
  CustomTable,
  MacroType,
  NestedGroup,
  NestedItem,
  ParsedSitePlan,
  Section,
} from './types.ts'

const MACRO_TYPES: ReadonlySet<MacroType> = new Set([
  'collection',
  'cart',
  'submission',
  'search',
  'favorites',
  'auth',
])

/** Parse a single nested-group value (`groupName>item~field~field^item~field`). */
function parseNestedValue(value: string): NestedGroup | null {
  const gt = value.indexOf('>')
  if (gt === -1) return null
  const name = value.slice(0, gt).trim()
  const itemsString = value.slice(gt + 1)
  const itemStrings = itemsString.split('^')
  const items: NestedItem[] = []
  for (const itemStr of itemStrings) {
    const trimmed = itemStr.trim()
    if (trimmed.length === 0) continue
    const fields = trimmed.split('~').map((f) => f.trim())
    items.push({ fields })
  }
  if (name.length === 0 && items.length === 0) return null
  return { name, items }
}

/**
 * Parse a single section line into a Section.
 * Format: `role value1|value2|...` where a value containing `>` is a nested group.
 */
export function parseSectionLine(line: string): Section {
  const trimmed = line.trim()
  // role = first whitespace-delimited token; remainder = rest after first gap.
  const spaceIdx = trimmed.search(/\s/)
  let role: string
  let remainder: string
  if (spaceIdx === -1) {
    role = trimmed
    remainder = ''
  } else {
    role = trimmed.slice(0, spaceIdx).trim()
    remainder = trimmed.slice(spaceIdx).trim()
  }

  const content: string[] = []
  const nested: NestedGroup[] = []

  if (remainder.length > 0) {
    // Split by | but NOT inside [...] brackets (LLM may use | inside array values).
    const parts: string[] = []
    let depth = 0
    let current = ''
    for (const ch of remainder) {
      if (ch === '[') {
        depth++
        current += ch
      } else if (ch === ']') {
        depth = Math.max(0, depth - 1)
        current += ch
      } else if (ch === '|' && depth === 0) {
        parts.push(current)
        current = ''
      } else current += ch
    }
    if (current) parts.push(current)

    for (const part of parts) {
      const v = part.trim()
      if (v.includes('>')) {
        const group = parseNestedValue(v)
        if (group) nested.push(group)
        else content.push(v)
      } else {
        content.push(v)
      }
    }
  }

  const section: Section = { role, content }
  if (nested.length > 0) section.nested = nested
  return section
}

/** Parse a `+` custom data-model line into either a CustomTable or CustomOperation. */
function parsePlusLine(line: string): CustomTable | CustomOperation | null {
  const body = line.replace(/^\+\s*/, '').trim()
  if (body.length === 0) return null
  const tokens = body.split(/\s+/)
  if (tokens.length < 2) return null

  // Operation: `+ opName macroType tableName [key]` — 2nd token is a MacroType.
  if (MACRO_TYPES.has(tokens[1] as MacroType)) {
    const macroType = tokens[1] as MacroType
    const name = tokens[0]
    const table = tokens[2] ?? ''
    if (table.length === 0) return null
    const op: CustomOperation = { name, macroType, table }
    if (tokens[3] !== undefined && tokens[3].length > 0) op.key = tokens[3]
    return op
  }

  // Table: `+ tableName field1 field2 [+]` — trailing `+` marks seeded.
  let seeded = false
  let fields = tokens.slice(1)
  if (fields.length > 0 && fields[fields.length - 1] === '+') {
    seeded = true
    fields = fields.slice(0, -1)
  }
  if (fields.length === 0) return null
  const table: CustomTable = { name: tokens[0], fields, seeded }
  return table
}

/** Parse raw positional DSL text into a structured ParsedSitePlan. */
export function parseSitePlan(raw: string): ParsedSitePlan {
  const lines = raw.split('\n')
  const sections: Section[] = []
  const pages: string[] = []
  const tables: CustomTable[] = []
  const operations: CustomOperation[] = []
  let kind = ''

  let kindSeen = false
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (line.length === 0) continue
    if (line.startsWith('#')) continue

    if (!kindSeen) {
      // Line 1 = kind (one word).
      kind = line.split(/\s+/)[0] ?? ''
      kindSeen = true
      continue
    }

    if (line.startsWith('@pages')) {
      const rest = line.replace(/^@pages\s*/, '').trim()
      if (rest.length > 0) {
        for (const p of rest.split(/\s+/)) {
          if (p.length > 0) pages.push(p)
        }
      }
      continue
    }

    if (line.startsWith('+')) {
      const parsed = parsePlusLine(line)
      if (parsed) {
        if ('macroType' in parsed) operations.push(parsed)
        else tables.push(parsed)
      }
      continue
    }

    // Section line — but only if it starts with a role token (alphabetic-ish).
    const firstChar = line[0] ?? ''
    if (/[A-Za-z_]/.test(firstChar)) {
      sections.push(parseSectionLine(line))
      continue
    }

    // Unknown line shape: skip silently.
  }

  return { kind, sections, pages, tables, operations }
}
