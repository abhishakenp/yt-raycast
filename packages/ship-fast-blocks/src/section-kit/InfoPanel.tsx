import * as React from 'react'

import { cn } from '#/lib/utils.ts'

const InfoPanel = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      data-slot="info-panel"
      className={cn(
        'rounded-lg border border-border bg-muted/30 p-6',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
InfoPanel.displayName = 'InfoPanel'

export { InfoPanel }
