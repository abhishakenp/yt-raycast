import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Slot } from '@radix-ui/react-slot'
import { cn } from '#/lib/utils.ts'

const RatesTableVariants = cva('w-full overflow-hidden', {
  variants: {
    variant: {
      default: 'rounded-lg border border-border',
      muted: 'rounded-lg border border-border bg-muted/30',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const RatesTable = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'table'> & VariantProps<typeof RatesTableVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    data-slot="rates-table"
    className={cn(RatesTableVariants({ variant }), className)}
    ref={ref}
    {...props}
  />
))
RatesTable.displayName = 'RatesTable'

const RatesHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'thead'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="rates-table-header"
      className={cn('border-b border-border bg-muted/50', className)}
      ref={ref}
      {...props}
    />
  )
})
RatesHeader.displayName = 'RatesHeader'

const RatesBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'tbody'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="rates-table-body"
      className={cn('divide-y divide-border', className)}
      ref={ref}
      {...props}
    />
  )
})
RatesBody.displayName = 'RatesBody'

const RatesRow = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'tr'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="rates-table-row"
      className={cn('transition-colors hover:bg-muted/40', className)}
      ref={ref}
      {...props}
    />
  )
})
RatesRow.displayName = 'RatesRow'

const RateCard = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="rate-card"
      className={cn('flex flex-col gap-1 p-4', className)}
      ref={ref}
      {...props}
    />
  )
})
RateCard.displayName = 'RateCard'

export {
  RatesTable,
  RatesHeader,
  RatesBody,
  RatesRow,
  RateCard,
  RatesTableVariants,
}
