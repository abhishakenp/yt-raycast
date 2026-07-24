// v3 engine — positional DSL parser. Transforms raw text into a structured site-plan.
import type {
  CustomOperation,
  CustomTable,
  FreeformDef,
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

/** Parse a @freeform block into a Section with a FreeformDef.
 *  Block format:
 *    @freeform rolename
 *    state: var1=initval var2=initval
 *    actions: action1→expr action2→expr
 *    layout: <div class="...">...</div>
 *    @endfreeform
 */
function parseFreeformBlock(role: string, lines: string[]): Section | null {
  if (role.length === 0) return null
  const state: Record<string, string> = {}
  const actions: Record<string, string> = {}
  let layout = ''

  for (const line of lines) {
    if (line.startsWith('state:')) {
      const rest = line.replace(/^state:\s*/, '').trim()
      for (const token of rest.split(/\s+/)) {
        const eqIdx = token.indexOf('=')
        if (eqIdx > 0) {
          const name = token.slice(0, eqIdx).trim()
          const val = token.slice(eqIdx + 1).trim()
          if (name.length > 0) state[name] = val
        }
      }
    } else if (line.startsWith('actions:')) {
      const rest = line.replace(/^actions:\s*/, '').trim()
      // Actions are comma-separated: inc→count+1, dec→count-1
      for (const token of rest.split(',')) {
        const arrowIdx = token.indexOf('→')
        if (arrowIdx > 0) {
          const name = token.slice(0, arrowIdx).trim()
          const expr = token.slice(arrowIdx + 1).trim()
          if (name.length > 0) actions[name] = expr
        }
      }
    } else if (line.startsWith('layout:')) {
      // Layout may span multiple lines — collect everything after "layout:"
      const rest = line.replace(/^layout:\s*/, '')
      layout = layout ? layout + '\n' + rest : rest
    } else if (layout.length > 0) {
      // Continuation of multi-line layout
      layout += '\n' + line
    }
  }

  if (layout.length === 0) return null
  const def: FreeformDef = { state, actions, layout }
  return { role, content: [], freeform: def }
}

/** Parse raw positional DSL text into a structured ParsedSitePlan.
 *  Strips <reasoning>...</reasoning> blocks (cognitive scaffolding phase) before
 *  parsing the DSL. The reasoning is not part of the site-plan — it primes the
 *  LLM's output quality, then the parser extracts the structured DSL after it.
 */
export function parseSitePlan(raw: string): ParsedSitePlan {
  // Strip reasoning blocks — the LLM emits <reasoning>...</reasoning> before
  // the DSL as cognitive scaffolding. Everything inside is discarded.
  const stripped = raw.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '').trim()
  const lines = stripped.split('\n')
  const sections: Section[] = []
  const pages: string[] = []
  const tables: CustomTable[] = []
  const operations: CustomOperation[] = []
  let kind = ''
  let brand: string | undefined
  let title: string | undefined
  let navLabels: Record<string, string> | undefined

  let kindSeen = false
  // Freeform block collection: when inside @freeform ... @endfreeform,
  // collect lines into a buffer keyed by the role name.
  let freeformRole: string | null = null
  let freeformBuf: string[] = []
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (line.length === 0) continue
    if (line.startsWith('#')) continue

    // ── Freeform block collection ────────────────────────────────────────
    if (freeformRole !== null) {
      if (line === '@endfreeform' || line.startsWith('@endfreeform')) {
        const def = parseFreeformBlock(freeformRole, freeformBuf)
        if (def) sections.push(def)
        freeformRole = null
        freeformBuf = []
        continue
      }
      freeformBuf.push(line)
      continue
    }
    if (line.startsWith('@freeform')) {
      freeformRole = line.replace(/^@freeform\s*/, '').trim()
      freeformBuf = []
      continue
    }

    // @type line (app vs website) — comes before kind
    if (line.startsWith('@type')) {
      // Parse but don't require — the presence of @freeform blocks determines app vs website
      continue
    }

    if (!kindSeen) {
      // Kind line (first non-@type, non-@freeform line).
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

    if (line.startsWith('@brand')) {
      const rest = line.replace(/^@brand\s*/, '').trim()
      if (rest.length > 0) brand = rest
      continue
    }

    if (line.startsWith('@title')) {
      const rest = line.replace(/^@title\s*/, '').trim()
      if (rest.length > 0) title = rest
      continue
    }

    if (line.startsWith('@nav')) {
      const rest = line.replace(/^@nav\s*/, '').trim()
      if (rest.length > 0) {
        navLabels = {}
        for (const token of rest.split(/\s+/)) {
          const colonIdx = token.indexOf(':')
          if (colonIdx > 0) {
            const pageId = token.slice(0, colonIdx).trim()
            const label = token.slice(colonIdx + 1).trim()
            if (pageId.length > 0 && label.length > 0) {
              navLabels[pageId] = label
            }
          }
        }
        if (Object.keys(navLabels).length === 0) navLabels = undefined
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

  const plan: ParsedSitePlan = { kind, sections, pages, tables, operations }
  if (brand) plan.brand = brand
  if (title) plan.title = title
  if (navLabels) plan.navLabels = navLabels
  return plan
}
