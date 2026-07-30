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

// ─── Design intent (serializable — flows through DSL → parser → compiler) ──

export interface DesignIntent {
  radius: Radius
  shadow: Shadow
  gradient: Gradient
  density: Density
  typography: Typography
  motion: Motion
}

export const DEFAULT_DESIGN: DesignIntent = {
  radius: 'sharp',
  shadow: 'hard',
  gradient: 'none',
  density: 'balanced',
  typography: 'editorial',
  motion: 'subtle',
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
  }
  shadow: {
    btn: string
    card: string
    container: string
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
}

// ─── Resolution tables ───────────────────────────────────────────────────

const RADIUS_TABLE: Record<Radius, Omit<DesignClasses['radius'], 'container'>> &
  Record<Radius, Pick<DesignClasses['radius'], 'container'>> = {
  sharp: {
    btn: 'rounded-none',
    card: 'rounded-none',
    input: 'rounded-none',
    badge: 'rounded-none',
    container: 'rounded-none',
  },
  soft: {
    btn: 'rounded-lg',
    card: 'rounded-lg',
    input: 'rounded-lg',
    badge: 'rounded-md',
    container: 'rounded-xl',
  },
  rounded: {
    btn: 'rounded-xl',
    card: 'rounded-xl',
    input: 'rounded-xl',
    badge: 'rounded-lg',
    container: 'rounded-2xl',
  },
  pill: {
    btn: 'rounded-full',
    card: 'rounded-3xl',
    input: 'rounded-full',
    badge: 'rounded-full',
    container: 'rounded-3xl',
  },
}

const SHADOW_TABLE: Record<Shadow, DesignClasses['shadow']> = {
  none: {
    btn: '',
    card: '',
    container: '',
  },
  soft: {
    btn: 'shadow-sm hover:shadow-md',
    card: 'shadow-sm',
    container: 'shadow-sm',
  },
  hard: {
    btn: 'shadow-[4px_4px_0_0] shadow-foreground hover:-translate-y-0.5',
    card: 'shadow-[4px_4px_0_0] shadow-foreground',
    container: 'shadow-[4px_4px_0_0] shadow-foreground',
  },
  brutalist: {
    btn: 'shadow-[8px_8px_0_0] shadow-foreground hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none',
    card: 'shadow-[8px_8px_0_0] shadow-foreground',
    container: 'shadow-[8px_8px_0_0] shadow-foreground',
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
  },
  balanced: {
    section: 'py-16',
    grid: 'gap-6',
    card: 'p-6',
  },
  airy: {
    section: 'py-24',
    grid: 'gap-10',
    card: 'p-8',
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

// ─── Resolver ────────────────────────────────────────────────────────────

export function resolveDesign(intent: DesignIntent): DesignClasses {
  return {
    radius: RADIUS_TABLE[intent.radius],
    shadow: SHADOW_TABLE[intent.shadow],
    gradient: GRADIENT_TABLE[intent.gradient],
    density: DENSITY_TABLE[intent.density],
    typography: TYPOGRAPHY_TABLE[intent.typography],
    motion: MOTION_TABLE[intent.motion],
  }
}

// ─── Parser: "@design radius:rounded gradients:vibrant ..." → DesignIntent ──

/**
 * Alias maps: values the prompt documents (but aren't in the enum) map to
 * valid enum values. This prevents silent drops when the LLM emits a
 * documented-but-invalid value like "motion:gentle" or "motion:kinetic".
 */
const RADIUS_ALIASES: Record<string, Radius> = {
  soft: 'rounded',
  square: 'sharp',
  hard: 'sharp',
}
const SHADOW_ALIASES: Record<string, Shadow> = {}
const GRADIENT_ALIASES: Record<string, Gradient> = {}
const DENSITY_ALIASES: Record<string, Density> = {}
const TYPOGRAPHY_ALIASES: Record<string, Typography> = {}
const MOTION_ALIASES: Record<string, Motion> = {
  static: 'none',
  gentle: 'subtle',
  kinetic: 'lively',
  animated: 'lively',
  lively: 'lively',
}

function resolveAxis<T extends string>(
  v: string,
  values: readonly T[],
  aliases: Record<string, T>,
): T | undefined {
  if (values.includes(v as T)) return v as T
  if (aliases[v]) return aliases[v]
  return undefined
}

export function parseDesignLine(line: string): DesignIntent {
  const intent: Partial<DesignIntent> = { ...DEFAULT_DESIGN }
  // Strip leading "@design" token
  const body = line.replace(/^@design\s+/i, '').trim()
  if (!body) return DEFAULT_DESIGN
  // Split on whitespace, each token is "key:value"
  for (const token of body.split(/\s+/)) {
    // Split on ":" and take the last non-empty part as the value.
    // This handles double-colons ("radius::sharp") and trailing colons.
    const parts = token.split(':').filter((p) => p.length > 0)
    if (parts.length < 2) continue
    const key = parts[0]
    const value = parts[parts.length - 1]
    const v = value.toLowerCase()
    switch (key.toLowerCase()) {
      case 'radius': {
        const resolved = resolveAxis(v, RADIUS_VALUES, RADIUS_ALIASES)
        if (resolved) intent.radius = resolved
        break
      }
      case 'shadow':
      case 'shadows': {
        const resolved = resolveAxis(v, SHADOW_VALUES, SHADOW_ALIASES)
        if (resolved) intent.shadow = resolved
        break
      }
      case 'gradient':
      case 'gradients': {
        const resolved = resolveAxis(v, GRADIENT_VALUES, GRADIENT_ALIASES)
        if (resolved) intent.gradient = resolved
        break
      }
      case 'density': {
        const resolved = resolveAxis(v, DENSITY_VALUES, DENSITY_ALIASES)
        if (resolved) intent.density = resolved
        break
      }
      case 'typography':
      case 'type': {
        const resolved = resolveAxis(v, TYPOGRAPHY_VALUES, TYPOGRAPHY_ALIASES)
        if (resolved) intent.typography = resolved
        break
      }
      case 'motion': {
        const resolved = resolveAxis(v, MOTION_VALUES, MOTION_ALIASES)
        if (resolved) intent.motion = resolved
        break
      }
    }
  }
  return intent as DesignIntent
}

// ─── Serialization (for OpenUI compiler — provider needs serializable intent) ──

export function serializeDesignIntent(intent: DesignIntent): string {
  return `@design radius:${intent.radius} shadow:${intent.shadow} gradient:${intent.gradient} density:${intent.density} typography:${intent.typography} motion:${intent.motion}`
}
