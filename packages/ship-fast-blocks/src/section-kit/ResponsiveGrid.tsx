import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const gridColsVariants = cva('grid', {
  variants: {
    cols: {
      '1': 'grid-cols-1',
      '1-2': 'sm:grid-cols-2',
      '1-2-3': 'sm:grid-cols-2 lg:grid-cols-3',
      '1-2-4': 'sm:grid-cols-2 lg:grid-cols-4',
      '1-3': 'sm:grid-cols-3',
      '1-4': 'sm:grid-cols-4',
      '1-lg-3': 'lg:grid-cols-3',
      '1-md-2': 'md:grid-cols-2',
      '1-md-2-3': 'md:grid-cols-2 lg:grid-cols-3',
      '1-md-2-4': 'md:grid-cols-2 lg:grid-cols-4',
      '2': 'grid-cols-2',
      '2-3': 'grid-cols-2 md:grid-cols-3',
      '2-3-4': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      '2-3-6': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
      '2-4': 'grid-cols-2 sm:grid-cols-4',
      '2-4-5': 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5',
      '2-4-6': 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6',
      '2-lg-3': 'grid-cols-2 lg:grid-cols-3',
      '2-lg-4': 'grid-cols-2 lg:grid-cols-4',
      '2-md-3': 'grid-cols-2 md:grid-cols-3',
      '2-md-4': 'grid-cols-2 md:grid-cols-4',
      '3': 'grid-cols-3',
      '4': 'grid-cols-4',
    },
    gap: {
      none: 'gap-0',
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-10',
      '2xl': 'gap-12',
    },
  },
  defaultVariants: {
    cols: '1-2-3',
    gap: 'lg',
  },
})

export interface ResponsiveGridProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridColsVariants> {
  asChild?: boolean
}

const ResponsiveGrid = React.forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ className, cols, gap, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp
        ref={ref}
        data-slot="responsive-grid"
        className={cn(gridColsVariants({ cols, gap }), className)}
        {...props}
      />
    )
  },
)
ResponsiveGrid.displayName = 'ResponsiveGrid'

export { ResponsiveGrid, gridColsVariants }
