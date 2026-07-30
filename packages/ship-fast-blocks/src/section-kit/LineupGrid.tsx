import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const LineupGridVariants = cva('grid', {
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

const LineupGrid = React.forwardRef<
 HTMLDivElement,
 React.ComponentProps<'div'> &
 VariantProps<typeof LineupGridVariants> & { asChild?: boolean }>(({ className, cols, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'div'
 return (
 <Comp
 data-slot="lineup-grid"
 data-d-role="grid"className={cn(LineupGridVariants({ cols }), className)}
 ref={ref}
 {...props}
 />
 )
})
LineupGrid.displayName = 'LineupGrid'

const LineupCard = React.forwardRef<
 HTMLElement,
 React.ComponentProps<'article'> & { asChild?: boolean }>(({ className, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'article'
 return (
 <Comp
 data-slot="lineup-grid-item"
 data-d-role="card"className={cn(
 'group flex flex-col overflow-hidden border border-border bg-card',
 className,
 )}
 ref={ref}
 {...props}
 />
 )
})
LineupCard.displayName = 'LineupCard'

const ArtistCard = React.forwardRef<
 HTMLElement,
 React.ComponentProps<'article'> & { asChild?: boolean }>(({ className, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'article'
 return (
 <Comp
 data-slot="artist-card"
 data-d-role="card"className={cn(
 'group relative block overflow-hidden text-left',
 className,
 )}
 ref={ref}
 {...props}
 />
 )
})
ArtistCard.displayName = 'ArtistCard'

const ArtistTier = React.forwardRef<
 HTMLElement,
 React.ComponentProps<'article'> & { asChild?: boolean }>(({ className, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'article'
 return (
 <Comp
 data-slot="artist-tier"
 data-d-role="card"className={cn(
 'flex flex-col items-center justify-center border border-border bg-card p-4 text-center transition-colors hover:border-primary/40',
 className,
 )}
 ref={ref}
 {...props}
 />
 )
})
ArtistTier.displayName = 'ArtistTier'

export { LineupGrid, LineupCard, ArtistCard, ArtistTier, LineupGridVariants }
