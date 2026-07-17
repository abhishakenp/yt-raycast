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
  React.ComponentProps<'div'> & VariantProps<typeof PiecesGridVariants>
>(({ className, cols, ...props }, ref) => (
  <div
    data-slot="pieces-grid"
    className={cn(PiecesGridVariants({ cols }), className)}
    ref={ref}
    {...props}
  />
))
PiecesGrid.displayName = 'PiecesGrid'

const PiecesCard = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'article'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'article'
  return (
    <Comp
      data-slot="pieces-grid-item"
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-border bg-card',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
PiecesCard.displayName = 'PiecesCard'

export { PiecesGrid, PiecesCard, PiecesGridVariants }
