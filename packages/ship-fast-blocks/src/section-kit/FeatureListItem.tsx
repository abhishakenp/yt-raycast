import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const FeatureListItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="feature-list-item"
      className={cn('flex items-start gap-4', className)}
      {...props}
    />
  )
})
FeatureListItem.displayName = 'FeatureListItem'

const featureListItemIconVariants = cva(
  'flex shrink-0 items-center justify-center bg-muted',
  {
    variants: {
      shape: {
        circle: 'rounded-full',
        square: 'rounded-lg',
      },
      size: {
        sm: 'size-10',
        md: 'size-12',
        lg: 'size-14',
      },
    },
    defaultVariants: {
      shape: 'circle',
      size: 'md',
    },
  },
)

const FeatureListItemIcon = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof featureListItemIconVariants> & { asChild?: boolean }
>(({ className, shape, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="feature-list-item-icon"
      className={cn(featureListItemIconVariants({ shape, size }), className)}
      {...props}
    />
  )
})
FeatureListItemIcon.displayName = 'FeatureListItemIcon'

const FeatureListItemTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h4'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h4'
  return (
    <Comp
      ref={ref}
      data-slot="feature-list-item-title"
      className={cn('font-medium text-foreground', className)}
      {...props}
    />
  )
})
FeatureListItemTitle.displayName = 'FeatureListItemTitle'

const FeatureListItemDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      ref={ref}
      data-slot="feature-list-item-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
})
FeatureListItemDescription.displayName = 'FeatureListItemDescription'

const FeatureListItemBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="feature-list-item-body"
      className={className}
      {...props}
    />
  )
})
FeatureListItemBody.displayName = 'FeatureListItemBody'

export {
  FeatureListItem,
  FeatureListItemIcon,
  FeatureListItemTitle,
  FeatureListItemDescription,
  FeatureListItemBody,
  featureListItemIconVariants,
}
