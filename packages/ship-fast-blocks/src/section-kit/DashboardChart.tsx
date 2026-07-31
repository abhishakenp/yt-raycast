import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'

const DashboardChart = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-d-role="card"
      data-slot="chart"
      className={cn(' border border-border bg-card p-6', className)}
      ref={ref}
      {...props}
    />
  )
})
DashboardChart.displayName = 'DashboardChart'

export { DashboardChart }
