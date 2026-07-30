import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'

const StreamingLinks = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="streaming-links"
      data-d-role="link"className={cn('flex flex-wrap gap-4', className)}
      ref={ref}
      {...props}
    />
  )
})
StreamingLinks.displayName = 'StreamingLinks'

export { StreamingLinks }
