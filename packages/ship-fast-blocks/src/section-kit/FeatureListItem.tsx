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
      data-d-role="list"
      className={cn('flex items-start gap-4', className)}
      {...props}
    />
  )
})
FeatureListItem.displayName = 'FeatureListItem'

const featureListItemIconVariants = cva(
  'flex size-12 shrink-0 items-center justify-center bg-muted',
  {
    variants: {
      shape: {
        circle: 'rounded-full',
        square: '',
      },
    },
    defaultVariants: {
      shape: 'circle',
    },
  },
)

const FeatureListItemIcon = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof featureListItemIconVariants> & { asChild?: boolean }
>(({ className, shape, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="feature-list-item-icon"
      data-d-role="list"
      className={cn(featureListItemIconVariants({ shape }), className)}
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
      data-d-role="list"
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
      data-d-role="list"
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
      data-d-role="list"
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
