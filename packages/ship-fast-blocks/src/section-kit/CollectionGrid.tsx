import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const collectionGridVariants = cva('grid', {
  variants: {
    cols: {
      '1-2-3': 'gap-8 sm:grid-cols-2 lg:grid-cols-3',
      '1-2-4': 'gap-6 sm:grid-cols-2 lg:grid-cols-4',
      '1-md-2-3': 'gap-6 md:grid-cols-2 lg:grid-cols-3',
    },
  },
  defaultVariants: {
    cols: '1-2-3',
  },
})

const CollectionGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & VariantProps<typeof collectionGridVariants>
>(({ className, cols, ...props }, ref) => (
  <div
    data-slot="collection-grid"
    className={cn(collectionGridVariants({ cols }), className)}
    ref={ref}
    {...props}
  />
))
CollectionGrid.displayName = 'CollectionGrid'

const CollectionCard = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'article'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'article'
  return (
    <Comp
      data-slot="collection-card"
      className={cn('group flex flex-col', className)}
      ref={ref}
      {...props}
    />
  )
})
CollectionCard.displayName = 'CollectionCard'

export { CollectionGrid, CollectionCard, collectionGridVariants }
