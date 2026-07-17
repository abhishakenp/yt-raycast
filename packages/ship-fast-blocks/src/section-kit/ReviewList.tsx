import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const reviewListVariants = cva('', {
  variants: {
    layout: {
      list: 'divide-y divide-border',
      grid: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3',
    },
  },
  defaultVariants: {
    layout: 'list',
  },
})

const ReviewList = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'> & VariantProps<typeof reviewListVariants>
>(({ className, layout, ...props }, ref) => (
  <ul
    data-slot="review-list"
    className={cn(reviewListVariants({ layout }), className)}
    ref={ref}
    {...props}
  />
))
ReviewList.displayName = 'ReviewList'

const ReviewItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'li'
  return (
    <Comp
      data-slot="review-item"
      className={cn('flex flex-col gap-3', className)}
      ref={ref}
      {...props}
    />
  )
})
ReviewItem.displayName = 'ReviewItem'

export { ReviewList, ReviewItem, reviewListVariants }
