/**
 * React context for the @design axis.
 *
 * Two kinds of axes:
 * 1. Tailwind axes (radius, shadow, etc.): provider converts the Tailwind
 *    class to a CSS value and sets --d-{axis} as a single global custom
 *    property. CSS harmonizes per-role via multipliers.
 * 2. Named-concept axes (density, typography, etc.): provider sets
 *    data-{axis}="preset" on the wrapper. CSS maps presets to per-role
 *    values in design-presets.css.
 *
 * Per-role overrides: provider sets --d-{axis}-{role} which takes
 * precedence over the global --d-{axis}.
 *
 * Elements tagged with data-d-role get styled by CSS override rules.
 */
import { createContext, useContext, type ReactNode } from 'react'
import {
  DEFAULT_DESIGN,
  mergeDesign,
  designValueToCss,
  isNamedPreset,
  AXIS_NAMES,
  type DesignIntent,
  type DesignClasses,
} from './design-system.ts'

interface DesignContextValue {
  /** @deprecated Empty shape — CSS handles styling now. */
  classes: DesignClasses
  intent: DesignIntent
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

const DesignContext = createContext<DesignContextValue>({
  classes: EMPTY_CLASSES,
  intent: DEFAULT_DESIGN,
})

/**
 * Build data attributes for named-concept axes.
 * Only set data attributes for named presets — Tailwind axes use CSS vars.
 */
function buildDataAttrs(intent: DesignIntent): Record<string, string> {
  const attrs: Record<string, string> = {}
  for (const axisName of AXIS_NAMES) {
    const value = (intent as unknown as Record<string, unknown>)[axisName]
    if (typeof value === 'string' && value && isNamedPreset(axisName, value)) {
      attrs[`data-${axisName}`] = value
    }
  }
  return attrs
}

/**
 * Build inline CSS custom properties for Tailwind axes.
 * Sets --d-{axis} (global) from the Tailwind class CSS value.
 * Sets --d-{axis}-{role} for per-role overrides.
 */
function buildCustomProperties(intent: DesignIntent): Record<string, string> {
  const props: Record<string, string> = {}

  // Global value for each Tailwind axis
  for (const axisName of AXIS_NAMES) {
    const value = (intent as unknown as Record<string, unknown>)[axisName]
    if (typeof value !== 'string' || !value) continue
    // Skip named presets — CSS file handles them via data attributes
    if (isNamedPreset(axisName, value)) continue

    const cssValue = designValueToCss(value)
    if (cssValue === null) continue

    // Single global var — CSS harmonizes per-role
    props[`--d-${axisName}`] = cssValue
  }

  // Per-role overrides — set role-specific vars that take precedence
  if (intent.roles) {
    for (const [axisName, roleMap] of Object.entries(intent.roles)) {
      for (const [role, value] of Object.entries(roleMap)) {
        const cssValue = designValueToCss(value)
        if (cssValue !== null) {
          props[`--d-${axisName}-${role}`] = cssValue
        }
      }
    }
  }

  return props
}

export function DesignSystemProvider({
  intent,
  children,
}: {
  intent: DesignIntent
  children: ReactNode
}) {
  const dataAttrs = buildDataAttrs(intent)
  const customProps = buildCustomProperties(intent)

  return (
    <DesignContext.Provider value={{ classes: EMPTY_CLASSES, intent }}>
      <div {...dataAttrs} style={customProps}>
        {children}
      </div>
    </DesignContext.Provider>
  )
}

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

/** @deprecated CSS handles styling now. */
export function useDesign(): DesignClasses {
  return useContext(DesignContext).classes
}

export function useDesignIntent(): DesignIntent {
  return useContext(DesignContext).intent
}

export function useDesignCompositional(): { chrome?: string; decor?: string } {
  const intent = useContext(DesignContext).intent
  return { chrome: intent.chrome, decor: intent.decor }
}
