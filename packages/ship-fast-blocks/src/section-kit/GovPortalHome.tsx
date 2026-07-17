import * as React from 'react'

import { cn } from '#/lib/utils.ts'

const GovPortalHome = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    data-slot="gov-portal-home"
    className={cn('rounded-xl border border-border bg-card', className)}
    ref={ref}
    {...props}
  />
))
GovPortalHome.displayName = 'GovPortalHome'

export { GovPortalHome }
