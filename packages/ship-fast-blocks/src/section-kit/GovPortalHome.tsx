import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'

const GovPortalHome = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-d-role="card"
      data-slot="gov-portal-home"
      className={cn(' border border-border bg-card', className)}
      ref={ref}
      {...props}
    />
  )
})
GovPortalHome.displayName = 'GovPortalHome'

export { GovPortalHome }
