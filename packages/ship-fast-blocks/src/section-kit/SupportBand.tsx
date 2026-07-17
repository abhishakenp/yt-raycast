import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const SupportBandVariants = cva('py-20 lg:py-28', {
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

const SupportBand = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> & VariantProps<typeof SupportBandVariants>
>(({ className, variant, ...props }, ref) => (
  <section
    data-slot="support-band"
    className={cn(SupportBandVariants({ variant }), className)}
    ref={ref}
    {...props}
  />
))
SupportBand.displayName = 'SupportBand'

export { SupportBand, SupportBandVariants }
