import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const featuredArticleVariants = cva('', {
  variants: {
    size: {
      sm: 'py-12',
      md: 'py-16',
      lg: 'py-20 lg:py-28',
      xl: 'py-20 lg:py-32',
      none: '',
    },
  },
  defaultVariants: {
    size: 'lg',
  },
})

const FeaturedArticle = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> & VariantProps<typeof featuredArticleVariants>
>(({ className, size, ...props }, ref) => (
  <section
    data-slot="featured-article"
    className={cn(featuredArticleVariants({ size }), className)}
    ref={ref}
    {...props}
  />
))
FeaturedArticle.displayName = 'FeaturedArticle'

const FeaturedArticleMedia = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="featured-article-media"
      className={cn('relative overflow-hidden', className)}
      ref={ref}
      {...props}
    />
  )
})
FeaturedArticleMedia.displayName = 'FeaturedArticleMedia'

const FeaturedArticleContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="featured-article-content"
      className={cn('flex flex-col', className)}
      ref={ref}
      {...props}
    />
  )
})
FeaturedArticleContent.displayName = 'FeaturedArticleContent'

const FeaturedArticleMeta = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    data-slot="featured-article-meta"
    className={cn(
      'flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground',
      className,
    )}
    ref={ref}
    {...props}
  />
))
FeaturedArticleMeta.displayName = 'FeaturedArticleMeta'

export {
  FeaturedArticle,
  FeaturedArticleMedia,
  FeaturedArticleContent,
  FeaturedArticleMeta,
  featuredArticleVariants,
}
