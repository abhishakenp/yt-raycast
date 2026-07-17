import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const DonationBandVariants = cva('py-20 lg:py-28', {
  variants: {
    variant: {
      default: 'bg-background text-foreground',
      muted: 'bg-muted text-foreground',
      primary: 'bg-primary text-primary-foreground',
      inverted: 'bg-foreground text-background',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const DonationBand = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> & VariantProps<typeof DonationBandVariants>
>(({ className, variant, ...props }, ref) => (
  <section
    data-slot="donation-band"
    className={cn(DonationBandVariants({ variant }), className)}
    ref={ref}
    {...props}
  />
))
DonationBand.displayName = 'DonationBand'

export { DonationBand, DonationBandVariants }
