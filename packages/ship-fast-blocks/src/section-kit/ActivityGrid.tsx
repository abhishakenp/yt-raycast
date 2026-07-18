import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const activityGridVariants = cva('grid', {
  variants: {
    cols: {
      '1-2-3': 'gap-8 md:grid-cols-2 lg:grid-cols-3',
      '1-2': 'gap-8 md:grid-cols-2',
      '1-md-2-3': 'gap-6 md:grid-cols-2 lg:grid-cols-3',
    },
  },
  defaultVariants: {
    cols: '1-2-3',
  },
})

const ActivityGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof activityGridVariants> & { asChild?: boolean }
>(({ className, cols, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="activity-grid"
      className={cn(activityGridVariants({ cols }), className)}
      ref={ref}
      {...props}
    />
  )
})
ActivityGrid.displayName = 'ActivityGrid'

const ActivityTile = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'article'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'article'
  return (
    <Comp
      data-slot="activity-tile"
      className={cn(
        'group flex flex-col rounded-3xl border border-border bg-muted/40 p-6 transition-all duration-300 hover:bg-card hover:shadow-xl',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
ActivityTile.displayName = 'ActivityTile'

const ActivityTileMedia = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="activity-tile-media"
      className={cn(
        'relative mb-6 aspect-[4/3] overflow-hidden rounded-2xl',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
ActivityTileMedia.displayName = 'ActivityTileMedia'

const ActivityTileBadge = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      data-slot="activity-tile-badge"
      className={cn(
        'absolute left-4 top-4 rounded-full bg-card/95 px-3 py-1 text-xs font-semibold text-card-foreground backdrop-blur-sm',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
ActivityTileBadge.displayName = 'ActivityTileBadge'

const ActivityTileIcon = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="activity-tile-icon"
      className={cn(
        'mb-4 grid size-12 place-items-center rounded-xl',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
ActivityTileIcon.displayName = 'ActivityTileIcon'

const ActivityTileTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h3'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h3'
  return (
    <Comp
      data-slot="activity-tile-title"
      className={cn('mb-2 text-xl font-bold text-foreground', className)}
      ref={ref}
      {...props}
    />
  )
})
ActivityTileTitle.displayName = 'ActivityTileTitle'

const ActivityTileDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      data-slot="activity-tile-description"
      className={cn('mb-4 text-muted-foreground', className)}
      ref={ref}
      {...props}
    />
  )
})
ActivityTileDescription.displayName = 'ActivityTileDescription'

export {
  ActivityGrid,
  ActivityTile,
  ActivityTileMedia,
  ActivityTileBadge,
  ActivityTileIcon,
  ActivityTileTitle,
  ActivityTileDescription,
  activityGridVariants,
}
