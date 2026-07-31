/**
 * composition-parser.ts — parses the new generative DSL.
 *
 * New format (no kinds, no roles):
 *
 *   @design rounded-xl shadow-lg gradient:vibrant density:airy typography:display
 *   @brand Acme
 *   @title Acme — We ship fast
 *   @pages home about pricing contact
 *
 *   @section SplitHero
 *     badge Available now
 *     heading We craft [hl]experiences[/hl]
 *     primaryCta Start a project
 *     stats>120+ Projects^45 Awards^98% Retention
 *
 *   @section CardGrid
 *     @design rounded-none
 *     eyebrow Features
 *     heading Everything you need
 *     cards>Feature One~Does the thing^Feature Two~Does another
 *
 * The parser strips <reasoning> blocks, extracts @design/@brand/@title/@pages
 * metadata, and parses each @section into a CompositionSection with motif name,
 * props (key-value), nested groups, and optional per-section design override.
 */
import type { DesignIntent } from '../../../ship-fast-blocks/src/primitives/design-system.ts'
import {
  parseDesignLine,
  DEFAULT_DESIGN,
} from '../../../ship-fast-blocks/src/primitives/design-system.ts'
import {
  argTypeTree,
  type TypeTree,
  type TypeField,
} from './openui-signature.ts'

// ─── Types ───────────────────────────────────────────────────────────────

/**
 * A parsed DSL node — a recursive tree that mirrors the component spec's
 * type tree at arbitrary depth.
 *
 * - Leaf: a list of field values (strings) → mapped to object fields by type
 * - Branch: named children, each of which is a DslNode
 */
export interface DslNode {
  /** Field values for leaf nodes (e.g. ["Americano", "Double shot", "$4"]). */
  fields: string[]
  /** Named child groups for branch nodes (e.g. { items: DslNode, ... }). */
  children?: Record<string, DslNode>
  /** Items as separate field arrays (e.g. [["Americano","$4"], ["Cappuccino","$5"]]).
   * Preserves item boundaries so dslNodeToObjectArray doesn't misalign when
   * the LLM omits optional fields. */
  items?: string[][]
}

export interface CompositionSection {
  /** Motif name (e.g. "SplitHero", "CardGrid"). */
  motif: string
  /** Flat key-value props (e.g. { heading: "Hello", primaryCta: "Go" }). */
  props: Record<string, string>
  /** Nested groups parsed into DslNode trees, keyed by group name. */
  nested: Record<string, DslNode>
  /** Per-section design override (optional). */
  design?: DesignIntent
  /** Svelte block (LLM-generated interactive component). */
  svelte?: {
    source: string
  }
  /** Raw line number for error reporting. */
  line: number
  /** Page this section belongs to (default: "home"). Set by @page directive. */
  page: string
}

export interface ParsedComposition {
  /** Global design intent. */
  design: DesignIntent
  /** Brand name. */
  brand?: string
  /** Site title. */
  title?: string
  /** Page list (first is always "home"). */
  pages: string[]
  /** Nav labels: pageId → display label. */
  navLabels?: Record<string, string>
  /** Sections in order. */
  sections: CompositionSection[]
}

// ─── Parser ──────────────────────────────────────────────────────────────

/**
 * Parse raw DSL text into a ParsedComposition.
 * Strips <reasoning>...</reasoning> blocks before parsing.
 */
export function parseComposition(raw: string): ParsedComposition {
  const stripped = raw.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '').trim()

  const lines = stripped.split('\n')

  let design: DesignIntent = { ...DEFAULT_DESIGN }
  let brand: string | undefined
  let title: string | undefined
  let pages: string[] = []
  let navLabels: Record<string, string> | undefined
  const sections: CompositionSection[] = []

  let currentSection: CompositionSection | null = null
  let currentPage = 'home'

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    const line = rawLine.trim()

    if (line.length === 0) continue
    if (line.startsWith('#')) continue

    // ── Metadata lines ──────────────────────────────────────────────

    if (line.startsWith('@design')) {
      const parsed = parseDesignLine(line)
      if (currentSection) {
        // Per-section override
        currentSection.design = parsed
      } else {
        // Global
        design = parsed
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

    if (line.startsWith('@pages')) {
      const rest = line.replace(/^@pages\s*/, '').trim()
      if (rest.length > 0) {
        pages = rest.split(/\s+/).filter((p) => p.length > 0)
      }
      continue
    }

    if (line.startsWith('@nav')) {
      const rest = line.replace(/^@nav\s*/, '').trim()
      if (rest.length > 0) {
        navLabels = {}
        // Split on pageId:label pairs where label can contain spaces.
        // Pattern: word:rest-of-text-until-next-word:
        const navRegex = /(\w+):([^\s]+(?:\s+(?!\w+:)[^\s]+)*)/g
        let match: RegExpExecArray | null
        while ((match = navRegex.exec(rest)) !== null) {
          const pageId = match[1].trim()
          const label = match[2].trim()
          if (pageId.length > 0 && label.length > 0) {
            navLabels[pageId] = label
          }
        }
        if (Object.keys(navLabels).length === 0) navLabels = undefined
      }
      continue
    }

    // ── Page directive ──────────────────────────────────────────────

    if (line.startsWith('@page')) {
      // Flush previous section
      if (currentSection) sections.push(currentSection)
      currentSection = null
      const pageId = line.replace(/^@page\s*/, '').trim()
      if (pageId.length > 0) {
        currentPage = pageId
        // Ensure this page is in the pages list
        if (!pages.includes(pageId)) {
          pages.push(pageId)
        }
      }
      continue
    }

    // ── Section start ───────────────────────────────────────────────

    if (line.startsWith('@section')) {
      // Flush previous section
      if (currentSection) sections.push(currentSection)

      const motif = line.replace(/^@section\s*/, '').trim()
      if (motif.length === 0) {
        currentSection = null
        continue
      }
      currentSection = {
        motif,
        props: {},
        nested: {},
        line: i + 1,
        page: currentPage,
      }
      continue
    }

    // ── Section content (indented or after @section) ────────────────

    if (currentSection) {
      // @svelte block — multi-line Svelte component source
      if (line === '@svelte' || line.startsWith('@svelte ')) {
        const svelteLines: string[] = []
        // Collect indented lines until dedent or next directive
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j]
          const nextTrimmed = nextLine.trim()
          if (nextTrimmed.length === 0) {
            svelteLines.push('')
            continue
          }
          // Stop at next directive or dedented line
          if (
            nextTrimmed.startsWith('@') ||
            (!nextLine.startsWith(' ') && !nextLine.startsWith('\t'))
          ) {
            break
          }
          svelteLines.push(nextTrimmed)
          i = j
        }
        currentSection.svelte = {
          source: svelteLines.join('\n').trim(),
        }
        continue
      }

      // Check if this is a nested group (contains >)
      if (line.includes('>')) {
        const { name, node } = parseNestedLine(line)
        if (name && node) {
          currentSection.nested[name] = node
          continue
        }
      }

      // Key-value prop: "key value..." or "key: value..."
      const kvMatch = line.match(/^(\w+)\s*[:=]?\s*(.*)$/)
      if (kvMatch) {
        const key = kvMatch[1]
        const value = kvMatch[2].trim()
        if (key && value) {
          currentSection.props[key] = value
        }
        continue
      }
    }

    // Unknown line: skip silently
  }

  // Flush last section
  if (currentSection) sections.push(currentSection)

  // Ensure pages always has home
  if (pages.length === 0) pages = ['home']
  if (pages[0] !== 'home') pages.unshift('home')

  const result: ParsedComposition = { design, pages, sections }
  if (brand) result.brand = brand
  if (title) result.title = title
  if (navLabels) result.navLabels = navLabels
  return result
}

// ─── Recursive DSL parser (infinite depth) ───────────────────────────────

/**
 * DSL separator hierarchy (outermost → innermost):
 *   |  separates sibling groups at the same level
 *   >  separates a group name from its content (descends one level)
 *   ^  separates leaf items within a group
 *   ~  separates fields within a leaf item
 *
 * The parser recurses on `>` and `|` to build a DslNode tree of arbitrary depth.
 * Field names are NOT assigned here — that happens in dslNodeToValue() using
 * the component spec's type tree.
 */

/**
 * Parse a top-level nested line: `fieldName>content`
 * Returns the field name and the parsed DslNode tree.
 */
function parseNestedLine(line: string): { name: string; node: DslNode | null } {
  const gt = line.indexOf('>')
  if (gt === -1) return { name: '', node: null }
  const name = line.slice(0, gt).trim()
  const content = line.slice(gt + 1)
  const node = parseDslContent(content)
  return {
    name,
    node:
      node.fields.length > 0 ||
      (node.children && Object.keys(node.children).length > 0)
        ? node
        : null,
  }
}

/**
 * Parse DSL content into a DslNode.
 *
 * - Leaf: `item1~field~field^item2~field` → { fields: [...] }
 * - Branch: `GroupName>subContent|OtherGroup>subContent` → { children: {...} }
 *
 * For leaf items, `~` separates fields. If no `~` is found in an item, the
 * whole item is a single field. The type-driven mapper will handle splitting
 * later if needed (e.g. "120+ Projects" → value="120+", label="Projects").
 */
function parseDslContent(content: string): DslNode {
  if (content.includes('>')) {
    return parseBranchContent(content)
  }
  // Leaf: items separated by ^ or |, fields separated by ~
  // | is normally a group separator for two-level nesting, but in leaf context
  // (no > present), treat it as an item separator like ^ — the LLM often uses |
  // to separate items in one-level arrays (tiers, cells, columns, cards)
  const itemStrings = content.split(/[\^|]/) // split on ^ or |
  const fields: string[] = []
  const items: string[][] = []
  for (const itemStr of itemStrings) {
    const trimmed = itemStr.trim()
    if (trimmed.length === 0) continue
    const itemFields = trimmed.split('~').map((f) => f.trim())
    fields.push(...itemFields)
    items.push(itemFields)
  }
  return { fields, items }
}

/**
 * Parse branch content: `GroupName>subContent|OtherGroup>subContent`
 * Each `|` segment is a named child. The first `>` separates name from content.
 */
function parseBranchContent(content: string): DslNode {
  const segments = content.split('|')
  const children: Record<string, DslNode> = {}
  for (const segment of segments) {
    const trimmed = segment.trim()
    if (trimmed.length === 0) continue
    const gt = trimmed.indexOf('>')
    if (gt === -1) continue
    const childName = trimmed.slice(0, gt).trim()
    const childContent = trimmed.slice(gt + 1)
    children[childName] = parseDslContent(childContent)
  }
  return { fields: [], children }
}

// ─── Type-driven DSL → typed value mapper (infinite depth) ───────────────

/**
 * Convert a DslNode tree into a typed value using the component spec's TypeTree.
 * Recurses to arbitrary depth.
 */
export function dslNodeToValue(node: DslNode, typeTree: TypeTree): unknown {
  switch (typeTree.kind) {
    case 'primitive':
      if (node.fields.length >= 1)
        return coercePrimitive(node.fields[0], typeTree.tsType)
      return null
    case 'stringArray':
      if (node.fields.length === 0) return []
      // If a single field contains commas, split it (e.g. "Instagram, Twitter")
      if (node.fields.length === 1 && node.fields[0].includes(',')) {
        return node.fields[0]
          .split(',')
          .map((s) => stripHlTags(s.trim()))
          .filter((s) => s.length > 0)
      }
      return node.fields.map(stripHlTags)
    case 'objectArray':
      return dslNodeToObjectArray(node, typeTree.fields)
    case 'object':
      return dslNodeToObject(node, typeTree.fields)
    default:
      return null
  }
}

/**
 * Check if a string matches a TS string literal union type (e.g. "wide" | "tall" | "normal").
 * Returns the enum values if it's a literal union, or null otherwise.
 */
function extractEnumValues(tsType: string): string[] | null {
  // Match "val1" | "val2" | "val3"
  const match = tsType.match(/"[^"]+"\s*\|\s*"[^"]+"/)
  if (!match) return null
  const values = tsType.match(/"([^"]+)"/g)
  if (!values) return null
  return values.map((v) => v.replace(/"/g, ''))
}

/**
 * Find a later type field whose enum values match the given value.
 * Returns the index of the matching field, or -1 if no match.
 */
function findEnumMatch(
  typeFields: TypeField[],
  startIdx: number,
  value: string,
): number {
  for (let i = startIdx + 1; i < typeFields.length; i++) {
    const field = typeFields[i]
    if (field.type.kind !== 'primitive') continue
    const enumValues = extractEnumValues(field.type.tsType)
    if (enumValues && enumValues.includes(value)) return i
  }
  return -1
}

/**
 * Flatten deeply nested children (caused by LLM using > as a field separator)
 * back into items with ~-separated fields.
 *
 * When the LLM writes: cards>Title~Description>ImageAlt>ImageSrc^...
 * The parser creates nested children. This function walks the tree and collects
 * all leaf fields, treating child names that contain ~ as field separators.
 *
 * Also handles ^ appearing inside child names (when the LLM mixed ^ and >).
 */
function flattenNestedChildren(node: DslNode): string[][] {
  const items: string[][] = []
  function walk(n: DslNode, accumulated: string[]) {
    if (n.fields.length > 0 && !n.children) {
      items.push([...accumulated, ...n.fields])
      return
    }
    if (n.children) {
      for (const [childName, childNode] of Object.entries(n.children)) {
        // If the child name contains ^, it marks a boundary between items.
        // "field1~field2^field3~field4" means:
        //   - "field1~field2" completes the CURRENT item (push it)
        //   - "field3~field4" starts a NEW item that continues into childNode
        if (childName.includes('^')) {
          const parts = childName.split('^')
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i].trim()
            const partFields = part.includes('~')
              ? part.split('~').map((f) => f.trim())
              : [part]
            if (i === 0) {
              // First part — completes the current accumulated item
              items.push([...accumulated, ...partFields])
            } else {
              // Subsequent parts — start a NEW item, walk into childNode
              walk(childNode, [...partFields])
            }
          }
        } else if (childName.includes('~')) {
          // Child name has ~ — these are actually fields, not a group name
          const nameFields = childName.split('~').map((f) => f.trim())
          walk(childNode, [...accumulated, ...nameFields])
        } else {
          // Normal child name — it's a group name (for two-level nesting)
          walk(childNode, [...accumulated, childName])
        }
      }
    }
  }
  walk(node, [])
  return items
}

/**
 * Map a DslNode to an array of objects.
 *
 * Branch node (has children): each child name → first string field, child content → remaining fields.
 * Leaf node (no children): fields chunked by primitive field count, zipped to object fields.
 */
function dslNodeToObjectArray(
  node: DslNode,
  typeFields: TypeField[],
): unknown[] {
  if (node.children) {
    // Defensive: if the LLM used > as a field separator within items (e.g.
    // "cards>Title~Description>ImageAlt>ImageSrc^..."), the parser creates
    // deeply nested children whose names contain ~. Detect this and flatten
    // back into items with ~-separated fields.
    const childNames = Object.keys(node.children)
    const hasTildeInNames = childNames.some((n) => n.includes('~'))
    const hasDeepNesting = childNames.some((n) => {
      const child = node.children![n]
      return child.children && Object.keys(child.children).length > 0
    })
    if (hasTildeInNames || hasDeepNesting) {
      // Flatten the nested children into items
      const flatItems = flattenNestedChildren(node)
      if (flatItems.length > 0) {
        return flatItems.map((itemFields) => {
          const obj: Record<string, unknown> = {}
          let fieldIdx = 0
          for (let fi = 0; fi < typeFields.length; fi++) {
            const field = typeFields[fi]
            if (field.type.kind === 'primitive') {
              if (field.optional && fieldIdx < itemFields.length) {
                const laterEnum = findEnumMatch(
                  typeFields,
                  fi,
                  itemFields[fieldIdx],
                )
                if (laterEnum !== -1) continue
              }
              const value = itemFields[fieldIdx]
              if (value !== undefined)
                obj[field.name] = coercePrimitive(value, field.type.tsType)
              fieldIdx++
            } else if (field.type.kind === 'stringArray') {
              const rawValue = itemFields[fieldIdx]
              if (rawValue !== undefined) {
                obj[field.name] = rawValue.includes(',')
                  ? rawValue
                      .split(',')
                      .map((s) => stripHlTags(s.trim()))
                      .filter((s) => s.length > 0)
                  : [stripHlTags(rawValue)]
              } else {
                obj[field.name] = []
              }
              fieldIdx++
            }
          }
          return obj
        })
      }
    }
    return Object.entries(node.children).map(([childName, childNode]) => {
      const obj: Record<string, unknown> = {}
      const nameField = typeFields.find(
        (f) => f.type.kind === 'primitive' && f.type.tsType === 'string',
      )
      if (nameField) obj[nameField.name] = stripHlTags(childName)
      for (const field of typeFields) {
        if (field.name === nameField?.name) continue
        obj[field.name] = dslNodeToValue(childNode, field.type)
      }
      return obj
    })
  }
  // If we have items (preserved item boundaries), map each item's fields
  // to the type's fields. This handles missing optional fields correctly
  // because each item is mapped independently rather than chunked from a flat array.
  if (node.items && node.items.length > 0) {
    return node.items.map((itemFields) => {
      const obj: Record<string, unknown> = {}
      let fieldIdx = 0
      for (let fi = 0; fi < typeFields.length; fi++) {
        const field = typeFields[fi]
        if (field.type.kind === 'primitive') {
          // Check if the current value matches a later field's enum type.
          // If so, this optional field was likely omitted by the LLM — skip it.
          if (field.optional && fieldIdx < itemFields.length) {
            const laterEnum = findEnumMatch(
              typeFields,
              fi,
              itemFields[fieldIdx],
            )
            if (laterEnum !== -1) {
              // Skip this optional field — the value belongs to the enum field
              continue
            }
          }
          const value = itemFields[fieldIdx]
          if (value !== undefined)
            obj[field.name] = coercePrimitive(value, field.type.tsType)
          fieldIdx++
        } else if (field.type.kind === 'stringArray') {
          const rawValue = itemFields[fieldIdx]
          if (rawValue !== undefined) {
            obj[field.name] = rawValue.includes(',')
              ? rawValue
                  .split(',')
                  .map((s) => s.trim())
                  .filter((s) => s.length > 0)
              : [rawValue]
          } else {
            obj[field.name] = []
          }
          fieldIdx++
        }
      }
      return obj
    })
  }
  // Fallback: chunk flat fields by total field count (primitive + stringArray)
  const flatFields = typeFields.filter(
    (f) => f.type.kind === 'primitive' || f.type.kind === 'stringArray',
  )
  const fieldCount = flatFields.length
  let workingFields = node.fields
  if (fieldCount > 1 && workingFields.length < fieldCount) {
    workingFields = splitFieldsHeuristically(workingFields, fieldCount)
  }
  const objects: Record<string, unknown>[] = []
  for (let i = 0; i < workingFields.length; i += fieldCount) {
    const obj: Record<string, unknown> = {}
    let fieldIdx = 0
    for (const field of typeFields) {
      if (field.type.kind === 'primitive') {
        const value = workingFields[i + fieldIdx]
        if (value !== undefined)
          obj[field.name] = coercePrimitive(value, field.type.tsType)
        fieldIdx++
      } else if (field.type.kind === 'stringArray') {
        const rawValue = workingFields[i + fieldIdx]
        if (rawValue !== undefined) {
          obj[field.name] = rawValue.includes(',')
            ? rawValue
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
            : [rawValue]
        } else {
          obj[field.name] = []
        }
        fieldIdx++
      }
    }
    objects.push(obj)
  }
  return objects
}

function dslNodeToObject(
  node: DslNode,
  typeFields: TypeField[],
): Record<string, unknown> {
  const obj: Record<string, unknown> = {}
  let fieldIdx = 0
  for (const field of typeFields) {
    if (field.type.kind === 'primitive') {
      const value = node.fields[fieldIdx]
      if (value !== undefined)
        obj[field.name] = coercePrimitive(value, field.type.tsType)
      fieldIdx++
    } else if (field.type.kind === 'stringArray') {
      const rawValue = node.fields[fieldIdx]
      if (rawValue !== undefined) {
        obj[field.name] = rawValue.includes(',')
          ? rawValue
              .split(',')
              .map((s) => stripHlTags(s.trim()))
              .filter((s) => s.length > 0)
          : [stripHlTags(rawValue)]
      } else {
        obj[field.name] = []
      }
      fieldIdx++
    } else if (
      field.type.kind === 'objectArray' ||
      field.type.kind === 'object'
    ) {
      if (node.children?.[field.name]) {
        obj[field.name] = dslNodeToValue(node.children[field.name], field.type)
      }
    }
  }
  return obj
}

function stripHlTags(s: string): string {
  return s.replace(/\[hl\]|\[\/hl\]/g, '')
}

function coercePrimitive(value: string, tsType: string): unknown {
  if (tsType === 'boolean')
    return value === 'true' || value === '1' || value === 'yes'
  if (tsType === 'number') {
    const n = Number(value)
    return isNaN(n) ? value : n
  }
  return stripHlTags(value)
}

/**
 * Heuristically split fields when the LLM used spaces instead of ~.
 * Example: ["120+ Projects", "45 Awards", "98% Retention"] with fieldCount=2
 * → ["120+", "Projects", "45", "Awards", "98%", "Retention"]
 *
 * Strategy: split each field on the first space, distributing into the
 * expected field count. If a field has no space, keep it whole.
 */
function splitFieldsHeuristically(
  fields: string[],
  fieldCount: number,
): string[] {
  const result: string[] = []
  for (const field of fields) {
    const spaceIdx = field.indexOf(' ')
    if (spaceIdx !== -1 && fieldCount > 1) {
      result.push(field.slice(0, spaceIdx).trim())
      result.push(field.slice(spaceIdx + 1).trim())
    } else {
      result.push(field)
    }
  }
  return result
}

// ─── sectionToProps — type-driven prop extraction ─────────────────────────

export function sectionToProps(
  section: CompositionSection,
): Record<string, unknown> {
  const props: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(section.props)) {
    // Strip [hl]...[/hl] markers from string props — they're highlight
    // markers that are parsed by P.Heading but not by HeroHeading or
    // SectionHeading. Stripping here ensures the compiled OpenUI source
    // never contains raw [hl] tags.
    props[key] =
      typeof value === 'string' ? value.replace(/\[hl\]|\[\/hl\]/g, '') : value
  }
  for (const [groupName, node] of Object.entries(section.nested)) {
    const typeTree = argTypeTree(section.motif, groupName)
    if (typeTree) {
      props[groupName] = dslNodeToValue(node, typeTree)
    } else {
      props[groupName] = node.fields.map((f) =>
        typeof f === 'string' ? stripHlTags(f) : f,
      )
    }
  }
  if (section.design) {
    props.design = serializeDesignForProp(section.design)
  }
  return props
}

function serializeDesignForProp(intent: DesignIntent): string {
  // Data-driven: iterate all keys, serialize non-undefined ones
  const parts: string[] = []
  for (const [key, val] of Object.entries(intent)) {
    if (key === 'roles') {
      // Per-role overrides: roles is Record<axis, Record<role, value>>
      const roles = val as Record<string, Record<string, string>>
      for (const [roleMap] of Object.entries(roles)) {
        for (const [role, value] of Object.entries(roleMap)) {
          parts.push(`${role}:${value}`)
        }
      }
      continue
    }
    if (val !== undefined && val !== null) {
      parts.push(`${key}:${val}`)
    }
  }
  return parts.join(' ')
}
