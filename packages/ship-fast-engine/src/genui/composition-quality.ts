/**
 * composition-quality.ts — content quality gate for generated compositions.
 *
 * Runs on the compiled OpenUI source (the artifact that gets persisted) rather
 * than on parser/compiler internals, so it keeps working when motifs, blocks,
 * or the compiler change shape.
 */
export type CompositionQualityViolation = {
  rule: 'banned-phrase' | 'placeholder'
  message: string
  excerpt: string
}

export type CompositionQualityResult = {
  valid: boolean
  score: number
  violations: CompositionQualityViolation[]
}

/**
 * Copy patterns that indicate a generic template rather than a generated
 * site. These mirror the banned phrases the composition prompt already
 * forbids, so the gate enforces what the prompt asks for.
 */
export const COMPOSITION_BANNED_TEMPLATE_PHRASES: readonly string[] = [
  'Why Choose Us',
  'Our Benefits',
  'Feature One',
  'Feature Two',
  'Feature Three',
  'Product 1',
  'Product 2',
  'Item 1',
  'Item 2',
  'Your Trusted Partner',
  'Best in class',
  'World-class',
  'Cutting-edge solutions',
  'We are passionate about',
  'Unlock your potential',
  'Take it to the next level',
  'Quality you can trust',
  'Excellence in everything',
  'One-stop shop',
]

type PlaceholderPattern = {
  pattern: RegExp
  label: string
}

const PLACEHOLDER_PATTERNS: readonly PlaceholderPattern[] = [
  { pattern: /\blorem\s+ipsum\b/i, label: 'lorem ipsum' },
  {
    pattern: /\bfeature\s+(one|two|three|four|five|\d+)\b/i,
    label: 'Feature N',
  },
  { pattern: /\bproduct\s+\d+\b/i, label: 'Product N' },
  { pattern: /\bitem\s+\d+\b/i, label: 'Item N' },
  { pattern: /\bservice\s+\d+\b/i, label: 'Service N' },
  { pattern: /\b(john|jane)\s+doe\b/i, label: 'generic John/Jane Doe' },
  { pattern: /\bTODO\b/, label: 'TODO marker' },
  { pattern: /\bTBD\b/, label: 'TBD marker' },
  { pattern: /\bxxx+\b/i, label: 'XXX placeholder' },
  {
    pattern: /\b(sample|dummy)\s+(text|content|data)\b/i,
    label: 'sample/dummy content',
  },
]

const STRING_LITERAL = /"((?:[^"\\]|\\.)*)"/g

function normalize(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Visible copy in OpenUI source lives inside double-quoted prop literals
 * (`heading="…"`, `cards="…"`), so only those are inspected. Sources without
 * any literal (a malformed or empty compile) fall back to the raw text.
 */
export function extractCompositionCopy(source: string): string {
  const literals = Array.from(source.matchAll(STRING_LITERAL), (match) =>
    match[1].replace(/\\"/g, '"'),
  )
  return normalize(literals.length > 0 ? literals.join(' ') : source)
}

function excerpt(value: string): string {
  return value.length <= 80 ? value : `${value.slice(0, 79)}…`
}

/** Validate generated composition copy before it becomes a persisted artifact. */
export function validateCompositionQuality(
  source: string,
): CompositionQualityResult {
  const text = extractCompositionCopy(source)
  const lower = text.toLowerCase()
  const violations: CompositionQualityViolation[] = []

  for (const phrase of COMPOSITION_BANNED_TEMPLATE_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) {
      violations.push({
        rule: 'banned-phrase',
        message: `Banned template phrase found: "${phrase}"`,
        excerpt: phrase,
      })
    }
  }

  for (const { pattern, label } of PLACEHOLDER_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      violations.push({
        rule: 'placeholder',
        message: `Placeholder content detected (${label})`,
        excerpt: excerpt(match[0]),
      })
    }
  }

  return {
    valid: violations.length === 0,
    score: Math.max(0, 100 - violations.length * 20),
    violations,
  }
}
