import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const TenderTableVariants = cva('w-full overflow-hidden', {
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

const TenderTable = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'table'> & VariantProps<typeof TenderTableVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    data-slot="tender-table"
    className={cn(TenderTableVariants({ variant }), className)}
    ref={ref}
    {...props}
  />
))
TenderTable.displayName = 'TenderTable'

const TenderHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'thead'>
>(({ className, ...props }, ref) => (
  <div
    data-slot="tender-table-header"
    className={cn('border-b border-border bg-muted/50', className)}
    ref={ref}
    {...props}
  />
))
TenderHeader.displayName = 'TenderHeader'

const TenderBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'tbody'>
>(({ className, ...props }, ref) => (
  <div
    data-slot="tender-table-body"
    className={cn('divide-y divide-border', className)}
    ref={ref}
    {...props}
  />
))
TenderBody.displayName = 'TenderBody'

const TenderRow = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'tr'> & { asChild?: boolean }
>(({ className, ...props }, ref) => (
  <div
    data-slot="tender-table-row"
    className={cn('transition-colors hover:bg-muted/40', className)}
    ref={ref}
    {...props}
  />
))
TenderRow.displayName = 'TenderRow'

export { TenderTable, TenderHeader, TenderBody, TenderRow, TenderTableVariants }
