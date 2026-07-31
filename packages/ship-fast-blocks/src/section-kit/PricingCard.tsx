import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const pricingCardVariants = cva('relative flex flex-col', {
  variants: {
    variant: {
      outlined: ' border bg-card p-8 text-card-foreground',
      'outlined-2xl': ' border bg-card p-8 text-card-foreground',
      'muted-2xl': ' border border-border bg-muted/50 p-8',
      filled: ' p-8 lg:p-10',
      plain: ' bg-card p-8',
    },
    highlight: {
      none: '',
      primary: 'border-2 border-primary ',
      foreground: 'border-2 border-foreground',
      'filled-primary': 'bg-primary ',
    },
  },
  defaultVariants: {
    variant: 'outlined',
    highlight: 'none',
  },
})

const PricingCard = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'article'> &
    VariantProps<typeof pricingCardVariants> & { asChild?: boolean }
>(({ className, variant, highlight, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'article'
  return (
    <Comp
      data-slot="pricing-card"
      data-d-role="card"
      className={cn(pricingCardVariants({ variant, highlight }), className)}
      ref={ref}
      {...props}
    />
  )
})
PricingCard.displayName = 'PricingCard'

const PricingCardBadge = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      data-slot="pricing-card-badge"
      data-d-role="badge"
      className={cn(
        'absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
PricingCardBadge.displayName = 'PricingCardBadge'

const PricingCardName = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h3'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h3'
  return (
    <Comp
      data-slot="pricing-card-name"
      data-d-role="card"
      className={cn('text-lg font-semibold text-foreground', className)}
      ref={ref}
      {...props}
    />
  )
})
PricingCardName.displayName = 'PricingCardName'

const PricingCardTagline = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      data-slot="pricing-card-tagline"
      data-d-role="card"
      className={cn('text-sm text-muted-foreground', className)}
      ref={ref}
      {...props}
    />
  )
})
PricingCardTagline.displayName = 'PricingCardTagline'

const PricingCardPrice = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="pricing-card-price"
      data-d-role="card"
      className={cn('mt-4 flex items-baseline gap-1', className)}
      ref={ref}
      {...props}
    />
  )
})
PricingCardPrice.displayName = 'PricingCardPrice'

const PricingCardPriceValue = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      data-slot="pricing-card-price-value"
      data-d-role="card"
      className={cn(
        'text-4xl font-semibold tracking-tight text-foreground',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
PricingCardPriceValue.displayName = 'PricingCardPriceValue'

const PricingCardPriceUnit = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      data-slot="pricing-card-price-unit"
      data-d-role="card"
      className={cn('text-sm text-muted-foreground', className)}
      ref={ref}
      {...props}
    />
  )
})
PricingCardPriceUnit.displayName = 'PricingCardPriceUnit'

const PricingCardFeatures = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'ul'
  return (
    <Comp
      data-slot="pricing-card-features"
      data-d-role="card"
      className={cn('mt-7 flex flex-col gap-3', className)}
      ref={ref}
      {...props}
    />
  )
})
PricingCardFeatures.displayName = 'PricingCardFeatures'

const PricingCardFeature = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'li'
  return (
    <Comp
      data-slot="pricing-card-feature"
      data-d-role="card"
      className={cn(
        'flex items-start gap-2 text-sm text-muted-foreground',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
PricingCardFeature.displayName = 'PricingCardFeature'

const PricingCardCheckIcon = React.forwardRef<
  SVGSVGElement,
  React.ComponentProps<'svg'>
>(({ className, ...props }, ref) => (
  <svg
    className={cn('mt-0.5 size-4 shrink-0 text-primary', className)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
    data-slot="pricing-card-check-icon"
    data-d-role="card"
    ref={ref}
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
  </svg>
))
PricingCardCheckIcon.displayName = 'PricingCardCheckIcon'

const PricingCardCta = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="pricing-card-cta"
      className={cn('mt-8', className)}
      ref={ref}
      {...props}
    />
  )
})
PricingCardCta.displayName = 'PricingCardCta'

export {
  PricingCard,
  PricingCardBadge,
  PricingCardName,
  PricingCardTagline,
  PricingCardPrice,
  PricingCardPriceValue,
  PricingCardPriceUnit,
  PricingCardFeatures,
  PricingCardFeature,
  PricingCardCheckIcon,
  PricingCardCta,
  pricingCardVariants,
}
