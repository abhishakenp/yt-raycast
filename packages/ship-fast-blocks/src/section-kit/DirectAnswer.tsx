import * as React from 'react'

import { cn } from '#/lib/utils.ts'

const DirectAnswer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    data-slot="direct-answer"
    className={cn(
      'rounded-lg border-l-4 border-primary bg-muted/30 p-6',
      className,
    )}
    ref={ref}
    {...props}
  />
))
DirectAnswer.displayName = 'DirectAnswer'

export { DirectAnswer }
