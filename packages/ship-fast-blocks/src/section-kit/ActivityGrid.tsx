import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const activityGridVariants = cva('grid', {
  variants: {
    cols: {
      '1-2-3': 'gap-8 md:grid-cols-2 lg:grid-cols-3',
      '1-2': 'gap-8 md:grid-cols-2',
      '1-md-2-3': 'gap-6 md:grid-cols-2 lg:grid-cols-3',
    },
  },
  defaultVariants: {
    cols: '1-2-3',
  },
})

const ActivityGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & VariantProps<typeof activityGridVariants>
>(({ className, cols, ...props }, ref) => (
  <div
    data-slot="activity-grid"
    className={cn(activityGridVariants({ cols }), className)}
    ref={ref}
    {...props}
  />
))
ActivityGrid.displayName = 'ActivityGrid'

export { ActivityGrid, activityGridVariants }
