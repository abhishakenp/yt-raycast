import * as React from 'react'

import { cn } from '#/lib/utils.ts'

const StreamingLinks = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    data-slot="streaming-links"
    className={cn('flex flex-wrap gap-4', className)}
    ref={ref}
    {...props}
  />
))
StreamingLinks.displayName = 'StreamingLinks'

export { StreamingLinks }
