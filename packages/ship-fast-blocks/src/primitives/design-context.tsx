/**
 * React context for the @design axis.
 *
 * Primitives call useDesign() to get resolved Tailwind classes.
 * The compiler wraps the site in <DesignSystemProvider intent={...}>.
 *
 * In addition to the React context, the provider injects CSS override layers
 * that remap hardcoded Tailwind utilities to match the design intent:
 *   - `rounded-*` → radius intent
 *   - `shadow-*` → shadow intent
 *   - `bg-gradient-*` → gradient intent (none removes all gradients)
 *   - `transition-*` / `duration-*` → motion intent
 *   - `font-serif` / `font-mono` → typography intent
 *
 * This fixes hundreds of hardcoded classes in section-kit components WITHOUT
 * needing to edit each one.
 *
 * Elements that should always stay round regardless of design intent
 * (avatars, icon circles, toggle switches) use the `d-radius-lock` class
 * to opt out of the radius override. Similarly, `d-shadow-lock` opts out
 * of shadow overrides, and `d-gradient-lock` opts out of gradient overrides.
 *
 * Color palettes are handled by the existing theme system (theme-presets.ts),
 * which sets CSS custom properties (--primary, --background, etc.) via
 * applyThemeVars. This provider does NOT duplicate that — it only handles
 * the structural design axes (radius, shadow, gradient, motion, typography).
 */
import { createContext, useContext, type ReactNode } from 'react'
import {
  resolveDesign,
  DEFAULT_DESIGN,
  mergeDesign,
  type DesignIntent,
  type DesignClasses,
  type Radius,
  type Shadow,
  type Gradient,
  type Motion,
  type Typography,
  type Border,
  type Tracking,
  type Leading,
  type Weight,
  type Transform,
  type ImageTreatment,
  type Opacity,
  type Chrome,
  type Decor,
} from './design-system.ts'

interface DesignContextValue {
  /** Resolved Tailwind classes for the current design intent. */
  classes: DesignClasses
  /** The raw design intent (for cascade merging in nested providers). */
  intent: DesignIntent
}

const DesignContext = createContext<DesignContextValue>({
  classes: resolveDesign(DEFAULT_DESIGN),
  intent: DEFAULT_DESIGN,
})

// ─── CSS override layer ───────────────────────────────────────────────────
//
// Two-tier approach:
// 1. Per-role overrides: elements tagged with `data-d-role="btn|card|..."`
//    get role-specific CSS values via CSS custom properties.
// 2. Blanket fallback: untagged elements get blanket overrides (legacy compat).
//
// The provider sets CSS custom properties for each role, then override rules
// apply the right variable to each element based on its role.

// ── CSS value maps (for blanket fallback + custom property values) ──

const RADIUS_CSS: Record<Radius, string> = {
  sharp: '0px',
  soft: '0.5rem',
  rounded: '0.75rem',
  pill: '9999px',
}

// Per-role radius values — buttons/containers get more radius than badges
const RADIUS_ROLE_CSS: Record<Radius, Record<string, string>> = {
  sharp: {
    btn: '0px',
    card: '0px',
    input: '0px',
    badge: '0px',
    container: '0px',
    link: '0px',
    image: '0px',
    icon: '0px',
  },
  soft: {
    btn: '0.5rem',
    card: '0.5rem',
    input: '0.5rem',
    badge: '0.375rem',
    container: '0.75rem',
    link: '0.375rem',
    image: '0.5rem',
    icon: '9999px',
  },
  rounded: {
    btn: '0.75rem',
    card: '0.75rem',
    input: '0.75rem',
    badge: '0.5rem',
    container: '1rem',
    link: '0.5rem',
    image: '0.75rem',
    icon: '9999px',
  },
  pill: {
    btn: '9999px',
    card: '1.5rem',
    input: '9999px',
    badge: '9999px',
    container: '1.5rem',
    link: '9999px',
    image: '1.5rem',
    icon: '9999px',
  },
}

const SHADOW_CSS: Record<Shadow, string> = {
  none: 'none',
  soft: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  hard: '4px 4px 0 0 currentColor',
  brutalist: '8px 8px 0 0 currentColor',
}

const SHADOW_ROLE_CSS: Record<Shadow, Record<string, string>> = {
  none: { btn: 'none', card: 'none', container: 'none', image: 'none' },
  soft: {
    btn: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    card: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    container: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    image: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  },
  hard: {
    btn: '4px 4px 0 0 currentColor',
    card: '4px 4px 0 0 currentColor',
    container: '4px 4px 0 0 currentColor',
    image: '4px 4px 0 0 currentColor',
  },
  brutalist: {
    btn: '8px 8px 0 0 currentColor',
    card: '8px 8px 0 0 currentColor',
    container: '8px 8px 0 0 currentColor',
    image: '8px 8px 0 0 currentColor',
  },
}

const MOTION_CSS: Record<Motion, { transition: string; duration: string }> = {
  none: { transition: 'none', duration: '0s' },
  subtle: { transition: 'all', duration: '200ms' },
  lively: { transition: 'all', duration: '300ms' },
}

// ── New axis CSS value maps ──

const BORDER_CSS: Record<Border, string> = {
  hairline: '1px',
  medium: '2px',
  bold: '4px',
}

const TRACKING_CSS: Record<Tracking, Record<string, string>> = {
  tight: {
    display: '-0.05em',
    heading: '-0.025em',
    body: '-0.025em',
    eyebrow: '-0.025em',
  },
  normal: { display: '0', heading: '0', body: '0', eyebrow: '0.1em' },
  wide: {
    display: '0.025em',
    heading: '0.025em',
    body: '0.025em',
    eyebrow: '0.2em',
  },
}

const LEADING_CSS: Record<Leading, Record<string, string>> = {
  compact: { display: '0.85', heading: '1.1', body: '1.375' },
  normal: { display: '0.92', heading: '1.5', body: '1.625' },
  relaxed: { display: '0.98', heading: '1.75', body: '2' },
}

const WEIGHT_CSS: Record<Weight, Record<string, string>> = {
  light: { display: '200', heading: '300', body: '300', eyebrow: '300' },
  normal: { display: '400', heading: '400', body: '400', eyebrow: '400' },
  bold: { display: '800', heading: '700', body: '500', eyebrow: '600' },
  black: { display: '900', heading: '900', body: '700', eyebrow: '700' },
}

const TRANSFORM_CSS: Record<Transform, string> = {
  none: 'none',
  uppercase: 'uppercase',
  lowercase: 'lowercase',
}

const IMAGE_CSS: Record<ImageTreatment, string> = {
  plain: 'none',
  grayscale: 'grayscale(1)',
  duotone: 'grayscale(1) contrast(1.25) brightness(1.1)',
  zoom: 'none', // zoom is a hover transform, handled via class
}

const OPACITY_CSS: Record<Opacity, Record<string, string>> = {
  solid: { decor: '1', watermark: '0.08', divider: '1' },
  subtle: { decor: '0.5', watermark: '0.04', divider: '0.5' },
  ghost: { decor: '0.2', watermark: '0.02', divider: '0.2' },
}

// ── Helper: build CSS custom properties for provider ──

function buildCustomProperties(intent: DesignIntent): Record<string, string> {
  const props: Record<string, string> = {}
  // Radius per-role
  const radiusRoles = RADIUS_ROLE_CSS[intent.radius]
  for (const [role, val] of Object.entries(radiusRoles)) {
    props[`--d-radius-${role}`] = val
  }
  // Shadow per-role
  const shadowRoles = SHADOW_ROLE_CSS[intent.shadow]
  for (const [role, val] of Object.entries(shadowRoles)) {
    props[`--d-shadow-${role}`] = val
  }
  // Motion
  const motion = MOTION_CSS[intent.motion]
  props['--d-motion-transition'] = motion.transition
  props['--d-motion-duration'] = motion.duration
  // New axes (only if set — undefined = component decides)
  if (intent.border) {
    props['--d-border-width'] = BORDER_CSS[intent.border]
  }
  if (intent.tracking) {
    const tr = TRACKING_CSS[intent.tracking]
    for (const [role, val] of Object.entries(tr)) {
      props[`--d-tracking-${role}`] = val
    }
  }
  if (intent.leading) {
    const ld = LEADING_CSS[intent.leading]
    for (const [role, val] of Object.entries(ld)) {
      props[`--d-leading-${role}`] = val
    }
  }
  if (intent.weight) {
    const wt = WEIGHT_CSS[intent.weight]
    for (const [role, val] of Object.entries(wt)) {
      props[`--d-weight-${role}`] = val
    }
  }
  if (intent.transform) {
    props['--d-transform'] = TRANSFORM_CSS[intent.transform]
  }
  if (intent.image) {
    props['--d-image-filter'] = IMAGE_CSS[intent.image]
  }
  if (intent.opacity) {
    const op = OPACITY_CSS[intent.opacity]
    for (const [role, val] of Object.entries(op)) {
      props[`--d-opacity-${role}`] = val
    }
  }
  return props
}

// ── Per-role override rules (applied via data-d-role) ──

const RADIUS_CLASSES = [
  'rounded-sm',
  'rounded-md',
  'rounded-lg',
  'rounded-xl',
  'rounded-2xl',
  'rounded-3xl',
  'rounded-full',
  'rounded-none',
]
const SHADOW_CLASSES = [
  'shadow-sm',
  'shadow-md',
  'shadow-lg',
  'shadow-xl',
  'shadow-2xl',
  'shadow-none',
]
const BORDER_CLASSES = [
  'border',
  'border-2',
  'border-4',
  'border-8',
  'border-t',
  'border-t-2',
  'border-t-4',
  'border-b',
  'border-b-2',
  'border-l',
  'border-r',
]

function buildPerRoleRadiusCSS(intent: Radius): string {
  const lines: string[] = []
  for (const role of [
    'btn',
    'card',
    'input',
    'badge',
    'container',
    'link',
    'image',
    'icon',
  ]) {
    for (const cls of RADIUS_CLASSES) {
      lines.push(
        `[data-radius="${intent}"] [data-d-role="${role}"].${cls}:not(.d-radius-lock) { border-radius: var(--d-radius-${role}); }`,
      )
    }
  }
  return lines.join('\n')
}

function buildPerRoleShadowCSS(intent: Shadow): string {
  const lines: string[] = []
  for (const role of ['btn', 'card', 'container', 'image']) {
    for (const cls of SHADOW_CLASSES) {
      lines.push(
        `[data-shadow="${intent}"] [data-d-role="${role}"].${cls}:not(.d-shadow-lock) { box-shadow: var(--d-shadow-${role}); }`,
      )
    }
  }
  // Arbitrary shadow utilities
  if (intent === 'none') {
    for (const role of ['btn', 'card', 'container', 'image']) {
      lines.push(
        `[data-shadow="none"] [data-d-role="${role}"].shadow-\\[.*\\]:not(.d-shadow-lock) { box-shadow: none !important; }`,
      )
    }
  }
  return lines.join('\n')
}

function buildPerRoleBorderCSS(intent: Border): string {
  const lines: string[] = []
  for (const role of [
    'btn',
    'card',
    'input',
    'container',
    'divider',
    'image',
  ]) {
    for (const cls of BORDER_CLASSES) {
      lines.push(
        `[data-border="${intent}"] [data-d-role="${role}"].${cls}:not(.d-border-lock) { border-width: var(--d-border-width); }`,
      )
    }
  }
  return lines.join('\n')
}

function buildPerRoleTrackingCSS(intent: Tracking): string {
  const lines: string[] = []
  for (const role of ['display', 'heading', 'body', 'eyebrow']) {
    lines.push(
      `[data-tracking="${intent}"] [data-d-role="${role}"]:not(.d-tracking-lock) { letter-spacing: var(--d-tracking-${role}); }`,
    )
  }
  return lines.join('\n')
}

function buildPerRoleLeadingCSS(intent: Leading): string {
  const lines: string[] = []
  for (const role of ['display', 'heading', 'body']) {
    lines.push(
      `[data-leading="${intent}"] [data-d-role="${role}"]:not(.d-leading-lock) { line-height: var(--d-leading-${role}); }`,
    )
  }
  return lines.join('\n')
}

function buildPerRoleWeightCSS(intent: Weight): string {
  const lines: string[] = []
  for (const role of ['display', 'heading', 'body', 'eyebrow']) {
    lines.push(
      `[data-weight="${intent}"] [data-d-role="${role}"]:not(.d-weight-lock) { font-weight: var(--d-weight-${role}); }`,
    )
  }
  return lines.join('\n')
}

function buildPerRoleTransformCSS(intent: Transform): string {
  if (intent === 'none') return ''
  const lines: string[] = []
  for (const role of ['eyebrow', 'display', 'heading']) {
    lines.push(
      `[data-transform="${intent}"] [data-d-role="${role}"]:not(.d-transform-lock) { text-transform: var(--d-transform); }`,
    )
  }
  return lines.join('\n')
}

function buildPerRoleImageCSS(intent: ImageTreatment): string {
  if (intent === 'plain') return ''
  if (intent === 'zoom') return '' // zoom is a class, not a filter
  const lines: string[] = []
  lines.push(
    `[data-image="${intent}"] [data-d-role="image"]:not(.d-image-lock) { filter: var(--d-image-filter); }`,
  )
  return lines.join('\n')
}

function buildPerRoleOpacityCSS(intent: Opacity): string {
  const lines: string[] = []
  for (const role of ['decor', 'watermark', 'divider']) {
    lines.push(
      `[data-opacity="${intent}"] [data-d-role="${role}"]:not(.d-opacity-lock) { opacity: var(--d-opacity-${role}); }`,
    )
  }
  return lines.join('\n')
}

// ── Blanket fallback overrides (for untagged elements — legacy compat) ──

function buildBlanketRadiusCSS(intent: Radius): string {
  const css = RADIUS_CSS[intent]
  const lines: string[] = []
  for (const cls of RADIUS_CLASSES) {
    if (cls === 'rounded-full' && intent === 'pill') continue
    if (cls === 'rounded-none' && intent === 'sharp') continue
    lines.push(
      `[data-radius="${intent}"] .${cls}:not(.d-radius-lock):not([data-d-role]) { border-radius: ${css}; }`,
    )
  }
  return lines.join('\n')
}

function buildBlanketShadowCSS(intent: Shadow): string {
  const css = SHADOW_CSS[intent]
  const lines: string[] = []
  for (const cls of SHADOW_CLASSES) {
    lines.push(
      `[data-shadow="${intent}"] .${cls}:not(.d-shadow-lock):not([data-d-role]) { box-shadow: ${css}; }`,
    )
  }
  if (intent === 'none') {
    lines.push(
      `[data-shadow="none"] .shadow-\\[.*\\]:not(.d-shadow-lock):not([data-d-role]) { box-shadow: none !important; }`,
    )
  }
  return lines.join('\n')
}

function buildBlanketGradientCSS(intent: Gradient): string {
  if (intent !== 'none') return ''
  const lines: string[] = []
  for (const cls of [
    'bg-gradient-to-r',
    'bg-gradient-to-l',
    'bg-gradient-to-t',
    'bg-gradient-to-b',
    'bg-gradient-to-tr',
    'bg-gradient-to-tl',
    'bg-gradient-to-br',
    'bg-gradient-to-bl',
  ]) {
    lines.push(
      `[data-gradient="none"] .${cls}:not(.d-gradient-lock) { background-image: none; }`,
    )
  }
  return lines.join('\n')
}

function buildBlanketMotionCSS(intent: Motion): string {
  if (intent !== 'none') return ''
  const lines: string[] = []
  for (const cls of [
    'transition-all',
    'transition-colors',
    'transition-transform',
    'transition-opacity',
    'transition-shadow',
  ]) {
    lines.push(
      `[data-motion="none"] .${cls}:not(.d-motion-lock) { transition: none; }`,
    )
  }
  lines.push(
    `[data-motion="none"] .transition-\\[.*\\]:not(.d-motion-lock) { transition: none; }`,
  )
  return lines.join('\n')
}

function buildBlanketTypographyCSS(intent: Typography): string {
  const lines: string[] = []
  if (intent === 'editorial') {
    lines.push(
      `[data-typography="editorial"] h1:not(.d-type-lock), [data-typography="editorial"] h2:not(.d-type-lock), [data-typography="editorial"] h3:not(.d-type-lock) { font-family: var(--font-serif, Georgia, serif); }`,
    )
  } else if (intent === 'technical') {
    lines.push(
      `[data-typography="technical"] .font-mono:not(.d-type-lock) { font-family: var(--font-mono, monospace); }`,
    )
    lines.push(
      `[data-typography="technical"] .font-serif:not(.d-type-lock) { font-family: var(--font-mono, monospace); }`,
    )
  }
  return lines.join('\n')
}

// ── Pre-build all override CSS (cached per enum value) ──

function buildAllOverrides(intent: DesignIntent): string {
  const parts: string[] = []
  // Per-role overrides (higher priority — applied when data-d-role is set)
  parts.push(buildPerRoleRadiusCSS(intent.radius))
  parts.push(buildPerRoleShadowCSS(intent.shadow))
  if (intent.border) parts.push(buildPerRoleBorderCSS(intent.border))
  if (intent.tracking) parts.push(buildPerRoleTrackingCSS(intent.tracking))
  if (intent.leading) parts.push(buildPerRoleLeadingCSS(intent.leading))
  if (intent.weight) parts.push(buildPerRoleWeightCSS(intent.weight))
  if (intent.transform) parts.push(buildPerRoleTransformCSS(intent.transform))
  if (intent.image) parts.push(buildPerRoleImageCSS(intent.image))
  if (intent.opacity) parts.push(buildPerRoleOpacityCSS(intent.opacity))
  // Blanket fallback (for untagged elements)
  parts.push(buildBlanketRadiusCSS(intent.radius))
  parts.push(buildBlanketShadowCSS(intent.shadow))
  parts.push(buildBlanketGradientCSS(intent.gradient))
  parts.push(buildBlanketMotionCSS(intent.motion))
  parts.push(buildBlanketTypographyCSS(intent.typography))
  return parts.filter(Boolean).join('\n')
}

export function DesignSystemProvider({
  intent,
  children,
}: {
  intent: DesignIntent
  children: ReactNode
}) {
  const classes = resolveDesign(intent)
  const customProps = buildCustomProperties(intent)
  const overrideCSS = buildAllOverrides(intent)

  return (
    <DesignContext.Provider value={{ classes, intent }}>
      <div
        data-radius={intent.radius}
        data-shadow={intent.shadow}
        data-gradient={intent.gradient}
        data-motion={intent.motion}
        data-typography={intent.typography}
        data-density={intent.density}
        {...(intent.border && { 'data-border': intent.border })}
        {...(intent.tracking && { 'data-tracking': intent.tracking })}
        {...(intent.leading && { 'data-leading': intent.leading })}
        {...(intent.weight && { 'data-weight': intent.weight })}
        {...(intent.transform && { 'data-transform': intent.transform })}
        {...(intent.image && { 'data-image': intent.image })}
        {...(intent.opacity && { 'data-opacity': intent.opacity })}
        {...(intent.chrome && { 'data-chrome': intent.chrome })}
        {...(intent.decor && { 'data-decor': intent.decor })}
        style={customProps}
      >
        <style>{overrideCSS}</style>
        {children}
      </div>
    </DesignContext.Provider>
  )
}

/**
 * Element-level design override. Merges a partial DesignIntent onto the
 * parent context (from the nearest DesignSystemProvider or DesignOverride).
 * Unspecified axes inherit from the parent — this is the cascade:
 *   element → section → global
 *
 * Wraps children in a nested DesignSystemProvider with the merged intent,
 * so the CSS override layer applies within this subtree only.
 */
export function DesignOverride({
  override,
  children,
}: {
  override: Partial<DesignIntent>
  children: ReactNode
}) {
  const parent = useContext(DesignContext)
  const merged = mergeDesign(parent.intent, override)
  return <DesignSystemProvider intent={merged}>{children}</DesignSystemProvider>
}

/**
 * Get resolved Tailwind classes for the current design intent.
 * Use in primitives: `const d = useDesign(); d.radius.btn; d.shadow.card;`
 */
export function useDesign(): DesignClasses {
  return useContext(DesignContext).classes
}

/**
 * Get the raw design intent for cascade merging.
 * Use in DesignOverride and section-level merge logic.
 */
export function useDesignIntent(): DesignIntent {
  return useContext(DesignContext).intent
}

/**
 * Get compositional axes (chrome, decor) from design context.
 * Returns undefined for axes not set — caller should fall back to prop value.
 *
 * Usage in motifs:
 *   const { chrome, decor } = useDesignCompositional()
 *   const effectiveChrome = props.chrome ?? chrome ?? 'editorial'
 */
export function useDesignCompositional(): {
  chrome?: Chrome
  decor?: Decor
} {
  const intent = useContext(DesignContext).intent
  return {
    chrome: intent.chrome,
    decor: intent.decor,
  }
}
