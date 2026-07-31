import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const articleGridVariants = cva('', {
  variants: {
    cols: {
      '1-2-3': 'grid gap-8 sm:grid-cols-2 lg:grid-cols-3',
      '1-md-2-3': 'grid gap-6 md:grid-cols-2 lg:grid-cols-3',
      '1-md-2': 'grid gap-8 md:grid-cols-2',
    },
  },
  defaultVariants: {
    cols: '1-2-3',
  },
})

const ArticleGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof articleGridVariants> & { asChild?: boolean }
>(({ className, cols, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="article-grid"
      data-d-role="grid"
      className={cn(articleGridVariants({ cols }), className)}
      ref={ref}
      {...props}
    />
  )
})
ArticleGrid.displayName = 'ArticleGrid'

const articleCardVariants = cva('', {
  variants: {
    variant: {
      default: 'border border-border bg-card',
      elevated: 'border border-border bg-card ',
      muted: 'bg-muted',
      none: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const ArticleCard = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'article'> & {
    variant?: VariantProps<typeof articleCardVariants>['variant']
    asChild?: boolean
  }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'article'
  return (
    <Comp
      data-slot="article-card"
      data-d-role="card"
      className={cn(
        'group flex flex-col overflow-hidden ',
        articleCardVariants({ variant }),
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
ArticleCard.displayName = 'ArticleCard'

const ArticleMedia = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    aspect?: '4-3' | '4-5' | '16-9' | '16-10' | '3-2' | '2-3'
    asChild?: boolean
  }
>(({ className, aspect = '4-3', asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  const aspectCls = {
    '4-3': 'aspect-[4/3]',
    '4-5': 'aspect-[4/5]',
    '16-9': 'aspect-video',
    '16-10': 'aspect-[16/10]',
    '3-2': 'aspect-[3/2]',
    '2-3': 'aspect-[2/3]',
  }[aspect]
  return (
    <Comp
      data-slot="article-media"
      className={cn('relative overflow-hidden bg-muted', aspectCls, className)}
      ref={ref}
      {...props}
    />
  )
})
ArticleMedia.displayName = 'ArticleMedia'

const ArticleContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="article-content"
      data-d-role="container"
      className={cn('flex flex-1 flex-col', className)}
      ref={ref}
      {...props}
    />
  )
})
ArticleContent.displayName = 'ArticleContent'

const ArticleMeta = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="article-meta"
      data-d-role="body"
      className={cn(
        'flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
ArticleMeta.displayName = 'ArticleMeta'

export {
  ArticleGrid,
  ArticleCard,
  ArticleMedia,
  ArticleContent,
  ArticleMeta,
  articleGridVariants,
  articleCardVariants,
}
