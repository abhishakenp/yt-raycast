import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

const pricingTierVariants = cva(
  'relative flex flex-col gap-6 rounded-xl border bg-card p-8',
  {
    variants: {
      variant: {
        default: 'border-border',
        highlighted: 'border-2 border-primary shadow-lg',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

const PricingGrid = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'section'
  return (
    <Comp
      ref={ref}
      data-slot="pricing-grid"
      className={cn('flex flex-col gap-10', className)}
      {...props}
    />
  )
})
PricingGrid.displayName = 'PricingGrid'

const PricingTier = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof pricingTierVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="pricing-tier"
      className={cn(pricingTierVariants({ variant }), className)}
      {...props}
    />
  )
})
PricingTier.displayName = 'PricingTier'

const PricingTierBadge = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      ref={ref}
      data-slot="pricing-tier-badge"
      className={cn(
        'absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground',
        className,
      )}
      {...props}
    />
  )
})
PricingTierBadge.displayName = 'PricingTierBadge'

const PricingTierHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="pricing-tier-header"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
})
PricingTierHeader.displayName = 'PricingTierHeader'

const PricingTierName = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h3'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h3'
  return (
    <Comp
      ref={ref}
      data-slot="pricing-tier-name"
      className={cn('text-lg font-semibold text-foreground', className)}
      {...props}
    />
  )
})
PricingTierName.displayName = 'PricingTierName'

const PricingTierTagline = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      ref={ref}
      data-slot="pricing-tier-tagline"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
})
PricingTierTagline.displayName = 'PricingTierTagline'

const PricingTierPrice = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      ref={ref}
      data-slot="pricing-tier-price"
      className={cn('text-4xl font-bold text-foreground', className)}
      {...props}
    />
  )
})
PricingTierPrice.displayName = 'PricingTierPrice'

const PricingTierPeriod = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      ref={ref}
      data-slot="pricing-tier-period"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
})
PricingTierPeriod.displayName = 'PricingTierPeriod'

const PricingTierFeatures = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'ul'
  return (
    <Comp
      ref={ref}
      data-slot="pricing-tier-features"
      className={cn('flex flex-col gap-3', className)}
      {...props}
    />
  )
})
PricingTierFeatures.displayName = 'PricingTierFeatures'

const PricingTierFeature = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'li'
  return (
    <Comp
      ref={ref}
      data-slot="pricing-tier-feature"
      className={cn(
        'flex items-start gap-2 text-sm text-muted-foreground',
        className,
      )}
      {...props}
    >
      <svg
        className="mt-0.5 size-4 shrink-0 text-primary"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
      </svg>
      {props.children}
    </Comp>
  )
})
PricingTierFeature.displayName = 'PricingTierFeature'

const PricingTierCta = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & {
    asChild?: boolean
    target?: string
  }
>(({ className, asChild = false, target, onClick, ...props }, ref) => {
  const go = useNavigate()
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      ref={ref}
      data-slot="pricing-tier-cta"
      className={cn(
        'mt-auto inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors',
        className,
      )}
      onClick={(e: React.MouseEvent<HTMLElement>) => {
        if (!asChild && target) {
          go(target)
        }
        onClick?.(e as React.MouseEvent<HTMLButtonElement>)
      }}
      {...props}
    />
  )
})
PricingTierCta.displayName = 'PricingTierCta'

export {
  PricingGrid,
  PricingTier,
  pricingTierVariants,
  PricingTierBadge,
  PricingTierHeader,
  PricingTierName,
  PricingTierTagline,
  PricingTierPrice,
  PricingTierPeriod,
  PricingTierFeatures,
  PricingTierFeature,
  PricingTierCta,
}
