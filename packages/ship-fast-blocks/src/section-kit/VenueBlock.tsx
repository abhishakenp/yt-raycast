import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'

const VenueBlock = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-d-role="card"
      data-slot="venue-block"
      className={cn(' border border-border bg-card overflow-hidden', className)}
      ref={ref}
      {...props}
    />
  )
})
VenueBlock.displayName = 'VenueBlock'

export { VenueBlock }
