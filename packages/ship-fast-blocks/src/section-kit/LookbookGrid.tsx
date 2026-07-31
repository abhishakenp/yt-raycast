import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const LookbookGridVariants = cva('grid', {
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

const LookbookGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof LookbookGridVariants> & { asChild?: boolean }
>(({ className, cols, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="lookbook-grid"
      data-d-role="grid"
      className={cn(LookbookGridVariants({ cols }), className)}
      ref={ref}
      {...props}
    />
  )
})
LookbookGrid.displayName = 'LookbookGrid'

const LookbookCard = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'article'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'article'
  return (
    <Comp
      data-slot="lookbook-grid-item"
      data-d-role="card"
      className={cn(
        'group flex flex-col overflow-hidden border border-border bg-card',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
LookbookCard.displayName = 'LookbookCard'

const LookbookCaption = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="lookbook-caption"
      className={cn('absolute text-background', className)}
      ref={ref}
      {...props}
    />
  )
})
LookbookCaption.displayName = 'LookbookCaption'

export { LookbookGrid, LookbookCard, LookbookCaption, LookbookGridVariants }
