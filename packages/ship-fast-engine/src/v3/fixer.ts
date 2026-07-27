// v3 engine — best-effort repair of a parsed site-plan from validation errors.
import type { NestedGroup, ParsedSitePlan, Section } from './types.ts'
import type { ValidationError } from './validator.ts'
import { KIND_NAMES, inferKind } from './kinds.ts'
import { getVocabulary, roleFieldOrder } from './vocabulary.ts'

const EMPTY_ROLES = new Set(['footer'])

function roleExists(kind: string, role: string): boolean {
  const vocab = getVocabulary(kind)
  if (!vocab) return false
  return vocab.roles.some((r) => r.role === role)
}

/** Drop sections whose roles are invalid for the kind. */
function dropUnknownRoles(plan: ParsedSitePlan, kind: string): ParsedSitePlan {
  if (!KIND_NAMES.includes(kind)) return plan
  const sections = plan.sections.filter((s) => roleExists(kind, s.role))
  return { ...plan, sections }
}

/** Pad/truncate content to match expected field count. */
function fixFieldCounts(plan: ParsedSitePlan, kind: string): ParsedSitePlan {
  if (!KIND_NAMES.includes(kind)) return plan
  const sections = plan.sections.map((section) => {
    if (EMPTY_ROLES.has(section.role)) return section
    const expected = roleFieldOrder(kind, section.role)
    if (expected.length === 0) return section
    const nestedSlots = section.nested && section.nested.length > 0 ? 1 : 0
    const slotCount = section.content.length + nestedSlots
    if (slotCount === expected.length) return section

    // Heuristic: a stray `|` in prose — 2x expected fields with alternating empties.
    if (
      slotCount === expected.length * 2 &&
      section.nested === undefined &&
      section.content.every((_, i) => i % 2 === 0 || section.content[i] === '')
    ) {
      const merged: string[] = []
      for (let i = 0; i < section.content.length; i += 2) {
        const a = section.content[i] ?? ''
        const b = section.content[i + 1] ?? ''
        merged.push(b.length > 0 ? `${a}|${b}` : a)
      }
      return { ...section, content: merged.slice(0, expected.length) }
    }

    const contentTarget = expected.length - nestedSlots
    let content = section.content.slice()
    if (content.length < contentTarget) {
      while (content.length < contentTarget) content.push('')
    } else if (content.length > contentTarget) {
      content = content.slice(0, contentTarget)
    }
    return { ...section, content }
  })
  return { ...plan, sections }
}

/** Drop malformed nested groups/items. */
function fixNested(plan: ParsedSitePlan): ParsedSitePlan {
  const sections = plan.sections.map((section) => {
    if (!section.nested) return section
    const nested: NestedGroup[] = []
    for (const group of section.nested) {
      if (group.name.length === 0 || group.items.length < 1) continue
      const items = group.items.filter((it) => it.fields.length > 0)
      if (items.length > 0) nested.push({ name: group.name, items })
    }
    if (nested.length === 0) {
      const { nested: _omit, ...rest } = section
      return rest as Section
    }
    return { ...section, nested }
  })
  return { ...plan, sections }
}

/** Drop pages referencing invalid roles. */
function fixPages(plan: ParsedSitePlan, kind: string): ParsedSitePlan {
  if (!KIND_NAMES.includes(kind)) return plan
  const pages = plan.pages.filter((p) => roleExists(kind, p))
  return { ...plan, pages }
}

/** Infer a missing/unknown kind from section role names. */
function inferKindFromPlan(plan: ParsedSitePlan, fallback?: string): string {
  if (KIND_NAMES.includes(plan.kind)) return plan.kind
  const prompt = plan.sections.map((s) => s.role).join(' ')
  const result = inferKind(prompt)
  if (result.kind && KIND_NAMES.includes(result.kind)) return result.kind
  if (fallback && KIND_NAMES.includes(fallback)) return fallback
  return 'marketing'
}

export function fixPlan(
  plan: ParsedSitePlan,
  errors: ValidationError[],
  kind: string,
): ParsedSitePlan {
  const errorRules = new Set(errors.map((e) => e.rule))

  let next: ParsedSitePlan = {
    kind: plan.kind,
    sections: plan.sections.slice(),
    pages: plan.pages.slice(),
  }

  // Missing/unknown kind → infer (use validated kind as fallback).
  if (errorRules.has('kind_unknown') || !KIND_NAMES.includes(next.kind)) {
    next = { ...next, kind: inferKindFromPlan(next, kind) }
  }

  if (errorRules.has('role_invalid')) {
    next = dropUnknownRoles(next, next.kind)
  }

  if (errorRules.has('field_count')) {
    next = fixFieldCounts(next, next.kind)
  }

  if (errorRules.has('nested_unbalanced')) {
    next = fixNested(next)
  }

  if (errorRules.has('page_invalid')) {
    next = fixPages(next, next.kind)
  }

  // no_sections → cannot fix (leave as-is, retry layer handles).
  return next
}
