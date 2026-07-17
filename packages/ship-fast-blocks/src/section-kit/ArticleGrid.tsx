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
  React.ComponentProps<'div'> & VariantProps<typeof articleGridVariants>
>(({ className, cols, ...props }, ref) => (
  <div
    data-slot="article-grid"
    className={cn(articleGridVariants({ cols }), className)}
    ref={ref}
    {...props}
  />
))
ArticleGrid.displayName = 'ArticleGrid'

const articleCardVariants = cva('', {
  variants: {
    variant: {
      default: 'border border-border bg-card',
      elevated: 'border border-border bg-card shadow-sm',
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
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    asChild?: boolean
  }
>(({ className, variant, rounded = 'xl', asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'article'
  const roundedCls = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
  }[rounded]
  return (
    <Comp
      data-slot="article-card"
      className={cn(
        'group flex flex-col overflow-hidden',
        articleCardVariants({ variant }),
        roundedCls,
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
  }
>(({ className, aspect = '4-3', ...props }, ref) => {
  const aspectCls = {
    '4-3': 'aspect-[4/3]',
    '4-5': 'aspect-[4/5]',
    '16-9': 'aspect-video',
    '16-10': 'aspect-[16/10]',
    '3-2': 'aspect-[3/2]',
    '2-3': 'aspect-[2/3]',
  }[aspect]
  return (
    <div
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
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    data-slot="article-content"
    className={cn('flex flex-1 flex-col', className)}
    ref={ref}
    {...props}
  />
))
ArticleContent.displayName = 'ArticleContent'

const ArticleMeta = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    data-slot="article-meta"
    className={cn(
      'flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground',
      className,
    )}
    ref={ref}
    {...props}
  />
))
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
