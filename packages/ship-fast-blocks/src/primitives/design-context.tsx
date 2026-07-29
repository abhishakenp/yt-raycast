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
  type DesignIntent,
  type DesignClasses,
  type Radius,
  type Shadow,
  type Gradient,
  type Motion,
  type Typography,
} from './design-system.ts'

const DesignContext = createContext<DesignClasses>(
  resolveDesign(DEFAULT_DESIGN),
)

// ─── CSS override layer ───────────────────────────────────────────────────
//
// Each axis maps Tailwind utility classes to CSS values matching the design
// intent. Overrides use data attribute selectors so they only apply inside
// a DesignSystemProvider wrapper.

const RADIUS_CSS: Record<Radius, string> = {
  sharp: '0px',
  soft: '0.5rem',
  rounded: '0.75rem',
  pill: '9999px',
}

const SHADOW_CSS: Record<Shadow, string> = {
  none: 'none',
  soft: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  hard: '4px 4px 0 0 currentColor',
  brutalist: '8px 8px 0 0 currentColor',
}

const MOTION_CSS: Record<Motion, { transition: string; duration: string }> = {
  none: { transition: 'none', duration: '0s' },
  subtle: { transition: 'all', duration: '200ms' },
  lively: { transition: 'all', duration: '300ms' },
}

const GRADIENT_NONE_CSS = 'none' // used to kill gradients when intent is none

// ── Radius override ──
function buildRadiusOverrideCSS(intent: Radius): string {
  const css = RADIUS_CSS[intent]
  const lines: string[] = []
  for (const cls of [
    'rounded-sm',
    'rounded-md',
    'rounded-lg',
    'rounded-xl',
    'rounded-2xl',
    'rounded-3xl',
  ]) {
    lines.push(`[data-radius="${intent}"] .${cls}:not(.d-radius-lock) { border-radius: ${css}; }`)
  }
  if (intent !== 'pill') {
    lines.push(`[data-radius="${intent}"] .rounded-full:not(.d-radius-lock) { border-radius: ${css}; }`)
  }
  if (intent !== 'sharp') {
    lines.push(`[data-radius="${intent}"] .rounded-none:not(.d-radius-lock) { border-radius: ${css}; }`)
  }
  return lines.join('\n')
}

// ── Shadow override ──
function buildShadowOverrideCSS(intent: Shadow): string {
  const css = SHADOW_CSS[intent]
  const lines: string[] = []
  for (const cls of [
    'shadow-sm',
    'shadow-md',
    'shadow-lg',
    'shadow-xl',
    'shadow-2xl',
    'shadow-none',
  ]) {
    lines.push(`[data-shadow="${intent}"] .${cls}:not(.d-shadow-lock) { box-shadow: ${css}; }`)
  }
  // Also override arbitrary shadow utilities like shadow-[8px_8px_0_0]
  if (intent === 'none') {
    lines.push(`[data-shadow="none"] .shadow-\\[.*\\]:not(.d-shadow-lock) { box-shadow: none !important; }`)
  }
  return lines.join('\n')
}

// ── Gradient override ──
function buildGradientOverrideCSS(intent: Gradient): string {
  if (intent === 'none') {
    // Kill all gradient utilities
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
      lines.push(`[data-gradient="none"] .${cls}:not(.d-gradient-lock) { background-image: none; }`)
    }
    return lines.join('\n')
  }
  return ''
}

// ── Motion override ──
function buildMotionOverrideCSS(intent: Motion): string {
  const { transition, duration } = MOTION_CSS[intent]
  const lines: string[] = []
  if (intent === 'none') {
    lines.push(`[data-motion="none"] .transition-all:not(.d-motion-lock) { transition: none; }`)
    lines.push(`[data-motion="none"] .transition-colors:not(.d-motion-lock) { transition: none; }`)
    lines.push(`[data-motion="none"] .transition-transform:not(.d-motion-lock) { transition: none; }`)
    lines.push(`[data-motion="none"] .transition-opacity:not(.d-motion-lock) { transition: none; }`)
    lines.push(`[data-motion="none"] .transition-shadow:not(.d-motion-lock) { transition: none; }`)
    lines.push(`[data-motion="none"] .transition-\\[.*\\]:not(.d-motion-lock) { transition: none; }`)
  }
  return lines.join('\n')
}

// ── Typography override ──
// When typography is editorial, force font-serif on headings.
// When typography is technical, force font-mono on eyebrows/labels.
// This is lighter touch — only overrides font-family, not weight/size.
function buildTypographyOverrideCSS(intent: Typography): string {
  const lines: string[] = []
  if (intent === 'editorial') {
    lines.push(`[data-typography="editorial"] h1:not(.d-type-lock), [data-typography="editorial"] h2:not(.d-type-lock), [data-typography="editorial"] h3:not(.d-type-lock) { font-family: var(--font-serif, Georgia, serif); }`)
  } else if (intent === 'technical') {
    lines.push(`[data-typography="technical"] .font-mono:not(.d-type-lock) { font-family: var(--font-mono, monospace); }`)
    lines.push(`[data-typography="technical"] .font-serif:not(.d-type-lock) { font-family: var(--font-mono, monospace); }`)
  }
  return lines.join('\n')
}

// Pre-build all override CSS strings
const RADIUS_OVERRIDE_CACHE: Record<Radius, string> = {
  sharp: buildRadiusOverrideCSS('sharp'),
  soft: buildRadiusOverrideCSS('soft'),
  rounded: buildRadiusOverrideCSS('rounded'),
  pill: buildRadiusOverrideCSS('pill'),
}

const SHADOW_OVERRIDE_CACHE: Record<Shadow, string> = {
  none: buildShadowOverrideCSS('none'),
  soft: buildShadowOverrideCSS('soft'),
  hard: buildShadowOverrideCSS('hard'),
  brutalist: buildShadowOverrideCSS('brutalist'),
}

const GRADIENT_OVERRIDE_CACHE: Record<Gradient, string> = {
  none: buildGradientOverrideCSS('none'),
  subtle: '',
  vibrant: '',
  mesh: '',
}

const MOTION_OVERRIDE_CACHE: Record<Motion, string> = {
  none: buildMotionOverrideCSS('none'),
  subtle: '',
  lively: '',
}

const TYPOGRAPHY_OVERRIDE_CACHE: Record<Typography, string> = {
  editorial: buildTypographyOverrideCSS('editorial'),
  technical: buildTypographyOverrideCSS('technical'),
  display: '',
  humanist: '',
}

export function DesignSystemProvider({
  intent,
  children,
}: {
  intent: DesignIntent
  children: ReactNode
}) {
  const classes = resolveDesign(intent)
  const overrideCSS = [
    RADIUS_OVERRIDE_CACHE[intent.radius],
    SHADOW_OVERRIDE_CACHE[intent.shadow],
    GRADIENT_OVERRIDE_CACHE[intent.gradient],
    MOTION_OVERRIDE_CACHE[intent.motion],
    TYPOGRAPHY_OVERRIDE_CACHE[intent.typography],
  ].filter(Boolean).join('\n')

  return (
    <DesignContext.Provider value={classes}>
      <div
        data-radius={intent.radius}
        data-shadow={intent.shadow}
        data-gradient={intent.gradient}
        data-motion={intent.motion}
        data-typography={intent.typography}
      >
        <style>{overrideCSS}</style>
        {children}
      </div>
    </DesignContext.Provider>
  )
}

export function useDesign(): DesignClasses {
  return useContext(DesignContext)
}
