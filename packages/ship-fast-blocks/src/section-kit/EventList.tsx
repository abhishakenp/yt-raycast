import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const eventListVariants = cva('', {
  variants: {
    variant: {
      card: 'grid gap-6',
      list: 'space-y-6',
      calendar: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
    },
  },
  defaultVariants: {
    variant: 'card',
  },
})

const EventList = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof eventListVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="event-list"
      data-d-role="list"
      className={cn(eventListVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
})
EventList.displayName = 'EventList'

const EventCard = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="event-card"
      data-d-role="card"
      className={cn('group flex flex-col', className)}
      ref={ref}
      {...props}
    />
  )
})
EventCard.displayName = 'EventCard'

const EventDate = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="event-date"
      className={cn('shrink-0', className)}
      ref={ref}
      {...props}
    />
  )
})
EventDate.displayName = 'EventDate'

const EventDetails = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="event-details"
      className={cn('flex flex-col', className)}
      ref={ref}
      {...props}
    />
  )
})
EventDetails.displayName = 'EventDetails'

export { EventList, EventCard, EventDate, EventDetails, eventListVariants }
