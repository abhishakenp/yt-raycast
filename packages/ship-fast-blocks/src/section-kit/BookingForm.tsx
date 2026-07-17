import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const BookingFormVariants = cva('py-20 lg:py-28', {
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

const BookingForm = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'section'> & VariantProps<typeof BookingFormVariants>
>(({ className, variant, ...props }, ref) => (
  <section
    data-slot="booking-form"
    className={cn(BookingFormVariants({ variant }), className)}
    ref={ref}
    {...props}
  />
))
BookingForm.displayName = 'BookingForm'

export { BookingForm, BookingFormVariants }
