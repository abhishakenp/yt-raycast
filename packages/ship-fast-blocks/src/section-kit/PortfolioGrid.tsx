import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const portfolioGridVariants = cva('', {
  variants: {
    cols: {
      '1-2-3': 'grid gap-8 sm:grid-cols-2 md:grid-cols-3',
      '1-md-2': 'grid gap-8 md:grid-cols-2',
      '1-md-2-3': 'grid gap-6 md:grid-cols-2 lg:grid-cols-3',
      '1-2-3-sm': 'grid gap-4 sm:grid-cols-2 md:grid-cols-3',
    },
  },
  defaultVariants: {
    cols: '1-2-3',
  },
})

const PortfolioGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & VariantProps<typeof portfolioGridVariants>
>(({ className, cols, ...props }, ref) => (
  <div
    data-slot="portfolio-grid"
    className={cn(portfolioGridVariants({ cols }), className)}
    ref={ref}
    {...props}
  />
))
PortfolioGrid.displayName = 'PortfolioGrid'

const PortfolioItem = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="portfolio-item"
      className={cn(
        'group relative flex flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
PortfolioItem.displayName = 'PortfolioItem'

const PortfolioMedia = React.forwardRef<
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
      data-slot="portfolio-media"
      className={cn('relative overflow-hidden', aspectCls, className)}
      ref={ref}
      {...props}
    />
  )
})
PortfolioMedia.displayName = 'PortfolioMedia'

const PortfolioCaption = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    data-slot="portfolio-caption"
    className={cn('flex flex-col', className)}
    ref={ref}
    {...props}
  />
))
PortfolioCaption.displayName = 'PortfolioCaption'

const PortfolioTag = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'>
>(({ className, ...props }, ref) => (
  <span
    data-slot="portfolio-tag"
    className={cn('inline-flex items-center text-sm font-medium', className)}
    ref={ref}
    {...props}
  />
))
PortfolioTag.displayName = 'PortfolioTag'

export {
  PortfolioGrid,
  PortfolioItem,
  PortfolioMedia,
  PortfolioCaption,
  PortfolioTag,
  portfolioGridVariants,
}
