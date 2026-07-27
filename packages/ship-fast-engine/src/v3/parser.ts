// v3 engine — positional DSL parser. Transforms raw text into a structured site-plan.
import type {
  NestedGroup,
  NestedItem,
  ParsedSitePlan,
  Section,
} from './types.ts'

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

/** Parse a @svelte block into a Section with a SvelteBlockDef.
 *  Block format:
 *    @svelte rolename
 *    <script>...</script>
 *    <div>...</div>
 *    <style>...</style>
 *    @endsvelte
 *
 *  Everything between @svelte and @endsvelte is collected as raw Svelte 4 source.
 */
function parseSvelteBlock(role: string, lines: string[]): Section | null {
  if (role.length === 0) return null
  const source = lines.join('\n').trim()
  if (source.length === 0) return null
  return { role, content: [], svelte: { source } }
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
  let kind = ''
  let brand: string | undefined
  let title: string | undefined
  let navLabels: Record<string, string> | undefined

  let kindSeen = false
  // Svelte block collection: when inside @svelte ... @endsvelte,
  // collect raw lines as Svelte source.
  let svelteRole: string | null = null
  let svelteBuf: string[] = []
  for (const rawLine of lines) {
    // Inside a @svelte block — collect everything verbatim (no trimming
    // since Svelte source is whitespace-sensitive inside <script>/<style>).
    if (svelteRole !== null) {
      if (
        rawLine.trim() === '@endsvelte' ||
        rawLine.trim().startsWith('@endsvelte')
      ) {
        const def = parseSvelteBlock(svelteRole, svelteBuf)
        if (def) sections.push(def)
        svelteRole = null
        svelteBuf = []
        continue
      }
      svelteBuf.push(rawLine)
      continue
    }
    if (rawLine.trim().startsWith('@svelte')) {
      svelteRole = rawLine.replace(/^\s*@svelte\s*/, '').trim()
      svelteBuf = []
      continue
    }

    const line = rawLine.trim()
    if (line.length === 0) continue
    if (line.startsWith('#')) continue

    // @type line (app vs website) — comes before kind
    if (line.startsWith('@type')) {
      continue
    }

    if (!kindSeen) {
      // Kind line (first non-@type, non-@svelte line).
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

    // Section line — but only if it starts with a role token (alphabetic-ish).
    const firstChar = line[0] ?? ''
    if (/[A-Za-z_]/.test(firstChar)) {
      sections.push(parseSectionLine(line))
      continue
    }

    // Unknown line shape: skip silently.
  }

  const plan: ParsedSitePlan = { kind, sections, pages }
  if (brand) plan.brand = brand
  if (title) plan.title = title
  if (navLabels) plan.navLabels = navLabels
  return plan
}
