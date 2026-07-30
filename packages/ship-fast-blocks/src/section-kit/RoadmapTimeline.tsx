import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'

const RoadmapTimeline = React.forwardRef<
  HTMLOListElement,
  React.ComponentProps<'ol'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'ol'
  return (
    <Comp
      data-d-role="list"
      data-slot="roadmap-timeline"
      className={cn('relative flex flex-col', className)}
      ref={ref}
      {...props}
    />
  )
})
RoadmapTimeline.displayName = 'RoadmapTimeline'

export { RoadmapTimeline }
