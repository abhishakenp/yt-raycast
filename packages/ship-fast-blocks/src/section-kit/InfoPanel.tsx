import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'

const InfoPanel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="info-panel"
      className={cn(
        'rounded-lg border border-border bg-muted/30 p-6',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
InfoPanel.displayName = 'InfoPanel'

export { InfoPanel }
