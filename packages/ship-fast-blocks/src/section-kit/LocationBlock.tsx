import * as React from 'react'

import { cn } from '#/lib/utils.ts'

const LocationBlock = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    data-slot="location-block"
    className={cn(
      'rounded-xl border border-border bg-card overflow-hidden',
      className,
    )}
    ref={ref}
    {...props}
  />
))
LocationBlock.displayName = 'LocationBlock'

export { LocationBlock }
