import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

/**
 * BentoGrid — CSS grid container for bento-style image galleries where tiles
 * declare per-item col-span / row-span. Uses the same cols + gap CVA variants
 * as ResponsiveGrid. Pass BentoTile children; each tile carries its own span
 * classes and chrome (aspect, rounded, hover) via className.
 */
const bentoGridVariants = cva('grid', {
  variants: {
    cols: {
      '2-lg-3': 'grid-cols-2 lg:grid-cols-3',
      '2-lg-4': 'grid-cols-2 lg:grid-cols-4',
      '2-md-4': 'grid-cols-2 md:grid-cols-4',
      '2-3-4': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      '1-2-4': 'sm:grid-cols-2 lg:grid-cols-4',
      '1-md-2-3': 'md:grid-cols-2 lg:grid-cols-3',
      '1-md-2-4': 'md:grid-cols-2 lg:grid-cols-4',
    },
    gap: {
      none: 'gap-0',
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
    },
  },
  defaultVariants: {
    cols: '2-lg-4',
    gap: 'sm',
  },
})

export interface BentoGridProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bentoGridVariants> {
  asChild?: boolean
}

const BentoGrid = React.forwardRef<HTMLDivElement, BentoGridProps>(
  ({ className, cols, gap, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp
        ref={ref}
        data-slot="bento-grid"
        className={cn(bentoGridVariants({ cols, gap }), className)}
        {...props}
      />
    )
  },
)
BentoGrid.displayName = 'BentoGrid'

/**
 * BentoTile — grid item wrapper for a bento gallery tile. The `span` prop
 * carries col-span / row-span classes (e.g. "col-span-2 row-span-2" or
 * "lg:col-span-2 lg:row-span-2"); `className` carries chrome (aspect, rounded,
 * overflow, hover). Use `asChild` to render as a <button> for clickable tiles.
 */
export interface BentoTileProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: string
  asChild?: boolean
}

const BentoTile = React.forwardRef<HTMLDivElement, BentoTileProps>(
  ({ className, span, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp
        ref={ref}
        data-slot="bento-tile"
        className={cn(span, className)}
        {...props}
      />
    )
  },
)
BentoTile.displayName = 'BentoTile'

export { BentoGrid, BentoTile, bentoGridVariants }
