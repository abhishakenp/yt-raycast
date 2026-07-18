import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'

const GovPortalHome = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="gov-portal-home"
      className={cn('rounded-xl border border-border bg-card', className)}
      ref={ref}
      {...props}
    />
  )
})
GovPortalHome.displayName = 'GovPortalHome'

export { GovPortalHome }
