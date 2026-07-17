import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const TourListVariants = cva('flex flex-col', {
  variants: {
    gap: {
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6',
    },
  },
  defaultVariants: {
    gap: 'md',
  },
})

const TourList = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'> & VariantProps<typeof TourListVariants>
>(({ className, gap, ...props }, ref) => (
  <ul
    data-slot="tour-list"
    className={cn(TourListVariants({ gap }), className)}
    ref={ref}
    {...props}
  />
))
TourList.displayName = 'TourList'

const TourItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'li'
  return (
    <Comp
      data-slot="tour-list-item"
      className={cn('flex flex-col', className)}
      ref={ref}
      {...props}
    />
  )
})
TourItem.displayName = 'TourItem'

export { TourList, TourItem, TourListVariants }
