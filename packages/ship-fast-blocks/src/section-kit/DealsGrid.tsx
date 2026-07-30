import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const dealsGridVariants = cva('grid', {
  variants: {
    cols: {
      '1-2-4': 'gap-6 sm:grid-cols-2 lg:grid-cols-4',
      '1-2-3': 'gap-6 sm:grid-cols-2 lg:grid-cols-3',
      '1-md-2-4': 'gap-6 md:grid-cols-2 lg:grid-cols-4',
    },
  },
  defaultVariants: {
    cols: '1-2-4',
  },
})

const DealsGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof dealsGridVariants> & { asChild?: boolean }
>(({ className, cols, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="deals-grid"
      data-d-role="grid"className={cn(dealsGridVariants({ cols }), className)}
      ref={ref}
      {...props}
    />
  )
})
DealsGrid.displayName = 'DealsGrid'

export { DealsGrid, dealsGridVariants }
