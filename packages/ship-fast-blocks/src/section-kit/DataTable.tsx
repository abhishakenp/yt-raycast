import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'

const DataTableVariants = cva('w-full overflow-hidden', {
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

const DataTable = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'table'> &
    VariantProps<typeof DataTableVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="data-table"
      className={cn(DataTableVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
})
DataTable.displayName = 'DataTable'

const DataHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'thead'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="data-table-header"
      className={cn('border-b border-border bg-muted/50', className)}
      ref={ref}
      {...props}
    />
  )
})
DataHeader.displayName = 'DataHeader'

const DataBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'tbody'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="data-table-body"
      className={cn('divide-y divide-border', className)}
      ref={ref}
      {...props}
    />
  )
})
DataBody.displayName = 'DataBody'

const DataRow = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'tr'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="data-table-row"
      className={cn('transition-colors hover:bg-muted/40', className)}
      ref={ref}
      {...props}
    />
  )
})
DataRow.displayName = 'DataRow'

const DataTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.ComponentProps<'td'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'td'
  return (
    <Comp
      data-slot="data-table-cell"
      className={cn('px-5 py-3.5', className)}
      ref={ref}
      {...props}
    />
  )
})
DataTableCell.displayName = 'DataTableCell'

export {
  DataTable,
  DataHeader,
  DataBody,
  DataRow,
  DataTableCell,
  DataTableVariants,
}
