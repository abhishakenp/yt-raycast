import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const LocationListVariants = cva('flex flex-col', {
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

const LocationList = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'> &
    VariantProps<typeof LocationListVariants> & { asChild?: boolean }
>(({ className, gap, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'ul'
  return (
    <Comp
      data-slot="location-list"
      className={cn(LocationListVariants({ gap }), className)}
      ref={ref}
      {...props}
    />
  )
})
LocationList.displayName = 'LocationList'

const LocationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'li'
  return (
    <Comp
      data-slot="location-list-item"
      className={cn('flex flex-col', className)}
      ref={ref}
      {...props}
    />
  )
})
LocationItem.displayName = 'LocationItem'

const LocationCard = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="location-card"
      className={cn(
        'rounded-xl bg-card p-6 text-card-foreground shadow-sm',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
LocationCard.displayName = 'LocationCard'

export { LocationList, LocationItem, LocationCard, LocationListVariants }
