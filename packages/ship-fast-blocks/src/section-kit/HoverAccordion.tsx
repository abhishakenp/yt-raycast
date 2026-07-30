import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

/**
 * HoverAccordion — a row of panels where hovering (or focusing) one
 * panel eases it wide via flex-grow. The accordion owns the expanded
 * index state; panels register via render-prop children or direct
 * composition. Desktop-only visual; render a fallback grid yourself
 * for small screens (the accordion accepts a `className` to gate by
 * breakpoint, e.g. `hidden lg:flex`).
 *
 * The transition curve is tuned to feel editorial: 700ms cubic-bezier
 * with a soft shadow fade.
 */
const hoverAccordionPanelVariants = cva(
 'group relative h-full min-w-0 overflow-hidden ',
 {
 variants: {
 ring: {
 border: 'ring-1 ring-border/60 hover:ring-primary/40',
 none: '',
 },
 },
 defaultVariants: {
 ring: 'border',
 },
 },
)

export interface HoverAccordionPanelProps
 extends
 React.HTMLAttributes<HTMLDivElement>,
 VariantProps<typeof hoverAccordionPanelVariants> {
 /** Whether this panel is the expanded one. */
 expanded?: boolean
 /** Flex-grow weight when expanded vs collapsed. */
 grow?: { expanded: number; collapsed: number }
 asChild?: boolean
}

const HoverAccordionPanel = React.forwardRef<
 HTMLDivElement,
 HoverAccordionPanelProps>(
 (
 {
 className,
 expanded = false,
 grow = { expanded: 3, collapsed: 1 },
 ring,
 asChild = false,
 ...props
 },
 ref,
 ) => {
 const Comp = asChild ? Slot : 'div'
 return (
 <Comp
 data-d-role="card"
 ref={ref}
 data-slot="hover-accordion-panel"
 className={cn(hoverAccordionPanelVariants({ ring }), className)}
 style={{
 flexGrow: expanded ? grow.expanded : grow.collapsed,
 flexBasis: 0,
 transition:
 'flex-grow 700ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 500ms ease',
 }}
 {...props}
 />
 )
 },
)
HoverAccordionPanel.displayName = 'HoverAccordionPanel'

export interface HoverAccordionContextValue {
 expanded: number | null
 setExpanded: (index: number | null) => void
}

const HoverAccordionContext =
 React.createContext<HoverAccordionContextValue | null>(null)

export interface HoverAccordionProps extends React.HTMLAttributes<HTMLDivElement> {
 /** Called when the expanded index changes (including null on leave). */
 onExpandedChange?: (index: number | null) => void
 asChild?: boolean
}

const HoverAccordion = React.forwardRef<HTMLDivElement, HoverAccordionProps>(
 (
 {
 className,
 onExpandedChange,
 onMouseLeave,
 children,
 asChild = false,
 ...props
 },
 ref,
 ) => {
 const [expanded, setExpanded] = React.useState<number | null>(null)
 const ctx = React.useMemo<HoverAccordionContextValue>(
 () => ({
 expanded,
 setExpanded: (i) => {
 setExpanded(i)
 onExpandedChange?.(i)
 },
 }),
 [expanded, onExpandedChange],
 )
 const Comp = asChild ? Slot : 'div'
 return (
 <HoverAccordionContext.Provider value={ctx}>
 <Comp
 data-d-role="container"
 ref={ref}
 data-slot="hover-accordion"
 className={cn('flex gap-4', className)}
 onMouseLeave={(e) => {
 setExpanded(null)
 onExpandedChange?.(null)
 onMouseLeave?.(e)
 }}
 {...props}>
 {children}
 </Comp>
 </HoverAccordionContext.Provider>
 )
 },
)
HoverAccordion.displayName = 'HoverAccordion'

/** Hook to read the nearest HoverAccordion context. */
function useHoverAccordion() {
 const ctx = React.useContext(HoverAccordionContext)
 if (!ctx) {
 throw new Error('useHoverAccordion must be used within a <HoverAccordion>')
 }
 return ctx
}

export {
 HoverAccordion,
 HoverAccordionPanel,
 hoverAccordionPanelVariants,
 useHoverAccordion,
}
