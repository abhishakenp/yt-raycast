import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const FeaturedListVariants = cva('grid', {
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

const FeaturedList = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & VariantProps<typeof FeaturedListVariants>
>(({ className, cols, ...props }, ref) => (
  <div
    data-slot="featured-list"
    className={cn(FeaturedListVariants({ cols }), className)}
    ref={ref}
    {...props}
  />
))
FeaturedList.displayName = 'FeaturedList'

const FeaturedItem = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'article'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'article'
  return (
    <Comp
      data-slot="featured-list-item"
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-border bg-card',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
FeaturedItem.displayName = 'FeaturedItem'

export { FeaturedList, FeaturedItem, FeaturedListVariants }
