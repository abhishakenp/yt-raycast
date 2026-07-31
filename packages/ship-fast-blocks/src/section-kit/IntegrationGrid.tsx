import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const IntegrationGridVariants = cva('grid gap-6', {
  variants: {
    cols: {
      '1-2-3': 'sm:grid-cols-2 lg:grid-cols-3',
      '1-2': 'sm:grid-cols-2',
      '1-2-4': 'sm:grid-cols-2 lg:grid-cols-4',
      '1-3': 'md:grid-cols-3',
      '1-4': 'lg:grid-cols-4',
      '1-md-2-3': 'md:grid-cols-2 lg:grid-cols-3',
      '2-3-4': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      '2-4-6': 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6',
      '2-lg-4': 'grid-cols-2 lg:grid-cols-4',
    },
  },
  defaultVariants: {
    cols: '1-2-3',
  },
})

const IntegrationGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof IntegrationGridVariants> & { asChild?: boolean }
>(({ className, cols, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="integration-grid"
      data-d-role="grid"
      className={cn(IntegrationGridVariants({ cols }), className)}
      ref={ref}
      {...props}
    />
  )
})
IntegrationGrid.displayName = 'IntegrationGrid'

const IntegrationCard = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'article'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'article'
  return (
    <Comp
      data-slot="integration-grid-item"
      data-d-role="card"
      className={cn(
        'group flex flex-col overflow-hidden border border-border bg-card',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
IntegrationCard.displayName = 'IntegrationCard'

export { IntegrationGrid, IntegrationCard, IntegrationGridVariants }
