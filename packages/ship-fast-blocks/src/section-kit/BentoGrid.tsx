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
const bentoGridVariants = cva('grid gap-4', {
  variants: {
    cols: {
      '2-lg-3': 'grid-cols-2 lg:grid-cols-3',
      '2-lg-4': 'grid-cols-2 lg:grid-cols-4',
      '2-md-4': 'grid-cols-2 md:grid-cols-4',
      '2-3-4': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      '1-2-4': 'sm:grid-cols-2 lg:grid-cols-4',
      '1-md-2-3': 'md:grid-cols-2 lg:grid-cols-3',
      '1-md-2-4': 'md:grid-cols-2 lg:grid-cols-4',
      '1-sm-2-md-6': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-6',
      '1-sm-2-lg-6': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-6',
      '1-md-3': 'grid-cols-1 md:grid-cols-3',
      '1-sm-2': 'sm:grid-cols-2',
      '1-sm-2-lg-3': 'sm:grid-cols-2 lg:grid-cols-3',
    },
  },
  defaultVariants: {
    cols: '2-lg-4',
  },
})

export interface BentoGridProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bentoGridVariants> {
  asChild?: boolean
}

const BentoGrid = React.forwardRef<HTMLDivElement, BentoGridProps>(
  ({ className, cols, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp
        ref={ref}
        data-slot="bento-grid"
        data-d-role="grid"className={cn(bentoGridVariants({ cols }), className)}
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
        data-d-role="card"className={cn(span, className)}
        {...props}
      />
    )
  },
)
BentoTile.displayName = 'BentoTile'

const BentoTileBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="bento-tile-body"
      data-d-role="card"className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
})
BentoTileBody.displayName = 'BentoTileBody'

const BentoTileTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h3'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h3'
  return (
    <Comp
      ref={ref}
      data-slot="bento-tile-title"
      data-d-role="card"className={cn('font-semibold text-foreground', className)}
      {...props}
    />
  )
})
BentoTileTitle.displayName = 'BentoTileTitle'

const BentoTileDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      ref={ref}
      data-slot="bento-tile-description"
      data-d-role="card"className={cn('text-sm leading-relaxed text-muted-foreground', className)}
      {...props}
    />
  )
})
BentoTileDescription.displayName = 'BentoTileDescription'

export {
  BentoGrid,
  BentoTile,
  BentoTileBody,
  BentoTileTitle,
  BentoTileDescription,
  bentoGridVariants,
}
