import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

/**
 * StorySection — semantic compound for"our story" / origin / narrative bands.
 *
 * Story capsules share the same split-layout structure as the generic
 * `SplitStory` (media on one side, heading + prose on the other) or the
 * `FeaturedArticle` layout (full-bleed media with content below). This
 * component gives both patterns a dedicated `story-*` semantic identity so
 * styling and tests can target story sections specifically.
 *
 * Compound components: StorySection, StorySplitGrid, StoryMedia, StoryContent,
 * StoryEyebrow, StoryHeading, StoryBody, StoryFooter, StoryFeatures,
 * StoryImageTile — all forwardRef + displayName + asChild via Radix Slot.
 * Compose with `SectionHeading` or `Eyebrow` inside `StoryContent` for the
 * heading area. For featured-article-style stories, use `StorySection` as
 * the outer wrapper and compose `FeaturedArticleMedia` / `FeaturedArticleContent`
 * inside.
 */

const storySectionVariants = cva('', {
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

const StorySection = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> &
    VariantProps<typeof storySectionVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'section'
  return (
    <Comp
      data-slot="story-section"
      data-d-role="section"
      className={cn(storySectionVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
})
StorySection.displayName = 'StorySection'

const StorySplitGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="story-grid"
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
StorySplitGrid.displayName = 'StorySplitGrid'

const StoryMedia = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="story-media"
      className={cn('grid grid-cols-2 gap-4', className)}
      ref={ref}
      {...props}
    />
  )
})
StoryMedia.displayName = 'StoryMedia'

const StoryContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="story-content"
      data-d-role="container"
      className={cn('space-y-6', className)}
      ref={ref}
      {...props}
    />
  )
})
StoryContent.displayName = 'StoryContent'

const StoryEyebrow = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      data-slot="story-eyebrow"
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
StoryEyebrow.displayName = 'StoryEyebrow'

const StoryHeading = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h2'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h2'
  return (
    <Comp
      data-slot="story-heading"
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
StoryHeading.displayName = 'StoryHeading'

const StoryBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="story-body"
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
StoryBody.displayName = 'StoryBody'

const StoryFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="story-footer"
      className={cn('flex items-center gap-6 pt-4', className)}
      ref={ref}
      {...props}
    />
  )
})
StoryFooter.displayName = 'StoryFooter'

const StoryFeatures = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'ul'
  return (
    <Comp
      data-slot="story-features"
      className={cn('mt-6 space-y-3', className)}
      ref={ref}
      {...props}
    />
  )
})
StoryFeatures.displayName = 'StoryFeatures'

const StoryImageTile = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { offset?: boolean; asChild?: boolean }
>(({ className, offset = false, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="story-image-tile"
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
StoryImageTile.displayName = 'StoryImageTile'

export {
  StorySection,
  StorySplitGrid,
  StoryMedia,
  StoryContent,
  StoryEyebrow,
  StoryHeading,
  StoryBody,
  StoryFooter,
  StoryFeatures,
  StoryImageTile,
  storySectionVariants,
}
