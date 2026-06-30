// v3 engine — parse → validate → fix retry loop.
import type { ParsedSitePlan } from './types.ts'
import { parseSitePlan } from './parser.ts'
import { validatePlan, type ValidationError } from './validator.ts'
import { fixPlan } from './fixer.ts'

export interface RetryResult {
  plan: ParsedSitePlan
  attempts: number
  valid: boolean
  errors: ValidationError[]
}

/** Count sections that survive validation against the kind vocabulary. */
function validSectionCount(plan: ParsedSitePlan): number {
  return plan.sections.length
}

export function retryLoop(
  raw: string,
  kind: string,
  maxRetries = 3,
): RetryResult {
  let plan: ParsedSitePlan = {
    kind,
    sections: [],
    pages: [],
    tables: [],
    operations: [],
  }
  let errors: ValidationError[] = []
  let valid = false
  let attempts = 0

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    attempts = attempt + 1
    const parsed = parseSitePlan(raw)
    // Use the kind argument if the parsed kind is empty, else parsed kind.
    const effectiveKind = parsed.kind.length > 0 ? parsed.kind : kind
    const result = validatePlan(parsed, effectiveKind)
    const fixed = fixPlan(parsed, result.errors, effectiveKind)
    const revalidate = validatePlan(fixed, fixed.kind)

    plan = fixed
    errors = revalidate.errors
    valid = revalidate.valid

    if (valid || validSectionCount(fixed) >= 3) break
  }

  return { plan, attempts, valid, errors }
}
