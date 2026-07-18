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
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    data-slot="story-split-grid"
    className={cn(
      'grid items-center gap-12 lg:grid-cols-2 lg:gap-20',
      className,
    )}
    ref={ref}
    {...props}
  />
))
SplitStoryGrid.displayName = 'SplitStoryGrid'

const SplitStoryMedia = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    data-slot="story-split-images"
    className={cn('grid grid-cols-2 gap-4', className)}
    ref={ref}
    {...props}
  />
))
SplitStoryMedia.displayName = 'SplitStoryMedia'

const SplitStoryImageTile = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { offset?: boolean }
>(({ className, offset = false, ...props }, ref) => (
  <div
    data-slot="story-split-image-tile"
    className={cn(
      'aspect-[3/4] overflow-hidden rounded-xl',
      offset && 'mt-8',
      className,
    )}
    ref={ref}
    {...props}
  />
))
SplitStoryImageTile.displayName = 'SplitStoryImageTile'

const SplitStoryContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    data-slot="story-split-content"
    className={cn('space-y-6', className)}
    ref={ref}
    {...props}
  />
))
SplitStoryContent.displayName = 'SplitStoryContent'

const SplitStoryEyebrow = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'>
>(({ className, ...props }, ref) => (
  <p
    data-slot="story-split-eyebrow"
    className={cn(
      'text-sm font-medium uppercase tracking-wider text-primary',
      className,
    )}
    ref={ref}
    {...props}
  />
))
SplitStoryEyebrow.displayName = 'SplitStoryEyebrow'

const SplitStoryHeading = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h2'>
>(({ className, ...props }, ref) => (
  <h2
    data-slot="story-split-heading"
    className={cn(
      'font-serif text-3xl font-medium leading-tight text-foreground sm:text-4xl lg:text-5xl',
      className,
    )}
    ref={ref}
    {...props}
  />
))
SplitStoryHeading.displayName = 'SplitStoryHeading'

const SplitStoryBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    data-slot="story-split-body"
    className={cn('space-y-4 leading-relaxed text-muted-foreground', className)}
    ref={ref}
    {...props}
  />
))
SplitStoryBody.displayName = 'SplitStoryBody'

const SplitStoryFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    data-slot="story-split-footer"
    className={cn('flex items-center gap-6 pt-4', className)}
    ref={ref}
    {...props}
  />
))
SplitStoryFooter.displayName = 'SplitStoryFooter'

/* ---------- SplitStoryFeatures ---------- */

const SplitStoryFeatures = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    data-slot="story-split-features"
    className={cn('mt-6 space-y-3', className)}
    ref={ref}
    {...props}
  />
))
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
