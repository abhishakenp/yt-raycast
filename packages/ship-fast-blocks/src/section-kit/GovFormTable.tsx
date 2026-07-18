import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Slot } from '@radix-ui/react-slot'
import { cn } from '#/lib/utils.ts'

const GovFormTableVariants = cva('w-full overflow-hidden', {
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

const GovFormTable = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'table'> & VariantProps<typeof GovFormTableVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    data-slot="gov-form-table"
    className={cn(GovFormTableVariants({ variant }), className)}
    ref={ref}
    {...props}
  />
))
GovFormTable.displayName = 'GovFormTable'

const GovFormHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'thead'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="gov-form-table-header"
      className={cn('border-b border-border bg-muted/50', className)}
      ref={ref}
      {...props}
    />
  )
})
GovFormHeader.displayName = 'GovFormHeader'

const GovFormBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'tbody'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="gov-form-table-body"
      className={cn('divide-y divide-border', className)}
      ref={ref}
      {...props}
    />
  )
})
GovFormBody.displayName = 'GovFormBody'

const GovFormRow = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'tr'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="gov-form-table-row"
      className={cn('transition-colors hover:bg-muted/40', className)}
      ref={ref}
      {...props}
    />
  )
})
GovFormRow.displayName = 'GovFormRow'

export {
  GovFormTable,
  GovFormHeader,
  GovFormBody,
  GovFormRow,
  GovFormTableVariants,
}
