import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const PiecesGridVariants = cva('grid', {
 variants: {
 cols: {
 '1-2-3': 'gap-6 sm:grid-cols-2 lg:grid-cols-3',
 '1-2': 'gap-6 sm:grid-cols-2',
 '1-2-4': 'gap-6 sm:grid-cols-2 lg:grid-cols-4',
 '1-3': 'gap-6 md:grid-cols-3',
 '1-4': 'gap-6 lg:grid-cols-4',
 '1-md-2-3': 'gap-6 md:grid-cols-2 lg:grid-cols-3',
 },
 },
 defaultVariants: {
 cols: '1-2-3',
 },
})

const PiecesGrid = React.forwardRef<
 HTMLDivElement,
 React.ComponentProps<'div'> &
 VariantProps<typeof PiecesGridVariants> & { asChild?: boolean }>(({ className, cols, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'div'
 return (
 <Comp
 data-slot="pieces-grid"
 data-d-role="grid"className={cn(PiecesGridVariants({ cols }), className)}
 ref={ref}
 {...props}
 />
 )
})
PiecesGrid.displayName = 'PiecesGrid'

const PiecesCard = React.forwardRef<
 HTMLElement,
 React.ComponentProps<'article'> & { asChild?: boolean }>(({ className, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'article'
 return (
 <Comp
 data-slot="pieces-grid-item"
 data-d-role="card"className={cn(
 'group flex flex-col overflow-hidden border border-border bg-card',
 className,
 )}
 ref={ref}
 {...props}
 />
 )
})
PiecesCard.displayName = 'PiecesCard'

const PieceSpecs = React.forwardRef<
 HTMLParagraphElement,
 React.ComponentProps<'p'> & { asChild?: boolean }>(({ className, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'p'
 return (
 <Comp
 data-slot="piece-specs"
 className={cn('text-sm text-muted-foreground', className)}
 ref={ref}
 {...props}
 />
 )
})
PieceSpecs.displayName = 'PieceSpecs'

export { PiecesGrid, PiecesCard, PieceSpecs, PiecesGridVariants }
