import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const CategoryGridVariants = cva('grid gap-6', {
  variants: {
    cols: {
      '1-2-3': 'gap-6 sm:grid-cols-2 lg:grid-cols-3',
      '1-2': 'gap-6 sm:grid-cols-2',
      '1-2-4': 'gap-6 sm:grid-cols-2 lg:grid-cols-4',
      '1-3': 'gap-6 md:grid-cols-3',
      '1-4': 'gap-6 lg:grid-cols-4',
      '1-md-2-3': 'gap-6 md:grid-cols-2 lg:grid-cols-3',
      '2-3-4': 'gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      '2-lg-4': 'gap-6 grid-cols-2 lg:grid-cols-4',
    },
  },
  defaultVariants: {
    cols: '1-2-3',
  },
})

const CategoryGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof CategoryGridVariants> & { asChild?: boolean }
>(({ className, cols, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="category-grid"
      className={cn(CategoryGridVariants({ cols }), className)}
      ref={ref}
      {...props}
    />
  )
})
CategoryGrid.displayName = 'CategoryGrid'

const CategoryCard = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'article'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'article'
  return (
    <Comp
      data-slot="category-card"
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-border bg-card',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
CategoryCard.displayName = 'CategoryCard'

const CategoryIcon = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="category-icon"
      className={cn(
        'grid size-12 place-items-center rounded-lg text-lg',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
CategoryIcon.displayName = 'CategoryIcon'

export {
  CategoryGrid,
  CategoryCard,
  CategoryIcon,
  CategoryGridVariants as categoryGridVariants,
}
