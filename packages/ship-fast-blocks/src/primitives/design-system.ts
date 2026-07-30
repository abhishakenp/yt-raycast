/**
 * @design axis — generative visual style system.
 *
 * Constrained enums that the LLM emits in a `@design` line. Each value resolves
 * to Tailwind classes per target (button, card, container, heading, etc.).
 * Primitives read the resolved design via `useDesign()` React context.
 *
 * This is the style degree of freedom. Structure + content are the other two.
 * Together they make the engine generative without freeform HTML.
 */

// ─── Enums ──────────────────────────────────────────────────────────────

export const RADIUS_VALUES = ['sharp', 'soft', 'rounded', 'pill'] as const
export type Radius = (typeof RADIUS_VALUES)[number]

export const SHADOW_VALUES = ['none', 'soft', 'hard', 'brutalist'] as const
export type Shadow = (typeof SHADOW_VALUES)[number]

export const GRADIENT_VALUES = ['none', 'subtle', 'vibrant', 'mesh'] as const
export type Gradient = (typeof GRADIENT_VALUES)[number]

export const DENSITY_VALUES = ['compact', 'balanced', 'airy'] as const
export type Density = (typeof DENSITY_VALUES)[number]

export const TYPOGRAPHY_VALUES = [
  'editorial',
  'technical',
  'display',
  'humanist',
] as const
export type Typography = (typeof TYPOGRAPHY_VALUES)[number]

export const MOTION_VALUES = ['none', 'subtle', 'lively'] as const
export type Motion = (typeof MOTION_VALUES)[number]

// ── New atomic axes ──

export const BORDER_VALUES = ['hairline', 'medium', 'bold'] as const
export type Border = (typeof BORDER_VALUES)[number]

export const TRACKING_VALUES = ['tight', 'normal', 'wide'] as const
export type Tracking = (typeof TRACKING_VALUES)[number]

export const LEADING_VALUES = ['compact', 'normal', 'relaxed'] as const
export type Leading = (typeof LEADING_VALUES)[number]

export const WEIGHT_VALUES = ['light', 'normal', 'bold', 'black'] as const
export type Weight = (typeof WEIGHT_VALUES)[number]

export const TRANSFORM_VALUES = ['none', 'uppercase', 'lowercase'] as const
export type Transform = (typeof TRANSFORM_VALUES)[number]

export const IMAGE_VALUES = ['plain', 'grayscale', 'duotone', 'zoom'] as const
export type ImageTreatment = (typeof IMAGE_VALUES)[number]

export const OPACITY_VALUES = ['solid', 'subtle', 'ghost'] as const
export type Opacity = (typeof OPACITY_VALUES)[number]

// ── Compositional axes (cascade through @design, not just per-section props) ──

export const CHROME_VALUES = [
  'none',
  'hairline',
  'brutalist',
  'terminal',
  'editorial',
  'gradient',
] as const
export type Chrome = (typeof CHROME_VALUES)[number]

export const DECOR_VALUES = ['none', 'dot-grid', 'graph-paper', 'glow'] as const
export type Decor = (typeof DECOR_VALUES)[number]

// ─── Design intent (serializable — flows through DSL → parser → compiler) ──
//
// All axes are optional except the original 6 (which have defaults).
// New axes are optional with `undefined` sentinel meaning "not set —
// component uses its own default / hardcoded value".

export interface DesignIntent {
  radius: Radius
  shadow: Shadow
  gradient: Gradient
  density: Density
  typography: Typography
  motion: Motion
  // New atomic axes — undefined = not set, component decides
  border?: Border
  tracking?: Tracking
  leading?: Leading
  weight?: Weight
  transform?: Transform
  image?: ImageTreatment
  opacity?: Opacity
  // Compositional axes — undefined = not set, component decides
  chrome?: Chrome
  decor?: Decor
}

export const DEFAULT_DESIGN: DesignIntent = {
  radius: 'sharp',
  shadow: 'hard',
  gradient: 'none',
  density: 'balanced',
  typography: 'editorial',
  motion: 'subtle',
  // New axes default to undefined — components use their own hardcoded
  // values unless @design explicitly sets them. This preserves backward
  // compatibility: existing sites look identical until you opt in.
}

// ─── Resolution: enum value → Tailwind classes per target ──────────────────
//
// Each target (button, card, container, etc.) gets a class string per axis.
// Primitives compose: cn(base, design.radius.btn, design.shadow.btn, ...)

export interface DesignClasses {
  radius: {
    btn: string
    card: string
    input: string
    badge: string
    container: string
    link: string
    image: string
    icon: string
  }
  shadow: {
    btn: string
    card: string
    container: string
    image: string
  }
  gradient: {
    highlight: string // text highlight block behind a word
    surface: string // gradient background on hero/cta surfaces
    text: string // gradient clip text
  }
  density: {
    section: string // py-* on section wrappers
    grid: string // gap-* on grids
    card: string // p-* on cards
    nav: string // py-* on nav
    footer: string // py-* on footer
    list: string // gap-* on lists
    form: string // gap-* on forms
  }
  typography: {
    display: string // hero h1 classes
    heading: string // h2/h3 classes
    body: string // paragraph classes
    eyebrow: string // mono label classes
    fontSans: string
    fontMono: string
  }
  motion: {
    hover: string // hover transform on cards/buttons
    transition: string // transition-* base
  }
  // New atomic axes — per-role Tailwind classes
  border: {
    btn: string
    card: string
    input: string
    container: string
    divider: string
    image: string
  }
  tracking: {
    display: string
    heading: string
    body: string
    eyebrow: string
  }
  leading: {
    display: string
    heading: string
    body: string
  }
  weight: {
    display: string
    heading: string
    body: string
    eyebrow: string
  }
  transform: {
    eyebrow: string
    display: string
    heading: string
  }
  image: {
    treatment: string // grayscale, zoom, etc.
  }
  opacity: {
    decor: string
    watermark: string
    divider: string
  }
}

// ─── Resolution tables ───────────────────────────────────────────────────

const RADIUS_TABLE: Record<Radius, DesignClasses['radius']> = {
  sharp: {
    btn: 'rounded-none',
    card: 'rounded-none',
    input: 'rounded-none',
    badge: 'rounded-none',
    container: 'rounded-none',
    link: 'rounded-none',
    image: 'rounded-none',
    icon: 'rounded-none',
  },
  soft: {
    btn: 'rounded-lg',
    card: 'rounded-lg',
    input: 'rounded-lg',
    badge: 'rounded-md',
    container: 'rounded-xl',
    link: 'rounded-md',
    image: 'rounded-lg',
    icon: 'rounded-full',
  },
  rounded: {
    btn: 'rounded-xl',
    card: 'rounded-xl',
    input: 'rounded-xl',
    badge: 'rounded-lg',
    container: 'rounded-2xl',
    link: 'rounded-lg',
    image: 'rounded-xl',
    icon: 'rounded-full',
  },
  pill: {
    btn: 'rounded-full',
    card: 'rounded-3xl',
    input: 'rounded-full',
    badge: 'rounded-full',
    container: 'rounded-3xl',
    link: 'rounded-full',
    image: 'rounded-3xl',
    icon: 'rounded-full',
  },
}

const SHADOW_TABLE: Record<Shadow, DesignClasses['shadow']> = {
  none: {
    btn: '',
    card: '',
    container: '',
    image: '',
  },
  soft: {
    btn: 'shadow-sm hover:shadow-md',
    card: 'shadow-sm',
    container: 'shadow-sm',
    image: 'shadow-sm',
  },
  hard: {
    btn: 'shadow-[4px_4px_0_0] shadow-foreground hover:-translate-y-0.5',
    card: 'shadow-[4px_4px_0_0] shadow-foreground',
    container: 'shadow-[4px_4px_0_0] shadow-foreground',
    image: 'shadow-[4px_4px_0_0] shadow-foreground',
  },
  brutalist: {
    btn: 'shadow-[8px_8px_0_0] shadow-foreground hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none',
    card: 'shadow-[8px_8px_0_0] shadow-foreground',
    container: 'shadow-[8px_8px_0_0] shadow-foreground',
    image: 'shadow-[8px_8px_0_0] shadow-foreground',
  },
}

const GRADIENT_TABLE: Record<Gradient, DesignClasses['gradient']> = {
  none: {
    highlight: 'bg-primary',
    surface: '',
    text: '',
  },
  subtle: {
    highlight: 'bg-gradient-to-r from-primary to-primary/80',
    surface: 'bg-gradient-to-br from-background via-background to-muted/30',
    text: '',
  },
  vibrant: {
    highlight: 'bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500',
    surface: 'bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500',
    text: 'bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 [-webkit-text-fill-color:transparent] [-webkit-background-clip:text] [background-clip:text]',
  },
  mesh: {
    highlight: 'bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500',
    surface: 'bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500',
    text: 'bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500 [-webkit-text-fill-color:transparent] [-webkit-background-clip:text] [background-clip:text]',
  },
}

const DENSITY_TABLE: Record<Density, DesignClasses['density']> = {
  compact: {
    section: 'py-10',
    grid: 'gap-3',
    card: 'p-4',
    nav: 'py-2',
    footer: 'py-8',
    list: 'gap-2',
    form: 'gap-3',
  },
  balanced: {
    section: 'py-16',
    grid: 'gap-6',
    card: 'p-6',
    nav: 'py-3',
    footer: 'py-12',
    list: 'gap-4',
    form: 'gap-5',
  },
  airy: {
    section: 'py-24',
    grid: 'gap-10',
    card: 'p-8',
    nav: 'py-4',
    footer: 'py-16',
    list: 'gap-6',
    form: 'gap-6',
  },
}

const TYPOGRAPHY_TABLE: Record<Typography, DesignClasses['typography']> = {
  editorial: {
    display:
      'text-[clamp(3rem,11vw,8.5rem)] font-extrabold uppercase leading-[0.88] tracking-tighter',
    heading: 'text-3xl font-extrabold tracking-tight sm:text-4xl',
    body: 'text-base leading-relaxed text-muted-foreground',
    eyebrow:
      'font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground',
    fontSans: 'font-sans',
    fontMono: 'font-mono',
  },
  technical: {
    display:
      'text-[clamp(2.5rem,8vw,6rem)] font-bold leading-[0.95] tracking-tight tabular-nums',
    heading: 'text-2xl font-bold tracking-tight tabular-nums sm:text-3xl',
    body: 'text-sm leading-6 text-muted-foreground font-mono',
    eyebrow:
      'font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground',
    fontSans: 'font-sans',
    fontMono: 'font-mono',
  },
  display: {
    display:
      'text-[clamp(3.5rem,14vw,11rem)] font-black uppercase leading-[0.82] tracking-tighter',
    heading: 'text-4xl font-black tracking-tighter sm:text-5xl',
    body: 'text-lg leading-relaxed text-muted-foreground',
    eyebrow:
      'font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground',
    fontSans: 'font-sans',
    fontMono: 'font-mono',
  },
  humanist: {
    display:
      'text-[clamp(2.75rem,9vw,7rem)] font-bold leading-[0.92] tracking-tight',
    heading: 'text-3xl font-bold tracking-tight sm:text-4xl',
    body: 'text-base leading-7 text-muted-foreground',
    eyebrow:
      'text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium',
    fontSans: 'font-sans',
    fontMono: 'font-mono',
  },
}

const MOTION_TABLE: Record<Motion, DesignClasses['motion']> = {
  none: {
    hover: '',
    transition: '',
  },
  subtle: {
    hover: 'hover:-translate-y-0.5',
    transition: 'transition-all duration-200',
  },
  lively: {
    hover: 'hover:-translate-y-1 hover:scale-[1.02]',
    transition: 'transition-all duration-300 ease-out',
  },
}

// ── New axis resolution tables ──

const BORDER_TABLE: Record<Border, DesignClasses['border']> = {
  hairline: {
    btn: 'border',
    card: 'border',
    input: 'border',
    container: 'border',
    divider: 'border-t',
    image: 'border',
  },
  medium: {
    btn: 'border-2',
    card: 'border-2',
    input: 'border-2',
    container: 'border-2',
    divider: 'border-t-2',
    image: 'border-2',
  },
  bold: {
    btn: 'border-4',
    card: 'border-4',
    input: 'border-4',
    container: 'border-4',
    divider: 'border-t-4',
    image: 'border-4',
  },
}

const TRACKING_TABLE: Record<Tracking, DesignClasses['tracking']> = {
  tight: {
    display: 'tracking-tighter',
    heading: 'tracking-tight',
    body: 'tracking-tight',
    eyebrow: 'tracking-tight',
  },
  normal: {
    display: 'tracking-normal',
    heading: 'tracking-normal',
    body: 'tracking-normal',
    eyebrow: 'tracking-[0.1em]',
  },
  wide: {
    display: 'tracking-wide',
    heading: 'tracking-wide',
    body: 'tracking-wide',
    eyebrow: 'tracking-[0.2em]',
  },
}

const LEADING_TABLE: Record<Leading, DesignClasses['leading']> = {
  compact: {
    display: 'leading-[0.85]',
    heading: 'leading-tight',
    body: 'leading-snug',
  },
  normal: {
    display: 'leading-[0.92]',
    heading: 'leading-normal',
    body: 'leading-relaxed',
  },
  relaxed: {
    display: 'leading-[0.98]',
    heading: 'leading-relaxed',
    body: 'leading-7',
  },
}

const WEIGHT_TABLE: Record<Weight, DesignClasses['weight']> = {
  light: {
    display: 'font-extralight',
    heading: 'font-light',
    body: 'font-light',
    eyebrow: 'font-light',
  },
  normal: {
    display: 'font-normal',
    heading: 'font-normal',
    body: 'font-normal',
    eyebrow: 'font-normal',
  },
  bold: {
    display: 'font-extrabold',
    heading: 'font-bold',
    body: 'font-medium',
    eyebrow: 'font-semibold',
  },
  black: {
    display: 'font-black',
    heading: 'font-black',
    body: 'font-bold',
    eyebrow: 'font-bold',
  },
}

const TRANSFORM_TABLE: Record<Transform, DesignClasses['transform']> = {
  none: {
    eyebrow: 'normal-case',
    display: 'normal-case',
    heading: 'normal-case',
  },
  uppercase: {
    eyebrow: 'uppercase',
    display: 'uppercase',
    heading: 'uppercase',
  },
  lowercase: {
    eyebrow: 'lowercase',
    display: 'lowercase',
    heading: 'lowercase',
  },
}

const IMAGE_TABLE: Record<ImageTreatment, DesignClasses['image']> = {
  plain: {
    treatment: '',
  },
  grayscale: {
    treatment: 'grayscale',
  },
  duotone: {
    treatment: 'grayscale contrast-125 brightness-110',
  },
  zoom: {
    treatment: 'transition-transform duration-300 hover:scale-[1.05]',
  },
}

const OPACITY_TABLE: Record<Opacity, DesignClasses['opacity']> = {
  solid: {
    decor: 'opacity-100',
    watermark: 'opacity-[0.08]',
    divider: 'opacity-100',
  },
  subtle: {
    decor: 'opacity-50',
    watermark: 'opacity-[0.04]',
    divider: 'opacity-50',
  },
  ghost: {
    decor: 'opacity-20',
    watermark: 'opacity-[0.02]',
    divider: 'opacity-20',
  },
}

// ─── Resolver ────────────────────────────────────────────────────────────

// ── Empty class defaults for new axes (when axis is undefined) ──
const EMPTY_BORDER: DesignClasses['border'] = {
  btn: '',
  card: '',
  input: '',
  container: '',
  divider: '',
  image: '',
}
const EMPTY_TRACKING: DesignClasses['tracking'] = {
  display: '',
  heading: '',
  body: '',
  eyebrow: '',
}
const EMPTY_LEADING: DesignClasses['leading'] = {
  display: '',
  heading: '',
  body: '',
}
const EMPTY_WEIGHT: DesignClasses['weight'] = {
  display: '',
  heading: '',
  body: '',
  eyebrow: '',
}
const EMPTY_TRANSFORM: DesignClasses['transform'] = {
  eyebrow: '',
  display: '',
  heading: '',
}
const EMPTY_IMAGE: DesignClasses['image'] = { treatment: '' }
const EMPTY_OPACITY: DesignClasses['opacity'] = {
  decor: '',
  watermark: '',
  divider: '',
}

export function resolveDesign(intent: DesignIntent): DesignClasses {
  return {
    radius: RADIUS_TABLE[intent.radius],
    shadow: SHADOW_TABLE[intent.shadow],
    gradient: GRADIENT_TABLE[intent.gradient],
    density: DENSITY_TABLE[intent.density],
    typography: TYPOGRAPHY_TABLE[intent.typography],
    motion: MOTION_TABLE[intent.motion],
    // New axes — empty strings when undefined (backward compat)
    border: intent.border ? BORDER_TABLE[intent.border] : EMPTY_BORDER,
    tracking: intent.tracking
      ? TRACKING_TABLE[intent.tracking]
      : EMPTY_TRACKING,
    leading: intent.leading ? LEADING_TABLE[intent.leading] : EMPTY_LEADING,
    weight: intent.weight ? WEIGHT_TABLE[intent.weight] : EMPTY_WEIGHT,
    transform: intent.transform
      ? TRANSFORM_TABLE[intent.transform]
      : EMPTY_TRANSFORM,
    image: intent.image ? IMAGE_TABLE[intent.image] : EMPTY_IMAGE,
    opacity: intent.opacity ? OPACITY_TABLE[intent.opacity] : EMPTY_OPACITY,
  }
}

// ─── Parser: "@design radius:rounded gradients:vibrant ..." → DesignIntent ──

/**
 * Axis registry — single source of truth for all @design axes.
 * Adding a new axis = add one entry here. Everything else (parsing,
 * serialization, key aliases, value aliases) derives from this.
 */
interface AxisDef {
  /** Key in DesignIntent (e.g. 'radius') */
  name: string
  /** Alternative DSL keys that map to this axis (e.g. ['shadows', 'type']) */
  keyAliases?: string[]
  /** Valid enum values */
  values: readonly string[]
  /** Value aliases: LLM-emitted value → canonical enum value */
  valueAliases?: Record<string, string>
}

const AXIS_REGISTRY: readonly AxisDef[] = [
  {
    name: 'radius',
    keyAliases: [],
    values: RADIUS_VALUES,
    valueAliases: { soft: 'rounded', square: 'sharp', hard: 'sharp' },
  },
  {
    name: 'shadow',
    keyAliases: ['shadows'],
    values: SHADOW_VALUES,
  },
  {
    name: 'gradient',
    keyAliases: ['gradients'],
    values: GRADIENT_VALUES,
  },
  {
    name: 'density',
    values: DENSITY_VALUES,
  },
  {
    name: 'typography',
    keyAliases: ['type'],
    values: TYPOGRAPHY_VALUES,
  },
  {
    name: 'motion',
    values: MOTION_VALUES,
    valueAliases: {
      static: 'none',
      gentle: 'subtle',
      kinetic: 'lively',
      animated: 'lively',
    },
  },
  {
    name: 'border',
    keyAliases: ['borders'],
    values: BORDER_VALUES,
    valueAliases: {
      thin: 'hairline',
      light: 'hairline',
      normal: 'medium',
      thick: 'bold',
      heavy: 'bold',
    },
  },
  {
    name: 'tracking',
    keyAliases: ['letterspacing', 'letter-spacing'],
    values: TRACKING_VALUES,
    valueAliases: { narrow: 'tight', loose: 'wide', spaced: 'wide' },
  },
  {
    name: 'leading',
    keyAliases: ['lineheight', 'line-height'],
    values: LEADING_VALUES,
    valueAliases: { tight: 'compact', loose: 'relaxed', wide: 'relaxed' },
  },
  {
    name: 'weight',
    keyAliases: ['fontweight', 'font-weight'],
    values: WEIGHT_VALUES,
    valueAliases: {
      thin: 'light',
      regular: 'normal',
      medium: 'normal',
      heavy: 'bold',
      extrabold: 'bold',
    },
  },
  {
    name: 'transform',
    keyAliases: ['texttransform', 'text-transform'],
    values: TRANSFORM_VALUES,
    valueAliases: { caps: 'uppercase', upper: 'uppercase', lower: 'lowercase' },
  },
  {
    name: 'image',
    keyAliases: ['imagetreatment', 'image-treatment'],
    values: IMAGE_VALUES,
    valueAliases: {
      bw: 'grayscale',
      mono: 'grayscale',
      color: 'plain',
      hover: 'zoom',
    },
  },
  {
    name: 'opacity',
    values: OPACITY_VALUES,
    valueAliases: { full: 'solid', faint: 'ghost', transparent: 'ghost' },
  },
  {
    name: 'chrome',
    values: CHROME_VALUES,
    valueAliases: {
      minimal: 'hairline',
      bold: 'brutalist',
      mono: 'terminal',
      magazine: 'editorial',
    },
  },
  {
    name: 'decor',
    values: DECOR_VALUES,
    valueAliases: {
      dots: 'dot-grid',
      grid: 'graph-paper',
      paper: 'graph-paper',
      orbs: 'glow',
    },
  },
] as const

/** Lookup: lowercased key → axis name (covers name + all keyAliases) */
const KEY_TO_AXIS: Map<string, string> = (() => {
  const m = new Map<string, string>()
  for (const axis of AXIS_REGISTRY) {
    m.set(axis.name.toLowerCase(), axis.name)
    for (const alias of axis.keyAliases ?? []) {
      m.set(alias.toLowerCase(), axis.name)
    }
  }
  return m
})()

/** Lookup: axis name → AxisDef */
const AXIS_BY_NAME: Map<string, AxisDef> = new Map(
  AXIS_REGISTRY.map((a) => [a.name, a]),
)

function resolveAxisValue(axis: AxisDef, v: string): string | undefined {
  if (axis.values.includes(v)) return v
  return axis.valueAliases?.[v]
}

/**
 * Parse a single axis token (key:value) into a resolved enum value.
 * Data-driven from AXIS_REGISTRY — no switch/case to maintain.
 */
function parseAxisToken(key: string, v: string): Partial<DesignIntent> {
  const axisName = KEY_TO_AXIS.get(key.toLowerCase())
  if (!axisName) return {}
  const axis = AXIS_BY_NAME.get(axisName)!
  const resolved = resolveAxisValue(axis, v.toLowerCase())
  return resolved ? ({ [axisName]: resolved } as Partial<DesignIntent>) : {}
}

/**
 * Parse a @design line into a FULL DesignIntent, filling unspecified axes
 * with DEFAULT_DESIGN. Use this for the global @design line where there's
 * no parent to inherit from.
 */
export function parseDesignLine(line: string): DesignIntent {
  const body = line.replace(/^@design\s+/i, '').trim()
  if (!body) return DEFAULT_DESIGN
  const override = parseDesignOverride(body)
  return { ...DEFAULT_DESIGN, ...override }
}

/**
 * Parse a @design string into a PARTIAL DesignIntent — only axes that
 * appear in the string are set, everything else is undefined.
 *
 * Use this for section/element overrides where unspecified axes should
 * inherit from the parent context (cascade merge), not reset to defaults.
 *
 * Accepts both "@design radius:sharp" and bare "radius:sharp".
 */
export function parseDesignOverride(input: string): Partial<DesignIntent> {
  const body = input.replace(/^@design\s+/i, '').trim()
  if (!body) return {}
  const override: Partial<DesignIntent> = {}
  for (const token of body.split(/\s+/)) {
    const parts = token.split(':').filter((p) => p.length > 0)
    if (parts.length < 2) continue
    const key = parts[0]
    const value = parts[parts.length - 1]
    const v = value.toLowerCase()
    Object.assign(override, parseAxisToken(key, v))
  }
  return override
}

/**
 * Merge a partial override onto a parent DesignIntent.
 * Only axes present in the override are replaced; everything else
 * inherits from the parent. This is the cascade: element → section → global.
 */
export function mergeDesign(
  parent: DesignIntent,
  override: Partial<DesignIntent>,
): DesignIntent {
  return { ...parent, ...override }
}

// ─── Serialization (for OpenUI compiler — provider needs serializable intent) ──

export function serializeDesignIntent(intent: DesignIntent): string {
  const parts = Object.entries(intent)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}:${v}`)
  return `@design ${parts.join(' ')}`
}
