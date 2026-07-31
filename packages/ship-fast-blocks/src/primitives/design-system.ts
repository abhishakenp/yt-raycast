/**
 * @design axis — generative visual style system.
 *
 * Two categories of axes:
 *
 * 1. Tailwind axes (radius, shadow, tracking, leading, weight, transform,
 *    border, image, opacity): the LLM emits Tailwind classes it already
 *    knows — rounded-xl, shadow-lg, tracking-wide, font-black, uppercase,
 *    border-2, grayscale, opacity-50. No invented vocabulary. The provider
 *    converts the class to a CSS value and sets --d-{axis}. CSS harmonizes
 *    per-role via multipliers. Per-role overrides: btn:rounded-full.
 *
 * 2. Named-concept axes (density, typography, gradient, motion, chrome,
 *    decor): no Tailwind equivalent. These control coherent value sets
 *    across multiple roles. The LLM uses named presets: density:airy,
 *    typography:display, gradient:vibrant, motion:lively, chrome:brutalist,
 *    decor:dot-grid. CSS maps presets to per-role values.
 *
 * Per-role overrides work for both: btn:rounded-full, card:shadow-lg.
 */

// ─── Named-concept presets (only for axes with no Tailwind equivalent) ────

export const DENSITY_PRESETS = ['compact', 'balanced', 'airy'] as const
export const TYPOGRAPHY_PRESETS = [
  'editorial',
  'technical',
  'display',
  'humanist',
] as const
export const GRADIENT_PRESETS = ['none', 'subtle', 'vibrant', 'mesh'] as const
export const MOTION_PRESETS = ['none', 'subtle', 'lively'] as const
export const CHROME_PRESETS = [
  'none',
  'hairline',
  'brutalist',
  'terminal',
  'editorial',
  'gradient',
] as const
export const DECOR_PRESETS = [
  'none',
  'dot-grid',
  'graph-paper',
  'glow',
] as const

// ─── Design intent (serializable — flows through DSL → parser → compiler) ──

export type DesignValue = string

export interface DesignIntent {
  // Tailwind axes — value is a Tailwind class or arbitrary [value]
  radius: DesignValue
  shadow: DesignValue
  tracking?: DesignValue
  leading?: DesignValue
  weight?: DesignValue
  transform?: DesignValue
  border?: DesignValue
  image?: DesignValue
  opacity?: DesignValue
  // Named-concept axes — value is a named preset
  gradient: DesignValue
  density: DesignValue
  typography: DesignValue
  motion: DesignValue
  chrome?: DesignValue
  decor?: DesignValue
  /** Per-role overrides: axis → role → value (Tailwind class or arbitrary) */
  roles?: Record<string, Record<string, string>>
}

export const DEFAULT_DESIGN: DesignIntent = {
  radius: 'rounded-none',
  shadow: 'shadow-[4px_4px_0_0]',
  gradient: 'none',
  density: 'balanced',
  typography: 'editorial',
  motion: 'subtle',
}

// ─── DesignClasses (kept for backward compat — all empty strings now) ─────

export interface DesignClasses {
  radius: Record<string, string>
  shadow: Record<string, string>
  gradient: Record<string, string>
  density: Record<string, string>
  typography: Record<string, string>
  motion: Record<string, string>
  border: Record<string, string>
  tracking: Record<string, string>
  leading: Record<string, string>
  weight: Record<string, string>
  transform: Record<string, string>
  image: Record<string, string>
  opacity: Record<string, string>
}

const EMPTY_CLASSES: DesignClasses = {
  radius: {},
  shadow: {},
  gradient: {},
  density: {},
  typography: {},
  motion: {},
  border: {},
  tracking: {},
  leading: {},
  weight: {},
  transform: {},
  image: {},
  opacity: {},
}

/** @deprecated CSS handles styling now. Returns empty shape for backward compat. */
export function resolveDesign(_intent: DesignIntent): DesignClasses {
  return EMPTY_CLASSES
}

// ─── Axis registry — single source of truth ──────────────────────────────

interface AxisDef {
  name: string
  keyAliases?: string[]
  /** Named presets (only for non-Tailwind axes) */
  presets?: readonly string[]
  valueAliases?: Record<string, string>
  cssProperty?: string
  roles?: string[]
  /** Regex matching bare Tailwind classes that map to this axis. */
  tailwindMatch?: RegExp
}

const AXIS_REGISTRY: readonly AxisDef[] = [
  // ── Tailwind axes ──
  {
    name: 'radius',
    cssProperty: 'border-radius',
    roles: [
      'btn',
      'card',
      'input',
      'badge',
      'container',
      'link',
      'image',
      'icon',
    ],
    tailwindMatch: /^rounded(-(\[.+\]|[a-z0-9]+)|\[.+\])?$/,
  },
  {
    name: 'shadow',
    keyAliases: ['shadows'],
    cssProperty: 'box-shadow',
    roles: ['btn', 'card', 'container', 'image'],
    tailwindMatch: /^shadow(-(\[.+\]|[a-z]+)|\[.+\])?$/,
  },
  {
    name: 'tracking',
    keyAliases: ['letterspacing', 'letter-spacing'],
    cssProperty: 'letter-spacing',
    roles: ['display', 'heading', 'body', 'eyebrow'],
    tailwindMatch: /^tracking(-(\[.+\]|[a-z]+)|\[.+\])?$/,
  },
  {
    name: 'leading',
    keyAliases: ['lineheight', 'line-height'],
    cssProperty: 'line-height',
    roles: ['display', 'heading', 'body'],
    tailwindMatch: /^leading(-(\[.+\]|[a-z]+)|\[.+\])?$/,
  },
  {
    name: 'weight',
    keyAliases: ['fontweight', 'font-weight'],
    cssProperty: 'font-weight',
    roles: ['display', 'heading', 'body', 'eyebrow'],
    tailwindMatch:
      /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
  },
  {
    name: 'transform',
    keyAliases: ['texttransform', 'text-transform'],
    cssProperty: 'text-transform',
    roles: ['display', 'heading', 'eyebrow'],
    tailwindMatch: /^(uppercase|lowercase|normal-case|capitalize)$/,
  },
  {
    name: 'border',
    keyAliases: ['borders'],
    cssProperty: 'border-width',
    roles: ['btn', 'card', 'input', 'container', 'divider', 'image'],
    tailwindMatch: /^border(-[0-9]+)?$/,
  },
  {
    name: 'image',
    keyAliases: ['imagetreatment', 'image-treatment'],
    cssProperty: 'filter',
    roles: ['image'],
    tailwindMatch: /^grayscale(-\d+)?$/,
  },
  {
    name: 'opacity',
    cssProperty: 'opacity',
    roles: ['decor', 'watermark', 'divider'],
    tailwindMatch: /^opacity(-(\[.+\]|\d+)|\[.+\])?$/,
  },
  // ── Named-concept axes ──
  {
    name: 'gradient',
    keyAliases: ['gradients'],
    presets: GRADIENT_PRESETS,
    roles: ['highlight', 'surface', 'gradient-text'],
  },
  {
    name: 'density',
    presets: DENSITY_PRESETS,
    roles: ['section', 'grid', 'card', 'nav', 'footer', 'list', 'form'],
  },
  {
    name: 'typography',
    keyAliases: ['type'],
    presets: TYPOGRAPHY_PRESETS,
    roles: ['display', 'heading', 'body', 'eyebrow'],
  },
  {
    name: 'motion',
    presets: MOTION_PRESETS,
    valueAliases: {
      static: 'none',
      gentle: 'subtle',
      kinetic: 'lively',
      animated: 'lively',
    },
    roles: ['card', 'btn'],
  },
  {
    name: 'chrome',
    presets: CHROME_PRESETS,
    valueAliases: {
      minimal: 'hairline',
      bold: 'brutalist',
      mono: 'terminal',
      magazine: 'editorial',
    },
  },
  {
    name: 'decor',
    presets: DECOR_PRESETS,
    valueAliases: {
      dots: 'dot-grid',
      grid: 'graph-paper',
      paper: 'graph-paper',
      orbs: 'glow',
    },
  },
] as const

const KEY_TO_AXIS: Map<string, string> = (() => {
  const m = new Map<string, string>()
  for (const axis of AXIS_REGISTRY) {
    m.set(axis.name.toLowerCase(), axis.name)
    for (const alias of axis.keyAliases ?? [])
      m.set(alias.toLowerCase(), axis.name)
  }
  return m
})()

const AXIS_BY_NAME: Map<string, AxisDef> = new Map(
  AXIS_REGISTRY.map((a) => [a.name, a]),
)

const ALL_ROLES: Set<string> = (() => {
  const s = new Set<string>()
  for (const axis of AXIS_REGISTRY)
    for (const role of axis.roles ?? []) s.add(role)
  return s
})()

// ─── Tailwind class → CSS value (static facts, not design decisions) ──────

const TAILWIND_CSS: Record<string, string> = {
  'rounded-none': '0px',
  'rounded-sm': '0.25rem',
  'rounded-md': '0.375rem',
  'rounded-lg': '0.5rem',
  'rounded-xl': '0.75rem',
  'rounded-2xl': '1rem',
  'rounded-3xl': '1.5rem',
  'rounded-full': '9999px',
  'shadow-none': 'none',
  'shadow-sm': '0 1px 3px 0 rgb(0 0 0 / 0.07)',
  'shadow-md':
    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  'shadow-lg':
    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  'shadow-xl':
    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  'shadow-2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  'font-thin': '100',
  'font-extralight': '200',
  'font-light': '300',
  'font-normal': '400',
  'font-medium': '500',
  'font-semibold': '600',
  'font-bold': '700',
  'font-extrabold': '800',
  'font-black': '900',
  'tracking-tighter': '-0.05em',
  'tracking-tight': '-0.025em',
  'tracking-normal': '0',
  'tracking-wide': '0.025em',
  'tracking-wider': '0.05em',
  'tracking-widest': '0.1em',
  'leading-none': '1',
  'leading-tight': '1.25',
  'leading-snug': '1.375',
  'leading-normal': '1.5',
  'leading-relaxed': '1.625',
  'leading-loose': '2',
  uppercase: 'uppercase',
  lowercase: 'lowercase',
  'normal-case': 'none',
  capitalize: 'capitalize',
  grayscale: 'grayscale(1)',
  'opacity-0': '0',
  'opacity-5': '0.05',
  'opacity-10': '0.1',
  'opacity-20': '0.2',
  'opacity-25': '0.25',
  'opacity-30': '0.3',
  'opacity-40': '0.4',
  'opacity-50': '0.5',
  'opacity-60': '0.6',
  'opacity-70': '0.7',
  'opacity-75': '0.75',
  'opacity-80': '0.8',
  'opacity-90': '0.9',
  'opacity-95': '0.95',
  'opacity-100': '1',
  border: '1px',
  'border-2': '2px',
  'border-4': '4px',
  'border-8': '8px',
}

// ─── Tailwind class → axis matching (derived from registry) ──────────────

function matchTailwindPrefix(token: string): string | null {
  for (const axis of AXIS_REGISTRY) {
    if (axis.tailwindMatch?.test(token)) return axis.name
  }
  return null
}

// ─── Parser ──────────────────────────────────────────────────────────────

function resolveAxisValue(axis: AxisDef, v: string): string | undefined {
  const lower = v.toLowerCase()
  // Named preset (case-insensitive) — only for named-concept axes
  if (axis.presets?.includes(lower as never)) return lower
  // Value alias → canonical preset
  const alias = axis.valueAliases?.[lower]
  if (alias && axis.presets?.includes(alias)) return alias
  // Tailwind class or arbitrary — accept as-is
  return v
}

function splitDesignTokens(line: string): string[] {
  const tokens: string[] = []
  let current = ''
  let inBrackets = 0
  for (const ch of line) {
    if (ch === '[') inBrackets++
    if (ch === ']') inBrackets = Math.max(0, inBrackets - 1)
    if (ch === ' ' && inBrackets === 0) {
      if (current.trim()) tokens.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  if (current.trim()) tokens.push(current.trim())
  return tokens
}

function parseTokens(
  tokens: string[],
  target: Record<string, unknown>,
  roles: Record<string, Record<string, string>>,
): void {
  for (const token of tokens) {
    const cleanToken = token.replace(/^:+/, '')
    const colonIdx = cleanToken.indexOf(':')
    if (colonIdx > 0) {
      let key = cleanToken.slice(0, colonIdx).toLowerCase()
      let value = cleanToken.slice(colonIdx + 1)
      while (value.startsWith(':')) value = value.slice(1)

      const axisName = KEY_TO_AXIS.get(key)
      if (axisName) {
        const axis = AXIS_BY_NAME.get(axisName)!
        const resolved = resolveAxisValue(axis, value)
        if (resolved !== undefined) target[axisName] = resolved
        continue
      }

      if (ALL_ROLES.has(key)) {
        const axisName = matchTailwindPrefix(value)
        if (axisName) {
          if (!roles[axisName]) roles[axisName] = {}
          roles[axisName][key] = value
        } else {
          // Arbitrary [value] for a role — default to radius if role exists there
          const radiusAxis = AXIS_BY_NAME.get('radius')!
          if (radiusAxis.roles?.includes(key)) {
            if (!roles['radius']) roles['radius'] = {}
            roles['radius'][key] = value
          }
        }
        continue
      }
    }

    const axisName = matchTailwindPrefix(cleanToken)
    if (axisName) {
      const axis = AXIS_BY_NAME.get(axisName)!
      const resolved = resolveAxisValue(axis, cleanToken)
      if (resolved !== undefined) target[axisName] = resolved
      continue
    }
  }
}

export function parseDesignLine(line: string): DesignIntent {
  const rest = line.replace(/^@design\s*/i, '').trim()
  if (!rest) return { ...DEFAULT_DESIGN }

  const tokens = splitDesignTokens(rest)
  const intent: Record<string, unknown> = {}
  const roles: Record<string, Record<string, string>> = {}

  parseTokens(tokens, intent, roles)
  if (Object.keys(roles).length > 0) intent.roles = roles

  return { ...DEFAULT_DESIGN, ...intent } as DesignIntent
}

export function parseDesignOverride(input: string): Partial<DesignIntent> {
  const rest = input.replace(/^@design\s*/i, '').trim()
  if (!rest) return {}

  const tokens = splitDesignTokens(rest)
  const override: Record<string, unknown> = {}
  const roles: Record<string, Record<string, string>> = {}

  parseTokens(tokens, override, roles)
  if (Object.keys(roles).length > 0) override.roles = roles

  return override as Partial<DesignIntent>
}

export function mergeDesign(
  parent: DesignIntent,
  override: Partial<DesignIntent>,
): DesignIntent {
  const merged: DesignIntent = { ...parent }
  for (const [key, val] of Object.entries(override)) {
    if (val !== undefined && val !== null)
      (merged as unknown as Record<string, unknown>)[key] = val
  }
  if (parent.roles || override.roles) {
    merged.roles = { ...(parent.roles ?? {}), ...(override.roles ?? {}) }
    for (const axis of Object.keys(parent.roles ?? {})) {
      if (override.roles?.[axis]) {
        merged.roles[axis] = {
          ...(parent.roles?.[axis] ?? {}),
          ...override.roles[axis],
        }
      }
    }
  }
  return merged
}

export function serializeDesignIntent(intent: DesignIntent): string {
  const parts: string[] = []
  for (const [key, val] of Object.entries(intent)) {
    if (key === 'roles') continue
    if (val !== undefined && val !== null) parts.push(`${key}:${val}`)
  }
  if (intent.roles) {
    for (const [, roleMap] of Object.entries(intent.roles)) {
      for (const [role, val] of Object.entries(roleMap))
        parts.push(`${role}:${val}`)
    }
  }
  return parts.join(' ')
}

// ─── Tailwind CSS value conversion (for provider inline styles) ──────────

export function designValueToCss(value: string): string | null {
  // Arbitrary bracket value: [13px]
  const arbMatch = value.match(/^\[(.+)\]$/)
  if (arbMatch) return arbMatch[1].replace(/_/g, ' ')
  // Tailwind class with arbitrary bracket: shadow-[4px_4px_0_0], rounded-[13px]
  const twArbMatch = value.match(/^[a-z]+-\[(.+)\]$/)
  if (twArbMatch) return twArbMatch[1].replace(/_/g, ' ')
  // Standard Tailwind class lookup
  if (TAILWIND_CSS[value]) return TAILWIND_CSS[value]
  // Raw CSS value
  if (
    /^[\d.]/.test(value) ||
    value.includes('px') ||
    value.includes('rem') ||
    value.includes('em')
  )
    return value
  return null // named preset — CSS file handles via data attributes
}

export function isNamedPreset(axisName: string, value: string): boolean {
  const axis = AXIS_BY_NAME.get(axisName)
  if (!axis?.presets) return false
  return axis.presets.includes(value)
}

// ─── Axis metadata exports ───────────────────────────────────────────────

export const AXIS_NAMES = AXIS_REGISTRY.map((a) => a.name)

export function getAxisRoles(axisName: string): string[] {
  return AXIS_BY_NAME.get(axisName)?.roles ?? []
}

export function getAxisCssProperty(axisName: string): string | undefined {
  return AXIS_BY_NAME.get(axisName)?.cssProperty
}

// ─── Backward compat type aliases ────────────────────────────────────────

export type Radius = string
export type Shadow = string
export type Gradient = string
export type Density = string
export type Typography = string
export type Motion = string
export type Border = string
export type Tracking = string
export type Leading = string
export type Weight = string
export type Transform = string
export type ImageTreatment = string
export type Opacity = string
export type Chrome = string
export type Decor = string
