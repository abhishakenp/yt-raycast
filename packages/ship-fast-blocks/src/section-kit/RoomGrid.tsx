import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const roomGridVariants = cva('grid', {
  variants: {
    cols: {
      '1-2-3': 'gap-8 sm:grid-cols-2 lg:grid-cols-3',
      '1-2': 'gap-8 sm:grid-cols-2',
      '1-md-2-3': 'gap-6 md:grid-cols-2 lg:grid-cols-3',
    },
  },
  defaultVariants: {
    cols: '1-2-3',
  },
})

const RoomGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof roomGridVariants> & { asChild?: boolean }
>(({ className, cols, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="room-grid"
      data-d-role="grid"className={cn(roomGridVariants({ cols }), className)}
      ref={ref}
      {...props}
    />
  )
})
RoomGrid.displayName = 'RoomGrid'

const RoomCard = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'article'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'article'
  return (
    <Comp
      data-slot="room-card"
      data-d-role="card"className={cn('group flex flex-col overflow-hidden', className)}
      ref={ref}
      {...props}
    />
  )
})
RoomCard.displayName = 'RoomCard'

export { RoomGrid, RoomCard, roomGridVariants }
