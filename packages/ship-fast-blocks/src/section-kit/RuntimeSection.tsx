import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'

/**
 * RuntimeSection — a full-bleed section wrapper for interactive runtimes
 * (games, simulators, canvases). No max-width, no padding — the runtime
 * owns its own layout. Use to wrap any full-page interactive component
 * that needs to fill the viewport.
 */
export interface RuntimeSectionProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean
}

const RuntimeSection = React.forwardRef<HTMLElement, RuntimeSectionProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'section'
    return (
      <Comp
        ref={ref}
        data-slot="runtime-section"
        data-d-role="section"
        className={cn('relative w-full', className)}
        {...props}
      />
    )
  },
)
RuntimeSection.displayName = 'RuntimeSection'

export { RuntimeSection }
