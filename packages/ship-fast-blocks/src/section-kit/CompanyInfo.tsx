import * as React from 'react'

import { cn } from '#/lib/utils.ts'

const CompanyInfo = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    data-slot="company-info"
    className={cn('rounded-lg border border-border bg-card p-8', className)}
    ref={ref}
    {...props}
  />
))
CompanyInfo.displayName = 'CompanyInfo'

export { CompanyInfo }
