import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const RestaurantListVariants = cva('flex flex-col gap-4', {
  variants: {
  },
  defaultVariants: {
  },
})

const RestaurantList = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'> &
    VariantProps<typeof RestaurantListVariants> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'ul'
  return (
    <Comp
      data-slot="restaurant-list"
      className={cn(RestaurantListVariants({}), className)}
      ref={ref}
      {...props}
    />
  )
})
RestaurantList.displayName = 'RestaurantList'

const RestaurantItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'li'
  return (
    <Comp
      data-slot="restaurant-list-item"
      className={cn('flex flex-col', className)}
      ref={ref}
      {...props}
    />
  )
})
RestaurantItem.displayName = 'RestaurantItem'

export { RestaurantList, RestaurantItem, RestaurantListVariants }
