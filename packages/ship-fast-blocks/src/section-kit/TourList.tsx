import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const TourListVariants = cva('flex flex-col gap-4', {
  variants: {},
  defaultVariants: {},
})

const TourList = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'> &
    VariantProps<typeof TourListVariants> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'ul'
  return (
    <Comp
      data-slot="tour-list"
      className={cn(TourListVariants({}), className)}
      ref={ref}
      {...props}
    />
  )
})
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
