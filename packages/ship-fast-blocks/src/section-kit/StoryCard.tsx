import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

const storyCardVariants = cva('group block w-full text-left', {
  variants: {
    variant: {
      simple: '',
      bordered:
        'flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]',
    },
  },
  defaultVariants: { variant: 'simple' },
})

const StoryCard = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> &
    VariantProps<typeof storyCardVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      ref={ref}
      data-slot="story-card"
      className={cn(storyCardVariants({ variant }), className)}
      {...props}
    />
  )
})
StoryCard.displayName = 'StoryCard'

const storyCardImageVariants = cva(
  'object-cover transition-transform duration-500',
  {
    variants: {
      variant: {
        simple: 'h-48 w-full group-hover:scale-105',
        bordered: 'size-full group-hover:scale-[1.04]',
      },
    },
    defaultVariants: {
      variant: 'simple',
    },
  },
)

const StoryCardImage = React.forwardRef<
  HTMLImageElement,
  Omit<React.ComponentProps<typeof Image>, 'w' | 'h'> & {
    asChild?: boolean
    w?: number
    h?: number
    variant?: VariantProps<typeof storyCardImageVariants>['variant']
  }
>(
  (
    { className, asChild = false, w = 600, h = 400, variant, ...props },
    ref,
  ) => {
    if (asChild) {
      return (
        <Slot
          ref={ref}
          data-slot="story-card-image"
          className={cn(storyCardImageVariants({ variant }), className)}
          {...props}
        />
      )
    }
    return (
      <Image
        w={w}
        h={h}
        loading="lazy"
        data-slot="story-card-image"
        className={cn(storyCardImageVariants({ variant }), className)}
        {...props}
      />
    )
  },
)
StoryCardImage.displayName = 'StoryCardImage'

const StoryCardImageContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="story-card-image-container"
      className={cn('relative overflow-hidden bg-muted', className)}
      {...props}
    />
  )
})
StoryCardImageContainer.displayName = 'StoryCardImageContainer'

const StoryCardFigure = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'figure'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'figure'
  return (
    <Comp
      ref={ref}
      data-slot="story-card-figure"
      className={cn('mb-4 overflow-hidden rounded-lg', className)}
      {...props}
    />
  )
})
StoryCardFigure.displayName = 'StoryCardFigure'

const StoryCardMeta = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="story-card-meta"
      className={className}
      {...props}
    />
  )
})
StoryCardMeta.displayName = 'StoryCardMeta'

const StoryCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h3'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h3'
  return (
    <Comp
      ref={ref}
      data-slot="story-card-title"
      className={cn(
        'mb-2 text-lg font-semibold text-foreground transition-colors group-hover:text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
})
StoryCardTitle.displayName = 'StoryCardTitle'

const StoryCardExcerpt = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      ref={ref}
      data-slot="story-card-excerpt"
      className={cn('text-sm leading-relaxed text-muted-foreground', className)}
      {...props}
    />
  )
})
StoryCardExcerpt.displayName = 'StoryCardExcerpt'

const StoryCardFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="story-card-footer"
      className={className}
      {...props}
    />
  )
})
StoryCardFooter.displayName = 'StoryCardFooter'

const StoryCardBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="story-card-body"
      className={className}
      {...props}
    />
  )
})
StoryCardBody.displayName = 'StoryCardBody'

export {
  StoryCard,
  StoryCardImage,
  StoryCardImageContainer,
  StoryCardFigure,
  StoryCardMeta,
  StoryCardTitle,
  StoryCardExcerpt,
  StoryCardFooter,
  StoryCardBody,
  storyCardVariants,
  storyCardImageVariants,
}
