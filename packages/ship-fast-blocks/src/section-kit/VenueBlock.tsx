import * as React from 'react'

import { cn } from '#/lib/utils.ts'

const VenueBlock = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    data-slot="venue-block"
    className={cn(
      'rounded-xl border border-border bg-card overflow-hidden',
      className,
    )}
    ref={ref}
    {...props}
  />
))
VenueBlock.displayName = 'VenueBlock'

export { VenueBlock }
