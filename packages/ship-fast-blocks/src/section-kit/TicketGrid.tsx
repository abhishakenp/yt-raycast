import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const ticketGridVariants = cva('grid', {
  variants: {
    cols: {
      '1-2-3': 'gap-6 sm:grid-cols-2 lg:grid-cols-3',
      '1-3': 'gap-6 lg:grid-cols-3',
      '1-2': 'gap-6 sm:grid-cols-2',
    },
  },
  defaultVariants: {
    cols: '1-2-3',
  },
})

const TicketGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & VariantProps<typeof ticketGridVariants>
>(({ className, cols, ...props }, ref) => (
  <div
    data-slot="ticket-grid"
    className={cn(ticketGridVariants({ cols }), className)}
    ref={ref}
    {...props}
  />
))
TicketGrid.displayName = 'TicketGrid'

const ticketCardVariants = cva('', {
  variants: {
    variant: {
      default: 'border border-border bg-card',
      featured: 'border-2 border-primary bg-card',
      elevated: 'border border-border bg-card shadow-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const TicketCard = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'article'> & {
    variant?: VariantProps<typeof ticketCardVariants>['variant']
    asChild?: boolean
  }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'article'
  return (
    <Comp
      data-slot="ticket-card"
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl',
        ticketCardVariants({ variant }),
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
TicketCard.displayName = 'TicketCard'

export { TicketGrid, TicketCard, ticketGridVariants, ticketCardVariants }
