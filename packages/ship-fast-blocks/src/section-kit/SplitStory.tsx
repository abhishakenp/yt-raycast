import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const storySplitVariants = cva('', {
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

const SplitStory = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> &
    VariantProps<typeof storySplitVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'section'
  return (
    <Comp
      data-slot="story-split"
      className={cn(storySplitVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
})
SplitStory.displayName = 'SplitStory'

const SplitStoryGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="story-split-grid"
      data-d-role="grid"
      className={cn(
        'grid items-center gap-12 lg:grid-cols-2 lg:gap-20',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
SplitStoryGrid.displayName = 'SplitStoryGrid'

const SplitStoryMedia = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="story-split-images"
      data-d-role="grid"
      className={cn('grid grid-cols-2 gap-4', className)}
      ref={ref}
      {...props}
    />
  )
})
SplitStoryMedia.displayName = 'SplitStoryMedia'

const SplitStoryImageTile = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { offset?: boolean; asChild?: boolean }
>(({ className, offset = false, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="story-split-image-tile"
      data-d-role="card"
      className={cn(
        'aspect-[3/4] overflow-hidden ',
        offset && 'mt-8',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
SplitStoryImageTile.displayName = 'SplitStoryImageTile'

const SplitStoryContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="story-split-content"
      data-d-role="container"
      className={cn('space-y-6', className)}
      ref={ref}
      {...props}
    />
  )
})
SplitStoryContent.displayName = 'SplitStoryContent'

const SplitStoryEyebrow = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      data-slot="story-split-eyebrow"
      data-d-role="eyebrow"
      className={cn(
        'text-sm font-medium uppercase tracking-wider text-primary',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
SplitStoryEyebrow.displayName = 'SplitStoryEyebrow'

const SplitStoryHeading = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h2'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h2'
  return (
    <Comp
      data-slot="story-split-heading"
      data-d-role="heading"
      className={cn(
        'font-serif text-3xl font-medium leading-tight text-foreground sm:text-4xl lg:text-5xl',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
SplitStoryHeading.displayName = 'SplitStoryHeading'

const SplitStoryBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="story-split-body"
      data-d-role="body"
      className={cn(
        'space-y-4 leading-relaxed text-muted-foreground',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
SplitStoryBody.displayName = 'SplitStoryBody'

const SplitStoryFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="story-split-footer"
      className={cn('flex items-center gap-6 pt-4', className)}
      ref={ref}
      {...props}
    />
  )
})
SplitStoryFooter.displayName = 'SplitStoryFooter'

/* ---------- SplitStoryFeatures ---------- */

const SplitStoryFeatures = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'ul'
  return (
    <Comp
      data-slot="story-split-features"
      className={cn('mt-6 space-y-3', className)}
      ref={ref}
      {...props}
    />
  )
})
SplitStoryFeatures.displayName = 'SplitStoryFeatures'

export {
  SplitStory,
  SplitStoryGrid,
  SplitStoryMedia,
  SplitStoryImageTile,
  SplitStoryContent,
  SplitStoryEyebrow,
  SplitStoryHeading,
  SplitStoryBody,
  SplitStoryFooter,
  SplitStoryFeatures,
  storySplitVariants,
}
