import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const pricingCardVariants = cva('relative flex flex-col', {
  variants: {
    variant: {
      outlined: 'rounded-xl border bg-card p-8 text-card-foreground',
      'outlined-2xl': 'rounded-2xl border bg-card p-8 text-card-foreground',
      'muted-2xl': 'rounded-2xl border border-border bg-muted/50 p-8',
      filled: 'rounded-2xl p-8 lg:p-10',
      plain: 'rounded-2xl bg-card p-8',
    },
    highlight: {
      none: '',
      primary: 'border-2 border-primary shadow-lg',
      foreground: 'border-2 border-foreground',
      'filled-primary': 'bg-primary shadow-xl',
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
  React.ComponentProps<'svg'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'svg'
  return (
    <Comp
      className={cn('mt-0.5 size-4 shrink-0 text-primary', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      data-slot="pricing-card-check-icon"
      ref={ref as React.Ref<SVGSVGElement>}
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
    </Comp>
  )
})
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
