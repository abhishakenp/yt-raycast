import * as React from 'react'

import { cn } from '#/lib/utils.ts'

const DashboardChart = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    data-slot="chart"
    className={cn('rounded-xl border border-border bg-card p-6', className)}
    ref={ref}
    {...props}
  />
))
DashboardChart.displayName = 'DashboardChart'

export { DashboardChart }
