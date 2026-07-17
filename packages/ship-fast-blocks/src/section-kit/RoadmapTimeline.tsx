import * as React from 'react'

import { cn } from '#/lib/utils.ts'

const RoadmapTimeline = React.forwardRef<
  HTMLOListElement,
  React.ComponentProps<'ol'>
>(({ className, ...props }, ref) => (
  <ol
    data-slot="roadmap-timeline"
    className={cn('relative flex flex-col', className)}
    ref={ref}
    {...props}
  />
))
RoadmapTimeline.displayName = 'RoadmapTimeline'

export { RoadmapTimeline }
