import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const SolutionGridVariants = cva('grid', {
 variants: {
 cols: {
 '1-2-3': 'gap-6 sm:grid-cols-2 lg:grid-cols-3',
 '1-2': 'gap-6 sm:grid-cols-2',
 '1-2-4': 'gap-6 sm:grid-cols-2 lg:grid-cols-4',
 '1-3': 'gap-6 md:grid-cols-3',
 '1-4': 'gap-6 lg:grid-cols-4',
 '1-md-2-3': 'gap-6 md:grid-cols-2 lg:grid-cols-3',
 '1-md-2-lg-3': 'gap-6 md:grid-cols-2 lg:grid-cols-3',
 },
 },
 defaultVariants: {
 cols: '1-2-3',
 },
})

const SolutionGrid = React.forwardRef<
 HTMLDivElement,
 React.ComponentProps<'div'> &
 VariantProps<typeof SolutionGridVariants> & { asChild?: boolean }>(({ className, cols, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'div'
 return (
 <Comp
 data-slot="solution-grid"
 data-d-role="grid"className={cn(SolutionGridVariants({ cols }), className)}
 ref={ref}
 {...props}
 />
 )
})
SolutionGrid.displayName = 'SolutionGrid'

const SolutionCard = React.forwardRef<
 HTMLElement,
 React.ComponentProps<'article'> & { asChild?: boolean }>(({ className, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'article'
 return (
 <Comp
 data-slot="solution-grid-item"
 data-d-role="card"className={cn(
 'group flex flex-col overflow-hidden border border-border bg-card',
 className,
 )}
 ref={ref}
 {...props}
 />
 )
})
SolutionCard.displayName = 'SolutionCard'

export { SolutionGrid, SolutionCard, SolutionGridVariants }
