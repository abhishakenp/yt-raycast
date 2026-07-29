/**
 * React context for the @design axis.
 *
 * Primitives call useDesign() to get resolved Tailwind classes.
 * The compiler wraps the site in <DesignSystemProvider intent={...}>.
 */
import { createContext, useContext, type ReactNode } from 'react'
import {
  resolveDesign,
  DEFAULT_DESIGN,
  type DesignIntent,
  type DesignClasses,
} from './design-system.ts'

const DesignContext = createContext<DesignClasses>(
  resolveDesign(DEFAULT_DESIGN),
)

export function DesignSystemProvider({
  intent,
  children,
}: {
  intent: DesignIntent
  children: ReactNode
}) {
  const classes = resolveDesign(intent)
  return (
    <DesignContext.Provider value={classes}>{children}</DesignContext.Provider>
  )
}

export function useDesign(): DesignClasses {
  return useContext(DesignContext)
}
