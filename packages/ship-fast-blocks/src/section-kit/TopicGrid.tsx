import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const TopicGridVariants = cva('grid gap-6', {
  variants: {
    cols: {
      '1-2-3': 'gap-6 sm:grid-cols-2 lg:grid-cols-3',
      '1-2': 'gap-6 sm:grid-cols-2',
      '1-2-4': 'gap-6 sm:grid-cols-2 lg:grid-cols-4',
      '1-3': 'gap-6 md:grid-cols-3',
      '1-4': 'gap-6 lg:grid-cols-4',
      '1-md-2-3': 'gap-6 md:grid-cols-2 lg:grid-cols-3',
      '2-3-4': 'gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    },
  },
  defaultVariants: {
    cols: '1-2-3',
  },
})

const TopicGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof TopicGridVariants> & { asChild?: boolean }
>(({ className, cols, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="topic-grid"
      data-d-role="grid"
      className={cn(TopicGridVariants({ cols }), className)}
      ref={ref}
      {...props}
    />
  )
})
TopicGrid.displayName = 'TopicGrid'

const TopicCard = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'article'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'article'
  return (
    <Comp
      data-slot="topic-card"
      data-d-role="card"
      className={cn(
        'group flex flex-col overflow-hidden border border-border bg-card',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
TopicCard.displayName = 'TopicCard'

const TopicIcon = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="topic-icon"
      className={cn('grid size-12 place-items-center text-lg', className)}
      ref={ref}
      {...props}
    />
  )
})
TopicIcon.displayName = 'TopicIcon'

export {
  TopicGrid,
  TopicCard,
  TopicIcon,
  TopicGridVariants as topicGridVariants,
}
