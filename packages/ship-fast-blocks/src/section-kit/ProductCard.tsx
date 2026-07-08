import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const productCardVariants = cva('group flex flex-col', {
  variants: {
    variant: {
      none: '',
      elevated: 'overflow-hidden rounded-xl bg-card text-card-foreground',
      outlined:
        'overflow-hidden rounded-lg border border-border bg-card text-card-foreground',
    },
  },
  defaultVariants: {
    variant: 'outlined',
  },
})

const ProductCard = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'article'> &
    VariantProps<typeof productCardVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'article'
  return (
    <Comp
      data-slot="product-card"
      className={cn(productCardVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
})
ProductCard.displayName = 'ProductCard'

const ProductCardImage = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="product-card-image"
      className={cn(
        'relative aspect-square overflow-hidden bg-muted',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
ProductCardImage.displayName = 'ProductCardImage'

const ProductCardBadge = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      data-slot="product-card-badge"
      className={cn(
        'absolute left-3 top-3 rounded-sm px-2 py-1 text-xs font-medium',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
ProductCardBadge.displayName = 'ProductCardBadge'

const ProductCardActions = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="product-card-actions"
      className={cn('absolute bottom-3 right-3', className)}
      ref={ref}
      {...props}
    />
  )
})
ProductCardActions.displayName = 'ProductCardActions'

const ProductCardContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="product-card-content"
      className={cn('flex flex-1 flex-col p-5', className)}
      ref={ref}
      {...props}
    />
  )
})
ProductCardContent.displayName = 'ProductCardContent'

const ProductCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h3'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h3'
  return (
    <Comp
      data-slot="product-card-title"
      className={cn('font-medium', className)}
      ref={ref}
      {...props}
    />
  )
})
ProductCardTitle.displayName = 'ProductCardTitle'

const ProductCardSubtitle = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      data-slot="product-card-subtitle"
      className={cn('mb-2 mt-1 text-sm text-muted-foreground', className)}
      ref={ref}
      {...props}
    />
  )
})
ProductCardSubtitle.displayName = 'ProductCardSubtitle'

const ProductCardPrice = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      data-slot="product-card-price"
      className={cn('font-medium', className)}
      ref={ref}
      {...props}
    />
  )
})
ProductCardPrice.displayName = 'ProductCardPrice'

export {
  ProductCard,
  ProductCardImage,
  ProductCardBadge,
  ProductCardActions,
  ProductCardContent,
  ProductCardTitle,
  ProductCardSubtitle,
  ProductCardPrice,
  productCardVariants,
}
