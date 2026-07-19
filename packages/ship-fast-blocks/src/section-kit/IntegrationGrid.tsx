import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const IntegrationGridVariants = cva('grid', {
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
    gap: {
      none: 'gap-0',
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-10',
    },
  },
  defaultVariants: {
    cols: '1-2-3',
    gap: 'md',
  },
})

const IntegrationGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof IntegrationGridVariants> & { asChild?: boolean }
>(({ className, cols, gap, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="integration-grid"
      className={cn(IntegrationGridVariants({ cols, gap }), className)}
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
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-border bg-card',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
IntegrationCard.displayName = 'IntegrationCard'

export { IntegrationGrid, IntegrationCard, IntegrationGridVariants }
