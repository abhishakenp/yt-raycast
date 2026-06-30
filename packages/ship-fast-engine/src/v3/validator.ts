// v3 engine — 7 validation rules over a parsed site-plan.
import type { MacroType, ParsedSitePlan, Section } from './types.ts'
import { KIND_NAMES } from './kinds.ts'
import { getVocabulary, roleFieldOrder } from './vocabulary.ts'

export interface ValidationError {
  rule: string
  message: string
  section?: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

const MACRO_TYPES: ReadonlySet<MacroType> = new Set([
  'collection',
  'cart',
  'submission',
  'search',
  'favorites',
  'auth',
])

/** Roles where field-count checking is skipped (no content fields). */
const EMPTY_ROLES = new Set(['footer'])

function roleExists(kind: string, role: string): boolean {
  const vocab = getVocabulary(kind)
  if (!vocab) return false
  return vocab.roles.some((r) => r.role === role)
}

/** Count of top-level positional slots a section occupies.
 *  All nested groups collectively occupy a single positional slot (the array field). */
function sectionSlotCount(section: Section): number {
  const nestedSlots = section.nested && section.nested.length > 0 ? 1 : 0
  return section.content.length + nestedSlots
}

export function validatePlan(
  plan: ParsedSitePlan,
  kind: string,
): ValidationResult {
  const errors: ValidationError[] = []

  // Rule 1: kind known.
  if (!KIND_NAMES.includes(kind)) {
    errors.push({
      rule: 'kind_unknown',
      message: `Unknown kind "${kind}"`,
    })
  }

  // Rule 6: >=1 section.
  if (plan.sections.length < 1) {
    errors.push({ rule: 'no_sections', message: 'Plan has no sections' })
  }

  const kindKnown = KIND_NAMES.includes(kind)

  // Rule 2: role valid for kind.
  for (const section of plan.sections) {
    if (kindKnown && !roleExists(kind, section.role)) {
      errors.push({
        rule: 'role_invalid',
        message: `Role "${section.role}" is not valid for kind "${kind}"`,
        section: section.role,
      })
    }
  }

  // Rule 3: field count matches.
  for (const section of plan.sections) {
    if (EMPTY_ROLES.has(section.role)) continue
    if (!kindKnown) continue
    const expected = roleFieldOrder(kind, section.role)
    if (expected.length === 0) continue
    const actual = sectionSlotCount(section)
    if (Math.abs(actual - expected.length) > 1) {
      errors.push({
        rule: 'field_count',
        message: `Section "${section.role}" has ${actual} fields, expected ~${expected.length}`,
        section: section.role,
      })
    } else if (actual !== expected.length) {
      // off-by-one is an error but not fatal — still recorded.
      errors.push({
        rule: 'field_count',
        message: `Section "${section.role}" has ${actual} fields, expected ${expected.length}`,
        section: section.role,
      })
    }
  }

  // Rule 4: nested structure balanced.
  for (const section of plan.sections) {
    if (!section.nested) continue
    for (const group of section.nested) {
      if (group.name.length === 0 || group.items.length < 1) {
        errors.push({
          rule: 'nested_unbalanced',
          message: `Nested group in "${section.role}" is unbalanced`,
          section: section.role,
        })
        continue
      }
      for (const item of group.items) {
        if (item.fields.length < 1) {
          errors.push({
            rule: 'nested_unbalanced',
            message: `Nested item in "${section.role}/${group.name}" has no fields`,
            section: section.role,
          })
        }
      }
    }
  }

  // Rule 5: `+` lines well-formed.
  for (const op of plan.operations) {
    if (!MACRO_TYPES.has(op.macroType)) {
      errors.push({
        rule: 'plus_malformed',
        message: `Operation "${op.name}" has invalid macroType "${op.macroType}"`,
      })
    }
  }
  for (const table of plan.tables) {
    if (table.fields.length < 1) {
      errors.push({
        rule: 'plus_malformed',
        message: `Table "${table.name}" has no fields`,
      })
    }
  }

  // Rule 7: @pages references valid roles.
  if (kindKnown) {
    for (const page of plan.pages) {
      if (!roleExists(kind, page)) {
        errors.push({
          rule: 'page_invalid',
          message: `Page "${page}" references an invalid role for kind "${kind}"`,
        })
      }
    }
  }

  return { valid: errors.length === 0, errors }
}
