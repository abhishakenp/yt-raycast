import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const PathwayGridVariants = cva('grid', {
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

const PathwayGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof PathwayGridVariants> & { asChild?: boolean }
>(({ className, cols, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="pathway-grid"
      className={cn(PathwayGridVariants({ cols }), className)}
      ref={ref}
      {...props}
    />
  )
})
PathwayGrid.displayName = 'PathwayGrid'

const PathwayCard = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'article'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'article'
  return (
    <Comp
      data-slot="pathway-grid-item"
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-border bg-card',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
PathwayCard.displayName = 'PathwayCard'

const PathwayCardBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="pathway-card-body"
      className={cn('flex flex-col gap-3 p-6', className)}
      ref={ref}
      {...props}
    />
  )
})
PathwayCardBody.displayName = 'PathwayCardBody'

const PathwayCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h3'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h3'
  return (
    <Comp
      data-slot="pathway-card-title"
      className={cn('text-lg font-semibold text-foreground', className)}
      ref={ref}
      {...props}
    />
  )
})
PathwayCardTitle.displayName = 'PathwayCardTitle'

const PathwayCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      data-slot="pathway-card-description"
      className={cn('text-sm text-muted-foreground', className)}
      ref={ref}
      {...props}
    />
  )
})
PathwayCardDescription.displayName = 'PathwayCardDescription'

export {
  PathwayGrid,
  PathwayCard,
  PathwayCardBody,
  PathwayCardTitle,
  PathwayCardDescription,
  PathwayGridVariants,
}
