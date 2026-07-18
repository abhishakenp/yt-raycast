import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const appointmentBandVariants = cva('', {
  variants: {
    variant: {
      primary: 'bg-foreground text-background',
      muted: 'bg-muted text-foreground',
      card: 'border border-border bg-card text-card-foreground',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
})

const AppointmentBand = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> &
    VariantProps<typeof appointmentBandVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'section'
  return (
    <Comp
      data-slot="appointment-band"
      className={cn(
        'flex flex-col items-center gap-6',
        appointmentBandVariants({ variant }),
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
AppointmentBand.displayName = 'AppointmentBand'

export { AppointmentBand, appointmentBandVariants }
