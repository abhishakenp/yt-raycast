import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

/**
 * StoryGrid — semantic section wrapper for blog/news story grid bands.
 *
 * Story grid capsules share the same structure: a section heading above a
 * responsive grid of story cards (ArticleGrid + StoryCard). This component
 * gives that pattern a dedicated `story-grid-section` data-slot so styling
 * and tests can target story grids specifically without overloading the
 * `article-grid` slot.
 *
 * Compose with `SectionHeading` + `ArticleGrid` + `StoryCard` inside.
 * variant: default/muted controls the section background.
 */

const storyGridVariants = cva('', {
  variants: {
    variant: {
      default: '',
      muted: 'bg-muted',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const StoryGrid = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> &
    VariantProps<typeof storyGridVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'section'
  return (
    <Comp
      data-slot="story-grid-section"
      data-d-role="section"className={cn(storyGridVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
})
StoryGrid.displayName = 'StoryGrid'

export { StoryGrid, storyGridVariants }
