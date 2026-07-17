import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const MarketTableVariants = cva('w-full overflow-hidden', {
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

const MarketTable = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'table'> & VariantProps<typeof MarketTableVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    data-slot="market-table"
    className={cn(MarketTableVariants({ variant }), className)}
    ref={ref}
    {...props}
  />
))
MarketTable.displayName = 'MarketTable'

const MarketHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'thead'>
>(({ className, ...props }, ref) => (
  <div
    data-slot="market-table-header"
    className={cn('border-b border-border bg-muted/50', className)}
    ref={ref}
    {...props}
  />
))
MarketHeader.displayName = 'MarketHeader'

const MarketBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'tbody'>
>(({ className, ...props }, ref) => (
  <div
    data-slot="market-table-body"
    className={cn('divide-y divide-border', className)}
    ref={ref}
    {...props}
  />
))
MarketBody.displayName = 'MarketBody'

const MarketRow = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'tr'> & { asChild?: boolean }
>(({ className, ...props }, ref) => (
  <div
    data-slot="market-table-row"
    className={cn('transition-colors hover:bg-muted/40', className)}
    ref={ref}
    {...props}
  />
))
MarketRow.displayName = 'MarketRow'

export { MarketTable, MarketHeader, MarketBody, MarketRow, MarketTableVariants }
