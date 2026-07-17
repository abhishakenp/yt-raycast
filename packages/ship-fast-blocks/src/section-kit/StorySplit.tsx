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

const StorySplit = React.forwardRef<
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
StorySplit.displayName = 'StorySplit'

const StorySplitGrid = React.forwardRef<
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
StorySplitGrid.displayName = 'StorySplitGrid'

const StorySplitImages = React.forwardRef<
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
StorySplitImages.displayName = 'StorySplitImages'

const StorySplitImageTile = React.forwardRef<
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
StorySplitImageTile.displayName = 'StorySplitImageTile'

const StorySplitContent = React.forwardRef<
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
StorySplitContent.displayName = 'StorySplitContent'

const StorySplitEyebrow = React.forwardRef<
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
StorySplitEyebrow.displayName = 'StorySplitEyebrow'

const StorySplitHeading = React.forwardRef<
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
StorySplitHeading.displayName = 'StorySplitHeading'

const StorySplitBody = React.forwardRef<
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
StorySplitBody.displayName = 'StorySplitBody'

const StorySplitFooter = React.forwardRef<
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
StorySplitFooter.displayName = 'StorySplitFooter'

export {
  StorySplit,
  StorySplitGrid,
  StorySplitImages,
  StorySplitImageTile,
  StorySplitContent,
  StorySplitEyebrow,
  StorySplitHeading,
  StorySplitBody,
  StorySplitFooter,
  storySplitVariants,
}
