import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Slot } from '@radix-ui/react-slot'
import { cn } from '#/lib/utils.ts'

const LoanCalculatorVariants = cva(' border border-border', {
  variants: {
    variant: {
      default: 'bg-card text-card-foreground',
      muted: 'bg-muted/40 text-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const LoanCalculator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof LoanCalculatorVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="loan-calculator"
      className={cn(LoanCalculatorVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
})
LoanCalculator.displayName = 'LoanCalculator'

const LoanDisplay = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="loan-calculator-display"
      data-d-role="display"
      className={cn(' bg-primary/10 p-6 text-center', className)}
      ref={ref}
      {...props}
    />
  )
})
LoanDisplay.displayName = 'LoanDisplay'

export { LoanCalculator, LoanDisplay, LoanCalculatorVariants }
