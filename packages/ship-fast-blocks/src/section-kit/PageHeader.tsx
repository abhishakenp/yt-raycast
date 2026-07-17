import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const pageHeaderVariants = cva('', {
  variants: {
    variant: {
      default: 'border-b border-border bg-background',
      muted: 'border-b border-border bg-muted/30',
      card: 'border border-border bg-card rounded-xl',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const PageHeader = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'header'> & VariantProps<typeof pageHeaderVariants>
>(({ className, variant, ...props }, ref) => (
  <header
    data-slot="page-header"
    className={cn(
      'flex flex-col gap-4',
      pageHeaderVariants({ variant }),
      className,
    )}
    ref={ref}
    {...props}
  />
))
PageHeader.displayName = 'PageHeader'

const PageHeaderActions = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    data-slot="page-header-actions"
    className={cn('flex items-center gap-3', className)}
    ref={ref}
    {...props}
  />
))
PageHeaderActions.displayName = 'PageHeaderActions'

export { PageHeader, PageHeaderActions, pageHeaderVariants }
